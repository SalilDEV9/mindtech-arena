'use strict';
const {applySubmission}=require('./submissions');
const {MongoClient}=require('mongodb');const {createHash}=require('node:crypto');const {ensure,initial,apply}=require('./domain');
function createStore(uri,name){ensure(name==='mindtech_round2'||/^mindtech_round2_test_[a-z0-9]+$/.test(name),'Only the isolated Round 2 database is allowed.',503);ensure(typeof uri==='string'&&uri.length>0,'Round 2 database is not configured.',503);const client=new MongoClient(uri,{maxPoolSize:10,serverSelectionTimeoutMS:5000,connectTimeoutMS:5000,timeoutMS:12000});let ready;
async function db(){if(!ready)ready=(async()=>{await client.connect();const d=client.db(name);await d.collection('events').updateOne({_id:'event'},{$setOnInsert:initial()},{upsert:true});await d.collection('limits').createIndex({expires:1},{expireAfterSeconds:0});return d;})().catch(e=>{ready=null;throw e;});return ready;}
return {client,db,
async saveSubmission(who,file,data,expected){
 const d=await db(),session=client.startSession();
 try{return await session.withTransaction(async()=>{
  const s=await d.collection('events').findOne({_id:'event'},{session});
  const before=s.teams.find(t=>t.id===who.id)?.submission?.version;
  const metadata=applySubmission(s,who,file,expected);
  if(metadata.version===before)return metadata;
  await d.collection('submissions').replaceOne({_id:who.id},{_id:who.id,...metadata,data},{upsert:true,session});
  await d.collection('events').replaceOne({_id:'event'},s,{session});
  await d.collection('operations').insertOne({_id:'submission-'+metadata.version,action:'submission',actor:who.id,at:new Date(),detail:{teamId:who.id,problemId:metadata.problemId,filename:metadata.filename,size:metadata.size}},{session});
  return metadata;
 },{readConcern:{level:'snapshot'},writeConcern:{w:'majority'},maxCommitTimeMS:5000,timeoutMS:12000});}finally{await session.endSession();}
},
async getSubmission(teamId){const doc=await (await db()).collection('submissions').findOne({_id:teamId});if(doc)doc.data=Buffer.isBuffer(doc.data)?doc.data:Buffer.from(doc.data.value());return doc;},
async read(){return (await db()).collection('events').findOne({_id:'event'});},async limit(key,max=20){const d=await db();const window=Math.floor(Date.now()/600000);const r=await d.collection('limits').findOneAndUpdate({_id:createHash('sha256').update(key+window).digest('hex')},{$inc:{count:1},$setOnInsert:{expires:new Date(Date.now()+1200000)}},{upsert:true,returnDocument:'after'});ensure(r.count<=max,'Too many sign-in attempts. Try again in ten minutes.',429);},async mutate(action,body,actor,key){ensure(typeof key==='string'&&/^[a-zA-Z0-9_-]{16,100}$/.test(key),'Missing operation ID.');const d=await db();const session=client.startSession();const fingerprint=createHash('sha256').update(JSON.stringify({action,body,actor})).digest('hex');try{return await session.withTransaction(async()=>{const ops=d.collection('operations');const existing=await ops.findOne({_id:key},{session});if(existing){ensure(existing.fingerprint===fingerprint,'Operation ID was reused for a different request.',409);return existing.result;}const s=await d.collection('events').findOne({_id:'event'},{session});const result=apply(s,action,body,actor);await d.collection('events').replaceOne({_id:'event'},s,{session});await ops.insertOne({_id:key,fingerprint,result,action,actor,at:new Date(),detail:{teamId:body.teamId||null,problemId:body.problemId||null,price:body.price??null,reason:body.reason||null,ids:body.ids||null}},{session});return result;},{readConcern:{level:'snapshot'},writeConcern:{w:'majority'},maxCommitTimeMS:5000,timeoutMS:12000});}finally{await session.endSession();}},async audit(){return (await db()).collection('operations').find({action:{$nin:['auction','claim']}}).sort({at:-1}).limit(100).project({fingerprint:0}).toArray();},async close(){await client.close();}};}
module.exports={createStore};
