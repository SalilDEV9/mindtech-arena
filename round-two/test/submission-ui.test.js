'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function harness(admin=false){
 const ids=admin?['admin-submissions','submission-count','refresh-submissions','admin-workspace','tab-submissions']:['solution-form','solution-status','solution-availability','solution-upload','solution-file','solution-progress'];
 const nodes=Object.fromEntries(ids.map(id=>[id,{innerHTML:'',textContent:'',disabled:false,files:[],handlers:{},addEventListener(type,fn){this.handlers[type]=fn;},reset(){nodes['solution-file'].files=[];}}]));
 const events={},requests=[];let snapshot;const esc=s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const context={document:{getElementById:id=>nodes[id]||null,querySelector:()=>({addEventListener(){}})},window:{R2:{esc,api:async()=>snapshot},addEventListener:(type,fn)=>events[type]=fn},setInterval(){},confirm:()=>true,encodeURIComponent,Date,XMLHttpRequest:class {constructor(){this.upload={};this.headers={};}open(method,url){this.url=url;}setRequestHeader(k,v){this.headers[k]=v;}send(file){requests.push(this);this.status=200;this.responseText=JSON.stringify({ok:true});this.onload();}}};
 vm.runInNewContext(fs.readFileSync('public/submissions.js','utf8'),context);
 return {nodes,requests,event(type,s){snapshot=s;events[type]({detail:s});}};
}
const state={phase:'work',team:{id:'T1'},assignment:{id:'PS1'},submission:null};
test('team form preserves selected file while polling and locks when round closes',()=>{
 const h=harness();h.event('r2-team-state',state);assert.equal(h.nodes['solution-upload'].disabled,false);
 const file={name:'solution.pdf',size:200};h.nodes['solution-file'].files=[file];h.event('r2-team-state',state);assert.equal(h.nodes['solution-file'].files[0],file);
 h.event('r2-team-state',{...state,phase:'closed'});assert.equal(h.nodes['solution-upload'].disabled,true);assert.match(h.nodes['solution-availability'].textContent,/closed/);
});
test('team upload sends selected bytes with version precondition and displays success',async()=>{
 const h=harness();h.event('r2-team-state',state);h.nodes['solution-file'].files=[{name:'solution.pdf',size:200}];
 await h.nodes['solution-form'].handlers.submit({preventDefault(){}});assert.equal(h.requests.length,1);assert.equal(h.requests[0].headers['X-Submission-Version'],'');assert.match(h.nodes['solution-progress'].textContent,/saved successfully/);assert.equal(h.nodes['solution-upload'].disabled,false);
});
test('oversized file is rejected before upload; admin escapes filenames and offers private links',async()=>{
 const h=harness();h.event('r2-team-state',state);h.nodes['solution-file'].files=[{name:'large.pdf',size:5*1024*1024}];await h.nodes['solution-form'].handlers.submit({preventDefault(){}});assert.equal(h.requests.length,0);
 const a=harness(true);a.event('r2-state',{teams:[{id:'T1',name:'<Team>',assignment:'PS1',submission:{filename:'<script>.pdf',size:200,uploadedAt:new Date().toISOString()}}]});assert.match(a.nodes['admin-submissions'].innerHTML,/&lt;script&gt;/);assert.match(a.nodes['admin-submissions'].innerHTML,/\/api\/submission\/T1/);assert.match(a.nodes['submission-count'].textContent,/1 \/ 1/);
});
