const {test}=require('node:test'),assert=require('node:assert/strict');const {initial,apply,teamState,csvRows}=require('../lib/domain');
test('CSV handles BOM, quoted commas and rejects hostile headers',()=>{assert.equal(csvRows('\ufeffTeam ID,Team Name,Team Leader,Final Credits\r\nT1,"Alpha, Beta",Lead,40')[0].name,'Alpha, Beta');assert.throws(()=>csvRows('__proto__,Team Name,Team Leader,Final Credits\nx,Alpha,Lead,4'));});
test('invalid credits are rejected',()=>{for(const v of ['-1','1.5','NaN','Infinity','1000001','1e2'])assert.throws(()=>csvRows('Team ID,Team Name,Team Leader,Final Credits\nT1,A,B,'+v));});
test('twists excluded from every nonassigned team response',()=>{const s=initial();apply(s,'import',{csv:'Team ID,Team Name,Team Leader,Final Credits\nT1,One,Lead,100\nT2,Two,Lead,100'});s.problems=[{id:'P1',title:'A',brief:'B',theme:'C',constraints:'SECRET',published:true,startingPrice:10}];s.teams[0].assignment='P1';s.teams[0].revealed=true;assert.equal(teamState(s,'T1').assignment.constraints,'SECRET');assert.ok(!JSON.stringify(teamState(s,'T2')).includes('SECRET'));});
test('bulk reveal validation cannot partially commit through the repository',()=>{const s=initial();apply(s,'import',{csv:'Team ID,Team Name,Team Leader,Final Credits\nT1,One,Lead,100'});assert.throws(()=>apply(structuredClone(s),'reveal',{ids:['MISSING']}));assert.equal(s.teams[0].revealed,false);});
test('published problems remain available after bidding and work phases',()=>{const s=initial();s.problems=[{id:'P1',published:true}];apply(s,'phase',{phase:'work'});assert.equal(s.problems[0].published,true);});

test('four constraints reveal sequentially only to the assigned team',()=>{
 const s=initial();apply(s,'import',{csv:'Team ID,Team Name,Team Leader,Final Credits\nT1,One,Lead,100\nT2,Two,Lead,100'});
 s.problems=[{id:'P1',title:'A',brief:'B',theme:'C',constraints:'PRIVATE',constraintStages:['SECRET ONE','SECRET TWO','SECRET THREE','SECRET FOUR'],published:true,startingPrice:10}];s.teams[0].assignment='P1';
 for(let i=1;i<=4;i++){
  apply(s,'reveal',{ids:['T1','T1']});const a=teamState(s,'T1').assignment;
  assert.equal(a.revealedCount,i);assert.equal(a.constraintCount,4);assert.equal(s.teams[0].revealed,i===4);
  assert.ok(a.constraints.includes(s.problems[0].constraintStages[i-1]));
  for(const hidden of s.problems[0].constraintStages.slice(i))assert.ok(!JSON.stringify(a).includes(hidden));
  assert.ok(!JSON.stringify(teamState(s,'T2')).includes('SECRET'));
  assert.ok(!JSON.stringify(require('../lib/domain').publicState(s)).includes('SECRET'));
  assert.throws(()=>apply(structuredClone(s),'reverse',{teamId:'T1',reason:'correction'}));
 }
 assert.throws(()=>apply(structuredClone(s),'reveal',{ids:['T1']}),/already released/);
});
test('30 problems fit the library; numbered constraints survive organiser edits',()=>{
 const s=initial();for(let n=1;n<=30;n++)apply(s,'problem',{id:'PS'+n,title:'Title',theme:'Campus',brief:'Brief',constraints:'Constraint 1: First\n\nConstraint 2: Second\n\nConstraint 3: Third\n\nConstraint 4: Fourth',startingPrice:10});
 assert.equal(s.problems.length,30);assert.deepEqual(require('../lib/domain').constraintStages(s.problems[0]),['First','Second','Third','Fourth']);
});

test('multi-PS direct allocation is atomic and supports extra PS on a team',()=>{
 const s=initial();apply(s,'import',{csv:'Team ID,Team Name,Team Leader,Final Credits\nT1,One,A,200\nT2,Two,B,200'});
 for(const id of ['PS1','PS2','PS3'])apply(s,'problem',{id,title:id,theme:'Campus',brief:'Brief',constraints:'Constraint 1: SECRET_'+id+'\n\nConstraint 2: NEXT_'+id,startingPrice:20});
 apply(s,'publish',{ids:['PS1','PS2','PS3'],published:true});
 let r=apply(s,'allocate',{teamId:'T1',problemIds:['PS1','PS2'],price:45},'admin');
 assert.deepEqual(r.problemIds,['PS1','PS2']);assert.equal(s.teams[0].spent,45);assert.deepEqual(s.teams[0].assignments,['PS1','PS2']);
 assert.deepEqual(teamState(s,'T1').assignments.map(p=>p.id),['PS1','PS2']);
 assert.equal(teamState(s,'T1').assignment.id,'PS1');assert.equal(teamState(s,'T1').assignments[1].constraints,null);
 assert.throws(()=>apply(s,'allocate',{teamId:'T2',problemIds:['PS2','PS3'],price:0},'admin'),/already allocated/);
 assert.equal(s.teams[1].spent,0);assert.equal(s.teams[1].assignment,null);
 assert.throws(()=>apply(s,'allocate',{teamId:'T1',problemIds:['PS3','PS3'],price:0},'admin'),/more than once/);
 assert.throws(()=>apply(s,'allocate',{teamId:'T1',problemIds:['PS3'],price:170},'admin'),/Insufficient/);
 apply(s,'allocate',{teamId:'T1',problemIds:['PS3'],price:5},'admin');
 assert.deepEqual(s.teams[0].assignments,['PS1','PS2','PS3']);assert.equal(s.teams[0].spent,50);
 apply(s,'reveal',{items:[{teamId:'T1',problemId:'PS2'}]},'admin');
 const d=teamState(s,'T1');assert.equal(d.assignments[0].constraints,null);assert.match(d.assignments[1].constraints,/SECRET_PS2/);assert.equal(d.assignments[2].constraints,null);
 assert.throws(()=>apply(s,'reverse',{teamId:'T1',reason:'correction'},'admin'),/Constraints have been seen/);
});
test('multi-PS auction persists lot and enforces combined starting price',()=>{
 const s=initial();apply(s,'import',{csv:'Team ID,Team Name,Team Leader,Final Credits\nT1,One,A,100'});
 for(const pid of ['P1','P2'])apply(s,'problem',{id:pid,title:'Demo',theme:'Campus',brief:'Brief',constraints:'Twist',startingPrice:20});
 apply(s,'publish',{ids:['P1','P2'],published:true});
 apply(s,'phase',{phase:'bidding'});const owner='test-controller-owner-bundle';
 apply(s,'claim',{owner});
 apply(s,'auction',{owner,sequence:1,problemIds:['P1','P2'],price:40,status:'open'});
 assert.deepEqual(s.auction.problemIds,['P1','P2']);
 assert.throws(()=>apply(s,'sale',{owner,teamId:'T1',problemIds:['P1','P2'],price:39}),/combined starting/);
 const r=apply(s,'sale',{owner,teamId:'T1',problemIds:['P1','P2'],price:45});
 assert.deepEqual(r.problemIds,['P1','P2']);assert.equal(s.teams[0].spent,45);assert.equal(s.auction.status,'sold');
 assert.deepEqual(s.auction.problemIds,['P1','P2']);
 assert.throws(()=>apply(s,'sale',{owner,teamId:'T1',problemId:'P2',price:20}),/already allocated/);
});
