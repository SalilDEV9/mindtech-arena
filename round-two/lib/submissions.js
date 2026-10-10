'use strict';
const {createHash,randomUUID}=require('node:crypto');
const yauzl=require('yauzl');
const {ensure,Fault}=require('./domain');
const MAX_BYTES=4*1024*1024;
async function validateFile(filename,data){
 ensure(typeof filename==='string'&&filename.length<=180&&/^[^/\\\x00-\x1f\x7f]+\.(pdf|docx)$/i.test(filename),'Choose a PDF or DOCX file.');
 ensure(Buffer.isBuffer(data)&&data.length>0,'Choose a non-empty file.');
 ensure(data.length<=MAX_BYTES,'File must be 4 MB or smaller.',413);
 const pdf=/\.pdf$/i.test(filename);
 if(pdf){ensure(data.subarray(0,8).toString('ascii').match(/^%PDF-\d\.\d/)&&data.subarray(-2048).includes(Buffer.from('%%EOF')),'This file is not a valid PDF.');}
 else await new Promise((resolve,reject)=>{
  yauzl.fromBuffer(data,{lazyEntries:true,validateEntrySizes:true},(err,zip)=>{
   if(err)return reject(new Fault(400,'This file is not a valid DOCX.'));
   const found=new Set();let count=0,total=0,finished=false;
   const fail=()=>{if(!finished){finished=true;zip.close();reject(new Fault(400,'Invalid DOCX. Use a standard, unencrypted Word document.'));}};
   zip.on('error',fail);zip.on('entry',entry=>{
    total+=entry.uncompressedSize;
    if(++count>2000||total>80*1024*1024||(entry.generalPurposeBitFlag&1)||/vbaProject\.bin$/i.test(entry.fileName))return fail();
    found.add(entry.fileName);zip.readEntry();
   });
   zip.on('end',()=>{if(finished)return;finished=true;if(['[Content_Types].xml','_rels/.rels','word/document.xml'].every(n=>found.has(n)))resolve();else reject(new Fault(400,'This ZIP file is not a DOCX document.'));});zip.readEntry();
  });
 });
 return {filename,size:data.length,contentType:pdf?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',sha256:createHash('sha256').update(data).digest('hex')};
}
function applySubmission(s,who,file,expected){
 const t=s.teams.find(t=>t.id===who.id);
 ensure(who.role==='team'&&t&&t.codeVersion===who.version,'Team session expired. Sign in again.',401);
 ensure(t.assignment,'Your team needs an assigned problem before submitting.',409);
 const old=t.submission;
 if(old&&old.sha256===file.sha256&&old.filename===file.filename&&old.problemId===t.assignment)return old;
 ensure(['bidding','work'].includes(s.phase),'Submissions are closed. Ask the organiser to open Challenge work.',409);
 ensure(typeof expected==='string'&&expected===(old?.version||''),'Your submission changed in another tab. Refresh before replacing it.',409);
 t.submission={...file,version:randomUUID(),problemId:t.assignment,uploadedAt:new Date().toISOString()};
 s.revision++;s.publicRevision++;s.updatedAt=t.submission.uploadedAt;return t.submission;
}
module.exports={MAX_BYTES,validateFile,applySubmission};
