'use strict';
const {randomUUID}=require('node:crypto');
const {parse}=require('csv-parse/sync');
class Fault extends Error { constructor(status,message){super(message);this.status=status;} }
function ensure(ok,message,status=400){if(!ok)throw new Fault(status,message);}
function text(v,max=5000){ensure(typeof v==='string'&&v.trim().length>0&&v.length<=max,'Missing or invalid text.');return v.trim();}
function number(v){ensure(Number.isSafeInteger(v)&&v>=0&&v<=1000000,'Credits must be whole numbers from 0 to 1,000,000.');return v;}
function id(v){ensure(typeof v==='string'&&/^[A-Z0-9_-]{1,40}$/.test(v),'Invalid ID. Use uppercase letters, numbers, - or _.');return v;}
function initial(){return {_id:'event',revision:0,publicRevision:0,phase:'preparation',reviewEndsAt:null,teams:[],problems:[],controller:null,auction:{sequence:0,problemId:null,price:0,leader:null,status:'upcoming'},updatedAt:new Date().toISOString()};}
function csvRows(input){let rows;try{rows=parse(text(input,150000),{columns:h=>h.map(x=>x.trim().toLowerCase().replace(/[ _]/g,'')),skip_empty_lines:true,bom:true,trim:true});}catch{throw new Fault(400,'Invalid CSV. Use the provided template.');}ensure(rows.length>0&&rows.length<=200,'Import 1–200 teams at a time.');const seen=new Set();return rows.map(r=>{const teamId=id(String(r.teamid||'').toUpperCase());ensure(!seen.has(teamId),'Duplicate team ID in CSV: '+teamId);seen.add(teamId);ensure(/^\d+$/.test(r.finalcredits||''),'Final Credits must be a nonnegative integer.');return {id:teamId,name:text(r.teamname,100),leader:text(r.teamleader,100),starting:number(Number(r.finalcredits)),spent:0,assignment:null,revealed:false,codeVersion:randomUUID()};});}
function assignedIds(t){return [...new Set([...(t.assignments||[]),t.assignment].filter(Boolean))];}
function isAllocated(s,pid){return s.teams.some(t=>assignedIds(t).includes(pid));}
function selectedProblems(s,b){const ids=b.problemIds===undefined?[b.problemId]:b.problemIds;ensure(Array.isArray(ids)&&ids.length>=1&&ids.length<=30,'Select 1–30 problem statements.');ensure(new Set(ids).size===ids.length,'A PS was selected more than once.');return ids.map(pid=>{const p=s.problems.find(p=>p.id===pid);ensure(p&&p.published,'Select released problems only.');ensure(!isAllocated(s,pid),'A selected PS is already allocated.',409);return p;});}
function addProblems(s,b,actor){const t=s.teams.find(t=>t.id===b.teamId);ensure(t,'Select a valid team.');ensure(!t.submission,'This team already submitted a solution; new allocations are locked.',409);const ps=selectedProblems(s,b),price=number(b.price);ensure(t.starting-t.spent>=price,'Insufficient credits.',409);const ids=assignedIds(t);t.assignments=[...ids,...ps.map(p=>p.id)];t.assignment=t.assignments[0]||null;t.spent+=price;return {team:t,problems:ps,price,result:{ok:true,teamId:t.id,problemId:ps[0].id,problemIds:ps.map(p=>p.id),price,available:t.starting-t.spent}};}
function publicProblem(p){return {id:p.id,title:p.title,theme:p.theme,brief:p.brief,startingPrice:p.startingPrice};}
function publicState(s){return {revision:s.publicRevision,phase:s.phase,reviewEndsAt:s.reviewEndsAt,problems:s.problems.filter(p=>p.published).map(p=>({...publicProblem(p),allocated:isAllocated(s,p.id)}))};}
function constraintStages(p){if(Array.isArray(p.constraintStages)&&p.constraintStages.length)return p.constraintStages;const parts=String(p.constraints||'').split(/(?:^|\n)\s*Constraint \d+:\s*/).filter(x=>x.trim()).map(x=>x.trim());return parts.length?parts:[p.constraints];}
function releasedCount(t,p){const n=t.revealCounts&&Number.isInteger(t.revealCounts[p.id])?t.revealCounts[p.id]:p.id===t.assignment?(Number.isInteger(t.revealedCount)?t.revealedCount:t.revealed?constraintStages(p).length:0):0;return Math.min(constraintStages(p).length,Math.max(0,n));}
function teamState(s,teamId){const t=s.teams.find(t=>t.id===teamId);ensure(t,'Team access was revoked.',401);const assignments=assignedIds(t).map(pid=>s.problems.find(p=>p.id===pid)).filter(Boolean).map(p=>{const count=releasedCount(t,p);return {...publicProblem(p),constraints:count?constraintStages(p).slice(0,count).map((c,i)=>constraintStages(p).length===1?c:'Constraint '+(i+1)+': '+c).join('\n\n'):null,revealed:count>0,revealedCount:count,constraintCount:constraintStages(p).length};});return {...publicState(s),team:{id:t.id,name:t.name,starting:t.starting,spent:t.spent,available:t.starting-t.spent},submission:t.submission||null,assignment:assignments[0]||null,assignments};}
function lease(s,owner){ensure(s.controller&&s.controller.owner===owner&&s.controller.expires>Date.now(),'Acquire auction control first.',409);}
function apply(s,action,b,actor){let result={ok:true};const now=Date.now();switch(action){
case 'import':{const rows=csvRows(b.csv);const added=rows.filter(r=>!s.teams.some(t=>t.id===r.id));ensure(s.teams.length+added.length<=200,'Maximum 200 teams.');s.teams.push(...added);result={ok:true,added:added.length,skipped:rows.length-added.length};break;}
case 'problem':{const p={id:id(b.id),title:text(b.title,150),theme:text(b.theme,80),brief:text(b.brief,6000),constraints:text(b.constraints,6000),startingPrice:number(b.startingPrice),published:false};const i=s.problems.findIndex(x=>x.id===p.id);if(i>=0){ensure(!s.problems[i].published&&!isAllocated(s,p.id),'Published or allocated briefs are locked. Unpublish an unassigned brief before editing.');s.problems[i]=p;}else{ensure(s.problems.length<50,'Maximum 50 problem statements.');s.problems.push(p);}break;}
case 'publish':{ensure(Array.isArray(b.ids)&&b.ids.length>0,'Select problems.');for(const pid of b.ids){const p=s.problems.find(p=>p.id===pid);ensure(p,'Unknown problem.');ensure(b.published===true||!isAllocated(s,pid),'An assigned problem cannot be unpublished.');p.published=b.published===true;}break;}
case 'phase':{ensure(['preparation','review','bidding','work','closed'].includes(b.phase),'Invalid phase.');if(b.phase==='review'){ensure(s.problems.some(p=>p.published),'Publish problems first.');ensure(Number.isInteger(b.minutes)&&b.minutes>=1&&b.minutes<=60,'Review time must be 1–60 minutes.');s.reviewEndsAt=new Date(now+b.minutes*60000).toISOString();}else s.reviewEndsAt=null;s.phase=b.phase;break;}
case 'claim':{ensure(typeof b.owner==='string'&&b.owner.length>=16&&b.owner.length<=100,'Invalid controller ID.');ensure(!s.controller||s.controller.expires<now||s.controller.owner===b.owner||b.takeover===true,'Another controller is active. Use explicit takeover.',409);s.controller={owner:b.owner,expires:now+120000};result={ok:true,sequence:s.auction.sequence};break;}
case 'auction':{lease(s,b.owner);ensure(Number.isSafeInteger(b.sequence)&&b.sequence>s.auction.sequence,'Stale auction update.',409);const ids=b.problemIds===undefined?[b.problemId]:b.problemIds;ensure(Array.isArray(ids)&&ids.length>0&&ids.length<=30&&new Set(ids).size===ids.length,'Select up to 30 different problems.');ensure(ids.every(pid=>s.problems.some(p=>p.id===pid&&p.published)),'Select released problems only.');ensure(['upcoming','open','unsold'].includes(b.status),'Invalid display status.');ensure(!b.leader||s.teams.some(t=>t.id===b.leader),'Unknown leading team.');s.auction={sequence:b.sequence,problemId:ids[0],problemIds:ids,price:number(b.price),leader:b.leader||null,status:b.status};s.controller.expires=now+120000;break;}
case 'allocate':{ensure(actor==='admin','Organiser access required.',403);ensure(s.phase!=='closed','Round is closed. Reopen the round before allocating.',409);result=addProblems(s,b,actor).result;break;}
case 'sale':{lease(s,b.owner);ensure(s.phase==='bidding','Open the bidding phase first.');const ps=b.problemIds===undefined?[b.problemId]:b.problemIds;ensure(Array.isArray(ps)&&ps.length,'Select a problem.');const minimum=ps.reduce((sum,pid)=>{const p=s.problems.find(p=>p.id===pid);return sum+(p?.startingPrice||0);},0);ensure(number(b.price)>=minimum,'Bid is below the combined starting price.');const a=addProblems(s,b,actor);const ids=a.result.problemIds;s.auction={sequence:s.auction.sequence+1,problemId:ids[0],problemIds:ids,price:a.price,leader:a.team.id,status:'sold'};result=a.result;break;}
case 'reverse':{text(b.reason,300);const t=s.teams.find(t=>t.id===b.teamId);ensure(t&&assignedIds(t).length,'Team has no assignment.');ensure(!t.submission,'A solution has been submitted. Reassignment is blocked.');ensure(assignedIds(t).every(pid=>{const p=s.problems.find(p=>p.id===pid);return !p||releasedCount(t,p)===0;}),'Constraints have been seen. Reassignment is blocked; resolve with the event lead.');t.assignment=null;t.assignments=[];t.revealCounts={};t.spent=0;t.revealed=false;t.revealedCount=0;s.auction={sequence:s.auction.sequence+1,problemId:null,problemIds:[],price:0,leader:null,status:'upcoming'};break;}
case 'adjust':{text(b.reason,300);const t=s.teams.find(t=>t.id===b.teamId);ensure(t,'Unknown team.');const n=number(b.starting);ensure(n>=t.spent,'Starting credits cannot be below spent credits.');t.starting=n;break;}
case 'editCredits':{
 ensure(actor==='admin','Organiser access required.',403);
 text(b.reason,300);
 const t=s.teams.find(t=>t.id===b.teamId);ensure(t,'Unknown team.');
 ensure(b.expectedStarting===t.starting&&b.expectedSpent===t.spent,'Team credits changed since this screen loaded. Refresh and try again.',409);
 const starting=number(b.starting),spent=number(b.spent);
 ensure(spent<=starting,'Spent credits cannot exceed starting credits.');
 t.starting=starting;t.spent=spent;
 result={ok:true,teamId:t.id,starting,spent,available:starting-spent};break;
}
case 'editAssignments':{
 ensure(actor==='admin','Organiser access required.',403);
 text(b.reason,300);
 const t=s.teams.find(t=>t.id===b.teamId);ensure(t,'Unknown team.');
 const old=assignedIds(t);
 ensure(Array.isArray(b.expectedProblemIds)&&JSON.stringify(b.expectedProblemIds)===JSON.stringify(old),'Team PS allotment changed since this screen loaded. Refresh and try again.',409);
 ensure(Array.isArray(b.problemIds)&&b.problemIds.length<=30,'Select up to 30 problem statements.');
 ensure(new Set(b.problemIds).size===b.problemIds.length,'A PS was selected more than once.');
 for(const pid of b.problemIds){
  const p=s.problems.find(p=>p.id===pid);
  ensure(p&&p.published,'All selected PSs must be released.');
  ensure(!s.teams.some(other=>other.id!==t.id&&assignedIds(other).includes(pid)),pid+' is already assigned to another team.',409);
 }
 const changed=JSON.stringify(old)!==JSON.stringify(b.problemIds);
 ensure(!changed||!t.submission,'This team has submitted a solution. PS edits are locked.',409);
 for(const pid of old.filter(pid=>!b.problemIds.includes(pid))){
  const p=s.problems.find(p=>p.id===pid);
  ensure(!p||releasedCount(t,p)===0,'Cannot remove '+pid+': its private constraints have already been released.',409);
 }
 const counts={};for(const pid of old){const p=s.problems.find(p=>p.id===pid);if(p)counts[pid]=releasedCount(t,p);}
 t.assignments=[...b.problemIds];t.assignment=t.assignments[0]||null;
 t.revealCounts=Object.fromEntries(t.assignments.filter(pid=>counts[pid]>0).map(pid=>[pid,counts[pid]]));
 t.revealedCount=t.assignment?(counts[t.assignment]||0):0;
 const primary=t.assignment?s.problems.find(p=>p.id===t.assignment):null;
 t.revealed=!!(primary&&t.revealedCount===constraintStages(primary).length);
 if(changed&&s.auction.status==='sold'&&s.auction.leader===t.id){
  s.auction={sequence:s.auction.sequence+1,problemId:null,problemIds:[],price:0,leader:null,status:'upcoming'};
 }
 result={ok:true,teamId:t.id,problemIds:t.assignments,available:t.starting-t.spent};break;
}
case 'reveal':{const items=Array.isArray(b.items)?b.items:Array.isArray(b.ids)?b.ids.map(teamId=>({teamId})):[];ensure(items.length>0,'Select assigned challenges.');const seen=new Set();for(const item of items){const t=s.teams.find(t=>t.id===item.teamId);const pid=item.problemId||t?.assignment;ensure(t&&pid&&assignedIds(t).includes(pid),'Every selected team must own the selected PS.');const key=t.id+':'+pid;if(seen.has(key))continue;seen.add(key);const p=s.problems.find(p=>p.id===pid);ensure(p,'Assigned problem is missing.');const count=releasedCount(t,p);ensure(count<constraintStages(p).length,'All constraints are already released.');t.revealCounts={...(t.revealCounts||{}),[pid]:count+1};if(pid===t.assignment){t.revealedCount=count+1;t.revealed=count+1===constraintStages(p).length;}}break;}
case 'rotate':{const t=s.teams.find(t=>t.id===b.teamId);ensure(t,'Unknown team.');t.codeVersion=randomUUID();break;}
default:throw new Fault(404,'Unknown action.');}s.revision++;if(!['auction','claim'].includes(action))s.publicRevision++;s.updatedAt=new Date().toISOString();return result;}
module.exports={Fault,ensure,text,number,id,initial,csvRows,publicState,teamState,publicProblem,apply,constraintStages,releasedCount,assignedIds,isAllocated};
