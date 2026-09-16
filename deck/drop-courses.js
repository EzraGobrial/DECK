/* Authored downhill places; guides never supply collision across air. */
(function(global){
 'use strict';
 const C=global.DeckCore,{v}=C,oldPath=C.coursePath,oldBuild=C.buildLevel;
 const owns=id=>id===8||id===11,join=parts=>C.obstacleGuide(parts.flatMap(p=>p.samples.map(s=>s.p)));
 for(const id of [8,11]){C.levels[id].revision++;C.levels[id].width=26;C.levels[id].description=id===8?'Leave the high deck, catch the descending bowl and climb to the open ridge.':'A downhill chute feeds a wide receiver. Choose a shoulder, then carry the climb out.';}
 function build(id,w){
  const alternatives=[],features=[];
  const road=(pts,width=28,kind='deck')=>{const p=C.samplePath(pts,width);w?.road(p,[],kind);return p;};
  const feature=(name,p)=>{const a=p.samples[0];features.push({type:'drop',signature:name,origin:a.p.clone(),yaw:Math.atan2(a.t.x,-a.t.z),width:a.w,length:p.length,end:p.samples.at(-1).p.clone()});};
  const trough=(p,width,lift)=>{const g=join([p]);w?.surface((a,b)=>{const f=g.frameAt(b),x=(a-.5)*width,t=C.clamp((Math.min(b,1-b)*g.length-65)/40,0,1);return f.p.addScaledVector(f.r,x).add(v(0,lift*(Math.max(0,Math.abs(x)-8)/(width/2-8))**2*t*t*(3-2*t),0));},26,Math.ceil(g.length/1.5),'bowl');return p;};
  let parts;
  if(id===8){
   const start=road([[0,100,0],[0,100,-35],[0,100,-70]],30);
   const hermite=(a,b,da,db,t,L)=>(2*t**3-3*t*t+1)*a+(t**3-2*t*t+t)*L*da+(-2*t**3+3*t*t)*b+(t**3-t*t)*L*db;
   const h=s=>s<200?96-.35*(s-82):s<280?hermite(54.7,42,-.35,0,(s-200)/80,80):hermite(42,68,0,0,(s-280)/110,110);
   const points=[];for(let s=72;s<=390;s+=1)points.push(v(0,h(s),-s));
   const receive=trough(C.obstacleGuide(points,60),60,10);
   const outer=road([[0,68,-390],[0,68,-425],[-55,68,-480],[-88,68,-535],[-58,68,-592],[0,68,-645],[0,68,-675]],30);
   const ridge=road([[0,68,-390],[0,68,-425],[8,68,-500],[8,68,-565],[0,68,-645],[0,68,-675]],10);
   const exit=road([[0,68,-675],[0,68,-710],[55,60,-790],[150,48,-860],[240,48,-900],[295,48,-930]],32);
   alternatives.push({name:'RIDGE DECK',path:join([ridge]),entry:ridge.samples[0].p.clone(),exit:ridge.samples.at(-1).p.clone()});
   feature('HIGH DECK',start);feature('DESCENDING BOWL',receive);feature('OPEN RIDGE',outer);parts=[start,receive,outer,exit];
  }else{
   const start=road([[0,70,0],[0,70,-35],[0,62,-75],[0,42,-125],[0,28,-180],[0,28,-215]],30);
   const low=trough(C.samplePath([[0,28,-215],[0,28,-245],[-46,19,-300],[-85,16,-365],[-66,21,-432],[0,28,-492],[0,28,-525]],48),48,8);
   const shoulder=road([[0,28,-215],[0,28,-245],[20,28,-310],[24,28,-404],[0,28,-492],[0,28,-525]],11);
   const ramp=road([[0,28,-525],[0,28,-555],[0,42,-620],[0,52,-685],[0,52,-715]],32,'ascent');
   const exit=road([[0,52,-715],[0,52,-745],[60,42,-820],[165,30,-870],[270,30,-875],[345,30,-875]],32);
   alternatives.push({name:'EAST SHOULDER',path:join([shoulder]),entry:shoulder.samples[0].p.clone(),exit:shoulder.samples.at(-1).p.clone()});
   feature('DOWNHILL CHUTE',start);feature('BANKED RECEIVER',low);feature('OUTGOING RAMP',ramp);parts=[start,low,ramp,exit];
  }
  const path=join(parts);path.features=features;path.alternatives=alternatives;path.tower=false;path.finishU=1-24/path.length;
  if(id===8)path.modules=[{start:70/path.length,end:(70+Math.hypot(2,.5))/path.length,type:'drop'}];
  if(w){const spawn=path.frameAt(.002);Object.assign(w,{level:C.levels[id],path,features,alternatives,branches:alternatives.map(a=>a.path),signs:[],landings:[],tower:false,spawn:spawn.p.clone().add(v(0,.55,0)),heading:Math.atan2(spawn.t.x,-spawn.t.z),finish:path.frameAt(path.finishU),finishS:path.length-24,medals:[path.length/30+7,path.length/23+10,path.length/17+14]});}
  return path;
 }
 const cache=new Map();C.coursePath=l=>{if(!owns(l.id))return oldPath(l);if(!cache.has(l.id))cache.set(l.id,build(l.id,null));return cache.get(l.id);};
 C.buildLevel=id=>{if(!owns(id))return oldBuild(id);const w=new C.World();build(id,w);return w;};
})(typeof window!=='undefined'?window:globalThis);
