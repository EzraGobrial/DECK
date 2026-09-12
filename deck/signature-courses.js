/* Three authored places. Collision and drawing share every visible surface. */
(function (global) {
  'use strict';
  const C=global.DeckCore, {v}=C, previousPath=C.coursePath, previousBuild=C.buildLevel;
  const descriptions={1:'Linked bowls around an open centre. Choose the bowl or the ridge.',2:'Descend the terraces, or carry momentum from the upper deck to the landing roof.',16:'Pass beneath the return bridge, climb around the open court, then ride out across the water.'};
  for(const id of [1,2,16]){const l=C.levels[id];l.revision+=1;l.description=descriptions[id];l.width=id===1?24:22;}
  const join=paths=>C.obstacleGuide(paths.flatMap(p=>p.samples.map(s=>s.p)));
  function make(id,world){
    const features=[],alternatives=[];
    const ribbon=(points,width,kind='deck')=>{const p=C.samplePath(points,width);world?.road(p,[],kind);return p;};
    const bowl=points=>{
      const p=C.samplePath(points,46),g=join([p]);
      // Broad, flat riding centre with rounded shoulders: the shoulders fade
      // at both ends so the ridge entry and rejoin have no raised side lip.
      world?.surface((a,b)=>{const f=g.frameAt(b),x=(a-.5)*46,t=C.clamp((Math.min(b,1-b)*g.length-80)/45,0,1),fade=t*t*(3-2*t);return f.p.addScaledVector(f.r,x).add(v(0,7*(Math.max(0,Math.abs(x)-7)/16)**2*fade,0));},24,Math.ceil(g.length/1.5),'bowl');
      return p;
    };
    const feature=(name,path)=>{const a=path.samples[0],b=path.samples.at(-1);features.push({type:'signature',signature:name,origin:a.p.clone(),yaw:Math.atan2(a.t.x,-a.t.z),length:path.length,width:a.w,end:b.p.clone()});};
    let pieces;
    if(id===1){
      const start=ribbon([[0,28,0],[0,28,-35],[0,28,-70]],28);
      const first=bowl([[0,28,-70],[0,28,-94],[-35,19,-140],[-68,12,-195],[-48,28,-250],[0,28,-296],[0,28,-320]]);
      const second=bowl([[0,28,-320],[0,28,-344],[42,18,-392],[66,12,-449],[38,19,-507],[0,28,-556],[0,28,-580]]);
      const end=ribbon([[0,28,-580],[0,28,-620],[0,28,-680]],28);
      const ridge=ribbon([[0,28,-70],[0,28,-94],[7,28,-158],[7,28,-229],[0,28,-296],[0,28,-320]],8.5);
      alternatives.push({name:'CENTRE RIDGE',path:join([ridge]),entry:first.samples[0].p.clone(),exit:first.samples.at(-1).p.clone()});
      feature('WEST BOWL',first);feature('EAST BOWL',second);pieces=[start,first,second,end];
    }else if(id===2){
      const start=ribbon([[0,76,0],[0,76,-42],[0,76,-80]],28);
      const terraces=ribbon([[0,76,-80],[0,76,-105],[-48,66,-160],[-85,55,-235],[-76,48,-300],[-38,42,-355],[0,34,-410],[0,34,-440]],28);
      const runup=ribbon([[0,76,-80],[0,76,-105],[0,69,-148],[0,66,-183],[0,67,-200]],13,'roof');
      // The landing roof slopes away from the gap, leaving generous runout
      // before any lateral steering. No guide creates collision in the air.
      const landing=ribbon([[0,62,-220],[0,55,-257],[0,44,-320],[0,34,-410],[0,34,-440]],19,'roof');
      const lower=ribbon([[0,34,-440],[0,34,-470],[40,26,-540],[100,18,-610],[110,18,-670],[105,18,-740]],30);
      alternatives.push({name:'LANDING ROOF',path:join([runup,landing]),entry:runup.samples[0].p.clone(),exit:landing.samples.at(-1).p.clone(),requiresJump:true,jumpZones:[v(0,67,-196)],jumpTargets:[v(0,62,-220)]});
      feature('UPPER TERRACES',terraces);feature('LOWER APRON',lower);pieces=[start,terraces,lower];
    }else{
      const approach=ribbon([[0,24,0],[0,24,-95],[0,24,-220],[50,28,-352],[120,34,-415],[200,34,-430]],30);
      const outer=ribbon([[200,34,-430],[245,34,-421],[328,39,-355],[360,46,-248],[330,52,-142],[258,55,-106],[158,55,-132],[65,55,-179],[0,55,-220]],28,'ascent');
      const inner=ribbon([[200,34,-430],[245,34,-421],[275,39,-371],[264,47,-293],[217,53,-223],[150,55,-177],[65,55,-179],[0,55,-220]],10,'ascent');
      const exit=ribbon([[0,55,-220],[-65,55,-261],[-157,49,-350],[-240,39,-477],[-373,31,-574],[-465,24,-690],[-480,24,-800],[-480,24,-860]],30);
      alternatives.push({name:'INNER ASCENT',path:join([inner]),entry:inner.samples[0].p.clone(),exit:inner.samples.at(-1).p.clone()});
      feature('LOWER APPROACH',approach);feature('RETURN BRIDGE',outer);feature('OPEN WATER RUNOUT',exit);pieces=[approach,outer,exit];
    }
    const path=join(pieces);path.features=features;path.alternatives=alternatives;path.tower=false;path.finishU=1-22/path.length;
    if(world){const start=path.frameAt(.003);world.level=C.levels[id];world.path=path;world.features=features;world.alternatives=alternatives;world.branches=alternatives.map(a=>a.path);world.signs=[];world.landings=[];world.tower=false;world.spawn=start.p.clone().add(v(0,.55,0));world.heading=Math.atan2(start.t.x,-start.t.z);world.finish=path.frameAt(path.finishU);world.finishS=path.length-22;world.medals=[path.length/30+7,path.length/23+10,path.length/17+14];}
    return path;
  }
  const cache=new Map(),owns=id=>id===1||id===2||id===16;
  C.coursePath=level=>{if(!owns(level.id))return previousPath(level);if(!cache.has(level.id))cache.set(level.id,make(level.id,null));return cache.get(level.id);};
  C.buildLevel=id=>{if(!owns(id))return previousBuild(id);const world=new C.World();make(id,world);return world;};
})(typeof window!=='undefined'?window:globalThis);
