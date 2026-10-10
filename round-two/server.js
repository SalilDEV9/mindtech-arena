'use strict';
const {MAX_BYTES,validateFile}=require('./lib/submissions');
const express=require('express');const path=require('node:path');const crypto=require('node:crypto');const {Fault,ensure,code,publicState,teamState,csvRows}=require('./lib/domain');const {createStore}=require('./lib/store');
function equal(a,b){return crypto.timingSafeEqual(crypto.createHash('sha256').update(String(a)).digest(),crypto.createHash('sha256').update(String(b)).digest());}
function createApp({store,secret=process.env.ROUND2_SESSION_SECRET,password=process.env.ROUND2_ADMIN_PASSWORD,secure=!!process.env.VERCEL}={}){
const app=express();app.disable('x-powered-by');app.disable('etag');app.set('trust proxy',1);app.use((req,res,next)=>{res.set({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"});if(secure)res.set('Strict-Transport-Security','max-age=31536000');next();});app.use(express.json({limit:'200kb'}));
function configured(){ensure(secret&&secret.length>=32&&password&&password.length>=12,'Round 2 is awaiting secure configuration.',503);if(!store)store=createStore(process.env.ROUND2_MONGODB_URI,process.env.ROUND2_DB_NAME||'mindtech_round2');return store;}
function sign(data){const p=Buffer.from(JSON.stringify({...data,exp:Date.now()+8*3600000})).toString('base64url');return p+'.'+crypto.createHmac('sha256',secret).update(p).digest('base64url');}
function session(req){configured();try{const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('r2session='))?.slice(10);ensure(token,'Sign in to continue.',401);const [p,s]=token.split('.');ensure(equal(s,crypto.createHmac('sha256',secret).update(p).digest('base64url')),'Invalid session.',401);const data=JSON.parse(Buffer.from(p,'base64url'));ensure(data.exp>Date.now(),'Session expired. Sign in again.',401);return data;}catch(e){if(e instanceof Fault)throw e;throw new Fault(401,'Invalid session.');}}
function cookie(res,value,age=28800){res.set('Set-Cookie',`r2session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure?'; Secure':''}`);}
app.use('/api',(req,res,next)=>{if(!['GET','HEAD'].includes(req.method)){if(req.headers['x-round-two']!=='1')return res.status(403).json({error:'Invalid request origin.'});const origin=req.headers.origin;if(origin){try{if(new URL(origin).host!==req.get('host'))return res.status(403).json({error:'Invalid request origin.'});}catch{return res.status(403).json({error:'Invalid request origin.'});}}}next();});
app.get('/api/health',async(req,res)=>{try{await configured().db();res.json({status:'ready',module:'round-two'});}catch{res.status(503).json({status:'setup-required',module:'round-two'});}});
app.post('/api/login',async(req,res)=>{const db=configured();await db.limit('ip:'+req.ip,1000);if(req.body.role==='admin')await db.limit('admin:'+req.ip,20);const b=req.body;let data;if(b.role==='admin'){ensure(typeof b.password==='string'&&equal(b.password,password),'Invalid credentials.',401);data={role:'admin'};}else{const id=String(b.teamId||'').toUpperCase();await db.limit('team:'+id);const s=await db.read();const t=s.teams.find(x=>x.id===id);ensure(t&&typeof b.code==='string'&&equal(b.code,code(t,secret)),'Invalid credentials.',401);data={role:'team',id:t.id,version:t.codeVersion};}cookie(res,sign(data));res.json({role:data.role});});
app.post('/api/logout',(req,res)=>{cookie(res,'',0);res.json({ok:true});});
app.get('/api/me',async(req,res)=>{const who=session(req);const s=await store.read();if(who.role==='admin')return res.json({role:'admin'});const t=s.teams.find(t=>t.id===who.id);ensure(t&&t.codeVersion===who.version,'Team code changed. Sign in again.',401);if(req.query.version===String(s.publicRevision))return res.json({unchanged:true,revision:s.publicRevision});res.json({role:'team',...teamState(s,who.id)});});
function teamSession(req){const who=session(req);ensure(who.role==='team','Sign in with your team code to submit.',403);return who;}
app.post('/api/submission',(req,res,next)=>{req.teamSession=teamSession(req);next();},express.raw({type:'application/octet-stream',limit:MAX_BYTES,inflate:false}),async(req,res)=>{
 const who=req.teamSession;
 await store.limit('submission:'+who.id,100);
 const file=await validateFile(req.query.filename,req.body);
 const submission=await store.saveSubmission(who,file,req.body,req.get('X-Submission-Version'));
 res.json({ok:true,submission});
});
app.get('/api/submission/:teamId',async(req,res)=>{
 const who=session(req),s=await store.read();
 if(who.role!=='admin'){
  const t=s.teams.find(t=>t.id===who.id);
  ensure(t&&t.codeVersion===who.version,'Team session expired. Sign in again.',401);
  ensure(who.role==='team'&&who.id===req.params.teamId,'You can download only your own solution.',403);
 }
 const file=await store.getSubmission(req.params.teamId);ensure(file,'No solution has been uploaded yet.',404);
 res.set('Content-Type',file.contentType);
 res.attachment(file.filename);res.send(file.data);
});
app.get('/api/public',async(req,res)=>res.json(publicState(await configured().read())));
app.use('/api/admin',(req,res,next)=>{ensure(session(req).role==='admin','Organiser access required.',403);next();});
app.get('/api/admin/state',async(req,res)=>res.json(await store.read()));app.get('/api/admin/audit',async(req,res)=>res.json(await store.audit()));
app.get('/api/admin/codes',async(req,res)=>{const s=await store.read();res.json(s.teams.map(t=>({id:t.id,name:t.name,code:code(t,secret)})));});
app.post('/api/admin/import-preview',async(req,res)=>{const s=await store.read();res.json(csvRows(req.body.csv).map(t=>({id:t.id,name:t.name,leader:t.leader,starting:t.starting,exists:s.teams.some(x=>x.id===t.id)})));});
app.post('/api/admin/:action',async(req,res)=>res.json(await store.mutate(req.params.action,req.body,'admin',req.get('Idempotency-Key'))));
app.get('/api/display',async(req,res)=>{const s=await configured().read();res.json({...s.auction,problems:publicState(s).problems,leaderName:s.teams.find(t=>t.id===s.auction.leader)?.name||'',synced:true});});
app.get('/api/board',async(req,res)=>{const s=await configured().read();res.json(s.teams.map(t=>({id:t.id,name:t.name,starting:t.starting,spent:t.spent,available:t.starting-t.spent,problemId:t.assignment})));});
const pages={'/':'index.html','/admin':'admin.html','/auction':'auction.html','/board':'board.html','/round-two':'index.html','/round-two/admin':'admin.html','/round-two/auction':'auction.html'};for(const [route,file]of Object.entries(pages))app.get(route,(req,res)=>res.sendFile(path.join(__dirname,'public',file),{etag:false,lastModified:false}));app.use(express.static(path.join(__dirname,'public'),{etag:false,lastModified:false}));app.use((req,res)=>res.status(404).json({error:'Not found.'}));app.use((err,req,res,next)=>{const status=err.status||503;res.status(status).json({error:err instanceof Fault?err.message:status===413?'File must be 4 MB or smaller.':status===400?'Invalid request.':'Unable to save or load. Keep this screen open and retry. No success has been confirmed.'});});return app;}
const app=createApp();module.exports=app;module.exports.createApp=createApp;if(require.main===module)app.listen(process.env.PORT||3000,()=>console.log('Idea Forge listening on '+(process.env.PORT||3000)));
