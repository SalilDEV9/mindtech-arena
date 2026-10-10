'use strict';
const {test,before,after}=require('node:test');const assert=require('node:assert/strict');const {randomUUID}=require('node:crypto');
const {createApp}=require('../server');const {MAX_BYTES,validateFile}=require('../lib/submissions');
let store,server,base,admin,cookie,other,mongo;const secret='submission-test-secret-at-least-32-characters',password='submission-test-admin-password';
const pdf=Buffer.from('%PDF-1.4\n1 0 obj <</Type /Catalog>> endobj\n%%EOF');
async function json(url,body,c=admin){const r=await fetch(base+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Round-Two':'1','Idempotency-Key':randomUUID(),Cookie:c||''},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
async function upload(data=pdf,name='solution.pdf',version='',c=cookie,extra={}){const r=await fetch(base+'/api/submission?filename='+encodeURIComponent(name),{method:'POST',headers:{'Content-Type':'application/octet-stream','X-Round-Two':'1','X-Submission-Version':version,Cookie:c||'',...extra},body:data});return {status:r.status,data:await r.json()};}
before(async()=>{
 if(process.env.ROUND2_TEST_MONGO==='1'){const {MongoMemoryReplSet}=require('mongodb-memory-server');mongo=await MongoMemoryReplSet.create({replSet:{count:1},binary:{version:'7.0.24'}});store=require('../lib/store').createStore(mongo.getUri(),'mindtech_round2_test_submissions');}
 else store=require('./memory-store').memoryStore();
 server=createApp({store,secret,password,secure:false}).listen(0);await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;
 admin=(await json('/api/login',{role:'admin',password},'')).cookie;
 await json('/api/admin/import',{csv:'Team ID,Team Name,Team Leader,Final Credits\nT1,One,Lead,100\nT2,Two,Lead,100'});
 for(const t of (await store.read()).teams){const c=(await json('/api/login',{teamId:t.id},'')).cookie;if(t.id==='T1')cookie=c;else other=c;}
});
after(async()=>{if(server)await new Promise(r=>server.close(r));if(store)await store.close();if(mongo)await mongo.stop();});
test('upload requires team login, assigned PS and same-origin request',async()=>{
 assert.equal((await upload(pdf,'solution.pdf','','')).status,401);assert.equal((await upload(pdf,'solution.pdf','',admin)).status,403);assert.equal((await upload()).status,409);
 assert.equal((await upload(pdf,'solution.pdf','',cookie,{Origin:'https://other.example'})).status,403);
 await json('/api/admin/problem',{id:'PS1',title:'Test',theme:'Test',brief:'Test brief',constraints:'Private constraint',startingPrice:10});
 await json('/api/admin/publish',{ids:['PS1'],published:true});await json('/api/admin/phase',{phase:'bidding'});await json('/api/admin/claim',{owner:'submission-test-controller'});
 await json('/api/admin/sale',{owner:'submission-test-controller',teamId:'T1',problemId:'PS1',price:10});
});
test('rejects invalid files, empty documents, unsafe filenames and oversized files',async()=>{
 for(const [data,name] of [[pdf,'bad.exe'],[Buffer.from('fake'),'fake.pdf'],[Buffer.alloc(0),'empty.pdf'],[pdf,'../bad.pdf'],[pdf,'fake.docx']])assert.equal((await upload(data,name)).status,400);
 assert.equal((await upload(Buffer.alloc(MAX_BYTES+1))).status,413);
});
test('saves PDF, reports private metadata and downloads exact bytes for team and admin',async()=>{
 const result=await upload();assert.equal(result.status,200);assert.equal(result.data.submission.problemId,'PS1');
 for(const c of [cookie,admin]){const r=await fetch(base+'/api/submission/T1',{headers:{Cookie:c}});assert.equal(r.status,200);assert.match(r.headers.get('content-disposition'),/^attachment/);assert.deepEqual(Buffer.from(await r.arrayBuffer()),pdf);}
 assert.equal((await fetch(base+'/api/submission/T1')).status,401);assert.equal((await fetch(base+'/api/submission/T1',{headers:{Cookie:other}})).status,403);
 assert.equal((await fetch(base+'/api/submission/T2',{headers:{Cookie:admin}})).status,404);
 assert.equal((await json('/api/me',null,cookie)).data.submission.filename,'solution.pdf');assert.equal((await json('/api/me',null,other)).data.submission,null);
 for(const route of ['/api/public','/api/board','/api/display'])assert.ok(!JSON.stringify((await json(route,null,'')).data).includes('solution.pdf'));
 assert.equal((await json('/api/admin/reverse',{teamId:'T1',reason:'test'})).status,400);
});
test('DOCX upload persists and downloads byte-for-byte',async()=>{
 const file=require('node:fs').readFileSync(require('node:path').join(__dirname,'fixtures/solution.docx'));
 const old=(await json('/api/me',null,cookie)).data.submission;
 const result=await upload(file,'solution.docx',old.version);assert.equal(result.status,200);
 const r=await fetch(base+'/api/submission/T1',{headers:{Cookie:admin}});assert.deepEqual(Buffer.from(await r.arrayBuffer()),file);
 const restore=await upload(pdf,'solution.pdf',result.data.submission.version);assert.equal(restore.status,200);
});
test('safe retry, replacement, stale-write protection and closed round',async()=>{
 const old=(await json('/api/me',null,cookie)).data.submission;
 assert.equal((await upload()).data.submission.version,old.version);
 const newer=Buffer.from('%PDF-1.4\nrevised\n%%EOF');
 assert.equal((await upload(newer)).status,409);
 const results=await Promise.all([upload(newer,'new.pdf',old.version),upload(newer,'other.pdf',old.version)]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 const saved=(await json('/api/me',null,cookie)).data.submission;
 assert.equal((await upload(Buffer.from('invalid'),'broken.pdf',saved.version)).status,400);
 assert.equal((await json('/api/me',null,cookie)).data.submission.version,saved.version);
 await json('/api/admin/phase',{phase:'closed'});assert.equal((await upload(pdf,'closed.pdf',saved.version)).status,409);
 assert.equal((await fetch(base+'/api/submission/T1',{headers:{Cookie:admin}})).status,200);
 await json('/api/admin/rotate',{teamId:'T1'});assert.equal((await upload()).status,401);assert.equal((await fetch(base+'/api/submission/T1',{headers:{Cookie:cookie}})).status,401);
});
test('DOCX validation accepts a real Word document',async()=>{
 const fs=require('node:fs');const file=fs.readFileSync(require('node:path').join(__dirname,'fixtures/solution.docx'));assert.equal((await validateFile('solution.docx',file)).contentType,'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});
