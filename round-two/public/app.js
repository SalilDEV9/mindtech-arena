'use strict';
const $=id=>document.getElementById(id),page=document.body.dataset.page;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lastAssignment='',hasTeamSnapshot=false;
let current=null,teamVersion=-1,reviewEnd=null,importCSV='',pollTimer;
function message(s){$('message').textContent=s;$('message').className=s?'notice':'';}
async function api(path,body,key){const c=new AbortController(),timer=setTimeout(()=>c.abort(),14000);try{const r=await fetch(path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Round-Two':'1',...(key?{'Idempotency-Key':key}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:c.signal,cache:'no-store'});const d=await r.json();if(!r.ok){const e=new Error(d.error||'Service unavailable.');e.status=r.status;throw e;}return d;}finally{clearTimeout(timer);}}
function connection(ok){if($('connection')){$('connection').textContent=ok?'Connected':'Connection interrupted';$('connection').className=ok?'status':'status bad';}}
function readPending(){try{return JSON.parse(sessionStorage.getItem('r2-pending'));}catch{return null;}}
async function mutate(action,body){if(readPending())throw new Error('A previous save is unresolved. Use Retry pending save before another action.');const item={action,body,key:crypto.randomUUID()};sessionStorage.setItem('r2-pending',JSON.stringify(item));return retryPending();}
async function retryPending(){const p=readPending();if(!p)return;try{const r=await api('/api/admin/'+p.action,p.body,p.key);sessionStorage.removeItem('r2-pending');$('retry').hidden=true;message('Saved successfully.');await loadAdmin();return r;}catch(e){if(e.status&&e.status<500){sessionStorage.removeItem('r2-pending');$('retry').hidden=true;}else{$('retry').hidden=false;}throw e;}}
window.R2={api,mutate,esc,getState:()=>current,refresh:loadAdmin,message};
function safe(fn){return async e=>{if(e)e.preventDefault();try{await fn(e);}catch(err){message(err.name==='AbortError'?'Save or load timed out. Check the connection and retry.':err.message);}};}
function on(id,fn,event='click'){if($(id))$(id).addEventListener(event,safe(fn));}
function phase(s){if($('phase'))$('phase').textContent=s.phase.toUpperCase();reviewEnd=s.reviewEndsAt;}
let publicProblems=[],cardFingerprint='',seenProblems=new Set(),hasProblemSnapshot=false;
function briefMarkup(brief){return String(brief).split(/(?=Problem Statement:|Target Users:|Expected MVP:|Suggested Technology:)/).filter(x=>x.trim()).map(part=>{const match=part.match(/^([^:]+):\s*([\s\S]*)$/);return match?`<section class="ps-section"><h3>${esc(match[1])}</h3><p>${esc(match[2])}</p></section>`:`<p>${esc(part)}</p>`;}).join('');}
function renderCards(){
 const query=($('problem-search')?.value||'').trim().toLowerCase(),theme=$('problem-theme')?.value||'';
 const problems=publicProblems.filter(p=>(!theme||p.theme===theme)&&(!query||[p.id,p.title,p.brief,p.theme].join(' ').toLowerCase().includes(query)));
 $('problem-count').textContent=problems.length+' / '+publicProblems.length+' released challenges';
 $('problems').innerHTML=problems.length?problems.map(p=>`<article class="card ps-card${seenProblems.has(p.id)?'':' ps-new'}"><span class="ps-number" aria-hidden="true">${esc(p.id.replace(/^PS/,''))}</span><div class="card-top"><span class="ps-code">${esc(p.id)}</span><span class="tag">${p.allocated?'ALLOCATED':esc(p.startingPrice)+' CR'}</span></div><p class="eyebrow ps-category">${esc(p.theme)}</p><h3>${esc(p.title)}</h3><p class="brief muted">${esc(p.brief.replace(/^Problem Statement:\s*/,''))}</p><button data-read="${esc(p.id)}">Reveal full PS <span aria-hidden="true">↗</span></button></article>`).join(''):`<div class="empty"><h2>${publicProblems.length?'NO MATCHING CHALLENGES.':'THE FORGE IS WARMING UP.'}</h2><p class="muted">${publicProblems.length?'Try a different keyword or category.':'The organiser will release the problem statements here.'}</p></div>`;
 document.querySelectorAll('[data-read]').forEach(b=>b.onclick=()=>showProblem(publicProblems.find(p=>p.id===b.dataset.read),true));
}
function cards(problems){
 const fingerprint=JSON.stringify(problems);if(fingerprint===cardFingerprint)return;
 const fresh=problems.filter(p=>!seenProblems.has(p.id));publicProblems=problems;cardFingerprint=fingerprint;
 if($('problem-theme')){const selected=$('problem-theme').value;$('problem-theme').innerHTML='<option value="">All categories</option>'+[...new Set(problems.map(p=>p.theme))].map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('');$('problem-theme').value=selected;}
 renderCards();if(hasProblemSnapshot&&fresh.length)window.PSReveal?.impact();seenProblems=new Set(problems.map(p=>p.id));hasProblemSnapshot=true;
}
function showProblem(p,withImpact=false){
 if(!p)return;$('detail-body').innerHTML=`<div class="ps-reveal-head"><p class="eyebrow">CHALLENGE UNLOCKED / ${esc(p.id)}</p><h2>${esc(p.title)}</h2><p class="ps-category">${esc(p.theme)}</p><span class="status">Starting price / ${esc(p.startingPrice)} credits</span></div>${briefMarkup(p.brief)}${page==='admin'?'<section class="ps-section twist"><h3>Organiser only / hidden constraints</h3><p>'+esc(p.constraints)+'</p></section>':''}`;
 $('detail').classList.remove('ps-impact');$('detail').showModal();void $('detail').offsetWidth;$('detail').classList.add('ps-impact');if(withImpact)window.PSReveal?.impact();
}
function assignedIds(t){return [...new Set([...(t.assignments||[]),t.assignment].filter(Boolean))];}
function stages(p){return p?.constraintStages?.length?p.constraintStages:String(p?.constraints||'').split(/(?:^|\n)\s*Constraint \d+:\s*/).filter(x=>x.trim());}
function stageCount(t,pid=t.assignment){const p=current.problems.find(p=>p.id===pid);if(!p)return 0;const v=t.revealCounts?.[pid];return Math.min(stages(p).length,Number.isInteger(v)?v:pid===t.assignment?(t.revealedCount??(t.revealed?stages(p).length:0)):0);}
function hasNext(t,pid=t.assignment){const p=current.problems.find(p=>p.id===pid);return !!p&&assignedIds(t).includes(pid)&&stageCount(t,pid)<stages(p).length;}
function renderTeam(d){if(d.unchanged)return;window.dispatchEvent(new CustomEvent('r2-team-state',{detail:d}));teamVersion=d.revision;phase(d);cards(d.problems);$('login').hidden=true;$('workspace').hidden=false;$('logout').hidden=false;$('challenge-board').hidden=false;$('team-name').textContent=d.team.name;$('stats').innerHTML=[['Starting',d.team.starting],['Spent',d.team.spent],['Available',d.team.available]].map(([k,v])=>'<div><strong>'+v+'</strong><small>'+k+' credits</small></div>').join('');const list=d.assignments|| (d.assignment?[d.assignment]:[]);const key=JSON.stringify(list.map(a=>[a.id,a.revealedCount]));const fresh=key!==lastAssignment;$('assignment').innerHTML=list.length?'<div class="bundle-head"><h2>YOUR ASSIGNED CHALLENGES · '+list.length+'</h2><p class="muted">Each challenge has its own constraints. Submit one combined solution PDF/DOCX covering all assigned PSs.</p></div>'+list.map(a=>'<section class="panel challenge'+(fresh?' ps-new':'')+'"><p class="eyebrow">YOUR CHALLENGE / '+esc(a.id)+'</p><h2>'+esc(a.title)+'</h2>'+briefMarkup(a.brief)+'<div class="twist"><p class="eyebrow">'+(a.revealed?'CONSTRAINTS / '+a.revealedCount+' OF '+a.constraintCount+' RELEASED':'CONSTRAINTS · NOT RELEASED')+'</p><p>'+(a.revealed?esc(a.constraints):'The organiser will reveal this challenge’s constraints here.')+'</p></div></section>').join(''):'<div class="panel"><h2>NO PS ASSIGNED YET.</h2><p class="muted">Your team login is working. The organiser has not allocated a problem statement yet. Ask the organiser to use Direct allocation.</p></div>';if(hasTeamSnapshot&&fresh&&list.length)window.PSReveal?.impact();lastAssignment=key;hasTeamSnapshot=true;}
async function pollTeam(){try{const d=await api('/api/me?version='+teamVersion);if(d.role==='admin'){message('You are signed in as an organiser. Open the organiser panel or sign out to use a Team ID.');$('logout').hidden=false;$('challenge-board').hidden=false;cards((await api('/api/public')).problems);}else{renderTeam(d);connection(true);}}catch(e){if(e.status===401){$('login').hidden=false;$('workspace').hidden=true;$('logout').hidden=true;$('challenge-board').hidden=true;teamVersion=-1;lastAssignment='';hasTeamSnapshot=false;publicProblems=[];cardFingerprint='';seenProblems.clear();if($('phase'))$('phase').textContent='SIGN IN REQUIRED';}else{connection(false);message(e.message);}}pollTimer=setTimeout(pollTeam,3000+Math.random()*700);}
function table(head,rows){return `<table><thead><tr>${head.map(h=>'<th>'+esc(h)+'</th>').join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;}
function selected(selector){return [...document.querySelectorAll(selector+':checked')].map(n=>n.value);}
function renderManualEditor(teamId){
 const select=$('edit-team');if(!select)return;
 const wanted=teamId??select.value;
 select.innerHTML='<option value="">Select a team</option>'+current.teams.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.id)+' · '+esc(t.name)+'</option>').join('');
 select.value=current.teams.some(t=>t.id===wanted)?wanted:'';
 const t=current.teams.find(t=>t.id===select.value);
 $('edit-credit-save').disabled=$('edit-ps-save').disabled=!t;
 $('edit-team-summary').textContent=t?t.name+' ('+t.id+') · Starting '+t.starting+' · Spent '+t.spent+' · Available '+(t.starting-t.spent)+' · PS: '+(assignedIds(t).join(', ')||'Not allotted'):'Choose a team to edit.';
 $('edit-starting').value=t?t.starting:'';
 $('edit-spent').value=t?t.spent:'';
 $('edit-credit-reason').value='';$('edit-ps-reason').value='';
 const mine=t?assignedIds(t):[];
 $('edit-ps-list').innerHTML=t?current.problems.filter(p=>p.published||mine.includes(p.id)).map(p=>{
  const owner=current.teams.find(other=>other.id!==t.id&&assignedIds(other).includes(p.id));
  return '<label class="ps-pick"><input class="edit-ps-check" type="checkbox" value="'+esc(p.id)+'" '+(mine.includes(p.id)?'checked':'')+' '+(owner?'disabled':'')+'><span><strong>'+esc(p.id)+'</strong> · '+esc(p.title)+'<small>'+(owner?'Already allotted to '+esc(owner.id):mine.includes(p.id)?'Currently allotted':'Available')+'</small></span></label>';
 }).join(''):'<p class="muted">Choose a team first.</p>';
}
async function loadAdmin(){current=await api('/api/admin/state');$('login').hidden=true;$('admin-workspace').hidden=false;$('retry').hidden=!readPending();connection(true);phase(current);$('phase-select').value=current.phase;
$('admin-problems').innerHTML=current.problems.length?current.problems.map(p=>`<div class="toolbar"><label><input type="checkbox" class="pick-problem" value="${esc(p.id)}"> ${esc(p.id)} · ${esc(p.title)} <small class="tag">${p.published?'RELEASED':'DRAFT'}</small></label><div class="row">${!p.published?`<button class="primary" data-release-one="${esc(p.id)}">Release this PS</button>`:current.teams.some(t=>assignedIds(t).includes(p.id))?'<span class="tag">ALLOCATED</span>':`<button class="primary" data-allocate-ps="${esc(p.id)}">Show / bid</button><button class="primary" data-direct-ps="${esc(p.id)}">Allocate directly</button>`}<button data-preview="${esc(p.id)}">Preview</button><button data-edit="${esc(p.id)}" ${p.published?'disabled':''}>Edit</button></div></div>`).join(''):'<p class="muted">No problem statements yet. Add your final event content here.</p>';
document.querySelectorAll('[data-release-one]').forEach(b=>b.onclick=safe(async()=>{if(confirm('Release '+b.dataset.releaseOne+' so all teams can read it?')){await mutate('publish',{ids:[b.dataset.releaseOne],published:true});message('PS released to all teams. Click Allocate directly beside it to choose a team.');}}));
document.querySelectorAll('[data-direct-ps]').forEach(b=>b.onclick=()=>{document.querySelector('[data-tab="allocation"]').click();window.dispatchEvent(new CustomEvent('r2-direct-ps',{detail:{problemId:b.dataset.directPs}}));$('tab-allocation').scrollIntoView({block:'start'});});
document.querySelectorAll('[data-allocate-ps]').forEach(b=>b.onclick=()=>{document.querySelector('[data-tab="auction"]').click();window.dispatchEvent(new CustomEvent('r2-choose-ps',{detail:{problemId:b.dataset.allocatePs}}));$('tab-auction').scrollIntoView({block:'start'});});
document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>showProblem(current.problems.find(p=>p.id===b.dataset.preview)));
document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{const p=current.problems.find(p=>p.id===b.dataset.edit);for(const [k,v] of Object.entries(p)){const el=$('problem-form').elements.namedItem(k);if(el)el.value=v;}});
$('admin-teams').innerHTML=table(['ID / Team','Starting','Spent','Available','Problems','Actions'],current.teams.map(t=>`<tr><td>${esc(t.id)}<br>${esc(t.name)}</td><td>${t.starting}</td><td>${t.spent}</td><td>${t.starting-t.spent}</td><td>${esc(assignedIds(t).join(', ')||'—')}</td><td><button data-edit-team="${esc(t.id)}">Edit credits / PS</button> ${assignedIds(t).length&&!assignedIds(t).some(pid=>stageCount(t,pid)>0)?`<button data-reverse="${esc(t.id)}">Reverse sale</button>`:''}</td></tr>`));
$('reveal-teams').innerHTML=table(['Select','Team','Problem','Constraints'],current.teams.flatMap(t=>assignedIds(t).map(pid=>`<tr><td><input type="checkbox" class="pick-team" aria-label="Select ${esc(t.name)} ${esc(pid)}" value="${esc(t.id)}|${esc(pid)}" ${hasNext(t,pid)?'':'disabled'}></td><td>${esc(t.name)}</td><td>${esc(pid)}</td><td>${stageCount(t,pid)} / ${stages(current.problems.find(p=>p.id===pid)).length} released</td></tr>`)));
document.querySelectorAll('[data-edit-team]').forEach(b=>b.onclick=()=>{document.querySelector('[data-tab="teams"]').click();renderManualEditor(b.dataset.editTeam);$('manual-corrections').scrollIntoView({block:'start'});});
document.querySelectorAll('[data-reverse]').forEach(b=>b.onclick=safe(async()=>{const reason=prompt('Reason to reverse this sale and refund credits');if(reason&&confirm('Reverse allocation and refund this team?'))await mutate('reverse',{teamId:b.dataset.reverse,reason});}));
renderManualEditor();window.dispatchEvent(new CustomEvent('r2-state',{detail:current}));}
function exportCSV(filename,rows){const cell=v=>{let s=String(v??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};const blob=new Blob(['\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
on('close-dialog',()=>$('detail').close());
on('logout',async()=>{await api('/api/logout',{});location.href='/';});
on('login-form',async()=>{const form=$('login-form');const b=Object.fromEntries(new FormData(form));b.role=page==='admin'?'admin':'team';const button=form.querySelector('button');button.disabled=true;try{await api('/api/login',b);form.reset();message('');if(page==='admin')await loadAdmin();else{clearTimeout(pollTimer);await pollTeam();}}catch(e){if(e.status===401)throw new Error(page==='admin'?'Incorrect organiser password.':'Team not found. Enter your registered Team ID or team name. Ask the organiser if your team is missing.');throw e;}finally{button.disabled=false;}},'submit');
setInterval(()=>{if($('timer')){const seconds=Math.max(0,Math.ceil((new Date(reviewEnd).getTime()-Date.now())/1000));$('timer').textContent=reviewEnd?'REVIEW / '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'):'';}},1000);
if(page==='team'){on('problem-search',renderCards,'input');on('problem-theme',renderCards,'change');on('workspace-link',()=>{($("workspace").hidden?$('login'):$('workspace')).scrollIntoView({block:'start'});});pollTeam();}
if(page==='board'){const poll=async()=>{try{const teams=await api('/api/board');$('board').innerHTML=table(['Team','Starting','Spent','Available','Challenge'],teams.map(t=>`<tr><td>${esc(t.name)}</td><td>${t.starting}</td><td>${t.spent}</td><td>${t.available}</td><td>${esc((t.problemIds?.length?t.problemIds.join(', '):t.problemId)||'Awaiting allocation')}</td></tr>`));connection(true);}catch(e){connection(false);message(e.status===401?'Sign in on the Team workspace page first to view the credits board.':e.message);}setTimeout(poll,4000+Math.random()*1000);};poll();}
if(page==='admin'){
loadAdmin().catch(e=>{if(e.status!==401)message(e.message);});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(n=>n.classList.toggle('active',n===b));document.querySelectorAll('.admin-section').forEach(n=>n.hidden=n.id!=='tab-'+b.dataset.tab);});
on('retry',retryPending);
on('problem-form',async()=>{const body=Object.fromEntries(new FormData($('problem-form')));body.id=body.id.toUpperCase();body.startingPrice=Number(body.startingPrice);await mutate('problem',body);$('problem-form').reset();},'submit');
on('set-phase',()=>mutate('phase',{phase:$('phase-select').value,minutes:Number($('review-minutes').value)}));
async function publish(ids,published){if(!ids.length)throw new Error('Select at least one problem.');if(confirm((published?'Release':'Unpublish')+' '+ids.length+' problem statements?'))await mutate('publish',{ids,published});}
on('publish-selected',()=>publish(selected('.pick-problem'),true));on('publish-all',()=>publish(current.problems.filter(p=>!p.published).map(p=>p.id),true));on('unpublish-selected',()=>publish(selected('.pick-problem'),false));
on('csv-file',()=>{importCSV='';$('confirm-import').hidden=true;$('import-preview').textContent='';},'change');
on('preview-import',async()=>{const file=$('csv-file').files[0];if(!file)throw new Error('Choose a CSV first.');if(file.size>150000)throw new Error('CSV is too large.');importCSV=await file.text();const rows=await api('/api/admin/import-preview',{csv:importCSV});$('import-preview').innerHTML=table(['ID','Team','Leader','Credits','Import'],rows.map(t=>`<tr><td>${esc(t.id)}</td><td>${esc(t.name)}</td><td>${esc(t.leader)}</td><td>${t.starting}</td><td>${t.exists?'Skip existing':'Add'}</td></tr>`));$('confirm-import').hidden=false;});
on('confirm-import',async()=>{if(!importCSV)throw new Error('Preview the CSV first.');const r=await mutate('import',{csv:importCSV});message(`Imported ${r.added} teams; skipped ${r.skipped} existing teams.`);$('confirm-import').hidden=true;});
on('edit-team',()=>renderManualEditor(),'change');
on('edit-credit-form',async()=>{
 const t=current.teams.find(t=>t.id===$('edit-team').value);if(!t)throw new Error('Select a team first.');
 const reason=$('edit-credit-reason').value.trim();if(!reason)throw new Error('Enter a reason for the credit correction.');
 const body={teamId:t.id,starting:Number($('edit-starting').value),spent:Number($('edit-spent').value),expectedStarting:t.starting,expectedSpent:t.spent,reason};
 if(!Number.isSafeInteger(body.starting)||!Number.isSafeInteger(body.spent)||body.spent>body.starting)throw new Error('Enter whole-number credits and keep Spent at or below Starting.');
 if(body.starting===t.starting&&body.spent===t.spent)throw new Error('Credits have not changed.');
 if(!confirm('Change '+t.id+' credits from '+t.starting+'/'+t.spent+' to '+body.starting+'/'+body.spent+' (Starting/Spent)?'))return;
 await mutate('editCredits',body);message('Credits corrected for '+t.id+'.');
},'submit');
on('edit-ps-form',async()=>{
 const t=current.teams.find(t=>t.id===$('edit-team').value);if(!t)throw new Error('Select a team first.');
 const reason=$('edit-ps-reason').value.trim();if(!reason)throw new Error('Enter a reason for the PS correction.');
 const problemIds=selected('.edit-ps-check'),old=assignedIds(t);
 if(JSON.stringify(problemIds)===JSON.stringify(old))throw new Error('PS allotment has not changed.');
 if(!confirm('Replace '+t.id+' PS allotment: '+(old.join(', ')||'None')+' → '+(problemIds.join(', ')||'None')+'? Credits will NOT change.'))return;
 await mutate('editAssignments',{teamId:t.id,problemIds,expectedProblemIds:old,reason});message('PS allotment corrected for '+t.id+'. Credits unchanged.');
},'submit');
on('export-results',()=>exportCSV('round-two-results.csv',[['Team ID','Team Name','Starting Credits','Spent','Available','Problem','Constraints Released','Total Constraints'],...current.teams.map(t=>[t.id,t.name,t.starting,t.spent,t.starting-t.spent,assignedIds(t).join('; '),assignedIds(t).map(pid=>pid+': '+stageCount(t,pid)).join('; '),assignedIds(t).map(pid=>pid+': '+stages(current.problems.find(p=>p.id===pid)).length).join('; ')])]));
async function reveal(values){if(!values.length)throw new Error('Select a team and PS with an unreleased constraint.');const items=values.map(v=>{const [teamId,problemId]=v.split('|');return {teamId,problemId};});if(confirm('Reveal the NEXT constraint for '+items.map(x=>x.teamId+' / '+x.problemId).join(', ')+'? This cannot be undone.'))await mutate('reveal',{items});}
on('reveal-selected',()=>reveal(selected('.pick-team')));on('reveal-all',()=>reveal(current.teams.flatMap(t=>assignedIds(t).filter(pid=>hasNext(t,pid)).map(pid=>t.id+'|'+pid))));
on('refresh-audit',async()=>{const rows=await api('/api/admin/audit');$('audit').innerHTML=table(['Time','Action','Details'],rows.map(r=>`<tr><td>${esc(new Date(r.at).toLocaleString())}</td><td>${esc(r.action)}</td><td>${esc(JSON.stringify(r.detail))}</td></tr>`));});
}
