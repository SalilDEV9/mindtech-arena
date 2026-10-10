'use strict';
(()=>{
 const $=id=>document.getElementById(id),esc=window.R2.esc;
 let state,busy=false;
 const ids=()=>[...document.querySelectorAll('.direct-pick:checked')].map(x=>x.value);
 function summary(){
  const chosen=ids(),t=state?.teams.find(t=>t.id===$('direct-team').value),price=Number($('direct-price').value);
  const valid=Number.isSafeInteger(price)&&price>=0&&price<=1000000;
  const min=chosen.reduce((sum,id)=>sum+(state?.problems.find(p=>p.id===id)?.startingPrice||0),0);
  const available=t?t.starting-t.spent:0;
  $('direct-count').textContent=chosen.length+' PS selected · combined starting price '+min+' credits';
  $('direct-summary').textContent=state?.phase==='closed'?'Round is closed. Reopen it in 02 Release PS.':!chosen.length||!t?'Select one or more available PSs and a team.':!valid?'Enter a whole-number total credit amount.':price>available?'Insufficient credits for this bundle.':chosen.join(', ')+' → '+t.name+' ('+t.id+') · '+(price===0?'Free allocation':price+' credits deducted in total')+' · Remaining: '+(available-price)+' credits';
  $('direct-confirm').disabled=busy||!chosen.length||!t||!valid||price>available||state?.phase==='closed';
 }
 function render(s){
  state=s;const selected=new Set(ids()),oldTeam=$('direct-team').value;
  const allocated=new Set(s.teams.flatMap(t=>t.assignments?.length?t.assignments:t.assignment?[t.assignment]:[]));
  const ps=s.problems.filter(p=>p.published&&!allocated.has(p.id)),teams=s.teams.filter(t=>!t.submission);
  $('direct-problems').innerHTML=ps.length?ps.map(p=>'<label class="ps-pick"><input class="direct-pick" type="checkbox" value="'+esc(p.id)+'" '+(selected.has(p.id)?'checked':'')+'><span><strong>'+esc(p.id)+'</strong> · '+esc(p.title)+'<small>'+p.startingPrice+' CR starting</small></span></label>').join(''):'<p class="muted">All released PSs are already allocated.</p>';
  $('direct-team').innerHTML='<option value="">Choose a team</option>'+teams.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.id)+' · '+esc(t.name)+' · '+(t.starting-t.spent)+' credits'+(t.assignment?' · has PS':'')+'</option>').join('');
  $('direct-team').value=teams.some(t=>t.id===oldTeam)?oldTeam:'';
  $('direct-assignments').innerHTML='<table><thead><tr><th>Team</th><th>Assigned PSs</th><th>Credits spent</th></tr></thead><tbody>'+s.teams.map(t=>'<tr><td>'+esc(t.id)+' · '+esc(t.name)+'</td><td>'+esc((t.assignments?.length?t.assignments:t.assignment?[t.assignment]:[]).join(', ')||'Not allocated')+'</td><td>'+t.spent+'</td></tr>').join('')+'</tbody></table>';
  $('direct-problems').querySelectorAll('input').forEach(x=>x.addEventListener('change',summary));summary();
 }
 window.addEventListener('r2-state',e=>render(e.detail));
 window.addEventListener('r2-direct-ps',e=>{
  $('direct-problems').querySelectorAll('input').forEach(x=>{x.checked=x.value===e.detail.problemId;});
  $('direct-price').value='0';summary();$('direct-team').focus();
 });
 $('direct-select-all').addEventListener('click',()=>{$('direct-problems').querySelectorAll('input').forEach(x=>x.checked=true);summary();});
 $('direct-clear').addEventListener('click',()=>{$('direct-problems').querySelectorAll('input').forEach(x=>x.checked=false);summary();});
 for(const id of ['direct-team','direct-price'])$(id).addEventListener('input',summary);
 $('refresh-allocation').addEventListener('click',()=>window.R2.refresh().catch(e=>window.R2.message(e.message)));
 $('direct-allocation-form').addEventListener('submit',async e=>{
  e.preventDefault();if(busy||$('direct-confirm').disabled)return;
  const problemIds=ids(),body={problemIds,teamId:$('direct-team').value,price:Number($('direct-price').value)};
  if(!confirm($('direct-summary').textContent+'\nConfirm all '+problemIds.length+' PS allocations?'))return;
  busy=true;summary();$('direct-result').textContent='Saving bundle allocation…';
  try{await window.R2.mutate('allocate',body);$('direct-result').textContent='Saved '+problemIds.join(', ')+' → '+body.teamId+'. All selected PSs appear in the team workspace.';$('direct-price').value='0';}
  catch(err){$('direct-result').textContent=err.message;window.R2.message(err.message);}
  finally{busy=false;summary();}
 });
})();