'use strict';
// A single short impact effect for participant reveals. No music or narration.
(()=>{
 let context,enabled=false,active=[],timer;
 const button=document.getElementById('reveal-sound');
 function stop(){clearTimeout(timer);active.forEach(n=>{try{n.stop();}catch{}});active=[];}
 async function unlock(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;context ||= new Audio();await context.resume();return context.state==='running';}
 function impact(){
  if(!enabled||!context||context.state!=='running'||document.hidden)return;
  stop();const t=context.currentTime,duration=.85;
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,2);
  const noise=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
  noise.buffer=buffer;filter.type='lowpass';filter.frequency.setValueAtTime(3500,t);filter.frequency.exponentialRampToValueAtTime(180,t+.75);
  gain.gain.setValueAtTime(.0001,t);gain.gain.linearRampToValueAtTime(.18,t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  noise.connect(filter);filter.connect(gain);gain.connect(context.destination);noise.start(t);noise.stop(t+duration);active.push(noise);
  noise.onended=()=>{noise.disconnect();filter.disconnect();gain.disconnect();};
  const thud=context.createOscillator(),low=context.createGain();thud.frequency.setValueAtTime(110,t);thud.frequency.exponentialRampToValueAtTime(35,t+.35);low.gain.setValueAtTime(.0001,t);low.gain.linearRampToValueAtTime(.22,t+.008);low.gain.exponentialRampToValueAtTime(.0001,t+.45);thud.connect(low);low.connect(context.destination);thud.start(t);thud.stop(t+.5);active.push(thud);thud.onended=()=>{thud.disconnect();low.disconnect();};timer=setTimeout(stop,1000);
 }
 button?.addEventListener('click',async()=>{try{enabled=enabled?false:await unlock();if(!enabled)stop();button.textContent=enabled?'Crash sound on · Mute':'Enable crash sound';button.setAttribute('aria-pressed',String(enabled));if(enabled)impact();}catch{enabled=false;button.textContent='Retry crash sound';button.setAttribute('aria-pressed','false');}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
 window.PSReveal={impact};
})();
