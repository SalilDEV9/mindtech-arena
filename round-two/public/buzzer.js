'use strict';
// Short, harmonically rich game-show buzzer. Bounded mix avoids clipping.
window.createForgeBuzzer=(context,destination)=>{
 let active=[];
 function stop(){for(const node of active){try{node.stop();}catch{}}active=[];}
 function play(){
  stop();const t=context.currentTime+.015;
  for(const offset of [0,.68])for(const [frequency,level] of [[220,.34],[330,.24]]){
   const oscillator=context.createOscillator(),gain=context.createGain();
   oscillator.type='sawtooth';oscillator.frequency.setValueAtTime(frequency,t+offset);
   gain.gain.setValueAtTime(0,t+offset);gain.gain.linearRampToValueAtTime(level,t+offset+.015);
   gain.gain.setValueAtTime(level,t+offset+.48);gain.gain.linearRampToValueAtTime(0,t+offset+.58);
   oscillator.connect(gain);gain.connect(destination);oscillator.start(t+offset);oscillator.stop(t+offset+.60);
   oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};active.push(oscillator);
  }
 }
 return {play,stop};
};
