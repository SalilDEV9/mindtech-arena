'use strict';
/* Original instrumental reveal cue. No speech, external media or audio requests. */
(()=>{
 let ctx,master,enabled=false,nodes=[],stopTimer;
 const toggle=document.getElementById('sound-toggle'),volume=document.getElementById('sound-volume');
 function stop(){clearTimeout(stopTimer);for(const n of nodes){try{n.stop();}catch{}}nodes=[];}
 async function unlock(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){toggle.textContent='Audio unavailable';return false;}ctx ||= new Audio();if(!master){master=ctx.createGain();master.connect(ctx.destination);}await ctx.resume();master.gain.value=Number(volume.value)/100*.35;return ctx.state==='running';}
 function tone(freq,start,duration,gain,type='sine'){
  const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;
  g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(gain,start+.035);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
  o.connect(g);g.connect(master);o.start(start);o.stop(start+duration+.02);nodes.push(o);o.onended=()=>{o.disconnect();g.disconnect();};
 }
 function reveal(){if(!enabled||!ctx||ctx.state!=='running'||document.hidden)return;stop();const t=ctx.currentTime+.04;
  // D minor / Bb / F / C: warm sustained harmony, low pulse and rising motif.
  const chords=[[146.83,174.61,220],[116.54,146.83,174.61],[130.81,174.61,220],[130.81,164.81,196]];
  chords.forEach((ch,i)=>ch.forEach(f=>tone(f,t+i*2,2.5,.10,'triangle')));
  const melody=[293.66,349.23,440,523.25,440,349.23,392,523.25,587.33];
  melody.forEach((f,i)=>tone(f,t+i*.65,1.25,.12,'sine'));
  for(let i=0;i<16;i++){tone(i%4===0?55:73.42,t+i*.5,.28,i%4===0?.30:.12);}
  tone(73.42,t+6.5,2.5,.16,'triangle');stopTimer=setTimeout(stop,10000);
 }
 toggle?.addEventListener('click',async()=>{try{if(enabled){enabled=false;stop();}else enabled=await unlock();toggle.textContent=enabled?'BGM on · Mute':'Enable BGM';toggle.setAttribute('aria-pressed',String(enabled));}catch{enabled=false;toggle.textContent='Tap to retry audio';toggle.setAttribute('aria-pressed','false');}});
 document.getElementById('sound-preview')?.addEventListener('click',async()=>{try{if(!enabled){enabled=await unlock();toggle.textContent=enabled?'BGM on · Mute':'Enable BGM';toggle.setAttribute('aria-pressed',String(enabled));}reveal();}catch{toggle.textContent='Tap to retry audio';}});
 volume?.addEventListener('input',()=>{if(master)master.gain.setTargetAtTime(Number(volume.value)/100*.35,ctx.currentTime,.05);});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
 window.ArenaRevealAudio={reveal,stop};
})();
