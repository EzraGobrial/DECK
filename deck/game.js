/* DECK / local browser build */
(() => {
 'use strict';
 const T=THREE,C=DeckCore,{v,clamp,angle}=C,$=s=>document.querySelector(s);
 $('.home-description').innerHTML='Just you, four wheels, and the perfect line.<br>'+C.levels.length+' courses. Countless ways to get there.';$('.home-stamp').innerHTML=C.levels.length+'<span>TRACKS<br>TO MASTER</span>';$('#levels .eyebrow').textContent='THE COLLECTION / '+C.levels.length+' COURSES';
 const deltaPanel=document.createElement('div');deltaPanel.id='result-delta';deltaPanel.hidden=true;$('#modal-stats').after(deltaPanel);
 const effectHud=document.createElement('div');effectHud.id='effect-hud';effectHud.innerHTML='<div id="boost-status"><b>BOOST</b><i><span></span></i></div><div id="ghost-status"></div>';$('#hud').append(effectHud);
 $('.controls').innerHTML='<strong>CONTROLLER / HOLD TO FLIP</strong><div><kbd>R2</kbd> GO <kbd>L2</kbd> BRAKE / REVERSE</div><div><kbd>LS ← →</kbd> STEER <kbd>LS ↑ ↓</kbd> FRONT / BACK FLIP</div><div><kbd>L1 / R1</kbd> ROLL LEFT / RIGHT <kbd>✕</kbd> DOUBLE JUMP</div><div><kbd>R3</kbd> RESTART <kbd>OPTIONS</kbd> PAUSE</div><small>Jump away from deck top · Release to hold angle · WASD / arrows · Space jump · Q/E roll · I/K flip · R reset · Esc pause</small>';
 const replayScreen=document.createElement('section');replayScreen.id='replays';replayScreen.className='screen';replayScreen.setAttribute('aria-label','Your best-run replays');$('#ui').append(replayScreen);
 const replayLink=document.createElement('button');replayLink.dataset.action='replays';replayLink.innerHTML='<span>04</span>MY REPLAYS<span class="nav-arrow">↗</span>';$('.home-nav').append(replayLink);
 const settingsScreen=document.createElement('section');settingsScreen.id='settings';settingsScreen.className='screen';settingsScreen.setAttribute('aria-label','Game settings');$('#ui').append(settingsScreen);
 const settingsLink=document.createElement('button');settingsLink.dataset.action='settings';settingsLink.innerHTML='<span>05</span>SETTINGS<span class="nav-arrow">↗</span>';$('.home-nav').append(settingsLink);
 const orbitHint=document.createElement('div');orbitHint.id='orbit-hint';orbitHint.innerHTML='<kbd>RIGHT STICK</kbd> ROTATE VIEW <span>J/L · U/O on keyboard</span>';$('#ui').append(orbitHint);
 const replayBar=document.createElement('div');replayBar.id='replay-bar';replayBar.hidden=true;replayBar.innerHTML='<div><strong>YOUR BEST · GHOST VIEW</strong><span id="replay-time"></span></div><input id="replay-seek" type="range" min="0" max="1000" value="0" aria-label="Replay position"><div class="replay-actions"><button data-action="replay-toggle">PAUSE · ✕</button><button data-action="replay-restart">RESTART · R3</button><button data-action="replay-exit">BACK · ○</button></div>';document.body.append(replayBar);
 const skins=[
  {id:'red',name:'REDLINE',color:'#ee584e',second:'#ffcd86',price:0},
  {id:'sea',name:'SEA GLASS',color:'#56beba',second:'#e6fbce',price:0},
  {id:'solar',name:'SOLAR',color:'#e7c344',second:'#fcf6d0',price:0},
  {id:'violet',name:'VIOLET',color:'#9777cf',second:'#e1ccff',price:0},
  {id:'sunset',name:'SUNSET SPLIT',color:'#f48547',second:'#c74769',price:180},
  {id:'grid',name:'GRIDLINE',color:'#233946',second:'#edeee2',price:220},
  {id:'bloom',name:'HYPERBLOOM',color:'#a493ef',second:'#80e6d2',price:260},
  {id:'chrome',name:'AFTERGLOW',color:'#d1e8f2',second:'#eff84b',price:320},
  {id:'ember',name:'EMBER',color:'#d84826',second:'#ffda8b',price:140},
  {id:'mint',name:'MINT CHIP',color:'#72dfb0',second:'#203e3a',price:160},
  {id:'cobalt',name:'COBALT',color:'#2553d5',second:'#bfd9ff',price:180},
  {id:'candy',name:'CANDY FLIP',color:'#f77dc2',second:'#ffed80',price:200},
  {id:'bone',name:'BONE WHITE',color:'#ebe8d6',second:'#3a434a',price:180},
  {id:'carbon',name:'CARBON',color:'#304047',second:'#85a9b4',price:220},
  {id:'signal',name:'SIGNAL',color:'#dcf44a',second:'#253344',price:240},
  {id:'copper',name:'COPPERHEAD',color:'#af754d',second:'#ecd2a7',price:240},
  {id:'aurora',name:'AURORA FLOW',color:'#69e8ca',second:'#bd6fee',price:360,animated:true},
  {id:'plasma',name:'PLASMA',color:'#ee5a9f',second:'#573fe1',price:380,animated:true},
  {id:'current',name:'ELECTRIC CURRENT',color:'#40caff',second:'#eeff77',price:400,animated:true},
  {id:'lava',name:'LAVA LAMP',color:'#fa683a',second:'#fed448',price:420,animated:true},
  {id:'hyperspace',name:'HYPERSPACE',color:'#9772ff',second:'#62eeed',price:440,animated:true},
  {id:'prism',name:'PRISM SHIFT',color:'#e597ed',second:'#96e7e5',price:460,animated:true}
 ];
 const wheelStyles=[{id:'classic',name:'CLASSIC URETHANE',color:'#f4ecce',price:0},{id:'redw',name:'HOT RED',color:'#f55951',price:80},{id:'ice',name:'ICE BLUE',color:'#72d7ef',price:90},{id:'limw',name:'ACID',color:'#d7f849',price:100},{id:'blackw',name:'NIGHT RUBBER',color:'#273445',price:100},{id:'pinkw',name:'BUBBLEGUM',color:'#ed93c8',price:110},{id:'chromew',name:'POLISHED',color:'#c9e4eb',price:180,metal:true},{id:'gloww',name:'PULSE WHEELS',color:'#82ffe2',price:240,animated:true}];
 const layoutRevisions=Object.fromEntries(C.levels.map(l=>[l.id,l.revision]));
 let save={skin:'red',wheel:'classic',coins:0,bests:{},rewards:{},owned:['red','sea','solar','violet'],ownedWheels:['classic'],muted:false,ghost:true,courseVersion:3,layoutRevisions};
 try{const old=JSON.parse(localStorage.getItem('deck-v2'));if(old&&Array.isArray(old.owned)){
   save={...save,...old};
   if(old.courseVersion!==3){save.previousCourseRecords={bests:old.bests,rewards:old.rewards};save.bests={};save.rewards={};save.courseVersion=3;}
   else for(const l of C.levels)if((old.layoutRevisions?.[l.id]||3)!==l.revision){
     // Archive only redesigned courses; unaffected records, old ghost files,
     // purchased cosmetics and the token balance stay intact.
     if(save.bests[l.id]!==undefined||save.rewards[l.id]!==undefined){save.archivedCourseRecords??={};save.archivedCourseRecords[l.id]??=[];save.archivedCourseRecords[l.id].push({revision:old.layoutRevisions?.[l.id]||3,time:save.bests[l.id],medal:save.rewards[l.id]});}
     delete save.bests[l.id];delete save.rewards[l.id];
   }
   save.layoutRevisions=layoutRevisions;
 }}catch{}
 if(!skins.some(s=>s.id===save.skin))save.skin='red';
 const settingDefaults={steering:1,airControl:1,deadzone:.17,music:1};
 const settingSteps={steering:[.6,.8,1],airControl:[.6,.8,1],deadzone:[.08,.12,.17,.22,.28],music:[0,.25,.5,.75,1]};
 save.settings={...settingDefaults,...(save.settings&&typeof save.settings==='object'?save.settings:{})};
 for(const name of Object.keys(settingDefaults))if(!settingSteps[name].includes(save.settings[name]))save.settings[name]=settingDefaults[name];
 // One requested score wipe for this update; never repeat it on normal reloads.
 if(save.scoreReset!=='2026-09-06-architecture-v1'){
   save.bests={};delete save.archivedCourseRecords;delete save.previousCourseRecords;
   try{for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(/^deck-ghost-v\d+-\d+$/.test(key))localStorage.removeItem(key);}}catch{}
   save.scoreReset='2026-09-06-architecture-v1';
 }
 const persist=()=>{try{localStorage.setItem('deck-v2',JSON.stringify(save));}catch{}};
 persist();
 const format=t=>`${String(Math.floor(t/60)).padStart(2,'0')}:${(t%60).toFixed(3).padStart(6,'0')}`;
 let mode='home',pack=0,levelIndex=0,world,runner,selected=null,pendingJump=false,accumulator=0,active=true,settingsReturn='home';
 const keys=new Set(),padState={previous:[],nav:0,next:0,index:null,armed:true};
 let userInput={steer:0,throttle:0,tilt:0,pitch:0};
 let orbitYaw=0,orbitPitch=0,orbitInput={x:0,y:0},replay=null;
 let recording=[],recordNext=0,ghostFrames=[],ghostIndex=0;
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.domElement.id='game';document.body.prepend(renderer.domElement);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.07,2500);
 const ambient=new T.HemisphereLight('#dff4ff','#56747f',2.0);scene.add(ambient);
 const sun=new T.DirectionalLight('#fff0d3',2.7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-50;sun.shadow.camera.right=50;sun.shadow.camera.top=50;sun.shadow.camera.bottom=-50;sun.shadow.camera.near=1;sun.shadow.camera.far=180;sun.shadow.normalBias=.05;sun.shadow.bias=-.00006;scene.add(sun,sun.target);
 const menuFill=new T.DirectionalLight('#eaf7ff',1.4),menuRim=new T.DirectionalLight('#ffffff',1.8);menuFill.position.set(9,17,12);menuRim.position.set(-4,12,-8);scene.add(menuFill,menuFill.target,menuRim,menuRim.target);
 const skyUniform={top:{value:new T.Color('#59a8cf')},bottom:{value:new T.Color('#e4f4fa')}};
 const sky=new T.Mesh(new T.SphereGeometry(2000,24,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:skyUniform,vertexShader:'varying vec3 d;void main(){d=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 top;uniform vec3 bottom;varying vec3 d;void main(){float h=clamp(normalize(d).y*.8+.25,0.,1.);gl_FragColor=vec4(mix(bottom,top,h),1.);}'}));scene.add(sky);
 const waterUniform={time:{value:0},color:{value:new T.Color('#3598b4')}};
 const water=new T.Mesh(new T.PlaneGeometry(4500,4500),new T.ShaderMaterial({uniforms:waterUniform,transparent:false,vertexShader:'varying vec3 p;void main(){p=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}',fragmentShader:'uniform float time;uniform vec3 color;varying vec3 p;void main(){float a=sin(p.x*.07+time*.3)*sin(p.z*.09+time*.4);float b=sin(p.x*.21+p.z*.3+time*.7);float glint=pow(max(0.,a*b),12.);gl_FragColor=vec4(color*(.83+.08*a)+vec3(glint*.35),1.);}'}));water.rotation.x=-Math.PI/2;water.position.y=-8;scene.add(water);
 const track=new T.Group();scene.add(track);let roadMeshes=[],padMeshes=[],bumperMeshes=[];
 const boardRoot=new T.Group(),boardVisual=new T.Group();boardRoot.add(boardVisual);scene.add(boardRoot);
 const materials={},wheels=[];let boardTexture;
 const mat=(color,roughness=.6,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 function mesh(g,m,parent=track){const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function makeBoard(){
   const slices=40,positions=[],uv=[],indices=[];
   // Rounded nose and tail with a subtle upward kick on both ends.
   for(let i=0;i<=slices;i++){
     const z=-1.62+i/slices*3.24,cap=Math.max(0,Math.abs(z)-1.09),w=.54*Math.sqrt(Math.max(.002,1-(cap/.54)**2)),kick=Math.max(0,Math.abs(z)-1.06)**2*.62;
     for(const y of [-.07,.07])for(const x of [-w,w]){positions.push(x,kick+y,z);uv.push((x/.54+1)/2,i/slices);}
     if(i<slices){const a=i*4,b=a+4;indices.push(a+2,a+3,b+2,a+3,b+3,b+2,a,b,a+1,a+1,b,b+1,a,a+2,b,a+2,b+2,b,a+1,b+1,a+3,a+3,b+1,b+3);}
   }
   indices.push(0,1,2,1,3,2,slices*4,slices*4+2,slices*4+1,slices*4+1,slices*4+2,slices*4+3);
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
   materials.deck=mat('#ffffff',.48,.07);materials.deck.side=T.DoubleSide;const deck=mesh(geo,materials.deck,boardVisual);deck.position.y=-.08;
   const woodGeo=geo.clone(),woodPositions=woodGeo.attributes.position;for(let i=0;i<woodPositions.count;i++){const z=woodPositions.getZ(i),kick=Math.max(0,Math.abs(z)-1.06)**2*.62;woodPositions.setY(i,kick+(woodPositions.getY(i)-kick)*.3);}woodGeo.computeVertexNormals();
   const wood=mesh(woodGeo,mat('#c3a277',.7),boardVisual);wood.scale.set(1.005,1,1);wood.position.y=-.08;
   const gripCanvas=document.createElement('canvas');gripCanvas.width=128;gripCanvas.height=384;const ctx=gripCanvas.getContext('2d');ctx.fillStyle='#273b46';ctx.fillRect(0,0,128,384);
   let seed=19;for(let i=0;i<6500;i++){seed=(seed*16807)%2147483647;const x=seed%128;seed=(seed*16807)%2147483647;ctx.fillStyle=i%2?'#4a5b6255':'#121e2455';ctx.fillRect(x,seed%384,1,1);}
   ctx.fillStyle='#dae9dd';ctx.font='bold 20px Arial';ctx.textAlign='center';ctx.fillText('DECK',64,217);ctx.fillStyle='#dbfa50';ctx.fillRect(58,250,12,45);
   const gripTex=new T.CanvasTexture(gripCanvas);gripTex.colorSpace=T.SRGBColorSpace;
   const gripGeo=geo.clone(); // top surface only, following the curved deck
   const gripIndices=[];for(let i=0;i<slices;i++){const a=i*4,b=a+4;gripIndices.push(a+2,a+3,b+2,a+3,b+3,b+2);}gripGeo.setIndex(gripIndices);gripGeo.computeVertexNormals();
   const grip=mesh(gripGeo,new T.MeshStandardMaterial({map:gripTex,roughness:1,side:T.DoubleSide}),boardVisual);grip.position.y=deck.position.y+.0015;grip.name='grip';deck.name='deck';wood.name='ply';
   for(const z of [-.99,.99]){
     const base=mesh(new T.BoxGeometry(.38,.1,.3),mat('#b1bcc0',.25,.8),boardVisual);base.position.set(0,-.20,z);
     const axle=mesh(new T.CylinderGeometry(.075,.075,1.12,12),mat('#d1d9db',.2,.9),boardVisual);axle.rotation.z=Math.PI/2;axle.position.set(0,-.31,z);
     for(const x of [-.55,.55]){const wheel=mesh(new T.CylinderGeometry(.22,.22,.17,20),mat('#f4ecce',.4),boardVisual);wheel.rotation.z=Math.PI/2;wheel.position.set(x,-.31,z);wheels.push(wheel);const hub=mesh(new T.CylinderGeometry(.08,.08,.177,12),mat('#7b8b93',.2,.75),boardVisual);hub.rotation.z=Math.PI/2;hub.position.copy(wheel.position);}
     for(const x of [-.19,.19])for(const dz of [-.10,.10]){const bolt=mesh(new T.CylinderGeometry(.027,.027,.008,8),mat('#bbc8cb',.3,.9),boardVisual);bolt.position.set(x,deck.position.y+.075+Math.max(0,Math.abs(z+dz)-1.06)**2*.62,z+dz);}
   }
 }
 function applySkin(){
   const skin=skins.find(s=>s.id===save.skin),canvas=document.createElement('canvas');canvas.width=256;canvas.height=768;const x=canvas.getContext('2d');x.fillStyle=skin.color;x.fillRect(0,0,256,768);
   x.fillStyle=skin.second;for(let i=0;i<5;i++){x.beginPath();x.moveTo(-150,80+i*185);x.lineTo(400,-30+i*185);x.lineTo(400,45+i*185);x.lineTo(-150,155+i*185);x.fill();}
   if(skin.id==='grid'){x.fillStyle=skin.second;for(let i=0;i<8;i++)for(let j=0;j<24;j++)if((i+j)%2)x.fillRect(i*32,j*32,32,32);}
   x.save();x.translate(128,370);x.rotate(-Math.PI/2);x.fillStyle='#162b38';x.font='900 86px Arial';x.textAlign='center';x.fillText('DECK',0,30);x.restore();
   if(boardTexture)boardTexture.dispose();boardTexture=new T.CanvasTexture(canvas);boardTexture.colorSpace=T.SRGBColorSpace;boardTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();materials.deck.map=boardTexture;materials.deck.needsUpdate=true;
   boardTexture.wrapT=T.RepeatWrapping;
   const wheel=wheelStyles.find(w=>w.id===save.wheel)||wheelStyles[0];wheels.forEach(w=>{w.material.color.set(wheel.color);w.material.metalness=wheel.metal?.85:.05;w.material.roughness=wheel.metal?.22:.4;});
   $('#hero-name').textContent=skin.name+' / '+String(skins.indexOf(skin)+1).padStart(3,'0');
 }
 makeBoard();applySkin();
 const ghostBoard=boardRoot.clone(true);scene.add(ghostBoard);ghostBoard.visible=false;
 ghostBoard.traverse(o=>{if(o.isMesh){o.material=new T.MeshBasicMaterial({color:'#b0f3ff',transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide});o.castShadow=false;o.receiveShadow=false;}});
 function resetRecording(){recording=[[0,...runner.p.toArray(),runner.heading,0,0]];recordNext=.05;ghostIndex=0;}
 const ghostKey=index=>'deck-ghost-v'+C.levels[index].revision+'-'+index;
 function loadGhost(){ghostFrames=[];try{const data=JSON.parse(localStorage.getItem(ghostKey(levelIndex)));if(data&&Array.isArray(data.frames)&&Math.abs(data.time-save.bests[levelIndex])<.01)ghostFrames=data.frames;}catch{}resetRecording();}
 function recordRun(){if(!runner.started||runner.elapsed<recordNext||recording.length>=6000)return;const f=v(Math.sin(runner.heading),0,-Math.cos(runner.heading)),right=v(Math.cos(runner.heading),0,Math.sin(runner.heading)),roll=runner.grounded?Math.asin(clamp(runner.normal.dot(right),-1,1)):runner.tilt,pitch=runner.grounded?Math.atan2(-runner.normal.dot(f),runner.normal.y):runner.pitchTilt;recording.push([runner.elapsed,...runner.p.toArray(),runner.heading,roll,pitch].map(x=>Math.round(x*1000)/1000));recordNext=runner.elapsed+.05;}
 function renderGhost(){
   ghostBoard.visible=save.ghost&&ghostFrames.length>1&&['race','pause'].includes(mode)&&runner.elapsed<=ghostFrames[ghostFrames.length-1][0];if(!ghostBoard.visible)return;
   while(ghostIndex<ghostFrames.length-2&&ghostFrames[ghostIndex+1][0]<runner.elapsed)ghostIndex++;
   const a=ghostFrames[ghostIndex],b=ghostFrames[ghostIndex+1],u=clamp((runner.elapsed-a[0])/Math.max(.001,b[0]-a[0]),0,1);
   ghostBoard.position.set(a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u,a[3]+(b[3]-a[3])*u);ghostBoard.rotation.set(0,-(a[4]+angle(b[4]-a[4])*u),0);ghostBoard.children[0].rotation.set(a[6]+angle(b[6]-a[6])*u,0,-(a[5]+angle(b[5]-a[5])*u));ghostBoard.scale.setScalar(1);
 }
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=64;shadowCanvas.height=64;const sc=shadowCanvas.getContext('2d'),sg=sc.createRadialGradient(32,32,0,32,32,31);sg.addColorStop(0,'rgba(9,29,42,.35)');sg.addColorStop(1,'rgba(9,29,42,0)');sc.fillStyle=sg;sc.fillRect(0,0,64,64);
 const blob=new T.Mesh(new T.PlaneGeometry(2.3,3.8),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));blob.rotation.x=-Math.PI/2;scene.add(blob);
 const particleCount=300,particlePositions=new Float32Array(particleCount*3),particleColors=new Float32Array(particleCount*3),particles=[];
 const particleGeo=new T.BufferGeometry();particleGeo.setAttribute('position',new T.BufferAttribute(particlePositions,3));particleGeo.setAttribute('color',new T.BufferAttribute(particleColors,3));
 const particleMesh=new T.Points(particleGeo,new T.PointsMaterial({vertexColors:true,size:.16,transparent:true,opacity:.85,depthWrite:false}));particleMesh.frustumCulled=false;scene.add(particleMesh);
 for(let i=0;i<particleCount;i++)particles.push({life:0,p:v(0,-100,0),v:v(),color:new T.Color()});let particleCursor=0;
 const trailGeo=new T.BufferGeometry(),trailPositions=new Float32Array(48*18),trailColors=new Float32Array(48*18);
 trailGeo.setAttribute('position',new T.BufferAttribute(trailPositions,3));trailGeo.setAttribute('color',new T.BufferAttribute(trailColors,3));trailGeo.setDrawRange(0,0);
 const trailMesh=new T.Mesh(trailGeo,new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.72,depthWrite:false,side:T.DoubleSide}));trailMesh.frustumCulled=false;scene.add(trailMesh);let trailHistory=[];
 function updateTrail(dt){
   const skin=skins.find(s=>s.id===save.skin),on=runner.boostTime>0||runner.reboundTime>0;
   trailHistory=trailHistory.filter(p=>runner.elapsed-p.time<.35);
   if(on&&dt>0){const right=v(Math.cos(runner.heading),0,Math.sin(runner.heading)),p=runner.p.clone().add(v(-Math.sin(runner.heading)*1.15,-.02,Math.cos(runner.heading)*1.15));trailHistory.unshift({p,right,time:runner.elapsed});if(trailHistory.length>48)trailHistory.length=48;
     for(let i=0;i<2;i++){const particle=particles[particleCursor++%particleCount];particle.p.copy(p).addScaledVector(right,(Math.random()-.5)*.5);particle.v.copy(runner.velocity).multiplyScalar(-.10);particle.life=.22;particle.color.set(skin.color);}}
   let offset=0,distance=0;const color=new T.Color(skin.color);
   for(let i=0;i<trailHistory.length-1;i++){const a=trailHistory[i],b=trailHistory[i+1];distance+=a.p.distanceTo(b.p);if(distance>10)break;const fade=1-distance/11,width=.34*fade,al=a.p.clone().addScaledVector(a.right,-width),ar=a.p.clone().addScaledVector(a.right,width),bl=b.p.clone().addScaledVector(b.right,-width*.9),br=b.p.clone().addScaledVector(b.right,width*.9);for(const p of [al,ar,bl,ar,br,bl]){trailPositions.set(p.toArray(),offset);trailColors.set(color.clone().lerp(new T.Color('#ffffff'),.25*fade).multiplyScalar(.5+fade*.5).toArray(),offset);offset+=3;}}
   trailGeo.setDrawRange(0,offset/3);trailGeo.attributes.position.needsUpdate=true;trailGeo.attributes.color.needsUpdate=true;trailMesh.visible=offset>0;
   $('#boost-status').classList.toggle('on',on);$('#boost-status b').textContent=runner.reboundTime>0?'REBOUND':'BOOST';$('#boost-status span').style.width=Math.min(1,Math.max(runner.boostTime/2.1,runner.reboundTime/1.8))*100+'%';$('#boost-status').style.setProperty('--boost-color',skin.color);
 }
 function burst(color,count=26,force=6){for(let i=0;i<count;i++){const p=particles[particleCursor++%particleCount];p.life=.5+Math.random()*.35;p.p.copy(runner.p);p.v.set((Math.random()-.5)*force,Math.random()*force*.6,(Math.random()-.5)*force);p.color.set(color);}}
 function updateParticles(dt){for(let i=0;i<particleCount;i++){const p=particles[i];p.life-=dt;if(p.life>0){p.v.y-=9*dt;p.p.addScaledVector(p.v,dt);}else p.p.y=-100;particlePositions.set(p.p.toArray(),i*3);particleColors.set(p.color.toArray(),i*3);}particleGeo.attributes.position.needsUpdate=true;particleGeo.attributes.color.needsUpdate=true;}
 function makeGeometry(vertices,smooth=false){const g=new T.BufferGeometry();if(smooth){const unique=[],indices=[],seen=new Map();for(let i=0;i<vertices.length;i+=3){const key=vertices.slice(i,i+3).map(n=>n.toFixed(4)).join(',');let index=seen.get(key);if(index===undefined){index=unique.length/3;seen.set(key,index);unique.push(...vertices.slice(i,i+3));}indices.push(index);}g.setAttribute('position',new T.Float32BufferAttribute(unique,3));g.setIndex(indices);}else g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return g;}
 function edgeStrip(points,color){
   const vertices=[];for(let i=0;i<points.length;i+=2){const a=points[i].clone().add(v(0,.045,0)),b=points[i+1].clone().add(v(0,.045,0)),d=b.clone().sub(a),r=v(-d.z,0,d.x).normalize().multiplyScalar(.15);const al=a.clone().sub(r),ar=a.clone().add(r),bl=b.clone().sub(r),br=b.clone().add(r);for(const p of [al,ar,bl,ar,br,bl])vertices.push(...p.toArray());}
   return mesh(makeGeometry(vertices),new T.MeshBasicMaterial({color,side:T.DoubleSide}));
 }
 function sign(text,point,color='#162e3d',scale=1){
   const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,512,128);x.fillStyle='#f6f8ed';x.font='900 55px Arial';x.textAlign='center';x.fillText(text,256,85);
   const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const m=mesh(new T.PlaneGeometry(7*scale,1.75*scale),new T.MeshBasicMaterial({map,side:T.DoubleSide}));m.position.copy(point);return m;
 }
 function chevron(at,color,width=1.1){
   const vertices=[],p=at.p.clone().addScaledVector(at.r.clone().cross(at.t).normalize(),.11),r=at.r,t=at.t;
   const pts=[p.clone().addScaledVector(t,1.2),p.clone().addScaledVector(r,-width).addScaledVector(t,-.4),p.clone().addScaledVector(t,.2),p.clone().addScaledVector(r,width).addScaledVector(t,-.4)];
   for(const q of [pts[0],pts[1],pts[2],pts[0],pts[2],pts[3]])vertices.push(...q.toArray());mesh(makeGeometry(vertices),new T.MeshBasicMaterial({color,side:T.DoubleSide}));
 }
 function disposeTrack(){
   cameraOccluders.clear();
   const geometries=new Set(),mats=new Set(),maps=new Set();track.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){mats.add(m);if(m.map)maps.add(m.map);}});track.clear();geometries.forEach(x=>x.dispose());mats.forEach(x=>x.dispose());maps.forEach(x=>x.dispose());roadMeshes=[];padMeshes=[];bumperMeshes=[];
 }
 function buildVisuals(){
   disposeTrack();const packStyle=C.packs[world.level.pack],night=world.level.pack===3;
   scene.fog=new T.Fog(packStyle.sky,180,1150);skyUniform.top.value.set(night?'#132137':packStyle.color).lerp(new T.Color(packStyle.sky),.6);skyUniform.bottom.value.set(packStyle.sky);waterUniform.color.value.set(packStyle.water);ambient.intensity=night?1.9:2;sun.intensity=night?1.5:2.7;
   for(const road of world.roads){
     const base=mesh(makeGeometry(road.vertices),mat(night?'#243646':'#738e99',.68));base.material.side=T.DoubleSide;roadMeshes.push(base);
     if(road.kind==='obstacle')base.material.color.set('#176fae');
     const surface=mesh(makeGeometry(road.top,true),mat(({bowl:'#cee4ec',roof:'#f5ebd6',grid:'#f1f3e9',obstacle:'#238bd0',wall:'#d8e8ed',scoop:'#e5ede0'})[road.kind]||(night?'#afbfc4':'#f0f1e7'),.78));surface.material.side=T.DoubleSide;roadMeshes.push(surface);
     const edgeColor=({shortcut:'#fba64b',transfer:'#d39aff',wall:'#249aff',scoop:'#f5ac4d',bowl:'#258ff0',grid:'#246bbb',roof:'#e59b43'})[road.kind]||packStyle.color;edgeStrip(road.edgeL,edgeColor);edgeStrip(road.edgeR,edgeColor);
     for(let s=18;!road.meshOnly&&s<road.path.length-15;s+=32){if(road.gaps.some(g=>s>g.start-3&&s<g.end+3))continue;chevron(C.pointAt(road.path,s/road.path.length),road.kind==='shortcut'?'#cb803b':(night?'#405563':'#718994'),road.kind==='shortcut'?.7:1.1);}
   }
   // Readable paint at entrances and exits, not floating route/checkpoint text.
   for(const feature of world.path.features||[]){const f=v(Math.sin(feature.yaw),0,-Math.cos(feature.yaw)),r=v(Math.cos(feature.yaw),0,Math.sin(feature.yaw));for(const side of [-1,0,1])chevron({p:feature.origin.clone().addScaledVector(f,3).addScaledVector(r,side*4),t:f,r},'#6c8994',.9);}
   for(const p of world.pads){
     const color=p.type==='boost'?'#ffcd27':'#109dff',g=new T.Group();track.add(g);const normal=p.r.clone().cross(p.t).normalize();g.position.copy(p.p).addScaledVector(normal,.055);g.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(p.r,normal,p.t.clone().negate()));
     const pad=mesh(p.width?new T.BoxGeometry(p.width,.065,p.halfLength*2):new T.CylinderGeometry(p.radius,p.radius,.065,48),mat(color,.3,.14),g);pad.position.y=.02;pad.material.emissive.set(color);pad.material.emissiveIntensity=.35;
     const rim=mesh(p.width?new T.BoxGeometry(p.width,.04,.17):new T.TorusGeometry(p.radius-.16,.06,8,48),new T.MeshBasicMaterial({color:'#fffbd7'}),g);if(!p.width)rim.rotation.x=-Math.PI/2;else rim.position.z=-p.halfLength+.12;rim.position.y=.09;
     for(let i=-1;i<=1;i++)for(const side of p.width?[-1,0,1]:[0])chevron({...p,p:p.p.clone().addScaledVector(p.t,i*1.45).addScaledVector(p.r,side*p.width*.28||0)},'#fffbed',p.width?1:.72);
     padMeshes.push({g,p,rim});
   }
   for(const b of world.bumpers){const g=new T.Group();track.add(g);g.position.copy(b.p);const body=mesh(new T.SphereGeometry(b.r,28,20),mat('#f12c38',.22,.18),g);body.material.emissive.set('#e81b29');body.material.emissiveIntensity=.32;const belt=mesh(new T.TorusGeometry(b.r,.11,8,32),new T.MeshBasicMaterial({color:'#fff0d1'}),g);belt.rotation.x=Math.PI/2;const ring=mesh(new T.TorusGeometry(b.r+1,.07,8,48),new T.MeshBasicMaterial({color:'#ff504a',transparent:true,opacity:.55}),g);ring.rotation.x=Math.PI/2;ring.position.y=-.39;bumperMeshes.push({g,b,body,ring});
     const marker=sign('RED = REBOUND',b.p.clone().add(v(0,3.3,0)),'#bb2334',.42);marker.rotation.y=Math.atan2(b.at.t.x,b.at.t.z);
   }
   for(const s of world.signs||[]){const a=s.at,label=sign(s.text,a.p.clone().addScaledVector(a.r,-world.level.width*.7).add(v(0,2.4,0)),'#263d4e',.5);label.rotation.y=Math.atan2(a.t.x,a.t.z);}
   for(const l of world.landings||[]){const label=sign(l.height+' m',l.p.clone().addScaledVector(l.r,world.level.width*.7).add(v(0,1.8,0)),'#1389ca',.52);label.rotation.y=Math.atan2(l.t.x,l.t.z);
     for(const side of [-1,1]){const size=v(.75,Math.max(1,l.p.y-1),.75),support=mesh(new T.BoxGeometry(...size.toArray()),mat('#496874',.7));support.position.copy(l.p).addScaledVector(l.r,side*world.level.width*.4);support.position.y=(l.p.y-1)/2;world.box(support.position,size);}
   }
   if(world.shortcut){const a=C.pointAt(world.shortcut,.13),p=a.p.clone().addScaledVector(a.r,3.3).add(v(0,1.7,0));const label=sign('CUT ↗',p,'#ad612b',.55);label.rotation.y=Math.atan2(a.t.x,a.t.z);}
   const finish=world.finish,normalYaw=Math.atan2(finish.t.x,finish.t.z),g=new T.Group();g.position.copy(finish.p);g.rotation.y=normalYaw;track.add(g);
   const finishWidth=world.level.width+2;
   for(const side of [-1,1]){const post=mesh(new T.BoxGeometry(.5,8,.5),mat('#d9fa50',.45),g);post.position.set(side*finishWidth/2,4,0);world.box(v(finish.p.x+finish.r.x*side*finishWidth/2,finish.p.y+4,finish.p.z+finish.r.z*side*finishWidth/2),v(.5,8,.5));}
   const banner=sign('FINISH',finish.p.clone().add(v(0,7.5,0)),'#1e333e',1.1);banner.rotation.y=normalYaw;
   // The finish stripe is flush with the road; the path beyond it is a safe runout.
   for(let i=0;i<Math.floor(world.level.width);i++){const tile=mesh(new T.BoxGeometry(1,.025,1.7),mat(i%2?'#f8f9ed':'#1e333e'),g);tile.position.set(i-world.level.width/2+.5,.04,0);}
   const start=C.pointAt(world.path,.014);for(let i=0;i<10;i++){const p=start.p.clone().addScaledVector(start.r,(i-4.5)*1.15);const tile=mesh(new T.BoxGeometry(1.12,.03,1.4),mat(i%2?'#ffffff':'#263d49'));tile.position.copy(p).add(v(0,.025,0));tile.rotation.y=world.heading;}
   // Tall peripheral pylons stay outside the playable road, with no enclosing rings.
   const bounds=new T.Box3().setFromPoints(world.path.samples.map(s=>s.p));
   const bannerMat=mat(packStyle.color,.55);for(let i=0;i<14;i++){
     const z=bounds.min.z+(bounds.max.z-bounds.min.z)*i/13,x=i%2?bounds.max.x+110:bounds.min.x-110,h=9+(i%4)*4;
     const pylon=mesh(new T.BoxGeometry(2,h,2),bannerMat);pylon.position.set(x,-8+h/2,z);const cap=mesh(new T.BoxGeometry(2.4,.25,2.4),new T.MeshBasicMaterial({color:'#f3f6db'}));cap.position.set(x,-8+h,z);
   }
 }
 // Original ambient loop. Audio starts only after a user gesture.
 let audio,master,musicGain,nextBeat=0,beat=0,toastTimer,eventTimer;
 function unlockAudio(){if(!audio){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audio=new Audio();master=audio.createGain();master.gain.value=save.muted?0:.24;master.connect(audio.destination);musicGain=audio.createGain();musicGain.gain.value=.45*save.settings.music;musicGain.connect(master);}if(audio.state==='suspended')audio.resume().catch(()=>{});}
 function tone(freq,time,length,volume,wave='sine',destination=musicGain){if(!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=wave;o.frequency.value=freq;g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(volume,time+.012);g.gain.exponentialRampToValueAtTime(.0001,time+length);o.connect(g);g.connect(destination);o.start(time);o.stop(time+length+.03);}
 function music(){if(!audio||audio.state!=='running')return;const menuMode=!['race','pause','finish','replay'].includes(mode);musicGain.gain.setTargetAtTime((menuMode?.45:.11)*save.settings.music,audio.currentTime,.2);if(nextBeat<audio.currentTime)nextBeat=audio.currentTime+.03;
   while(nextBeat<audio.currentTime+.10){const step=beat%16,chord=[[55,60,64,67],[53,57,60,64],[57,60,64,69],[55,59,62,67]][Math.floor(beat/32)%4],hz=n=>440*2**((n-69)/12);
     if(step%4===0){tone(hz(chord[0]-12),nextBeat,.37,.29,'triangle');tone(62,nextBeat,.11,.20,'sine');}
     if(step%2===0)tone(hz(chord[(step/2)%4]+12),nextBeat,.32,.085,'sine');
     if(step===0)for(const note of chord)tone(hz(note),nextBeat,1.45,.04,'triangle');
     if(step%4===2)tone(165,nextBeat,.07,.025,'triangle');beat++;nextBeat+=60/104/4;}
 }
 function sound(kind){unlockAudio();if(!audio)return;const cfg={move:[370,.065,.07],select:[590,.12,.12],jump:[480,.18,.18],double:[730,.23,.17],pad:[820,.24,.15],boost:[185,.3,.16],bonk:[100,.16,.22],land:[75,.065,.07],rough:[60,.12,.18],finish:[880,.6,.22]}[kind]||[300,.1,.1];tone(cfg[0],audio.currentTime+.01,cfg[1],cfg[2],'triangle',master);}
 function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').style.opacity=1;toastTimer=setTimeout(()=>$('#toast').style.opacity=0,2300);}
 function eventText(text){clearTimeout(eventTimer);$('#event-toast').textContent=text;$('#event-toast').classList.toggle('crash',text==='CRASH');$('#event-toast').style.color=text==='CRASH'?'#ff394a':text.startsWith('REBOUND')?'#ffb2ad':text.startsWith('UP TO')?'#a7e5ff':'#efffc9';$('#event-toast').style.opacity=1;eventTimer=setTimeout(()=>$('#event-toast').style.opacity=0,1150);}
 function drawMap(canvas,path,mini=false,position=null,shortcut=null){
   const x=canvas.getContext('2d'),w=canvas.width,h=canvas.height,project=p=>path.tower?[p.x+p.y*.32,p.z-p.y*.9]:[p.x,p.z];let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;
   for(const s of path.samples){const [px,pz]=project(s.p);minX=Math.min(minX,px);maxX=Math.max(maxX,px);minZ=Math.min(minZ,pz);maxZ=Math.max(maxZ,pz);}if(path.arenas){minX-=44;maxX+=44;minZ-=44;maxZ+=44;}
   const k=Math.min((w-45)/Math.max(1,maxX-minX),(h-35)/Math.max(1,maxZ-minZ)),ox=(w-(maxX-minX)*k)/2,oz=(h-(maxZ-minZ)*k)/2,pt=p=>{const [px,pz]=project(p);return [ox+(px-minX)*k,oz+(pz-minZ)*k];};x.clearRect(0,0,w,h);
   if(!mini){x.fillStyle='#e3edf0';x.fillRect(0,0,w,h);x.strokeStyle='#c7d9df';x.lineWidth=1;for(let i=0;i<w;i+=20){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();}}
   const line=(samples,color,width,withGaps=false)=>{x.strokeStyle=color;x.lineWidth=width;x.lineJoin='round';x.lineCap='round';x.beginPath();let pen=false;samples.forEach(s=>{const p=pt(s.p),gap=withGaps&&path.modules?.some(m=>s.u>m.start&&s.u<m.end);if(gap){pen=false;return;}if(pen)x.lineTo(...p);else x.moveTo(...p);pen=true;});x.stroke();};
   for(const a of path.arenas||[]){const f=v(Math.sin(a.yaw),0,-Math.cos(a.yaw)),r=v(Math.cos(a.yaw),0,Math.sin(a.yaw));x.fillStyle=({bowl:'#80b9d4',roof:'#d8b184',grid:'#8fa9bf',wall:'#a6bec4'})[a.type]||'#b8cdd0';x.strokeStyle='#587d8c';x.lineWidth=.7;x.beginPath();for(const [i,p] of [[-a.width/2,0],[a.width/2,0],[a.width/2,a.length],[-a.width/2,a.length]].entries()){const q=pt(a.origin.clone().addScaledVector(r,p[0]).addScaledVector(f,p[1]));if(i)x.lineTo(...q);else x.moveTo(...q);}x.closePath();x.fill();x.stroke();for(const h of a.holes||[]){const p=pt(h.center);x.fillStyle=mini?'#284754':'#e3edf0';x.fillRect(p[0]-h.width*k/2,p[1]-h.length*k/2,h.width*k,h.length*k);}}
   line(path.samples,mini?'#152c3a':'#9aaeb7',path.arenas?2:mini?7:9,true);if(!path.arenas)line(path.samples,mini?'#e0e8d9':'#fafbf2',mini?3:5,true);if(shortcut)line(shortcut.samples,'#ea9e44',2);if(mini&&world?.branches)for(const b of world.branches)line(b.samples,'#f5b264',1);
   for(const [u,color] of [[.008,'#168bd3'],[path.finishU||.975,'#d2f339']]){const p=pt(C.pointAt(path,u).p);x.fillStyle=color;x.beginPath();x.arc(...p,mini?3:4,0,Math.PI*2);x.fill();}
   if(position){const p=pt(position);x.fillStyle='#ff764c';x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.arc(...p,4,0,Math.PI*2);x.fill();x.stroke();}
 }
   const previews=C.levels.map(l=>C.coursePath(l));
 function renderLevels(){
   $('#pack-tabs').innerHTML=C.packs.map((p,i)=>`<button data-pack="${i}" class="${pack===i?'active':''}">${String(i+1).padStart(2,'0')} / ${p.name}</button>`).join('');
   $('#course-grid').innerHTML=C.levels.filter(l=>l.pack===pack).map((l,i)=>`<button class="course-card" data-level="${l.id}" ${i===0?'data-default':''}><div class="course-art"><canvas width="420" height="170" data-map="${l.id}"></canvas><span class="number">${String(l.id+1).padStart(2,'0')} / ${C.levels.length}</span><span class="medal">${save.rewards[l.id]?["","FINISHED","BRONZE","SILVER","GOLD"][save.rewards[l.id]]:''}</span></div><div class="course-info"><h3>${l.name}</h3><p>${l.description}</p><div class="course-meta"><span>${l.difficulty} · ${Math.round(previews[l.id].length)} M</span><span>${save.bests[l.id]?format(save.bests[l.id]):'SET A TIME'} ↗</span></div></div></button>`).join('');
   document.querySelectorAll('[data-map]').forEach(canvas=>drawMap(canvas,previews[+canvas.dataset.map]));
 }
 function renderLocker(){
   $('#locker-grid').innerHTML=skins.filter(s=>save.owned.includes(s.id)).map(s=>`<button class="skin-card ${s.id===save.skin?'equipped':''}" data-skin="${s.id}" ${s.id===save.skin?'data-default':''}><div class="deck-swatch ${s.animated?'animated-deck':''}" style="background:linear-gradient(125deg,${s.color} 45%,${s.second} 46% 69%,${s.color} 70%)"></div><strong>${s.name}</strong><small>${s.id===save.skin?'● EQUIPPED':s.animated?'ANIMATED · EQUIP ↗':'EQUIP DECK ↗'}</small></button>`).join('')+'<h3 class="catalog-heading">YOUR WHEELS</h3>'+wheelStyles.filter(w=>save.ownedWheels.includes(w.id)).map(w=>`<button class="skin-card ${save.wheel===w.id?'equipped':''}" data-wheel="${w.id}"><div class="wheel-swatch" style="--wheel:${w.color}"></div><strong>${w.name}</strong><small>${save.wheel===w.id?'● EQUIPPED':'EQUIP WHEELS ↗'}</small></button>`).join('');
 }
 function renderShop(){
   $('#shop-grid').innerHTML=skins.filter(s=>s.price).map((s,i)=>`<article class="shop-card"><div class="deck-swatch ${s.animated?'animated-deck':''}" style="background:linear-gradient(125deg,${s.color} 45%,${s.second} 46% 69%,${s.color} 70%)"></div><h3>${s.name}</h3><p>${s.animated?'ANIMATED GRAPHIC · flowing color':'DECK GRAPHIC · matching boost trail'}<br>Cosmetic only. Same performance.</p><strong>◈ ${s.price} TOKENS</strong><button data-buy="${s.id}" ${i===0?'data-default':''}>${save.owned.includes(s.id)?'EQUIP':save.coins>=s.price?'UNLOCK':'EARN '+(s.price-save.coins)+' MORE'}</button></article>`).join('')+'<h3 class="catalog-heading">WHEEL WORKSHOP / 7 SETS</h3>'+wheelStyles.filter(w=>w.price).map(w=>`<article class="shop-card"><div class="wheel-swatch" style="--wheel:${w.color}"></div><h3>${w.name}</h3><p>${w.animated?'ANIMATED · pulsing glow':w.metal?'POLISHED METAL FINISH':'COLORED URETHANE'}<br>Four wheels. Your style.</p><strong>◈ ${w.price} TOKENS</strong><button data-buy-wheel="${w.id}">${save.ownedWheels.includes(w.id)?'EQUIP':save.coins>=w.price?'UNLOCK':'EARN '+(w.price-save.coins)+' MORE'}</button></article>`).join('');
 }
 function refreshWallet(){$('#wallet').textContent='◈ '+save.coins;$('#audio-toggle').textContent=save.muted?'SOUND OFF':'SOUND ON';}
 function renderSettings(focusName){
   const percent=n=>Math.round(n*100)+'%',cards=[['steering','STEERING',percent(save.settings.steering),'How strongly the left stick turns. Lower it for finer lines.'],['airControl','AIR ROTATION',percent(save.settings.airControl),'Flip and roll speed. Lower it for easier wheel-down landings.'],['deadzone','STICK DEADZONE',percent(save.settings.deadzone),'Raise this if the board or camera moves without you.'],['music','MUSIC VOLUME',percent(save.settings.music),'Your menu soundtrack and quieter music during a run.'],['sound','GAME SOUND',save.muted?'OFF':'ON','Turn all music and game effects on or off.'],['ghost','BEST-RUN GHOST',save.ghost?'ON':'OFF','Race the ghost of your saved personal best.']];
   settingsScreen.innerHTML='<div class="page-heading"><div><p class="eyebrow">MAKE IT FEEL RIGHT</p><h2>Your setup.</h2></div><button data-action="settings-back">← '+(settingsReturn==='pause'?'PAUSED RUN':'HOME')+'</button></div><p class="section-copy">Select a setting and press ✕ to change it. Your choices save automatically.</p><div class="settings-grid">'+cards.map(([key,title,value,copy],i)=>`<button class="settings-card" data-setting="${key}" ${i===0?'data-default':''} aria-label="${title}: ${value}. Press Cross or Enter to change."><strong>${title}</strong><span class="settings-value">${value}</span><small>${copy}</small></button>`).join('')+'</div><div class="controller-guide"><strong>DUALSENSE CONTROLS</strong><p>R2 accelerate · L2 brake / reverse · Left stick steer · ✕ jump / double jump</p><p>In the air: left stick up / down flips · L1 rolls left · R1 rolls right</p><p>R3 restart · Options pause · ○ back · Right stick rotates your board in Home and Locker</p><small>Keyboard: WASD / arrows drive · Space jump · Q / E roll · I / K flip · R restart · Esc pause / back</small></div>';
   if(focusName)focusButton(settingsScreen.querySelector('[data-setting="'+focusName+'"]'));
 }
 function changeSetting(name){if(name==='sound'){save.muted=!save.muted;if(master)master.gain.setTargetAtTime(save.muted?0:.24,audio.currentTime,.03);refreshWallet();}else if(name==='ghost')save.ghost=!save.ghost;else if(settingSteps[name]){const values=settingSteps[name];save.settings[name]=values[(values.indexOf(save.settings[name])+1)%values.length];}persist();renderSettings(name);}
 function openSettings(){settingsReturn=mode==='pause'?'pause':'home';showScreen('settings');}
 function closeSettings(){if(settingsReturn!=='pause'){showScreen('home');return;}$('#ui').style.display='none';$('#hud').hidden=false;track.visible=true;particleMesh.visible=true;boardRoot.visible=true;cameraInit=false;mode='race';pause();}
 function replayData(id){try{const data=JSON.parse(localStorage.getItem(ghostKey(id)));if(data&&Array.isArray(data.frames)&&data.frames.length>1&&data.frames.every(f=>Array.isArray(f)&&f.length>=7&&f.every(Number.isFinite))&&Math.abs(data.time-save.bests[id])<.02)return data;}catch{}return null;}
 function renderReplays(){const available=C.levels.filter(l=>replayData(l.id));replayScreen.innerHTML='<div class="page-heading"><div><p class="eyebrow">YOUR PERSONAL BESTS</p><h2>Ride it again.</h2></div><button data-action="home">← HOME</button></div><p class="section-copy">Watch from your ghost’s view. Playback never changes your times or tokens.</p><div class="replay-list">'+(available.length?available.map(l=>`<button data-watch="${l.id}"><span>▶</span><strong>${l.name}</strong><small>${format(save.bests[l.id])} · WATCH YOUR BEST</small></button>`).join(''):'<div class="empty-replays"><h3>Your first replay is waiting.</h3><p>Finish a course to save a best-run ghost, then watch it here.</p><button data-action="levels">PLAY A COURSE →</button></div>')+'</div>';}
 function startReplay(id){const data=replayData(id);if(!data){toast('Finish this course to save a replay first.');return;}startLevel(id);mode='replay';replay={frames:data.frames,time:0,duration:data.frames.at(-1)[0],index:0,paused:false};replayBar.hidden=false;$('.controls').hidden=true;$('#air-jump').hidden=true;$('#effect-hud').hidden=true;$('#pause-button').hidden=true;$('#event-toast').style.opacity=0;updateReplay(0);}
 function replayPause(){if(!replay)return;replay.paused=!replay.paused;$('#replay-bar [data-action="replay-toggle"]').textContent=replay.paused?'PLAY · ✕':'PAUSE · ✕';}
 function seekReplay(time){if(!replay)return;replay.time=clamp(time,0,replay.duration);replay.index=0;cameraInit=false;updateReplay(0);}
 function updateReplay(dt){if(!replay)return;const q=replay;if(!q.paused)q.time=Math.min(q.duration,q.time+dt);while(q.index<q.frames.length-2&&q.frames[q.index+1][0]<q.time)q.index++;const a=q.frames[q.index],b=q.frames[q.index+1],interval=Math.max(.001,b[0]-a[0]),u=clamp((q.time-a[0])/interval,0,1);runner.p.set(a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u,a[3]+(b[3]-a[3])*u);runner.velocity.set((b[1]-a[1])/interval,(b[2]-a[2])/interval,(b[3]-a[3])/interval);runner.heading=a[4]+angle(b[4]-a[4])*u;runner.tilt=a[5]+angle(b[5]-a[5])*u;runner.pitchTilt=a[6]+angle(b[6]-a[6])*u;runner.elapsed=q.time;runner.grounded=false;runner.boostTime=0;runner.reboundTime=0;runner.progress=q.time/Math.max(.01,q.duration)*(world.path.finishU||.975);if(q.time>=q.duration&&!q.paused)replayPause();$('#replay-time').textContent=format(q.time)+' / '+format(q.duration);$('#replay-seek').value=Math.round(q.time/Math.max(.01,q.duration)*1000);}
 $('#replay-seek').addEventListener('input',e=>seekReplay(+e.target.value/1000*replay.duration));
 function uiButtons(){const root=['pause','finish'].includes(mode)?$('#modal-actions'):$('#'+mode);return root?[...root.querySelectorAll('button')].filter(b=>!b.disabled&&b.getClientRects().length):[];}
 function focusButton(button){if(selected)selected.classList.remove('selected');selected=button||null;if(selected){selected.classList.add('selected');selected.focus({preventScroll:true});selected.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});}}
 function defaultFocus(){const buttons=uiButtons();focusButton(buttons.find(b=>b.hasAttribute('data-default'))||buttons[0]);}
 function navigate(dx,dy){
   const buttons=uiButtons();if(!buttons.length)return;if(!buttons.includes(selected)){defaultFocus();return;}const a=selected.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;
   let best=null,bestScore=Infinity;for(const b of buttons){if(b===selected)continue;const r=b.getBoundingClientRect(),x=r.left+r.width/2-ax,y=r.top+r.height/2-ay,forward=x*dx+y*dy,cross=Math.abs(x*dy-y*dx);if(forward<=4)continue;const score=forward+cross*2.3;if(score<bestScore){best=b;bestScore=score;}}
   if(best){focusButton(best);sound('move');}
 }
 function clearInput(){keys.clear();pendingJump=false;userInput={steer:0,throttle:0,tilt:0,pitch:0};orbitInput={x:0,y:0};padState.nav=0;}
 function showScreen(next){mode=next;clearInput();$('#overlay').hidden=true;$('#hud').hidden=true;$('#ui').style.display='';document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===next));document.body.className=next==='locker'?'locker':next==='home'?'':'panel';
   replay=null;replayBar.hidden=true;orbitHint.hidden=!['home','locker'].includes(next);
   if(next==='levels')renderLevels();if(next==='locker')renderLocker();if(next==='shop')renderShop();if(next==='replays')renderReplays();if(next==='settings')renderSettings();refreshWallet();defaultFocus();boardRoot.visible=true;blob.visible=false;track.visible=false;particleMesh.visible=false;ghostBoard.visible=false;trailMesh.visible=false;
 }
 let cameraYaw=0,cameraDistance=15,cameraInit=false,displayPitch=0,displayRoll=0,cameraClock=0;const cameraAnchor=v(),cameraLook=v(),cameraOccluders=new Map();
 function startLevel(id){
   replay=null;replayBar.hidden=true;$('.controls').hidden=false;$('#air-jump').hidden=false;$('#effect-hud').hidden=false;$('#pause-button').hidden=false;
   levelIndex=id;world=C.buildLevel(id);runner=new C.Runner(world);buildVisuals();mode='race';clearInput();accumulator=0;$('#ui').style.display='none';$('#overlay').hidden=true;$('#hud').hidden=false;focusButton(null);document.activeElement?.blur();track.visible=true;particleMesh.visible=true;boardRoot.scale.setScalar(1);cameraYaw=runner.heading;cameraInit=false;displayPitch=0;cameraDistance=15;
   loadGhost();trailHistory=[];particles.forEach(p=>p.life=0);
   $('#run-name').textContent=world.level.name.toUpperCase();$('#run-pack').textContent=C.packs[world.level.pack].name;$('#best').textContent='PERSONAL BEST '+(save.bests[id]?format(save.bests[id]):'—');eventText('FIND YOUR LINE');
 }
 function restart(){runner.reset();loadGhost();trailHistory=[];mode='race';clearInput();accumulator=0;$('#overlay').hidden=true;$('#hud').hidden=false;cameraInit=false;cameraYaw=runner.heading;displayPitch=0;particles.forEach(p=>p.life=0);eventText('ONE MORE RUN');}
 function pause(){if(mode!=='race')return;mode='pause';clearInput();$('#overlay').hidden=false;$('#modal-tag').textContent='TAKE A BREATHER';$('#modal-title').textContent='Paused.';$('#modal-sub').textContent='Your run is waiting. The clock is stopped.';$('#modal-stats').innerHTML='';$('#result-delta').hidden=true;$('#modal-actions').innerHTML='<button data-action="resume" data-default>RESUME →</button><button data-action="restart">RESTART RUN</button><button data-action="levels">COURSE SELECT</button><button data-action="home">HOME</button><button data-action="settings">SETTINGS</button><button data-action="ghost">BEST GHOST: '+(save.ghost?'ON':'OFF')+'</button>';defaultFocus();}
 function resume(){mode='race';clearInput();$('#overlay').hidden=true;focusButton(null);accumulator=0;}
 function finish(){
   mode='finish';const time=runner.elapsed,old=save.bests[levelIndex],newBest=!old||time<old;
   if(newBest){save.bests[levelIndex]=time;recordNext=0;recordRun();try{localStorage.setItem(ghostKey(levelIndex),JSON.stringify({time,frames:recording}));}catch{toast('Best time saved; browser storage is full for the ghost.');}}
   const thresholds=world.medals,rank=time<=thresholds[0]?4:time<=thresholds[1]?3:time<=thresholds[2]?2:1,oldRank=save.rewards[levelIndex]||0,reward=Math.max(0,rank-oldRank)*30;
   save.rewards[levelIndex]=Math.max(rank,oldRank);save.coins+=reward;persist();
   $('#overlay').hidden=false;$('#modal-tag').textContent=['','','BRONZE MEDAL','SILVER MEDAL','GOLD MEDAL'][rank]||'COURSE COMPLETE';$('#modal-title').textContent='Nice line.';$('#modal-sub').textContent=world.level.name+' · '+(newBest?'New personal best!':'Another one in the books.');
   $('#modal-stats').innerHTML=`<div><strong>${format(time)}</strong><small>YOUR TIME</small></div><div><strong>+${reward}</strong><small>TOKENS EARNED</small></div>`;
   const delta=old?time-old:null;$('#result-delta').className='result-delta '+(delta===null?'first':delta<-.0005?'faster':delta>.0005?'slower':'equal');
   $('#result-delta').innerHTML=delta===null?'<small>FIRST RECORD SET</small><strong>THIS IS YOUR BENCHMARK</strong><span>Your ghost is ready for the next run.</span>':`<small>${delta<-.0005?'NEW PERSONAL RECORD':delta>.0005?'BEHIND YOUR PERSONAL BEST':'MATCHED YOUR PERSONAL BEST'}</small><strong>${delta<0?'−':'+'}${Math.abs(delta).toFixed(3)}<em> s</em></strong><span>${delta<-.0005?'FASTER':delta>.0005?'SLOWER':'EXACT MATCH'} · ${delta<0?'PREVIOUS BEST':'BEST TIME'} ${format(old)}</span>`;$('#result-delta').hidden=false;
   $('#modal-actions').innerHTML=`<button data-action="restart" data-default>RUN IT BACK →</button><button data-watch="${levelIndex}">WATCH MY BEST →</button>${levelIndex<C.levels.length-1?'<button data-action="next">NEXT COURSE</button>':''}<button data-action="levels">COURSE SELECT</button><button data-action="home">HOME</button>`;defaultFocus();sound('finish');burst('#d9fa50',140,16);
 }
 function goBack(){if(mode==='settings')closeSettings();else if(mode==='replay')showScreen('replays');else if(mode==='race')pause();else if(mode==='pause')resume();else if(mode==='finish')showScreen('levels');else if(mode!=='home')showScreen('home');}
 function action(button){
   if(!button)return;unlockAudio();sound('select');
   if(button.dataset.setting){changeSetting(button.dataset.setting);return;}
   if(button.dataset.action==='settings'){openSettings();return;}if(button.dataset.action==='settings-back'){closeSettings();return;}
   if(button.dataset.watch!==undefined){startReplay(+button.dataset.watch);return;}
   if(button.dataset.action==='replay-toggle'){replayPause();return;}if(button.dataset.action==='replay-restart'){if(replay){seekReplay(0);replay.paused=true;replayPause();}return;}if(button.dataset.action==='replay-exit'){showScreen('replays');return;}
   if(button.dataset.level!==undefined){startLevel(+button.dataset.level);return;}
   if(button.dataset.pack!==undefined){pack=+button.dataset.pack;renderLevels();defaultFocus();return;}
   if(button.dataset.skin){save.skin=button.dataset.skin;applySkin();persist();renderLocker();defaultFocus();return;}
   if(button.dataset.wheel){save.wheel=button.dataset.wheel;applySkin();persist();renderLocker();defaultFocus();return;}
   if(button.dataset.buyWheel){const w=wheelStyles.find(w=>w.id===button.dataset.buyWheel);if(!save.ownedWheels.includes(w.id)){if(save.coins<w.price){toast('Finish courses to earn more tokens.');return;}save.coins-=w.price;save.ownedWheels.push(w.id);}save.wheel=w.id;applySkin();persist();refreshWallet();renderShop();defaultFocus();toast(w.name+' equipped');return;}
   if(button.dataset.action==='ghost'){save.ghost=!save.ghost;persist();button.textContent='BEST GHOST: '+(save.ghost?'ON':'OFF');return;}
   if(button.dataset.buy){const s=skins.find(s=>s.id===button.dataset.buy);if(!save.owned.includes(s.id)){if(save.coins<s.price){toast('Finish courses to earn more tokens.');return;}save.coins-=s.price;save.owned.push(s.id);}save.skin=s.id;persist();applySkin();refreshWallet();renderShop();defaultFocus();toast(s.name+' equipped');return;}
   const a=button.dataset.action;if(['home','levels','locker','shop','replays'].includes(a))showScreen(a);else if(a==='pause')pause();else if(a==='resume')resume();else if(a==='restart')restart();else if(a==='next')startLevel(Math.min(C.levels.length-1,levelIndex+1));else if(a==='audio'){save.muted=!save.muted;if(master)master.gain.setTargetAtTime(save.muted?0:.24,audio.currentTime,.03);refreshWallet();persist();}
 }
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(b)action(b);});
 document.addEventListener('pointerover',e=>{const b=e.target.closest('button');if(b&&uiButtons().includes(b))focusButton(b);});
 addEventListener('keydown',e=>{
   unlockAudio();if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
   if(e.code==='Escape'&&!e.repeat){goBack();return;}
   if(mode==='replay'){if(e.repeat)return;if(['Space','Enter','KeyP'].includes(e.code))replayPause();if(e.code==='ArrowLeft')seekReplay(replay.time-5);if(e.code==='ArrowRight')seekReplay(replay.time+5);if(e.code==='KeyR'){seekReplay(0);if(replay.paused)replayPause();}return;}
   if(['home','locker'].includes(mode)&&['KeyJ','KeyL','KeyU','KeyO'].includes(e.code)){keys.add(e.code);return;}
   if(mode!=='race'){
     if(e.repeat)return;const dirs={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};if(dirs[e.code])navigate(...dirs[e.code]);if(e.code==='Enter'||e.code==='Space'){e.preventDefault();action(selected);}return;
   }
   keys.add(e.code);if(e.code==='Space'&&!e.repeat)pendingJump=true;if(e.code==='KeyR'&&!e.repeat)restart();if(e.code==='KeyP'&&!e.repeat)pause();
 });
 addEventListener('keyup',e=>keys.delete(e.code));
 function loseFocus(){active=false;clearInput();padState.armed=false;if(mode==='race')pause();if(mode==='replay'&&!replay.paused)replayPause();}
 function regainFocus(){active=true;clearInput();padState.armed=false;}
 function controllerDisconnected(){clearInput();padState.index=null;padState.previous=[];padState.armed=false;$('#connection').textContent='CONTROLLER DISCONNECTED · KEYBOARD AVAILABLE';if(mode==='race'){pause();$('#modal-sub').textContent='Controller disconnected. Reconnect, release the controls, then press ✕ to resume.';}if(mode==='replay'&&!replay.paused)replayPause();}
 addEventListener('blur',loseFocus);addEventListener('focus',regainFocus);addEventListener('pagehide',loseFocus);addEventListener('pageshow',regainFocus);document.addEventListener('visibilitychange',()=>{if(document.hidden)loseFocus();else if(!document.hasFocus||document.hasFocus())regainFocus();});
 addEventListener('gamepaddisconnected',e=>{if(e.gamepad?.index===padState.index)controllerDisconnected();});
 function pollInput(now){
   let pads=[];try{pads=Array.from(navigator.getGamepads?.()||[]);}catch{}
   const connected=pads.filter(p=>p&&p.connected),previousPad=connected.find(p=>p.index===padState.index);
   if(padState.index!==null&&!previousPad)controllerDisconnected();
   const p=previousPad||connected.find(p=>p.mapping==='standard')||connected[0],inUI=mode!=='race';let gs=0,gt=0,gr=0,gp=0;orbitInput={x:0,y:0};
   if(p&&active){
     const buttons=p.buttons.map(b=>b.pressed||b.value>.55),pressed=i=>buttons[i]&&!padState.previous[i],dead=x=>Math.abs(x)<=save.settings.deadzone?0:Math.sign(x)*(Math.abs(x)-save.settings.deadzone)/(1-save.settings.deadzone);
     if(p.index!==padState.index){padState.index=p.index;padState.previous=buttons.slice();padState.armed=false;const name=/dualsense|dualshock|054c|playstation/i.test(p.id||'')?'PLAYSTATION CONTROLLER':'CONTROLLER';$('#connection').textContent=name+' CONNECTED · '+(p.mapping==='standard'?'READY TO ROLL':'CHECK YOUR BUTTON MAPPING');}
     const neutral=!buttons.some(Boolean)&&p.axes.every(a=>Math.abs(a)<Math.max(.2,save.settings.deadzone+.03));if(neutral)padState.armed=true;
     if(padState.armed){
       if(mode==='replay'){
         if(pressed(0)||pressed(9))replayPause();if(pressed(1))goBack();else if(pressed(11)){seekReplay(0);if(replay.paused)replayPause();}else if(pressed(14))seekReplay(replay.time-5);else if(pressed(15))seekReplay(replay.time+5);
       }else if(inUI){
         if(['home','locker'].includes(mode))orbitInput={x:dead(p.axes[2]||0),y:dead(p.axes[3]||0)};
         const dx=(buttons[15]?1:0)-(buttons[14]?1:0)||(Math.abs(p.axes[0]||0)>.55?Math.sign(p.axes[0]):0),dy=(buttons[13]?1:0)-(buttons[12]?1:0)||(Math.abs(p.axes[1]||0)>.55?Math.sign(p.axes[1]):0),code=dx+dy*3;
         if(code&&(code!==padState.nav||now>padState.next)){navigate(dx?Math.sign(dx):0,dx?0:Math.sign(dy));padState.next=now+(code!==padState.nav?330:170);}padState.nav=code;
         if(pressed(0)){unlockAudio();action(selected);}else if(pressed(1))goBack();else if(pressed(9)&&mode==='pause')resume();
       }else{
         gs=dead(p.axes[0]||0)*save.settings.steering;gp=dead(p.axes[1]||0)*save.settings.airControl;const trigger=i=>clamp(((p.buttons[i]?.value||0)-.04)/.96,0,1);gt=trigger(7)-trigger(6);gr=((buttons[5]?1:0)-(buttons[4]?1:0))*save.settings.airControl;
         if(pressed(0))pendingJump=true;if(pressed(11))restart();if(pressed(9)||pressed(1))pause();
       }
     }
     padState.previous=buttons;
   }else if(!p){padState.previous=[];}
   const key=(...names)=>names.some(k=>keys.has(k))?1:0;
   userInput=active&&mode==='race'?{steer:clamp(gs+(key('KeyD','ArrowRight')-key('KeyA','ArrowLeft'))*save.settings.steering,-1,1),throttle:clamp(gt+key('KeyW','ArrowUp')-key('KeyS','ArrowDown'),-1,1),tilt:clamp(gr+(key('KeyE')-key('KeyQ'))*save.settings.airControl,-1,1),pitch:clamp(gp+(key('KeyK')-key('KeyI'))*save.settings.airControl,-1,1)}:{steer:0,throttle:0,tilt:0,pitch:0};
 }
 function updateRace(dt){
   accumulator=Math.min(accumulator+dt,.1);while(accumulator>=1/120&&mode==='race'){
     runner.step(1/120,{...userInput,jump:pendingJump});pendingJump=false;accumulator-=1/120;
     recordRun();
     for(const e of runner.events){
       if(e==='fall'){restart();break;}if(e==='finish'){finish();break;}
       if(e==='boost'){burst(skins.find(s=>s.id===save.skin).color,40,10);eventText('BOOST · FULL POWER');}if(e==='double'){burst('#bca1ff',30,8);eventText('AIR JUMP');}if(e==='pad'){burst('#38cfff',42,10);eventText('UP TO THE NEXT DECK');}if(e==='bonk'){burst('#ff443c',52,15);eventText('REBOUND!');}
       if(e==='rough')burst('#d7dfe2',Math.min(24,Math.round(runner.lastLanding.impact/2)),3);
       if(e==='crash'){eventText('CRASH');burst('#d7dfe2',25,3);sound('bonk');}
       if(e!=='land'||Math.hypot(runner.velocity.x,runner.velocity.z)>8)sound(e);
     }
   }
 }
 function renderRunner(dt){
   boardRoot.position.copy(runner.p);boardRoot.rotation.set(0,-runner.heading,0);boardRoot.scale.setScalar(1);
   const forward=v(Math.sin(runner.heading),0,-Math.cos(runner.heading));
   const slope=runner.grounded?Math.atan2(-runner.normal.dot(forward),runner.normal.y):runner.pitchTilt;if(runner.grounded){displayPitch=angle(displayPitch);displayPitch+=angle(slope-displayPitch)*(1-Math.exp(-dt*14));}else displayPitch=runner.pitchTilt;
   // Local +X is the right edge: negative Z rotation lowers that edge. R1 therefore tilts RIGHT.
   const bank=runner.grounded?Math.asin(clamp(runner.normal.dot(v(Math.cos(runner.heading),0,Math.sin(runner.heading))),-1,1)):runner.tilt;if(!runner.grounded)displayRoll=bank;else displayRoll+=angle(bank-displayRoll)*(1-Math.exp(-dt*12));boardVisual.rotation.set(displayPitch,0,-displayRoll);
   wheels.forEach(w=>w.rotation.x-=Math.hypot(runner.velocity.x,runner.velocity.z)*dt*3);
   blob.visible=runner.grounded;blob.position.copy(runner.p).addScaledVector(runner.normal,-.485);const shadowForward=forward.clone().projectOnPlane(runner.normal).normalize(),shadowRight=shadowForward.clone().cross(runner.normal).normalize();blob.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(shadowRight,shadowForward,runner.normal));
   const targetYaw=runner.heading;cameraYaw+=angle(targetYaw-cameraYaw)*(1-Math.exp(-dt*5));const f=v(Math.sin(cameraYaw),0,-Math.cos(cameraYaw));
   const wantedLook=runner.p.clone().addScaledVector(f,5).add(v(0,.45,0));
   if(!cameraInit){cameraAnchor.copy(runner.p);cameraLook.copy(wantedLook);}else{cameraAnchor.lerp(runner.p,1-Math.exp(-dt*10));cameraLook.lerp(wantedLook,1-Math.exp(-dt*9));}
   const desired=cameraAnchor.clone().addScaledVector(f,-15).add(v(0,10,0));
   if(!cameraInit){camera.position.copy(desired);cameraInit=true;}else camera.position.lerp(desired,1-Math.exp(-dt*14));
   // Stable framing: no speed zoom, camera kick, or snapping against triangle edges.
   // Briefly fade only geometry between the board and camera instead of hiding play.
   const focus=runner.p.clone().add(v(0,.8,0)),dir=camera.position.clone().sub(focus),maxDistance=dir.length();dir.normalize();track.updateMatrixWorld(true);cameraClock+=dt;
   for(const hit of new T.Raycaster(focus,dir,.1,maxDistance).intersectObjects(roadMeshes,false))cameraOccluders.set(hit.object,cameraClock+.25);
   for(const [object,until] of cameraOccluders){const faded=cameraClock<until,m=object.material;m.transparent=true;m.depthWrite=!faded;m.opacity=faded?.13:m.opacity+(1-m.opacity)*(1-Math.exp(-dt*6));if(!faded&&m.opacity>.995){m.opacity=1;m.transparent=false;cameraOccluders.delete(object);}}
   camera.lookAt(cameraLook);camera.fov=62;camera.updateProjectionMatrix();
   sun.position.copy(runner.p).add(v(-35,65,25));sun.target.position.copy(runner.p);sky.position.copy(camera.position);
   $('#clock').textContent=format(runner.elapsed);$('#speed').textContent=Math.round(Math.hypot(runner.velocity.x,runner.velocity.z)*3.6);$('#progress-fill').style.width=clamp(runner.progress/(world.path.finishU||.975)*100,0,100)+'%';
   const ready=runner.grounded?2:Math.max(0,2-runner.jumps);$('#air-jump').innerHTML=(ready===2?'● ●':ready===1?'● ○':'○ ○')+' <span>'+(ready?'AIR JUMP READY':'LAND TO RECHARGE')+'</span>';
   drawMap($('#minimap'),world.path,true,runner.p,world.shortcut);
   $('#ghost-status').textContent=ghostFrames.length?(save.ghost?'RACING YOUR BEST GHOST':'GHOST OFF'):'SET A RECORD TO UNLOCK YOUR GHOST';
   updateTrail(dt);renderGhost();
 }
 function renderMenu(t,dt){
   if(['home','locker'].includes(mode)){orbitYaw+=(orbitInput.x+(keys.has('KeyL')?1:0)-(keys.has('KeyJ')?1:0))*dt*1.8;orbitPitch=clamp(orbitPitch+(orbitInput.y+(keys.has('KeyO')?1:0)-(keys.has('KeyU')?1:0))*dt*1.6,-1.55,1.55);}
   const aspect=innerWidth/innerHeight,look=v(0,10.2,-1);camera.position.set(0,14,10.5);camera.lookAt(look);camera.fov=43;camera.updateProjectionMatrix();
   const height=2*Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.position.distanceTo(look),width=height*aspect,screenUp=v(0,1,0).applyQuaternion(camera.quaternion);
   boardRoot.scale.setScalar(Math.min(1.5,width*.39/3.7,height*.72/3.7));boardRoot.position.copy(look).add(v(width*.235,0,0)).addScaledVector(screenUp,height*.055+Math.sin(t*.8)*.045);
   boardRoot.rotation.set(.18+orbitPitch,Math.sin(t*.16)*.2-.65+orbitYaw,.24);boardVisual.rotation.set(0,0,mode==='locker'?Math.PI*.76:Math.PI*.64);
   sun.position.set(-15,35,15);sun.target.position.copy(boardRoot.position);menuFill.target.position.copy(boardRoot.position);menuRim.target.position.copy(boardRoot.position);sky.position.copy(camera.position);
   skyUniform.top.value.set('#9abeca');skyUniform.bottom.value.set('#dcefed');waterUniform.color.value.set('#86abb2');
 }
 let last=performance.now();
 function frame(now){
   const dt=Math.min((now-last)/1000,.05);last=now;pollInput(now);music();
   menuFill.visible=menuRim.visible=['home','locker'].includes(mode);
   if(mode==='race')updateRace(dt);
   if(mode==='replay')updateReplay(dt);
   if(['race','pause','finish','replay'].includes(mode)){renderRunner(['race','replay'].includes(mode)?dt:0);if(mode!=='pause'&&mode!=='replay')updateParticles(dt);}else renderMenu(now/1000,dt);
   if(mode!=='pause')waterUniform.time.value+=dt;for(const pm of padMeshes){pm.rim.material.color.setScalar(.85+Math.sin(now*.003)*.15);}
   for(const bm of bumperMeshes){const age=runner.elapsed-bm.b.hit,pulse=bm.b.hit>0&&age>=0&&age<.5?Math.sin(age/.5*Math.PI):0;bm.body.scale.setScalar(1+pulse*.16);bm.ring.scale.setScalar(1+pulse*2);bm.ring.material.opacity=.3+pulse*.5;}
   const skin=skins.find(s=>s.id===save.skin),wheel=wheelStyles.find(s=>s.id===save.wheel)||wheelStyles[0];
   if(skin.animated){boardTexture.offset.y=(now*.00012)%1;materials.deck.emissive.set(skin.color);materials.deck.emissiveIntensity=.12+Math.sin(now*.003)*.09;}else{boardTexture.offset.y=0;materials.deck.emissiveIntensity=0;}
   wheels.forEach(w=>{w.material.emissive.set(wheel.color);w.material.emissiveIntensity=wheel.animated?.3+Math.sin(now*.006)*.25:0;});
   renderer.render(scene,camera);requestAnimationFrame(frame);
 }
 addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
 window.addEventListener('error',e=>{const loading=$('#loading');if(loading&&loading.style.display!=='none')loading.querySelector('p').textContent='Could not start: '+e.message;});
 world=C.buildLevel(0);runner=new C.Runner(world);showScreen('home');$('#loading').style.display='none';requestAnimationFrame(frame);
 // Read-only diagnostics for regression tests; never used by gameplay or controller input.
 window.DeckDiagnostics={get mode(){return mode;},get runner(){return runner;},get selected(){return selected;},get input(){return {...userInput};},get roll(){return boardVisual.rotation.z;},get pitch(){return boardVisual.rotation.x;},get orbit(){return {yaw:orbitYaw,pitch:orbitPitch};},get replay(){return replay?{time:replay.time,duration:replay.duration,paused:replay.paused}:null;},get ghostVisible(){return ghostBoard.visible;},get ghostFrames(){return ghostFrames.length;},get trailVisible(){return trailMesh.visible;},get animationOffset(){return boardTexture.offset.y;},get wheelColor(){return wheels[0].material.color.getHexString();},startLevel,navigate,action,goBack,pollInput,get save(){return save;}};
})();
