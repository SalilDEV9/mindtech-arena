'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function harness(){
 const nodes=new Map();let sounds=0,writes=0;const get=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',addEventListener(){},classList:{remove(){},add(){}},showModal(){this.open=true;},set innerHTML(v){this.html=v;writes++;},get innerHTML(){return this.html;}});return nodes.get(id);};
 const c={document:{body:{dataset:{page:'test'}},getElementById:get,querySelectorAll:()=>[]},window:{PSReveal:{impact(){sounds++;}}},setInterval(){},setTimeout(){},clearTimeout(){},sessionStorage:{getItem(){return null;}},crypto:{},console};vm.createContext(c);vm.runInContext(fs.readFileSync('public/app.js','utf8'),c);return {c,get,sounds:()=>sounds,writes:()=>writes};
}
const p={id:'PS01',title:'<script>Campus</script>',theme:'Student life',brief:'Problem Statement:\nPublic brief\n\nTarget Users: Students\n\nExpected MVP:\n● A working flow\n\nSuggested Technology: JavaScript',startingPrice:10};
test('unchanged polling does not recreate cards or replay crash; new PS sounds once',()=>{
 const h=harness();h.c.cards([p]);const writes=h.writes();h.c.cards([p]);assert.equal(h.writes(),writes);assert.equal(h.sounds(),0);
 h.c.cards([p,{...p,id:'PS02'}]);assert.equal(h.sounds(),1);h.c.cards([p,{...p,id:'PS02'}]);assert.equal(h.sounds(),1);
});
test('full PS reveal separates the sections, escapes titles and plays only on user reveal',()=>{
 const h=harness();h.c.showProblem(p,true);const html=h.get('detail-body').innerHTML;assert.match(html,/Target Users/);assert.match(html,/Expected MVP/);assert.match(html,/Suggested Technology/);assert.match(html,/&lt;script&gt;/);assert.equal(h.sounds(),1);
});
test('search narrows the challenge board without playing sounds',()=>{
 const h=harness();h.c.cards([p,{...p,id:'PS02',title:'Different challenge'}]);h.get('problem-search').value='PS02';h.c.renderCards();assert.ok(h.get('problems').innerHTML.includes('Different challenge'));assert.ok(!h.get('problems').innerHTML.includes('data-read="PS01"'));assert.equal(h.sounds(),0);
});
test('participant page loads crash effects only; all panel destinations remain reachable',()=>{
 const html=fs.readFileSync('public/index.html','utf8');assert.match(html,/ps-reveal.js/);assert.ok(!html.includes('reveal-audio.js'));assert.ok(!html.includes('Enable BGM'));
 for(const path of ['/admin','/board','/auction'])assert.ok(html.includes('href="'+path+'"'));
});
