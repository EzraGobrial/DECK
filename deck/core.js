/* DECK: shared geometry and fixed-step simulation. No rendering or DOM required. */
(function (global) {
  'use strict';
  const T = global.THREE, V = T.Vector3;
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  const angle = (x) => Math.atan2(Math.sin(x),Math.cos(x));
  const v = (x=0,y=0,z=0) => new V(x,y,z);
  const packs = [
    {name:'OPEN WATER',subtitle:'Find your flow',color:'#157fe3',sky:'#bee5f5',water:'#3598b4'},
    {name:'HIGH TIDE',subtitle:'Climb. Carve. Commit.',color:'#00a799',sky:'#c9e8e6',water:'#258f9c'},
    {name:'GOLDEN HOUR',subtitle:'Chase the perfect line',color:'#ed6a36',sky:'#ffe4be',water:'#709fa6'},
    {name:'AFTER HOURS',subtitle:'Precision under the lights',color:'#b189fa',sky:'#233651',water:'#183d57'}
  ];
  // Each layout has its own authored centerline. Heights are absolute, in meters.
  const specs = [
    ['First Light',0,'Long bends and a gentle summit.',18,[[0,8,0],[0,8,-90],[28,16,-180],[82,9,-260],[55,8,-365],[-12,13,-450],[0,8,-560]]],
    ['Wide Awake',0,'A sweeping S with a straight inside cut.',18,[[0,8,0],[0,8,-85],[-60,14,-165],[-85,8,-255],[5,10,-330],[70,17,-415],[35,8,-540]]],
    ['Skyline',0,'Two climbs. Keep speed through the valley.',17,[[0,8,0],[0,10,-90],[38,30,-190],[80,10,-285],[28,9,-385],[-20,27,-490],[10,13,-610]]],
    ['Carve Club',0,'Link the corners with one clean line.',17,[[0,8,0],[0,8,-90],[75,12,-160],[120,12,-250],[40,18,-325],[-40,9,-410],[-5,8,-530]]],
    ['Air Mail',0,'Blue pads introduce two short gaps.',18,[[0,8,0],[0,8,-110],[-32,16,-225],[-12,14,-350],[55,8,-455],[0,8,-570]]],
    ['The Long Way',0,'Wide return bends spread over open water.',18,[[0,8,0],[0,8,-100],[80,12,-210],[230,16,-265],[350,14,-215],[420,10,-80],[555,8,-5],[720,8,-100],[860,12,-290],[950,8,-460]]],
    ['Tidal Shift',1,'A rolling slalom over open water.',16,[[0,8,0],[0,8,-90],[-75,17,-190],[-95,12,-305],[0,23,-405],[100,10,-520],[25,9,-635]]],
    ['Switchback',1,'Separated switchbacks and a distant finishing ridge.',17,[[0,8,0],[0,8,-100],[60,25,-260],[220,28,-345],[390,18,-285],[450,14,-105],[595,10,15],[750,10,-65],[790,18,-245],[880,18,-450],[1020,18,-610]]],
    ['Cloud Nine',1,'Big elevation, smooth transitions.',16,[[0,8,0],[0,8,-85],[30,30,-210],[-45,47,-310],[-70,25,-420],[25,10,-535],[90,28,-650]]],
    ['Split Decision',1,'The inner bridge needs a precise entry.',16,[[0,8,0],[0,8,-100],[95,16,-185],[145,19,-290],[60,15,-385],[-50,8,-420],[-100,18,-535],[-20,12,-645]]],
    ['Bluebird',1,'Launch, land, then set up the next turn.',16,[[0,8,0],[0,8,-120],[45,19,-235],[5,18,-375],[-70,25,-505],[-15,10,-650]]],
    ['Undertow',1,'Downhill speed meets a broad chicane.',15,[[0,27,0],[0,27,-85],[65,12,-205],[-15,8,-305],[-85,17,-405],[-10,25,-535],[85,10,-665]]],
    ['Sundowner',2,'Fast sweepers in the evening sun.',16,[[0,8,0],[0,8,-100],[85,17,-230],[150,8,-355],[40,12,-460],[-75,22,-555],[-30,9,-690]]],
    ['Corkscrew',2,'An open spiral that unwinds into a second wide arc.',16,[[0,8,0],[0,8,-100],[90,16,-230],[250,22,-260],[400,26,-155],[430,30,40],[350,34,205],[200,38,260],[115,42,365],[190,40,530],[365,30,630],[565,22,585],[720,14,410]]],
    ['Heatwave',2,'A long drop feeds two jump sections.',15,[[0,24,0],[0,24,-95],[-35,9,-215],[20,10,-350],[110,19,-475],[65,12,-620],[-25,10,-760]]],
    ['Sidewinder',2,'Four changing-radius corners.',14,[[0,8,0],[0,8,-95],[95,15,-195],[100,18,-315],[-10,12,-385],[-85,22,-490],[-15,15,-610],[100,10,-720]]],
    ['Over Under',2,'Drop into the low route, then climb to the high return bridge.',15,[[0,8,0],[0,8,-150],[120,13,-330],[300,20,-445],[485,28,-385],[560,35,-220],[485,40,-50],[300,43,-25],[205,33,-160],[235,33,-320],[395,33,-560],[560,33,-760],[740,33,-800]]],
    ['Gold Rush',2,'A long lap that rewards clean exits.',15,[[0,8,0],[0,8,-120],[-95,20,-240],[-105,12,-370],[0,15,-455],[125,25,-520],[200,13,-655],[120,8,-780],[10,18,-870]]],
    ['Night Shift',3,'Follow the edge lights through the S.',15,[[0,8,0],[0,8,-110],[95,24,-220],[120,16,-355],[0,9,-450],[-115,24,-565],[-25,14,-705],[60,8,-805]]],
    ['Knife Edge',3,'Narrow roads; an even narrower shortcut.',12,[[0,8,0],[0,8,-105],[-70,21,-225],[-115,26,-345],[-10,13,-440],[100,19,-560],[25,8,-700]]],
    ['Launch Window',3,'Three gaps. Keep an air jump in reserve.',15,[[0,8,0],[0,8,-120],[15,16,-260],[-65,25,-405],[-15,16,-555],[90,10,-705],[30,19,-850]]],
    ['Grand Tour',3,'The longest course in the collection.',15,[[0,8,0],[0,8,-120],[100,23,-230],[225,32,-320],[205,18,-480],[80,10,-580],[-65,22,-670],[-145,31,-820],[-40,16,-950],[90,8,-1080]]],
    ['Vertigo',3,'High ridges and a winding descent.',13,[[0,20,0],[0,20,-100],[70,46,-225],[155,55,-360],[70,29,-480],[-65,18,-570],[-135,37,-705],[-25,15,-845],[90,10,-965]]],
    ['One More Run',3,'A final mix of everything you learned.',14,[[0,8,0],[0,8,-105],[-75,24,-225],[-120,31,-350],[-10,12,-470],[125,26,-585],[190,40,-730],[90,20,-850],[-25,9,-940],[10,14,-1065]]]
  ];
  const levels=specs.map((s,i)=>({id:i,name:s[0],pack:s[1],description:s[2],width:s[3],points:s[4],revision:4,difficulty:['FLOW','SPORT','EXPERT','ELITE'][s[1]]}));

  function samplePath(points,width) {
    const curve=new T.CatmullRomCurve3(points.map(p=>v(...p)),false,'centripetal');
    // Smooth height transitions stay inside the authored heights, so valleys never dip
    // below their floor and ramp joins cannot grow a hidden lip through spline overshoot.
    const getPoint=curve.getPoint.bind(curve);
    curve.getPoint=function(t,target){const p=getPoint(t,target),u=clamp(t,0,1)*(points.length-1),i=Math.min(points.length-2,Math.floor(u)),f=u-i,s=f*f*(3-2*f);p.y=points[i][1]+(points[i+1][1]-points[i][1])*s;return p;};
    curve.arcLengthDivisions=1600;
    const length=curve.getLength(), count=Math.ceil(length/2.2), samples=[];
    for(let i=0;i<=count;i++){
      const u=i/count, p=curve.getPointAt(u),t=curve.getTangentAt(u).normalize(),r=v(-t.z,0,t.x).normalize();
      samples.push({p,t,r,w:typeof width==='function'?width(u):width,u,s:u*length});
    }
    return {curve,length,samples};
  }
  function pointAt(path,u){if(path.frameAt)return path.frameAt(clamp(u,0,1));const p=path.curve.getPointAt(clamp(u,0,1)),t=path.curve.getTangentAt(clamp(u,0,1)).normalize();return {p,t,r:v(-t.z,0,t.x).normalize()};}

  const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
  const courseStyles=[
    ['scoop','lift','wall'],['lift','wall','scoop'],['scoop','wall','lift'],
    ['wall','scoop','lift'],['lift','scoop','wall'],['scoop','wall','scoop']
  ];
  const featureNames={scoop:'CURVED TRANSFER',lift:'UPPER DECK',wall:'BANKED GAP',drop:'CHOOSE YOUR DROP'};
  // Separate, height-stepped pieces replace the old unbroken ribbon. Each authored
  // footprint gets its own sequence of quarter-pipe scoops, lift decks and wall rides.
  function coursePath(level){
    const base=samplePath(level.points,level.width),modules=[],styles=courseStyles[level.id%6].slice();
    const dropStart=[8,11,16,22].includes(level.id);if(dropStart)styles[0]='drop';
    if(level.id===16)styles[1]='lift';
    let floor=dropStart?58:8+(level.id===14?12:0);
    const initialFloor=floor;
    for(let i=0;i<3;i++){
      const type=styles[i],nominal=(level.id===16?[.105,.47,.80]:[.23,.52,.80])[i],gapMeters=type==='wall'?46+level.pack*8:type==='lift'?26+level.pack*3:18+level.pack*3;
      const gapU=gapMeters/base.length;let start=nominal,cost=Infinity;
      const searchWindow=level.id===16&&i===0?.01:.045;
      for(let u=nominal-searchWindow;u<nominal+searchWindow;u+=.004){
        const a=pointAt(base,u-7/base.length),b=pointAt(base,u+gapU+12/base.length),d=b.p.clone().sub(a.p);d.y=0;d.normalize();
        const ta=a.t.clone().setY(0).normalize(),tb=b.t.clone().setY(0).normalize();
        const score=2-ta.dot(d)-tb.dot(d)+Math.abs(u-nominal)*.4;
        if(score<cost){cost=score;start=u;}
      }
      const nextFloor=level.id===16?[22,58,44][i]:i===0?(dropStart?28+level.pack*3:floor+20+level.pack*3):i===1?floor+(type==='lift'?17:-9):Math.max(12,floor-14);
      const rampLength=type==='scoop'?34:type==='wall'?66:26;
      modules.push({type,start,end:start+gapU,rampStart:start-rampLength/base.length,bankStart:start-72/base.length,floor,nextFloor,lift:type==='scoop'?14:type==='wall'?5:0,index:i});
      floor=nextFloor;
    }
    // Natural transfers need their actual ramp lips aimed into a straight receiving
    // deck. Blend the geometry onto that line before takeoff and back out after a
    // generous runout; do not steer or redirect the player invisibly in midair.
    const corridors=modules.filter(m=>m.nextFloor<=m.floor).map(m=>{
      const a=base.curve.getPointAt(m.start),end=m.end+14/base.length,b=base.curve.getPointAt(Math.min(1,end)),d=b.clone().sub(a).setY(0).divideScalar(end-m.start);
      return {start:m.start,end:m.end,a,d,runout:m.type==='scoop'?90:50};
    });
    function height(u){
      let y=initialFloor;
      for(const m of modules){
        if(u<m.rampStart){
          // A concave bowl before the last scoop gives a real down-then-up transition.
          const bowlStart=m.rampStart-34/base.length;
          if(m.type==='scoop'&&m.index===2&&u>bowlStart){const x=(u-bowlStart)/(m.rampStart-bowlStart);return y-7*Math.sin(Math.PI*x)**2;}
          return y;
        }
        if(u<m.start){const x=(u-m.rampStart)/(m.start-m.rampStart);return y+m.lift*(m.type==='scoop'?1-Math.cos(x*Math.PI/2):smooth(x));}
        if(u<m.end)return y+m.lift+(m.nextFloor-y-m.lift)*smooth((u-m.start)/(m.end-m.start));
        y=m.nextFloor;
      }
      return y;
    }
    function bank(u){
      for(const m of modules)if(m.type==='wall'&&u>=m.bankStart&&u<m.start){
        const x=(u-m.bankStart)/(m.start-m.bankStart),a=pointAt(base,m.bankStart),b=pointAt(base,m.start);
        const sign=Math.sign(angle(Math.atan2(b.t.x,-b.t.z)-Math.atan2(a.t.x,-a.t.z)))||1;
        // Ease all the way back to level before the blue launch strip. Otherwise
        // an edge hit could shoot diagonally into the still-rising side of the wall.
        return sign*(.64+level.pack*.14)*smooth(x/.35)*(1-smooth((x-.55)/.24));
      }
      return 0;
    }
    function position(u){u=clamp(u,0,1);const p=base.curve.getPointAt(u);for(const c of corridors){const entry=smooth((u-c.start+36/base.length)/(24/base.length)),exit=1-smooth((u-c.end-c.runout/base.length)/(30/base.length)),weight=entry*exit;if(weight>0){const line=c.a.clone().addScaledVector(c.d,u-c.start);p.x+=(line.x-p.x)*weight;p.z+=(line.z-p.z)*weight;}}p.y=height(u);return p;}
    const path={modules,base,curve:{getPointAt:position}};
    path.frameAt=u=>{const p=position(u),t=position(Math.min(1,u+.0001)).sub(position(Math.max(0,u-.0001))).normalize(),r=v(-t.z,0,t.x).normalize().applyAxisAngle(t,bank(u));return {p,t,r};};
    path.curve.getTangentAt=u=>path.frameAt(u).t;
    const count=Math.ceil(base.length/1.55);path.samples=[];path.length=0;
    for(let i=0;i<=count;i++){const u=i/count,a=path.frameAt(u);if(i)path.length+=a.p.distanceTo(path.samples[i-1].p);path.samples.push({...a,u,w:level.width+4,s:0});}
    // Broad receiving decks, normal-width ramps, and readable, tall banked walls.
    path.widthAt=u=>{let width=level.width+4;for(const m of modules){if(u>m.rampStart&&u<m.start)width=level.width+(m.type==='wall'?6:1);const runout=m.nextFloor<=m.floor?(m.type==='scoop'?110:65)/base.length:.04;if(u>=m.end&&u<m.end+runout)width=level.width+10;}return width;};
    // Smooth width changes over several metres to avoid sharp little shoulders.
    const rawWidths=path.samples.map(s=>path.widthAt(s.u));
    path.samples.forEach((s,i)=>{s.w=0;let n=0;for(let j=Math.max(0,i-5);j<=Math.min(count,i+5);j++){s.w+=rawWidths[j];n++;}s.w/=n;s.s=s.u*path.length;});
    path.widthAt=u=>path.samples[Math.min(count,Math.round(u*count))].w;
    return path;
  }
  function pathSection(path,start,end){
    const samples=[start,...path.samples.filter(s=>s.u>start&&s.u<end).map(s=>s.u),end].map(u=>({...pointAt(path,u),u:(u-start)/(end-start),w:path.widthAt(u),s:(u-start)*path.length}));
    return {samples,length:(end-start)*path.length,frameAt:u=>pointAt(path,start+u*(end-start)),curve:{getPointAt:u=>pointAt(path,start+u*(end-start)).p}};
  }

  class World {
    constructor(){this.tris=[];this.cells=new Map();this.roads=[];this.pads=[];this.bumpers=[];this.blocks=[];this.cellSize=14;}
    triangle(a,b,c,metadata={}){
      const tri=new T.Triangle(a.clone(),b.clone(),c.clone()),normal=tri.getNormal(v());
      const item={tri,normal,id:this.tris.length,minY:Math.min(a.y,b.y,c.y),maxY:Math.max(a.y,b.y,c.y),...metadata};this.tris.push(item);
      const minX=Math.floor(Math.min(a.x,b.x,c.x)/14),maxX=Math.floor(Math.max(a.x,b.x,c.x)/14),minZ=Math.floor(Math.min(a.z,b.z,c.z)/14),maxZ=Math.floor(Math.max(a.z,b.z,c.z)/14);
      for(let x=minX;x<=maxX;x++)for(let z=minZ;z<=maxZ;z++){const key=x+','+z;if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(item);}
    }
    query(p,r=3){const found=new Set(),out=[];for(let x=Math.floor((p.x-r)/14);x<=Math.floor((p.x+r)/14);x++)for(let z=Math.floor((p.z-r)/14);z<=Math.floor((p.z+r)/14);z++)for(const t of this.cells.get(x+','+z)||[]){if(!found.has(t.id)){found.add(t.id);if(t.maxY>=p.y-r-1.6&&t.minY<=p.y+r+1.6)out.push(t);}}return out;}
    road(path,gaps=[],kind='main'){
      const vertices=[], top=[],edgeL=[],edgeR=[], depth=1.5;
      const add=(a,b,c,isTop=false)=>{this.triangle(a,b,c,{roadId:this.roads.length,top:isTop,rideableVert:kind==='vert'&&isTop});for(const p of [a,b,c])vertices.push(p.x,p.y,p.z);if(isTop)for(const p of [a,b,c])top.push(p.x,p.y+.012,p.z);};
      for(let i=0;i<path.samples.length-1;i++){
        const a=path.samples[i],b=path.samples[i+1];if(gaps.some(g=>a.s>=g.start&&b.s<=g.end))continue;
        const al=a.p.clone().addScaledVector(a.r,-a.w/2), ar=a.p.clone().addScaledVector(a.r,a.w/2),bl=b.p.clone().addScaledVector(b.r,-b.w/2),br=b.p.clone().addScaledVector(b.r,b.w/2);
        const an=a.r.clone().cross(a.t).normalize(),bn=b.r.clone().cross(b.t).normalize();
        const alb=al.clone().addScaledVector(an,-depth),arb=ar.clone().addScaledVector(an,-depth),blb=bl.clone().addScaledVector(bn,-depth),brb=br.clone().addScaledVector(bn,-depth);
        // A bank transition is a twisted surface, not one giant flat quad. Lateral
        // tessellation keeps its centreline and collision plane flush with the wheels.
        for(let lane=0;lane<8;lane++){
          const l=lane/8,r=(lane+1)/8,aa=al.clone().lerp(ar,l),ab=al.clone().lerp(ar,r),ba=bl.clone().lerp(br,l),bb=bl.clone().lerp(br,r);
          add(aa,ab,ba,true);add(ab,bb,ba,true);
        }
        add(al,alb,bl);add(bl,alb,blb);add(ar,br,arb);add(br,brb,arb);add(alb,blb,arb);add(arb,blb,brb);
        if(i===0||gaps.some(g=>Math.abs(a.s-g.end)<3)){add(al,ar,alb);add(ar,arb,alb);}
        if(i===path.samples.length-2||gaps.some(g=>Math.abs(b.s-g.start)<3)){add(bl,blb,br);add(br,blb,brb);}
        edgeL.push(al,bl);edgeR.push(ar,br);
      }
      const road={path,gaps,kind,vertices,top,edgeL,edgeR};this.roads.push(road);return road;
    }
    box(center,size){
      this.blocks.push({center:center.clone(),size:size.clone()});
      const p=[];for(let x of [-1,1])for(let y of [-1,1])for(let z of [-1,1])p.push(v(center.x+x*size.x/2,center.y+y*size.y/2,center.z+z*size.z/2));
      for(const [a,b,c,d] of [[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]]){this.triangle(p[a],p[b],p[c],{boxId:this.blocks.length-1});this.triangle(p[a],p[c],p[d],{boxId:this.blocks.length-1});}
    }
    surface(point,nx,nz,kind='deck',hole=()=>false){
      // One shared, closed mesh for drawing and collision, including the walls
      // around openings. No invisible floor is placed underneath a missing cell.
      const id=this.roads.length,vertices=[],top=[],edgeL=[],edgeR=[],grid=[],solid=[];
      for(let z=0;z<=nz;z++){grid[z]=[];for(let x=0;x<=nx;x++)grid[z][x]=point(x/nx,z/nz);}
      for(let z=0;z<nz;z++){solid[z]=[];for(let x=0;x<nx;x++)solid[z][x]=!hole((x+.5)/nx,(z+.5)/nz);}
      const add=(a,b,c,isTop=false)=>{this.triangle(a,b,c,{roadId:id,top:isTop});for(const p of [a,b,c])vertices.push(p.x,p.y,p.z);if(isTop)for(const p of [a,b,c])top.push(p.x,p.y+.012,p.z);};
      const side=(a,b)=>{const c=a.clone().add(v(0,-1.4,0)),d=b.clone().add(v(0,-1.4,0));add(a,c,b);add(b,c,d);edgeL.push(a,b);};
      for(let z=0;z<nz;z++)for(let x=0;x<nx;x++)if(solid[z][x]){
        const a=grid[z][x],b=grid[z][x+1],c=grid[z+1][x],d=grid[z+1][x+1];add(a,b,c,true);add(b,d,c,true);
        const bottom=p=>p.clone().add(v(0,-1.4,0));add(bottom(a),bottom(c),bottom(b));add(bottom(b),bottom(c),bottom(d));
        if(!solid[z-1]?.[x])side(b,a);if(!solid[z+1]?.[x])side(c,d);if(!solid[z]?.[x-1])side(a,c);if(!solid[z]?.[x+1])side(d,b);
      }
      const road={vertices,top,edgeL,edgeR,kind,meshOnly:true,gaps:[],path:{samples:[],length:0}};this.roads.push(road);return road;
    }
  }

  function buildLevel(index){
    const level=levels[index],world=new World(),path=coursePath(level);
    world.path=path;world.level=level;world.features=path.modules;world.signs=[];world.landings=[];
    let last=0;
    for(const m of path.modules){
      const rampStart=Math.max(last+.005,m.type==='wall'?m.bankStart:m.rampStart);
      world.road(pathSection(path,last,rampStart),[],'deck');
      world.road(pathSection(path,rampStart,m.start),[],m.type);
      // A blue pad has a fixed, visible launch direction and impulse, never a teleport.
      const padU=m.start-4.5/path.length,a=pointAt(path,padU),landing=pointAt(path,m.end+9/path.length);
      // Upward transfers keep a blue lift. Downhill scoops launch through their
      // curved geometry; low wall/drop exits use forward speed, not a skyward kick.
      m.natural=m.nextFloor<=m.floor;
      if(!m.natural)world.pads.push({...a,type:'jump',s:padU*path.length,radius:4.2,width:path.widthAt(padU)-.4,halfLength:3.3,target:landing.p.clone(),feature:m.type});
      else if(m.type!=='scoop'&&m.type!=='drop')world.pads.push({...a,type:'boost',s:padU*path.length,radius:4.2,width:path.widthAt(padU)-.4,halfLength:3.3,speed:70,feature:m.type});
      const boostU=Math.max(last+.025,rampStart-13/path.length),boost=pointAt(path,boostU);
      if(m.type!=='drop')world.pads.push({...boost,type:'boost',s:boostU*path.length,radius:3.4});
      world.landings.push({...landing,index:m.index,label:featureNames[m.type],height:Math.round(m.nextFloor),from:a.p.clone()});
      world.signs.push({at:pointAt(path,Math.max(last+.012,rampStart-22/path.length)),text:m.type==='wall'?'BANK → GAP':m.type==='lift'?(m.natural?'DROP / LAND':'BLUE = UP'):m.type==='drop'?'CHOOSE A DROP':'RAMP TRANSFER'});
      last=m.end;
    }
    world.road(pathSection(path,last,1),[],'deck');
    world.branches=[];
    if(path.modules[0].type==='drop'){
      const a=pointAt(path,.055),b=pointAt(path,path.modules[0].end+.012),offset=level.id===16?76:level.width+12;
      for(const side of [-1,1]){
        const a1=a.p.clone().addScaledVector(a.t,20).addScaledVector(a.r,side*offset*.7),mid=a.p.clone().lerp(b.p,.5).addScaledVector(a.r,side*offset),b1=b.p.clone().addScaledVector(b.t,-20).addScaledVector(b.r,side*7);
        a1.y=a.p.y-(side<0?3:10);mid.y=side<0?b.p.y+15:b.p.y+3;b1.y=b.p.y;
        const branch=samplePath([a.p.toArray(),a1.toArray(),mid.toArray(),b1.toArray(),b.p.toArray()],side<0?12:8.5);world.road(branch,[],'shortcut');world.branches.push(branch);
        world.signs.push({at:pointAt(branch,.12),text:side<0?'WIDE DESCENT':'STEEP / FAST'});
      }
    }
    // Optional rebound lines sit off the main driving line. Approach the marked red
    // side and the reflected trajectory cuts the next corner across an open gap.
    const m=path.modules[1],u=m.end+Math.min(.035,(path.modules[2].rampStart-m.end)*.3),a=pointAt(path,u),side=index%2?1:-1;
    const p=a.p.clone().addScaledVector(a.r,side*(path.widthAt(u)/2+.6)).add(v(0,.50,0));
    world.bumpers.push({p,r:1.65,strength:52,hit:0,side,at:a});
    // A rebound landing gives the red object a real optional shortcut destination.
    const startU=u+.027,endU=Math.min(path.modules[2].rampStart-.012,startU+.08),entry=pointAt(path,startU),exit=pointAt(path,endU);
    if(endU>startU+.025){
      const mid=entry.p.clone().lerp(exit.p,.5),lead=Math.min(12,entry.p.distanceTo(exit.p)*.2);
      const inPoint=entry.p.clone().addScaledVector(entry.t,lead),outPoint=exit.p.clone().addScaledVector(exit.t,-lead);
      const cut=samplePath([entry.p.toArray(),inPoint.toArray(),mid.toArray(),outPoint.toArray(),exit.p.toArray()],6.5);
      world.road(cut,[],'shortcut');world.shortcut=cut;
    }
    const start=pointAt(path,.008),finish=pointAt(path,.975);
    world.spawn=start.p.clone().add(v(0,.55,0));world.heading=Math.atan2(start.t.x,-start.t.z);world.finish=finish;world.finishS=path.length*.975;
    world.medals=[path.length/34+6,path.length/27+10,path.length/20+16];
    return world;
  }

  class Runner {
    constructor(world){this.world=world;this.reset();}
    boardUp(){return v(0,1,0).applyEuler(new T.Euler(this.pitchTilt,0,-this.tilt)).applyAxisAngle(v(0,1,0),-this.heading);}
    reset(){this.p=this.world.spawn.clone();this.velocity=v();this.heading=this.world.heading;this.grounded=false;this.normal=v(0,1,0);this.jumps=0;this.elapsed=0;this.started=false;this.won=false;this.padCooldown=new Map();this.bumperCooldown=new Map();this.events=[];this.coyote=.1;this.tilt=0;this.pitchTilt=0;this.airTime=0;this.surface=null;this.takeoffSurface=null;this.airStart=this.p.clone();this.progress=0;this.boostTime=0;this.reboundTime=0;this.launchTime=0;this.jumpSpeedTime=0;this.lastLanding=null;this.crashTime=0;}
    step(dt,input={}){
      this.events=[];if(this.won)return;const previousPosition=this.p.clone(),wasGrounded=this.grounded;
      this.airTime=this.grounded?0:this.airTime+dt;
      this.crashTime=Math.max(0,this.crashTime-dt);
      const steer=clamp(input.steer||0,-1,1),throttle=this.crashTime>0?0:clamp(input.throttle||0,-1,1);
      if(throttle||input.jump)this.started=true;if(this.started)this.elapsed+=dt;
      this.boostTime=Math.max(0,this.boostTime-dt);this.reboundTime=Math.max(0,this.reboundTime-dt);this.launchTime=Math.max(0,this.launchTime-dt);
      this.jumpSpeedTime=Math.max(0,this.jumpSpeedTime-dt);
      const speed=Math.hypot(this.velocity.x,this.velocity.z);
      this.heading+=steer*dt*(this.grounded?clamp(2.5-speed*.012,1.7,2.5):1.25)*(this.velocity.dot(v(Math.sin(this.heading),0,-Math.cos(this.heading)))<-.5?-1:1);
      const f=v(Math.sin(this.heading),0,-Math.cos(this.heading));
      if(this.grounded){f.projectOnPlane(this.normal).normalize();if(this.surfaceIsVert&&this.normal.y<.4&&this.velocity.length()>4)f.copy(this.velocity).projectOnPlane(this.normal).normalize();}
      const r=f.clone().cross(this.grounded?this.normal:v(0,1,0)).normalize();
      // Keep the collision capsule aligned to the takeoff surface for the first
      // instant of a jump; flattening it immediately drove its nose into the ramp.
      if(this.grounded)this.contactForward=f.clone();
      const collisionForward=f.clone();if(!this.grounded&&this.airTime<.20){if(this.contactForward)collisionForward.copy(this.contactForward);else collisionForward.projectOnPlane(this.normal).normalize();}
      if(this.grounded){
        const lateral=this.velocity.dot(r);this.velocity.addScaledVector(r,-lateral*(1-Math.exp(-dt*14)));
        const forwardSpeed=this.velocity.dot(f);
        if(throttle<0&&forwardSpeed>1)this.velocity.addScaledVector(f,throttle*33*dt);else this.velocity.addScaledVector(f,throttle*(throttle<0?9:11.5)*dt);
        this.velocity.multiplyScalar(Math.exp(-.14*dt));
      }else {
        if(throttle&&this.launchTime<=0)this.velocity.addScaledVector(f,throttle*2.2*dt);
        // Mild air control lets a player correct a landing without erasing launch momentum.
        this.velocity.addScaledVector(r,-this.velocity.dot(r)*(1-Math.exp(-dt*(this.launchTime>0?.12:.85))));
      }
      if(this.grounded){
        const forward=v(Math.sin(this.heading),0,-Math.cos(this.heading)),right=v(Math.cos(this.heading),0,Math.sin(this.heading));
        this.tilt=Math.asin(clamp(this.normal.dot(right),-1,1));this.pitchTilt=Math.atan2(-this.normal.dot(forward),this.normal.y);
      }else{
        // Held input adds rotation rather than choosing a limited tilt angle.
        // Releasing keeps the orientation. Both axes can complete unlimited flips.
        this.tilt+=clamp(input.tilt||0,-1,1)*3.4*dt;
        this.pitchTilt+=clamp(input.pitch||0,-1,1)*3.4*dt;
      }
      if(input.jump && this.crashTime<=0 && (this.grounded||this.coyote>0||this.jumps<2)){
        // Jump away from the deck's top, not world-up. Ground jumps follow the
        // riding surface; air jumps follow the same pitch/roll/yaw as the board.
        // Add an impulse so leaning can redirect a run without wiping its momentum.
        const first=this.grounded||this.coyote>0,direction=this.grounded?this.normal.clone():this.boardUp(),beforeJumpSpeed=Math.hypot(this.velocity.x,this.velocity.z);
        this.velocity.addScaledVector(direction,first?10.6:11.0);
        if(Math.hypot(this.velocity.x,this.velocity.z)>Math.max(43,beforeJumpSpeed+.1))this.jumpSpeedTime=.9;
        this.jumps=first?1:2;this.grounded=false;this.coyote=0;this.events.push(first?'jump':'double');
      }
      this.velocity.y-=25*dt;
      const horizontal=Math.hypot(this.velocity.x,this.velocity.z),cap=this.boostTime>0||this.reboundTime>0||this.launchTime>0?76:this.jumpSpeedTime>0?54:43;
      // Boost speed releases gradually; crossing the timer boundary never slams the brakes.
      if(horizontal>cap){const next=Math.max(cap,horizontal-16*dt);this.velocity.x*=next/horizontal;this.velocity.z*=next/horizontal;}
      // Adaptive steps keep every movement smaller than a wheel radius, even after a long frame.
      const steps=Math.max(1,Math.ceil(this.velocity.length()*dt/.13)),slice=dt/steps;
      let contact=false,contactN=v(),contactSurface=null,contactVert=false,impactVelocity=this.velocity.clone();
      for(let step=0;step<steps;step++){
        this.p.addScaledVector(this.velocity,slice);
        const triangles=this.world.query(this.p,2.5);
        for(let iteration=0;iteration<4;iteration++){
          let corrected=false;
          for(const offset of [0,-.72,.72]){
            const center=this.p.clone().addScaledVector(collisionForward,offset),closest=v();
            for(const item of triangles){
              item.tri.closestPointToPoint(center,closest);const delta=center.clone().sub(closest),dist=delta.length(),radius=.50;
              if(dist>=radius-.00001)continue;
              // Treat overlapping ribbon junctions as one solid: internal side faces must
              // not become invisible walls where the shortcut joins the main road.
              if(item.roadId!==undefined){
                const probe=new T.Ray(closest.clone().add(v(0,1.6,0)),v(0,-1,0));let buried=false;
                for(const other of triangles){if(!other.top||other.roadId===item.roadId)continue;const h=probe.intersectTriangle(other.tri.a,other.tri.b,other.tri.c,false,v());if(!h)continue;if(h.y>closest.y+.001&&h.y-closest.y<1.499){buried=true;break;}
                  if(item.top===false&&Math.abs(h.y-closest.y)<.003){const beyond=closest.clone().lerp(center,.25);beyond.y=closest.y+1.6;const inside=new T.Ray(beyond,v(0,-1,0)).intersectTriangle(other.tri.a,other.tri.b,other.tri.c,false,v());if(inside&&Math.abs(inside.y-closest.y)<.003){buried=true;break;}}
                }
                if(buried)continue;
              }
              const n=dist>.00001?delta.multiplyScalar(1/dist):item.normal.clone();
              const vertContact=item.rideableVert&&n.dot(item.normal)>.65&&(this.velocity.length()>9||n.y>.25);
              if((n.y>.25||vertContact)&&(item.top!==false)){contact=true;contactN.add(n);contactVert=contactVert||!!vertContact;contactSurface=item.roadId!==undefined?'road:'+item.roadId:item.boxId!==undefined?'box:'+item.boxId:null;}
              this.p.addScaledVector(n,radius-dist+.00002);center.addScaledVector(n,radius-dist+.00002);
              const into=this.velocity.dot(n);if(into<0)this.velocity.addScaledVector(n,-into*(n.y>.25||vertContact?1:1.08));
              corrected=true;
            }
          }
          if(!corrected)break;
        }
        for(const b of this.world.bumpers){
          const delta=this.p.clone().sub(b.p),d=delta.length(),radius=b.r+.52;
          if(d>radius+.8){this.bumperCooldown.delete(b);continue;}
          if(d>=radius)continue;
          const n=d>.00001?delta.multiplyScalar(1/d):this.velocity.clone().normalize().negate();
          this.p.copy(b.p).addScaledVector(n,radius+.02);
          const approach=this.velocity.dot(n);
          if(approach<0&&!this.bumperCooldown.has(b)){
            // Reflect around the actual hit normal, then add energy. Grazing the side
            // preserves the useful tangent; a head-on hit launches straight back.
            this.velocity.addScaledVector(n,-2*approach);
            this.velocity.setLength(Math.min(74,Math.max(b.strength||52,this.velocity.length()*1.32)));
            const outward=this.velocity.dot(n);if(outward<18)this.velocity.addScaledVector(n,18-outward);
            this.velocity.y=Math.max(4,this.velocity.y);this.reboundTime=1.8;this.launchTime=.28;
            this.heading=Math.atan2(this.velocity.x,-this.velocity.z);this.grounded=false;contact=false;this.coyote=0;this.jumps=1;
            b.hit=this.elapsed;this.events.push('bonk');this.bumperCooldown.set(b,true);
          }else if(approach<0)this.velocity.addScaledVector(n,-approach);
        }
      }
      // A very small ground snap prevents skipping down gentle, connected slopes.
      if(!contact&&this.grounded&&!input.jump){
        const ray=new T.Ray(this.p.clone().addScaledVector(this.normal,.05),this.normal.clone().negate());let best=null,bestN=null,bestD=Infinity,bestSurface=null;
        for(const item of this.world.query(this.p,2)){if(item.top===false||item.normal.y<.25&&!(item.rideableVert&&this.velocity.length()>9))continue;const hit=ray.intersectTriangle(item.tri.a,item.tri.b,item.tri.c,false,v());if(!hit)continue;const distance=hit.distanceTo(this.p);if(distance>=.44&&distance<1.12&&distance<bestD){best=hit;bestN=item.normal.clone();bestD=distance;bestSurface=item.roadId!==undefined?'road:'+item.roadId:item.boxId!==undefined?'box:'+item.boxId:null;contactVert=!!item.rideableVert;}}
        if(best){this.p.copy(best).addScaledVector(bestN,.501);contact=true;contactSurface=bestSurface;contactN.copy(bestN);this.velocity.projectOnPlane(bestN);}
      }
      if(contact){
        this.normal.copy(contactN.normalize());
        const boardUp=this.boardUp();
        if(!wasGrounded&&this.airTime>.15&&boardUp.dot(this.normal)<.35){
          // A missed wheels-down landing stops the run's momentum, not the run.
          // Presentation rotates the board upright during this brief recovery.
          this.velocity.set(0,0,0);this.boostTime=0;this.reboundTime=0;this.jumpSpeedTime=0;this.crashTime=.45;this.events.push('crash');
          this.tilt=Math.asin(clamp(this.normal.dot(v(Math.cos(this.heading),0,Math.sin(this.heading))),-1,1));
          this.pitchTilt=Math.atan2(-this.normal.dot(v(Math.sin(this.heading),0,-Math.cos(this.heading))),this.normal.y);
        }else if(!wasGrounded&&this.airTime>.15&&impactVelocity.dot(this.normal)<-1){
          // Impact is measured INTO the receiving surface, not by fall height or
          // board angle. Following a downhill ramp dissipates less speed than
          // slamming vertically onto a flat deck. There are no landing bonuses.
          const impact=Math.max(0,-impactVelocity.dot(this.normal)),before=this.velocity.length();
          const factor=clamp(1-impact*.012,.38,1);
          this.velocity.multiplyScalar(factor);
          this.lastLanding={impact,change:this.velocity.length()-before,lossFraction:1-factor,time:this.elapsed};
          this.events.push(impact>12?'rough':'land');
        }
        this.coyote=.085;this.jumps=0;this.launchTime=0;
      }
      else this.coyote=Math.max(0,this.coyote-dt);
      this.grounded=contact;
      for(const pad of this.world.pads){
        const normal=pad.r.clone().cross(pad.t).normalize(),delta=this.p.clone().sub(pad.p),height=delta.dot(normal),distance=delta.clone().projectOnPlane(normal).length();
        const inside=pad.width?Math.abs(delta.dot(pad.r))<pad.width/2&&Math.abs(delta.dot(pad.t))<pad.halfLength:distance<pad.radius;
        if(!inside){if(distance>(pad.width||pad.radius)+2)this.padCooldown.delete(pad);continue;}
        if(!contact||this.padCooldown.has(pad)||height>2.2||height<-.2)continue;
        this.padCooldown.set(pad,true);
        if(pad.type==='boost'){const forward=f.clone().normalize();this.velocity.addScaledVector(forward,Math.max(14,(pad.speed||62)-this.velocity.dot(forward)));this.boostTime=2.1;this.events.push('boost');}
        else{
          if(pad.target){
            // Solve from the actual contact point, not the pad centre. The apex clears
            // the receiving floor by 10 m, so early/edge touches cannot under-launch.
            const delta=pad.target.clone().add(v(0,.55,0)).sub(this.p),horizontal=Math.hypot(delta.x,delta.z);
            let vy=Math.sqrt(50*(Math.max(0,delta.y)+Math.max(10,horizontal*.13))),flight=(vy+Math.sqrt(Math.max(0,vy*vy-50*delta.y)))/25;
            if(horizontal/flight>60){flight=horizontal/60;vy=(delta.y+12.5*flight*flight)/flight;}
            this.velocity.set(delta.x/flight,vy,delta.z/flight);this.heading=Math.atan2(this.velocity.x,-this.velocity.z);
            this.launchTime=flight+.3;
          }else{this.velocity.y=26;this.launchTime=3;}
          this.grounded=false;this.coyote=0;this.jumps=1;this.events.push('pad');
        }
      }
      if(wasGrounded&&!this.grounded){this.takeoffSurface=this.surface;this.airStart.copy(this.p);}
      if(contact){this.surface=contactSurface;this.surfaceIsVert=contactVert;}
      let nearest=Infinity;for(let i=0;i<this.world.path.samples.length;i+=3){const s=this.world.path.samples[i],d=s.p.distanceToSquared(this.p);if(d<nearest){nearest=d;this.progress=s.u;}}
      // Only the visible finish line matters. No ordered route checks, minimum
      // progress/time requirements, or hidden rejection of a successful shortcut.
      const finish=this.world.finish,tangent=finish.t.clone().setY(0).normalize(),right=v(-tangent.z,0,tangent.x),from=previousPosition.clone().sub(finish.p),to=this.p.clone().sub(finish.p);
      if(this.started&&from.dot(tangent)<=0&&to.dot(tangent)>=0&&Math.abs(to.dot(right))<(this.world.level.width+2)/2&&(!this.world.tower||this.p.y>=finish.p.y-.6)){this.won=true;this.events.push('finish');}
      if(this.p.y<-5){this.events.push('fall');}
    }
  }
  levels.forEach(l=>{l.description=[8,11,16,22].includes(l.id)?'High start · Two drop ramps · Layered decks':courseStyles[l.id%6].map(t=>({scoop:'Curved ramp',lift:'Upper deck',wall:'Banked gap'}[t])).join(' · ');l.difficulty=['FLOW','SPORT','EXPERT','ELITE'][l.pack];});
  global.DeckCore={packs,levels,World,Runner,buildLevel,samplePath,coursePath,pointAt,v,clamp,angle};
})(typeof window!=='undefined'?window:globalThis);
