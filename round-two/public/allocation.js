'use strict';
(()=>{
 const $=id=>document.getElementById(id),esc=window.R2.esc;let state,busy=false;
 function summary(){
  const p=state?.problems.find(p=>p.id===$('direct-problem').value),t=state?.teams.find(t=>t.id===$('direct-team').value),price=Number($('direct-price').value);
  const valid=Number.isSafeInteger(price)&&price>=0&&price<=1000000;
  $('direct-summary').textContent=state?.phase==='closed'?'Round is closed. Reopen it in 02 Release PS.':!p||!t?'Choose an available PS and team.':!valid?'Enter a whole-number credit amount.':price>t.starting-t.spent?'This team does not have enough credits.':`${p.id} → ${t.name} (${t.id}) · ${price===0?'Free allocation':price+' credits deducted'} · Remaining: ${t.starting-t.spent-price} credits`;
  $('direct-confirm').disabled=busy||!p||!t||!valid||price>t.starting-t.spent||state?.phase==='closed';
 }
 function render(s){state=s;const oldP=$('direct-problem').value,oldT=$('direct-team').value;
  const ps=s.problems.filter(p=>p.published&&!s.teams.some(t=>t.assignment===p.id)),teams=s.teams.filter(t=>!t.assignment);
  $('direct-problem').innerHTML='<option value="">Choose an available PS</option>'+ps.map(p=>`<option value="${esc(p.id)}">${esc(p.id)} · ${esc(p.title)}</option>`).join('');
  $('direct-team').innerHTML='<option value="">Choose an unassigned team</option>'+teams.map(t=>`<option value="${esc(t.id)}">${esc(t.id)} · ${esc(t.name)} · ${t.starting-t.spent} credits</option>`).join('');
  $('direct-problem').value=ps.some(p=>p.id===oldP)?oldP:'';$('direct-team').value=teams.some(t=>t.id===oldT)?oldT:'';
  $('direct-assignments').innerHTML='<table><thead><tr><th>Team</th><th>Assigned PS</th><th>Credits spent</th></tr></thead><tbody>'+s.teams.map(t=>`<tr><td>${esc(t.id)} · ${esc(t.name)}</td><td>${esc(t.assignment||'Not allocated')}</td><td>${t.spent}</td></tr>`).join('')+'</tbody></table>';summary();
 }
 window.addEventListener('r2-state',e=>render(e.detail));
 window.addEventListener('r2-direct-ps',e=>{$('direct-problem').value=e.detail.problemId;$('direct-price').value='0';summary();$('direct-team').focus();});
 for(const id of ['direct-problem','direct-team','direct-price'])$(id).addEventListener('input',summary);
 $('refresh-allocation').addEventListener('click',()=>window.R2.refresh().catch(e=>window.R2.message(e.message)));
 $('direct-allocation-form').addEventListener('submit',async e=>{
  e.preventDefault();if(busy||$('direct-confirm').disabled)return;
  const body={problemId:$('direct-problem').value,teamId:$('direct-team').value,price:Number($('direct-price').value)};
  if(!confirm($('direct-summary').textContent+'\nConfirm this allocation?'))return;
  busy=true;summary();$('direct-result').textContent='Saving allocation…';
  try{await window.R2.mutate('allocate',body);$('direct-result').textContent=`Saved: ${body.problemId} allocated to ${body.teamId}. The team can now see it in their workspace.`;$('direct-price').value='0';}
  catch(err){$('direct-result').textContent=err.message;window.R2.message(err.message);}
  finally{busy=false;summary();}
 });
})();
