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
