'use strict';
(()=>{
 let context,buzzer,enabled=false;
 const button=document.getElementById('reveal-sound');
 function stop(){buzzer?.stop();}
 async function unlock(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;context ||= new Audio();buzzer ||= window.createForgeBuzzer(context,context.destination);await context.resume();return context.state==='running';}
 function impact(){if(enabled&&context?.state==='running'&&!document.hidden)buzzer.play();}
 button?.addEventListener('click',async()=>{try{enabled=enabled?false:await unlock();if(!enabled)stop();button.textContent=enabled?'Reveal buzzer on · Mute':'Enable reveal buzzer';button.setAttribute('aria-pressed',String(enabled));if(enabled)impact();}catch{enabled=false;button.textContent='Retry reveal buzzer';button.setAttribute('aria-pressed','false');}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
 window.PSReveal={impact};
})();
