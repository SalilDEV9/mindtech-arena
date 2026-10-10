'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {initial,apply,teamState}=require('../lib/domain');
function fixture(){
 const s=initial();
 apply(s,'import',{csv:'Team ID,Team Name,Team Leader,Final Credits\nT1,Alpha,A,200\nT2,Beta,B,200'});
 for(const pid of ['PS01','PS02','PS03'])apply(s,'problem',{id:pid,title:pid,theme:'Campus',brief:'Brief',constraints:'Constraint 1: PRIVATE '+pid+'\nConstraint 2: OTHER',startingPrice:10});
 apply(s,'publish',{ids:['PS01','PS02','PS03'],published:true});
 apply(s,'allocate',{teamId:'T1',problemIds:['PS01'],price:35},'admin');
 return s;
}
test('manual credits change starting and spent without changing allotted PS numbers',()=>{
 const s=fixture();
 const r=apply(s,'editCredits',{teamId:'T1',starting:250,spent:20,expectedStarting:200,expectedSpent:35,reason:'Correct score'},'admin');
 assert.equal(r.available,230);
 assert.equal(teamState(s,'T1').team.available,230);
 assert.deepEqual(teamState(s,'T1').assignments.map(p=>p.id),['PS01']);
 assert.throws(()=>apply(structuredClone(s),'editCredits',{teamId:'T1',starting:10,spent:30,expectedStarting:250,expectedSpent:20,reason:'Invalid'},'admin'),/exceed/);
 assert.throws(()=>apply(structuredClone(s),'editCredits',{teamId:'T1',starting:300,spent:20,expectedStarting:200,expectedSpent:35,reason:'Stale'},'admin'),/changed/);
 assert.throws(()=>apply(structuredClone(s),'editCredits',{teamId:'T1',starting:300,spent:20,expectedStarting:250,expectedSpent:20,reason:'Unauthorized'},'team'),/Organiser/);
});
test('manual PS number correction keeps credits, supports multiple, and prevents duplicates',()=>{
 const s=fixture();
 const body={teamId:'T1',problemIds:['PS02','PS03'],expectedProblemIds:['PS01'],reason:'Correct IDs'};
 const r=apply(s,'editAssignments',body,'admin');
 assert.deepEqual(r.problemIds,['PS02','PS03']);
 assert.equal(s.teams[0].spent,35);
 assert.equal(teamState(s,'T1').assignment.id,'PS02');
 assert.throws(()=>apply(structuredClone(s),'editAssignments',{teamId:'T2',problemIds:['PS02'],expectedProblemIds:[],reason:'Duplicate'},'admin'),/already assigned/);
 assert.throws(()=>apply(structuredClone(s),'editAssignments',{...body,problemIds:['PS01']},'admin'),/changed/);
 apply(s,'reveal',{items:[{teamId:'T1',problemId:'PS02'}]},'admin');
 assert.throws(()=>apply(structuredClone(s),'editAssignments',{teamId:'T1',problemIds:['PS03'],expectedProblemIds:['PS02','PS03'],reason:'No'},'admin'),/private constraints/);
 apply(s,'editAssignments',{teamId:'T1',problemIds:['PS03','PS02'],expectedProblemIds:['PS02','PS03'],reason:'Reorder'},'admin');
 assert.match(teamState(s,'T1').assignments[1].constraints,/PRIVATE PS02/);
 assert.equal(teamState(s,'T1').assignment.id,'PS03');
 assert.equal(s.teams[0].spent,35);
});
test('corrections reject submitted teams and ignore unrelated credit adjustments',()=>{
 const s=fixture();s.teams[0].submission={version:'submitted'};
 assert.throws(()=>apply(structuredClone(s),'editAssignments',{teamId:'T1',problemIds:[],expectedProblemIds:['PS01'],reason:'Remove'},'admin'),/submitted/);
 apply(s,'editCredits',{teamId:'T1',starting:210,spent:35,expectedStarting:200,expectedSpent:35,reason:'Score updated'},'admin');
 assert.equal(s.teams[0].starting,210);
});

test('organiser PS editor is a single text input, without checkbox selection or reason field',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const html=fs.readFileSync(path.join(__dirname,'../public/admin.html'),'utf8');
 const js=fs.readFileSync(path.join(__dirname,'../public/app.js'),'utf8');
 assert.match(html,/id="edit-ps-numbers" type="text"/);
 assert.doesNotMatch(html,/id="edit-ps-list"|id="edit-ps-reason"/);
 assert.match(js,/function parseManualPS\(/);
 assert.match(js,/reason:'Manual PS number edit by organiser'/);
 assert.doesNotMatch(js,/\.edit-ps-check/);
});
