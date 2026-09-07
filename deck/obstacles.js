/* DECK obstacle-course collection. First Light retains its original layout. */
(function(global){
  'use strict';
  const C=global.DeckCore,T=global.THREE,{v,clamp}=C,legacyBuild=C.buildLevel,legacyPath=C.coursePath;
  const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
  const names={bowl:'Sculpted bowl',roof:'Rooftop wedges',grid:'Open grid',drop:'Split descent',terrace:'High / low decks',bank:'Wall transfer',slalom:'Roundabout',islands:'Stepping islands',wave:'Rolling crests',spine:'Ridge and valleys',fork:'Three-way flyover'};
  // Authored sequences: each course gets a different ordering, turn direction,
  // elevation profile and risk line. Shapes are broad arenas, not widened ribbons.
  const recipes=[null,
    ['bowl','roof','grid','terrace'],['terrace','bowl','bank','drop'],['slalom','bowl','roof','bank'],['bank','grid','terrace','bowl'],['bowl','drop','slalom','terrace','grid'],
    ['roof','slalom','bowl','bank','grid'],['terrace','grid','roof','drop','bowl'],['drop','bowl','terrace','grid'],['grid','roof','slalom','bank','terrace'],['bank','terrace','bowl','roof'],['drop','roof','bowl','slalom','grid'],
    ['bowl','bank','grid','roof','terrace'],['slalom','terrace','bowl','roof','bank'],['drop','grid','bank','bowl','terrace'],['roof','bowl','slalom','grid','bank'],['drop','slalom','terrace','bank','grid'],['bowl','roof','bank','terrace','grid','slalom'],
    ['grid','slalom','bank','roof','terrace'],['roof','grid','terrace','slalom','bank'],['bank','bowl','grid','terrace','roof'],['terrace','roof','drop','bowl','slalom','grid'],['drop','bank','terrace','grid','roof'],['bowl','grid','roof','terrace','slalom','bank']
  ];
  for(const id of [5,9,17,21,23])recipes[id].splice(recipes[id].length-1,0,'islands');
  C.packs.push({name:'VERTICAL LIMIT',subtitle:'Find your way to the top',color:'#5073d8',sky:'#c7e2ed',water:'#407e9c'});
  const towerNames=['Stacked','Skywell','The Spire','Tower Run'];
  const towerRecipes=[['bowl','grid','roof','slalom','terrace'],['grid','roof','bowl','islands','terrace'],['roof','slalom','grid','bowl','terrace'],['bowl','islands','roof','grid','slalom','terrace']];
  towerNames.forEach((name,i)=>{const id=C.levels.length;recipes[id]=towerRecipes[i];C.levels.push({id,name,pack:4,width:18,revision:5,difficulty:i===3?'SUMMIT':'TOWER',tower:true});});
  // Hole grids are rare: exactly two in the entire collection, never every floor.
  for(let id=1;id<recipes.length;id++)if(![1,14].includes(id))recipes[id]=recipes[id].map((type,i)=>type==='grid'?['wave','spine','fork'][(id+i)%3]:type);
  for(let id=1;id<recipes.length;id++){const slot=recipes[id][0]==='drop'?(id===14?2:1):0;recipes[id][slot]='landmark';}
  for(const l of C.levels)if(l.id){l.revision=5;l.description=C.architectures[l.id].name+' · '+(l.tower?recipes[l.id].length+' floors · Momentum launch':recipes[l.id].filter(t=>t!=='landmark').slice(0,2).map(t=>names[t]).join(' · '));}

  // Arc-length sampled guides are for maps / tests only. Collision consists solely
  // of the visible pieces. A guide through a gap never creates a road there.
  function guide(points,width=16){
    const raw=points.filter((p,i)=>!i||p.distanceToSquared(points[i-1])>.00001),samples=[];let length=0;
    for(let i=0;i<raw.length-1;i++){const a=raw[i],b=raw[i+1],d=a.distanceTo(b),n=Math.max(1,Math.ceil(d/1.5));for(let j=0;j<n;j++){const p=a.clone().lerp(b,j/n),t=b.clone().sub(a).normalize();samples.push({p,t,r:v(-t.z,0,t.x).normalize(),w:width,s:length+d*j/n});}length+=d;}
    const end=raw[raw.length-1],t=end.clone().sub(raw[raw.length-2]).normalize();samples.push({p:end.clone(),t,r:v(-t.z,0,t.x).normalize(),w:width,s:length});samples.forEach(s=>s.u=s.s/length);
    const frameAt=u=>{const s=clamp(u,0,1)*length;let lo=0,hi=samples.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(samples[m].s<s)lo=m;else hi=m;}const a=samples[lo],b=samples[hi],f=clamp((s-a.s)/Math.max(.0001,b.s-a.s),0,1);return {p:a.p.clone().lerp(b.p,f),t:a.t.clone().lerp(b.t,f).normalize(),r:a.r.clone().lerp(b.r,f).normalize()};};
    return {samples,length,frameAt,curve:{getPointAt:u=>frameAt(u).p,getTangentAt:u=>frameAt(u).t},widthAt:()=>width,modules:[]};
  }
  const cached=new Map();
  function layout(index,world){
    const level=C.levels[index],recipe=recipes[index],design=C.architectures[index],route=[],arenas=[],alternatives=[],features=[];
    let cursor=v(0,[8,11,14,16,22].includes(index)?52:24,0),yaw=0;
    let stretchX=1,stretchZ=1,stretchY=1;
    const road=(points,width,kind='deck')=>{const path=C.samplePath(points.map(p=>p.toArray()),width*stretchX);if(world)world.road(path,[],kind);return path;};
    const extend=path=>route.push(...path.samples.map(s=>s.p));
    const slab=(origin,f,r,width,length,height,kind,holes)=>world?.surface((a,b)=>origin.clone().addScaledVector(r,(a-.5)*width*stretchX).addScaledVector(f,b*length*stretchZ).add(v(0,height((a-.5)*width,b*length)*stretchY,0)),Math.ceil(width*(kind==='grid'?1:stretchX)/2),Math.ceil(length*(kind==='grid'?1:stretchZ)/2),kind,holes);
    // A short start deck leaves the first obstacle visible immediately ahead.
    extend(road([cursor.clone(),cursor.clone().add(v(0,0,-32))],22));cursor.z-=32;
    for(let i=0;i<recipe.length;i++){
      const type=recipe[i],f=v(Math.sin(yaw),0,-Math.cos(yaw)),r=v(Math.cos(yaw),0,Math.sin(yaw)),origin=cursor.clone();
      stretchX=level.tower||type==='landmark'?1:.94+.075*((index+i*2)%5);stretchZ=level.tower||type==='landmark'?1:1+.1*((index*2+i)%4);stretchY=level.tower||type==='landmark'?1:.84+.06*((index+i)%4);
      const at=(x,s,h=0)=>origin.clone().addScaledVector(r,x*stretchX).addScaledVector(f,s*stretchZ).add(v(0,h*stretchY,0));
      const mark=(x,s,h=0)=>({p:at(x,s,h),t:f.clone(),r:r.clone()});
      const localRoute=(fn,length)=>{const points=[];for(let s=0;s<=length;s+=1.5)points.push(fn(s));points.push(fn(length));return guide(points);};
      let length=110,endHeight=0,width=72,safe;
      const feature={type,index:i,origin:origin.clone(),yaw,roadStart:world?.roads.length};
      if(type==='landmark'){
        length=design.length;width=design.width;endHeight=design.rise;feature.signature=design.name;
        const center=u=>width*design.bend*Math.sin((index%3+1)*Math.PI*u)*Math.sin(Math.PI*u)**2*(index%2?1:-1),envelope=u=>Math.sin(Math.PI*u)**2,span=u=>width*design.footprint(u);
        const h=(x,s)=>{const u=s/length,q=(x-center(u))/(width/2);return endHeight*ease(u)+envelope(u)*design.sculpt(q,u);};
        world?.surface((a,b)=>{const x=center(b)+(a-.5)*span(b);return at(x,b*length,h(x,b*length));},Math.ceil(width/1.8),Math.ceil(length/1.8),'landmark');
        safe=localRoute(s=>{const u=s/length,x=center(u)+span(u)/2*design.lane*envelope(u);return at(x,s,h(x,s));},length);
        for(const side of [-1,1]){const path=localRoute(s=>{const u=s/length,x=center(u)+side*span(u)*.29*envelope(u);return at(x,s,h(x,s));},length);alternatives.push({name:side<0?'LEFT ARCHITECTURAL LINE':'RIGHT ARCHITECTURAL LINE',path,entry:at(0,0),exit:at(0,length,endHeight)});}
      }else if(type==='bowl'){
        length=116;width=76;const h=(x,s)=>-13*Math.sin(Math.PI*s/length)**2+19*(x/(width/2))**2*Math.sin(Math.PI*s/length)**2;
        // The footprint swells into a broad dish; the shoulders are genuinely
        // concave and carveable all the way across, rather than decorative walls.
        world?.surface((a,b)=>{const x=(a-.5)*width*(.44+.56*Math.sin(Math.PI*b));return at(x,b*length,h(x,b*length));},38,64,'bowl');
        safe=localRoute(s=>at(0,s,h(0,s)),length);
        const carve=localRoute(s=>{const x=(index%2?1:-1)*22*Math.sin(Math.PI*s/length)**2;return at(x,s,h(x,s));},length);alternatives.push({name:'BOWL HIGH LINE',path:carve,entry:at(0,0),exit:at(0,length)});
      }else if(type==='roof'){
        length=124;width=76;
        const envelope=s=>ease(s/32)*(1-ease((s-88)/36));
        const h=(x,s)=>12*envelope(s)*Math.max(0,1-Math.sqrt(x*x+.16)/27);
        slab(origin,f,r,width,length,h,'roof');
        safe=localRoute(s=>{const x=(index%2?1:-1)*29*Math.sin(Math.PI*s/length)**2;return at(x,s,h(x,s));},length);
        const ridge=localRoute(s=>at(0,s,h(0,s)),length);alternatives.push({name:'ROOF RIDGE',path:ridge,entry:at(0,0),exit:at(0,length)});
      }else if(type==='grid'){
        length=140;width=84;const holes=[];
        for(const s of [42,70,98])for(const x of [-20,0,20])holes.push({x,s,w:12,h:16});
        const missing=(a,b)=>holes.some(h=>Math.abs((a-.5)*width-h.x)<h.w/2&&Math.abs(b*length-h.s)<h.h/2);
        // Flat jump approaches give each opening a predictable takeoff. A tiny
        // steep wedge here doubled vertical momentum under directional jumping.
        const h=()=>0;
        slab(origin,f,r,width,length,h,'grid',missing);
        safe=localRoute(s=>at(-34*ease(s/30)*(1-ease((s-112)/28)),s),length);
        const fast=localRoute(s=>at(0,s,h(0,s)),length);alternatives.push({name:'GRID HOP LINE',path:fast,entry:at(0,0),exit:at(0,length),jumpZones:[34,62,90].map(s=>at(0,s)),requiresJump:true});
        feature.holes=holes.map(h=>({center:at(h.x,h.s),width:h.w*stretchX,length:h.h*stretchZ}));
        // Small white bevel-like stripes around each opening are part of the
        // same physical slab; the mesh's boundary edges supply their blue outline.
      }else if(type==='wave'){
        length=144;width=82;const h=(x,s)=>9*Math.sin(2*Math.PI*s/length)**2*(1-.78*ease(Math.abs(x)/34));
        slab(origin,f,r,width,length,h,'wave');safe=localRoute(s=>at(0,s,h(0,s)),length);
        for(const side of [-1,1]){const low=localRoute(s=>{const x=side*32*Math.sin(Math.PI*s/length)**2;return at(x,s,h(x,s));},length);alternatives.push({name:side<0?'LEFT ROLLER BYPASS':'RIGHT ROLLER BYPASS',path:low,entry:at(0,0),exit:at(0,length)});}
      }else if(type==='spine'){
        length=140;width=84;const h=(x,s)=>Math.sin(Math.PI*s/length)**2*(12*Math.exp(-x*x/100)-6*Math.exp(-(((Math.abs(x)-25)/11)**2)));
        slab(origin,f,r,width,length,h,'bowl');safe=localRoute(s=>{const x=-26*Math.sin(Math.PI*s/length)**2;return at(x,s,h(x,s));},length);
        for(const side of [0,1]){const line=localRoute(s=>{const x=side*26*Math.sin(Math.PI*s/length)**2;return at(x,s,h(x,s));},length);alternatives.push({name:side?'RIGHT VALLEY':'HIGH SPINE',path:line,entry:at(0,0),exit:at(0,length)});}
      }else if(type==='fork'){
        length=144;width=94;slab(origin,f,r,44,18,()=>0,'deck');slab(at(0,126),f,r,58,18,()=>0,'deck');
        const center=road([at(0,10),at(0,46,-5),at(0,88,-5),at(0,116),at(0,134)],20,'drop');safe=guide([at(0,0),...center.samples.map(s=>s.p),at(0,length)]);
        for(const side of [-1,1]){const flyover=road([at(0,10),at(side*29,42,7),at(side*32,86,10),at(side*26,117,0),at(0,134)],12,'shortcut');alternatives.push({name:side<0?'LEFT FLYOVER':'RIGHT FLYOVER',path:guide([at(0,0),...flyover.samples.map(s=>s.p),at(0,length)]),entry:at(0,0),exit:at(0,length)});}
      }else if(type==='drop'){
        length=132;width=70;endHeight=-18;
        slab(origin,f,r,40,14,()=>0,'deck');
        const wide=road([at(0,10),at(-19,40,-3),at(-22,82,-14),at(-22,105,-18),at(0,132,-18)],20,'drop');
        const steep=road([at(0,10),at(13,34,-8),at(14,86,-18),at(0,122,-18)],14,'shortcut');
        const catchHeight=(x,s)=>-6*Math.sin(Math.PI*s/60)**2+4*(x/14)**2*Math.sin(Math.PI*s/60)**2;
        slab(at(0,30,-18),f,r,28,60,catchHeight,'bowl');
        slab(at(0,90,-18),f,r,28,30,()=>0,'deck');
        slab(at(0,118,-18),f,r,48,14,()=>0,'deck');
        safe=guide([at(0,0),...wide.samples.map(s=>s.p),at(0,length,endHeight)]);
        alternatives.push({name:'STEEP DESCENT',path:guide([at(0,0),...steep.samples.map(s=>s.p),at(0,length,endHeight)]),entry:at(0,0),exit:at(0,length,endHeight)});
        const middle=guide([at(0,0),at(0,14),at(0,30,-18),...localRoute(s=>at(0,30+s,-18+catchHeight(0,s)),60).samples.map(s=>s.p),at(0,120,-18),at(0,length,endHeight)]);
        alternatives.push({name:'MIDDLE BOWL DROP',path:middle,entry:at(0,0),exit:at(0,length,endHeight)});
      }else if(type==='terrace'){
        length=154;width=80;endHeight=12;
        const rise=s=>s<16?0:12*(1-Math.cos(clamp((s-16)/44,0,1)*Math.PI/2));
        slab(origin,f,r,28,60,(x,s)=>rise(s),'scoop');
        // A real eight-metre opening after the curved lip: speed carries the
        // board onto the separate high platform. No jump pad or launch script.
        slab(at(0,68,12),f,r,42,86,()=>0,'deck');
        const lower=road([at(0,0),at(35,32,-4),at(35,86,-4),at(35,126,12),at(26,142,12),at(0,154,12)],16,'shortcut');
        safe=localRoute(s=>at(0,s,rise(s)),length);alternatives.push({name:'LOWER RAMP',path:lower,entry:at(0,0),exit:at(0,length,endHeight)});
        feature.gap={from:at(0,60,12),to:at(0,68,12)};
      }else if(type==='bank'){
        length=142;width=64;endHeight=-8;
        const h=(x,s)=>7*ease(s/65)+x*.55*Math.sin(Math.PI*s/140)**2;
        slab(origin,f,r,58,70,h,'wall');
        slab(at(0,88,-8),f,r,60,54,()=>0,'deck');
        safe=guide([...localRoute(s=>at(0,s,h(0,s)),70).samples.map(s=>s.p),at(0,88,-8),at(0,length,-8)]);
        feature.gap={from:at(0,70,h(0,70)),to:at(0,88,-8)};
        // The outside wall line trades a longer carve for a higher takeoff.
        const high=guide([...localRoute(s=>{const x=14*Math.sin(Math.PI*s/140)**2;return at(x,s,h(x,s));},70).samples.map(s=>s.p),at(10,106,-8),at(0,length,-8)]);
        alternatives.push({name:'HIGH WALL',path:high,entry:at(0,0),exit:at(0,length,-8)});
      }else if(type==='islands'){
        length=184;width=78;const islandCenters=[12,52,92,132,172],heights=[0,2,0,3,0];
        for(let j=0;j<islandCenters.length;j++)slab(at(j%2?4:0,islandCenters[j]-12,heights[j]),f,r,22,24,()=>0,'island');
        const around=road([at(0,0),at(-31,31,-4),at(-34,94,-4),at(-29,148,0),at(-23,172,0),at(0,length)],14,'connector');safe=around;
        const hop=guide([at(0,0),...islandCenters.map((s,j)=>at(j%2?4:0,s,heights[j])),at(0,length)]);
        const jumpZones=islandCenters.slice(0,-1).map((s,j)=>at(j%2?4:0,s+12,heights[j])),jumpTargets=islandCenters.slice(1).map((s,j)=>at((j+1)%2?4:0,s,heights[j+1]));
        alternatives.push({name:'ISLAND HOPS',path:hop,entry:at(0,0),exit:at(0,length),requiresJump:true,jumpZones,jumpTargets});
        // Two real crossovers let a run mix the outside bridge with individual
        // jumps. Match the island height BEFORE entering its side, avoiding a
        // raised lip or an underside collision at either merge.
        const distance=p=>p.clone().sub(origin).dot(f),near=s=>around.samples.reduce((a,b)=>Math.abs(distance(a.p)-s)<Math.abs(distance(b.p)-s)?a:b).p.clone();
        const entry=near(40),exit=near(160);
        const inbound=road([entry,near(50),near(58),at(-23,66,-4),at(-14,76,0),at(0,86,0),at(0,98,0)],9,'transfer');
        const outbound=road([at(4,124,3),at(-14,136,3),at(-22,149,0),exit],9,'transfer');
        feature.transfers=[inbound,outbound];
        const enterPoints=[...around.samples.filter(s=>distance(s.p)<distance(entry)).map(s=>s.p),...inbound.samples.map(s=>s.p)];
        const leavePoints=[...outbound.samples.map(s=>s.p),...around.samples.filter(s=>distance(s.p)>distance(exit)).map(s=>s.p)];
        alternatives.push({name:'BRIDGE TO ISLANDS',path:guide([...enterPoints,...hop.samples.filter(s=>distance(s.p)>98).map(s=>s.p)]),entry:at(0,0),exit:at(0,length),requiresJump:true,jumpZones:jumpZones.slice(2),jumpTargets:jumpTargets.slice(2)});
        alternatives.push({name:'ISLANDS TO BRIDGE',path:guide([...hop.samples.filter(s=>distance(s.p)<124).map(s=>s.p),...leavePoints]),entry:at(0,0),exit:at(0,length),requiresJump:true,jumpZones:jumpZones.slice(0,3),jumpTargets:jumpTargets.slice(0,3)});
        alternatives.push({name:'MIXED TRANSFER LINE',path:guide([...enterPoints,...hop.samples.filter(s=>distance(s.p)>98&&distance(s.p)<124).map(s=>s.p),...leavePoints]),entry:at(0,0),exit:at(0,length),requiresJump:true,jumpZones:jumpZones.slice(2,3),jumpTargets:jumpTargets.slice(2,3)});
      }else if(type==='slalom'){
        length=132;width=78;slab(origin,f,r,width,length,()=>0,'deck');
        const centers=[{x:-5,s:43},{x:5,s:89}];
        for(const c of centers){if(world){const p=at(c.x,c.s),n=48,vertices=[],top=[],id=world.roads.length;
          const add=(a,b,c,isTop=false)=>{world.triangle(a,b,c,{roadId:id,top:isTop});for(const q of [a,b,c])vertices.push(...q.toArray());if(isTop)for(const q of [a,b,c])top.push(q.x,q.y+.012,q.z);};
          for(let j=0;j<n;j++){const a=j/n*Math.PI*2,b=(j+1)/n*Math.PI*2,p0=p.clone().add(v(Math.cos(a)*10,0,Math.sin(a)*10)),p1=p.clone().add(v(Math.cos(b)*10,0,Math.sin(b)*10)),q0=p0.clone().add(v(0,10,0)),q1=p1.clone().add(v(0,10,0));add(p0,q0,p1);add(p1,q0,q1);add(p.clone().add(v(0,10,0)),q1,q0,true);add(p,p0,p1);}
          world.roads.push({vertices,top,kind:'obstacle',meshOnly:true,path:{samples:[],length:0},gaps:[],edgeL:[],edgeR:[]});}}
        safe=guide(C.samplePath([at(0,0),at(20,43),at(-20,89),at(0,length)].map(p=>p.toArray()),16).samples.map(s=>s.p));
        const outside=guide(C.samplePath([at(0,0),at(-25,43),at(-25,89),at(0,length)].map(p=>p.toArray()),16).samples.map(s=>s.p));alternatives.push({name:'OUTSIDE LINE',path:outside,entry:at(0,0),exit:at(0,length)});
      }
      feature.length=length*stretchZ;feature.width=width*stretchX;feature.end=at(0,length,endHeight);feature.roadEnd=world?.roads.length;features.push(feature);extend(safe);
      arenas.push({type,width:width*stretchX,length:length*stretchZ,origin,yaw,holes:feature.holes});
      if(world){
        // Boost and rebound toys are optional lines on open decks, never required
        // substitutes for the ramps. Keep the safe route and camera sightline clear.
        if(type==='roof'){const p=mark(24,10);world.pads.push({...p,type:'boost',radius:3,speed:58});}
        if(type==='slalom'){const p=at(29,66,.5);world.bumpers.push({p,r:1.65,strength:52,hit:0,at:mark(29,66)});}
      }
      cursor=at(0,length,endHeight);
      if(i<recipe.length-1&&level.tower){
        const lead=cursor.clone().addScaledVector(f,24);extend(road([cursor.clone(),lead],22));cursor=lead;
        const upperY=origin.y+36,next=v(0,upperY,0);
        const wrap=road([cursor.clone(),cursor.clone().addScaledVector(f,15),at(70,length+68,6),v(102,origin.y+17,origin.z-length/2),v(86,upperY-7,28),v(30,upperY,30),next],20,'ascent');extend(wrap);
        const express=road([cursor.clone(),cursor.clone().addScaledVector(f,12),at(-50,length+62,9),v(-65,upperY-8,origin.z-length/2),v(-50,upperY,15),v(-22,upperY,24),next],8,'shortcut');
        alternatives.push({name:'FLOOR '+(i+1)+' EXPRESS RAMP',path:express,entry:cursor.clone(),exit:next.clone()});
        // A third ascent uses momentum through a genuinely over-vertical lip.
        // The launch is physical: no pad, teleport, scripted impulse or auto-flip.
        if(i===0){
        const theta=[2.12,2.25,2.35][index%3],radius=(upperY-cursor.y+5)/(1-Math.cos(theta)),runup=130,vertLength=runup+radius*theta;
        const frameAt=u=>{const s=u*vertLength,a=Math.max(0,s-runup)/radius;return {p:s<=runup?cursor.clone().add(v(-s,0,0)):cursor.clone().add(v(-runup-radius*Math.sin(a),radius*(1-Math.cos(a)),0)),t:v(-Math.cos(a),Math.sin(a),0),r:v(0,0,-1)};};
        const vert={samples:[],length:vertLength,frameAt,curve:{getPointAt:u=>frameAt(u).p,getTangentAt:u=>frameAt(u).t},widthAt:()=>14};const count=Math.ceil(vertLength/.6);for(let j=0;j<=count;j++)vert.samples.push({...frameAt(j/count),s:j/count*vertLength,u:j/count,w:14});
        world?.road(vert,[],'vert');
        const catchOrigin=v(-78,upperY,cursor.z+25),catchRoadId=world?.roads.length;slab(catchOrigin,v(0,0,-1),v(1,0,0),136,50,()=>0,'deck');
        const landing=v(-96,upperY,cursor.z),returnLane=road([landing,v(-96,upperY,cursor.z+16),v(-124,upperY,cursor.z+34),v(-190,upperY,cursor.z+40),v(-196,upperY,origin.z-length/2),v(-150,upperY,34),v(-65,upperY,35),next],16,'transfer');
        alternatives.push({name:'FLOOR '+(i+1)+' FLIP LAUNCH',path:guide([...vert.samples.map(s=>s.p),landing,...returnLane.samples.map(s=>s.p)]),entry:cursor.clone(),exit:next.clone(),requiresFlip:true,vert,landing,catchRoadId});
        }
        cursor=next;yaw=0;
      }else if(i<recipe.length-1){
        const turn=design.turns[i%design.turns.length],nextYaw=yaw+turn,nextF=v(Math.sin(nextYaw),0,-Math.cos(nextYaw)),rise=design.floors[i%design.floors.length],lead=17+(index+i)%3*6,reach=56+index%3*8;
        const points=[cursor.clone(),cursor.clone().addScaledVector(f,lead),cursor.clone().addScaledVector(f,lead+15).addScaledVector(nextF,30).add(v(0,rise*.5,0)),cursor.clone().addScaledVector(f,lead+15).addScaledVector(nextF,reach).add(v(0,rise,0))];
        extend(road(points,20,'connector'));cursor=points[3];yaw=nextYaw;
      }
    }
    const f=v(Math.sin(yaw),0,-Math.cos(yaw));extend(road([cursor.clone(),cursor.clone().addScaledVector(f,48)],26));
    const path=guide(route);path.arenas=arenas;path.alternatives=alternatives;path.features=features;path.tower=!!level.tower;path.finishU=1-18/path.length;
    return path;
  }
  C.coursePath=level=>{if(!level.id)return legacyPath(level);if(!cached.has(level.id))cached.set(level.id,layout(level.id,null));return cached.get(level.id);};
  C.buildLevel=index=>{
    if(index===0)return legacyBuild(0);
    const w=new C.World(),path=layout(index,w);w.level=C.levels[index];w.path=path;w.features=path.features;w.alternatives=path.alternatives;w.branches=path.alternatives.map(a=>a.path);w.signs=[];w.landings=[];w.tower=path.tower;
    const start=path.frameAt(.003),finish=path.frameAt(path.finishU);w.spawn=start.p.clone().add(v(0,.55,0));w.heading=Math.atan2(start.t.x,-start.t.z);w.finish=finish;w.finishS=path.length-18;w.medals=[path.length/30+7,path.length/23+10,path.length/17+14];return w;
  };
  C.obstacleGuide=guide;
})(typeof window!=='undefined'?window:globalThis);
