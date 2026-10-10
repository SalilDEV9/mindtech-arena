'use strict';
(()=>{
 let ctx,master,buzzer,enabled=false;
 const toggle=document.getElementById('sound-toggle'),volume=document.getElementById('sound-volume');
 function stop(){buzzer?.stop();}
 async function unlock(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;ctx ||= new Audio();if(!master){master=ctx.createGain();master.connect(ctx.destination);buzzer=window.createForgeBuzzer(ctx,master);}await ctx.resume();master.gain.value=Number(volume.value)/100;return ctx.state==='running';}
 function label(){toggle.textContent=enabled?'Reveal buzzer on · Mute':'Enable reveal buzzer';toggle.setAttribute('aria-pressed',String(enabled));}
 function reveal(){if(enabled&&ctx?.state==='running'&&!document.hidden)buzzer.play();}
 toggle?.addEventListener('click',async()=>{try{if(enabled){enabled=false;stop();}else enabled=await unlock();label();if(enabled)reveal();}catch{enabled=false;label();}});
 document.getElementById('sound-preview')?.addEventListener('click',async()=>{try{if(!enabled)enabled=await unlock();label();reveal();}catch{toggle.textContent='Tap to retry audio';}});
 volume?.addEventListener('input',()=>{if(master)master.gain.setTargetAtTime(Number(volume.value)/100,ctx.currentTime,.025);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
 window.ArenaRevealAudio={reveal,stop};
})();
