'use strict';
(()=>{
 const $=id=>document.getElementById(id),esc=window.R2.esc;
 const size=n=>(n/1024/1024).toFixed(2)+' MB';
 let team=null,submission=null,canUpload=false,busy=false;
 function renderTeam(d){
  team=d.team;submission=d.submission;canUpload=!!d.assignment&&['bidding','work'].includes(d.phase);
  $('solution-status').innerHTML=submission?`<p><strong>Submitted ✓</strong> · ${esc(submission.filename)} · ${size(submission.size)}<br><span class="muted">${esc(new Date(submission.uploadedAt).toLocaleString())} · ${esc(submission.problemId)}</span></p><a class="button" href="/api/submission/${encodeURIComponent(team.id)}" download>Download your submission ↓</a>`:'<p>No solution submitted yet.</p>';
  $('solution-availability').textContent=canUpload?'Ready to submit for '+d.assignment.id+'.':!d.assignment?'Your assigned problem must appear before you can submit.':'Submissions are closed. The organiser can open Challenge work to accept uploads.';
  $('solution-upload').disabled=busy||!canUpload;$('solution-file').disabled=busy||!canUpload;
  $('solution-upload').textContent=submission?'Replace solution ↗':'Upload solution ↗';
 }
 if($('solution-form')){
  window.addEventListener('r2-team-state',e=>renderTeam(e.detail));
  $('solution-form').addEventListener('submit',async e=>{
   e.preventDefault();if(busy||!canUpload)return;
   const file=$('solution-file').files[0],progress=$('solution-progress');
   if(!file||!file.size||! /\.(pdf|docx)$/i.test(file.name)){progress.textContent='Choose a non-empty PDF or DOCX file.';return;}
   if(file.size>4*1024*1024){progress.textContent='File must be 4 MB or smaller.';return;}
   if(submission&&!confirm('Replace your submitted solution with '+file.name+'?'))return;
   busy=true;$('solution-upload').disabled=true;$('solution-file').disabled=true;progress.textContent='Uploading…';
   try{
    await new Promise((resolve,reject)=>{
     const xhr=new XMLHttpRequest();xhr.open('POST','/api/submission?filename='+encodeURIComponent(file.name));xhr.timeout=90000;
     xhr.setRequestHeader('Content-Type','application/octet-stream');xhr.setRequestHeader('X-Round-Two','1');xhr.setRequestHeader('X-Submission-Version',submission?.version||'');
     xhr.upload.onprogress=e=>{if(e.lengthComputable)progress.textContent=e.loaded===e.total?'Upload received. Saving your solution…':'Uploading '+Math.round(e.loaded/e.total*100)+'%…';};
     xhr.onload=()=>{let d;try{d=JSON.parse(xhr.responseText);}catch{return reject(new Error('Upload could not be confirmed. Refresh to check your submission before retrying.'));}if(xhr.status>=200&&xhr.status<300&&d.ok)resolve(d);else reject(new Error(d.error||'Upload failed.'));};
     xhr.onerror=xhr.ontimeout=()=>reject(new Error('Connection interrupted. Refresh to check whether your solution was saved before retrying.'));xhr.send(file);
    });
    $('solution-form').reset();progress.textContent='Solution saved successfully. The organisers can now download it.';
    renderTeam(await window.R2.api('/api/me'));
   }catch(err){progress.textContent=err.message;try{renderTeam(await window.R2.api('/api/me'));}catch{}}
   finally{busy=false;$('solution-upload').disabled=!canUpload;$('solution-file').disabled=!canUpload;}
  });
 }
 function renderAdmin(s){
  const teams=s.teams||[],submitted=teams.filter(t=>t.submission);
  $('submission-count').textContent=submitted.length+' / '+teams.length+' teams submitted';
  $('admin-submissions').innerHTML='<table><thead><tr><th>Team</th><th>Assigned PS</th><th>Solution</th><th>Uploaded</th><th>Download</th></tr></thead><tbody>'+teams.map(t=>{const f=t.submission;return `<tr><td>${esc(t.id)}<br>${esc(t.name)}</td><td>${esc(t.assignment||'Awaiting allocation')}</td><td>${f?esc(f.filename)+'<br>'+size(f.size):'Not submitted'}</td><td>${f?esc(new Date(f.uploadedAt).toLocaleString()):'—'}</td><td>${f?`<a class="button" href="/api/submission/${encodeURIComponent(t.id)}" download>Download ↓</a>`:'—'}</td></tr>`;}).join('')+'</tbody></table>';
 }
 if($('admin-submissions')){
  window.addEventListener('r2-state',e=>renderAdmin(e.detail));
  async function refresh(){try{renderAdmin(await window.R2.api('/api/admin/state'));}catch(e){$('submission-count').textContent=e.message;}}
  $('refresh-submissions').addEventListener('click',refresh);
  document.querySelector('[data-tab="submissions"]').addEventListener('click',refresh);
  setInterval(()=>{if(!$('admin-workspace').hidden&&!$('tab-submissions').hidden)refresh();},10000);
 }
})();
