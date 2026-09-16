/* Two complete replacement courses: physical surfaces and map guides agree. */
(function (global) {
  'use strict';
  const C=global.DeckCore,{v}=C,previousPath=C.coursePath,previousBuild=C.buildLevel;
  const owns=id=>id===4||id===22,cache=new Map();
  const copyGuide=paths=>C.obstacleGuide(paths.flatMap(p=>p.samples.map(s=>s.p)));
  const describe={
    4:'A descending mail run: gather speed, shape the ramp, and choose your receiving bay.',
    22:'A high perch opens into stacked terraces. Read the drop, then stitch the decks back together.'
  };
  for(const id of [4,22]){C.levels[id].revision+=1;C.levels[id].description=describe[id];C.levels[id].width=id===4?24:22;}

  function build(id,world){
    const roads=[],features=[],alternatives=[];
    const road=(points,width,kind='deck')=>{const p=C.samplePath(points,width);world?.road(p,[],kind);roads.push(p);return p;};
    // A separate riding surface follows the terrain's height progression.
    // Shared samples at both ends eliminate unsupported caps and height steps;
    // a smooth lateral departure makes the choice visible before separation.
    const branch=(name,base,entry,exit,offset,width)=>{
      const g=copyGuide(base),nearest=p=>g.samples.reduce((a,b)=>a.p.distanceToSquared(p)<b.p.distanceToSquared(p)?a:b);
      const first=nearest(v(...entry)),last=nearest(v(...exit)),span=last.s-first.s;
      const pts=g.samples.filter(s=>s.s>=first.s&&s.s<=last.s).map(s=>{
        const u=C.clamp((s.s-first.s-18)/(span-36),0,1),shift=offset*Math.sin(Math.PI*u)**2;
        return s.p.clone().addScaledVector(s.r,shift);
      });
      const path=C.obstacleGuide(pts,width);world?.road(path,[],'terrace');roads.push(path);
      alternatives.push({name,path,entry:first.p.clone(),exit:last.p.clone()});
    };
    const feature=(signature,path)=>{const a=path.samples[0],b=path.samples.at(-1);features.push({type:'signature',signature,origin:a.p.clone(),end:b.p.clone(),length:path.length,width:a.w,yaw:Math.atan2(a.t.x,-a.t.z)});};
    let main;
    if(id===4){
      // The launch deck ends in real air. The guide spanning that interval is
      // for maps only: the broad, downhill receiver below is the first
      // collidable surface, leaving a long runout before the scoop asks to turn.
      const start=road([[0,64,0],[0,64,-30],[8,62,-52],[25,59,-68],[43,55,-80]],28,'deck');
      const launch=road([[43,55,-80],[52,52,-83],[60,49,-84]],24,'roof');
      const receiver=road([[60,40,-84],[70,32,-84],[80,24,-84],[88,17,-84],[112,12,-84],[146,10,-84],[180,12,-84],[208,16,-84]],38,'bowl');
      const runout=road([[208,16,-84],[230,18,-94],[247,22,-116],[255,29,-145],[255,38,-176],[250,48,-202]],26,'ascent');
      const upper=road([[250,48,-202],[236,48,-230],[210,44,-258],[180,38,-284],[150,32,-300]],28,'deck');
      branch('RECEIVER RIM',[receiver,runout],[112,12,-84],[247,22,-116],35,12);
      feature('ELEVATED AIR MAIL DECK',launch);feature('OPEN RECEIVING BOWL',receiver);feature('UPWARD SCOOP',runout);
      main=copyGuide([start,launch,receiver,runout,upper]);
    }else{
      // Vertigo starts on a genuine elevated deck. Each lower terrace has a
      // physical drop and generous landing/runout; guides never bridge air.
      const perch=road([[0,86,0],[0,86,-38],[0,82,-68]],28,'roof');
      const first=road([[0,82,-68],[-12,72,-100],[-30,61,-132],[-36,54,-162]],24,'drop');
      const terrace1=road([[-36,54,-162],[-58,53,-196],[-61,51,-231],[-48,50,-262]],30,'terrace');
      const second=road([[-48,50,-262],[-29,42,-294],[-10,32,-326],[6,27,-356]],23,'drop');
      const terrace2=road([[6,27,-356],[28,27,-391],[32,25,-428],[20,24,-462],[0,24,-496]],30,'terrace');
      const finish=road([[0,24,-496],[-5,24,-542],[0,24,-592]],28,'deck');
      branch('INNER TERRACE',[terrace1,second,terrace2],[-61,51,-231],[20,24,-462],-48,12);
      feature('HIGH PERCH',perch);feature('FIRST CATCH TERRACE',terrace1);feature('LOWER TERRACE',terrace2);
      main=copyGuide([perch,first,terrace1,second,terrace2,finish]);
    }
    main.features=features;main.alternatives=alternatives;main.branches=alternatives.map(a=>a.path);main.tower=false;main.finishU=1-18/main.length;
    if(world){const s=main.frameAt(.003);world.level=C.levels[id];world.path=main;world.features=features;world.alternatives=alternatives;world.branches=main.branches;world.signs=[];world.landings=[];world.tower=false;world.spawn=s.p.clone().add(v(0,.55,0));world.heading=Math.atan2(s.t.x,-s.t.z);world.finish=main.frameAt(main.finishU);world.finishS=main.length-18;world.medals=[main.length/31+7,main.length/24+10,main.length/18+14];}
    return main;
  }
  C.coursePath=level=>{if(!owns(level.id))return previousPath(level);if(!cache.has(level.id))cache.set(level.id,build(level.id,null));return cache.get(level.id);};
  C.buildLevel=id=>{if(!owns(id))return previousBuild(id);const world=new C.World();build(id,world);return world;};
})(typeof window!=='undefined'?window:globalThis);
