'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('reveal buzzer sustains two bursts at audible midrange frequencies with bounded gain',()=>{
 const sources=[],levels=[];const ctx={currentTime:0,createOscillator(){const node={frequency:{setValueAtTime(v){node.frequencyValue=v;}},connect(){},start(t){this.started=t;},stop(){this.stopped=true;},disconnect(){}};sources.push(node);return node;},createGain(){return {gain:{setValueAtTime(v){levels.push(v);},linearRampToValueAtTime(v){levels.push(v);}},connect(){},disconnect(){}};}};
 const scope={window:{}};vm.runInNewContext(fs.readFileSync('public/buzzer.js','utf8'),scope);const buzzer=scope.window.createForgeBuzzer(ctx,{});buzzer.play();assert.equal(sources.length,4);assert.deepEqual(sources.map(x=>x.frequencyValue),[220,330,220,330]);assert.ok(sources.every(x=>x.type==='sawtooth'));assert.ok(Math.max(...levels)<=.34);assert.ok(sources[2].started-sources[0].started>.6);buzzer.stop();assert.ok(sources.every(x=>x.stopped));
});
test('both reveal surfaces load the buzzer engine before audio controls; projector starts at full volume',()=>{
 for(const [file,script] of [['index.html','ps-reveal.js'],['auction.html','reveal-audio.js']]){const html=fs.readFileSync('public/'+file,'utf8');assert.ok(html.indexOf('/buzzer.js')<html.indexOf('/'+script));assert.match(html,/Enable reveal buzzer/);}
 assert.match(fs.readFileSync('public/auction.html','utf8'),/value="100" aria-label="Reveal buzzer volume"/);
});
