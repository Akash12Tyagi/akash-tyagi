/* Lusso di Firenze concept homepage. Source for assets/app.js (npm run build).
   Bundled to a classic script with three.js, Lenis and the logos inlined, so index.html also works when opened straight from disk. */
import * as THREE_NS from 'three';
import {RoundedBoxGeometry as RBG} from 'three/addons/geometries/RoundedBoxGeometry.js';
import Lenis from 'lenis';
import LOGO_MARK from '../assets/logo-mark.png';
import LOGO_WORD from '../assets/logo-word.png';
import LOGO_STACKED from '../assets/logo-stacked.png';

{const r=document.documentElement.style;r.setProperty('--logo-mark',`url(${LOGO_MARK})`);r.setProperty('--logo-word',`url(${LOGO_WORD})`);r.setProperty('--logo-stacked',`url(${LOGO_STACKED})`)}

(async()=>{
/* ============================================================
   DATA: name, bottle shape, concentration and audience as printed on the bottles in the brand guide.
   mrp values are placeholders until the live MRPs are supplied.
   ============================================================ */
const FRAGS=[
  {id:'majesty',name:'Majesty Noir',shape:'square',liquid:'#E6E19A',conc:'Eau de parfum',who:'For unisex',desc:'Bright citrus, a pineapple heart, smoked woods beneath.',notes:'Bergamot · black currant · jasmine · birch · oakmoss · musk',price:1385,mrp:2499,img:'majesty-splash.jpg'},
  {id:'flora',name:'Flora Bella',shape:'gem',liquid:'#F6D982',conc:'Eau de parfum',who:'For her',desc:'A blossom of timeless beauty.',notes:'Peony · rose · osmanthus · pink pepper · sandalwood',price:1847,mrp:2999,img:'flora-smile.jpg'},
  {id:'aura',name:'Aura Elegance',shape:'round',liquid:'#3FC9A4',conc:'Eau de parfum',who:'For unisex',desc:'A luminous blend of fruity freshness and spiced florals.',notes:'',price:1385,mrp:2499,img:'aura-denim.jpg'},
  {id:'amber',name:'Amber Nomad',shape:'round',liquid:'#DE8526',dens:1.05,conc:'Extrait de parfum',who:'For unisex',desc:'Warm amber, soft resins, a slow golden trail.',notes:'',price:1385,mrp:2499,img:'amber-car.jpg'},
  {id:'miss',name:'Miss Desire',shape:'round',liquid:'#F6A4B8',conc:'Eau de parfum',who:'For her',desc:'A fragrance of graceful intensity.',notes:'',price:1385,mrp:2499,img:'miss-stone.jpg'},
  {id:'vaan',name:'Vaan Noir',shape:'gem',liquid:'#EAB12C',conc:'Extrait de parfum',who:'',desc:'Deep gold, quiet depth, an after-hours signature.',notes:'',price:1847,mrp:2999,img:'vaan-books.jpg'},
  {id:'silver',name:'Silver Elite',shape:'round',liquid:'#F4D83A',conc:'Eau de parfum',who:'For unisex',desc:'Crisp, polished and quietly confident.',notes:'',price:1385,mrp:2499,img:'silver-stone.jpg'},
  {id:'golden',name:'Golden Temptation',shape:'tumbler',liquid:'#EBBB4C',conc:'Extrait de parfum',who:'For unisex',desc:'Warm spice, precious woods, a glow of white flowers.',notes:'',price:1847,mrp:2999,img:'golden-temptation.jpg'},
  {id:'rouge',name:'Rouge Signature',shape:'square',liquid:'#F0E4A6',conc:'Eau de parfum',who:'For unisex',desc:'A bold expression of modern elegance.',notes:'',price:1385,mrp:2499,img:'pack-rouge.jpg'},
  {id:'velvet',name:'Royal Velvet',shape:'round',liquid:'#A61E33',conc:'Eau de parfum',who:'',desc:'Plush, regal and unhurried.',notes:'',price:1385,mrp:2499,img:'pack-box.jpg',cap:'Lusso di Firenze gift box'}
];
const HERO_I=3, NOTES_I=0, N=FRAGS.length;
const NOTES=[
  {tier:0,name:'Bergamot',c:'#D9CB4E'},{tier:0,name:'Lemon',c:'#F1DE5C'},{tier:0,name:'Apple',c:'#9CC44C'},{tier:0,name:'Black currant',c:'#5A1F48'},{tier:0,name:'Pink pepper',c:'#E68C9C'},
  {tier:1,name:'Pineapple',c:'#F2B33D'},{tier:1,name:'Jasmine',c:'#F6F0E0'},{tier:1,name:'Birch',c:'#A8987F'},
  {tier:2,name:'Patchouli',c:'#5E3F27'},{tier:2,name:'Cedarwood',c:'#8F5C36'},{tier:2,name:'Oakmoss',c:'#5E6E3B'},{tier:2,name:'Ambergris',c:'#CDAA7C'},{tier:2,name:'Musk',c:'#EADFCD'}
];
const TIERS=['Top notes','Heart notes','Base notes'];
const inr=n=>'₹'+n.toLocaleString('en-IN');
const off=f=>Math.round((1-f.price/f.mrp)*100);

/* ============================================================
   DOM
   ============================================================ */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const mini=f=>`<span class="mini" data-s="${f.shape}" style="--liq:${f.liquid}"><span class="cap"></span><span class="gl"></span></span>`;

$('#tiers').innerHTML=TIERS.map((t,i)=>`<div class="tier"><span class="n">0${i+1}</span><h3>${t}</h3><p>${NOTES.filter(n=>n.tier===i).map(n=>n.name).join(' · ')}</p></div>`).join('');
$('#labels').innerHTML=NOTES.map(n=>`<div class="note"><span>${n.name}</span></div>`).join('');
$('#swatches').insertAdjacentHTML('beforeend',FRAGS.map((f,i)=>`<button class="sw" type="button" data-i="${i}" aria-label="${f.name}"><i style="background:${f.liquid}"></i><span>${f.name}</span></button>`).join(''));
$('#picks').innerHTML=FRAGS.map((f,i)=>`<button class="pick" type="button" data-i="${i}" aria-label="Add ${f.name} to box">${mini(f)}<span>${f.name}</span></button>`).join('');
$('#slots').innerHTML=[1,2,3].map(n=>`<div class="slot"><span class="ph">0${n}</span></div>`).join('');
const mq=['Designed in Italy','35% parfum oil','12–16 hours on skin','Unisex luxury','Entry at ₹999'].map(t=>`<span>${t}</span><span class="st">✦</span>`).join('');
$('#marq').innerHTML=mq+mq;
const mq2=FRAGS.map(f=>`<span>${f.name}</span><span class="st">✦</span>`).join('');$('#marq2').innerHTML=mq2+mq2;
$('#footShop').innerHTML=FRAGS.map((f,i)=>`<li><a href="#collection" data-go="${i}">${f.name}</a></li>`).join('');
const noteEls=$$('#labels .note'),tierEls=$$('.tier'),swEls=$$('.sw'),slotEls=$$('.slot');
const setBannerH=()=>document.documentElement.style.setProperty('--bannerH',$('#banner').offsetHeight+'px');setBannerH();addEventListener('resize',setBannerH);

/* smooth scroll */
let lenis=null;
if(!reduce){lenis=new Lenis({lerp:.09,smoothWheel:true});lenis.stop()}
function goTo(target){
  const y=typeof target==='number'?target:(document.querySelector(target)?.getBoundingClientRect().top??0)+scrollY;
  if(lenis)lenis.scrollTo(y,{duration:1.6,easing:t=>1-Math.pow(1-t,4)});else scrollTo({top:y,behavior:reduce?'auto':'smooth'});
}
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const h=a.getAttribute('href');if(h.length<2)return;e.preventDefault();
  if(a.dataset.go!==undefined)collScrollTo(+a.dataset.go);else goTo(h)}));

/* reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:0,rootMargin:'0px 0px -4% 0px'});
const armReveals=()=>$$('.split,.rise').forEach(el=>io.observe(el));

/* cursor + magnetic buttons */
const cur=$('#cursor'),dotc=$('#dotc'),curTxt=$('#cursorTxt');
let cx=innerWidth/2,cy=innerHeight/2,tx=cx,ty=cy,cursorMode='';
if(fine)document.body.classList.add('has-cursor');
function setCursor(m){if(m===cursorMode)return;cursorMode=m;cur.classList.toggle('big',m==='spritz'||m==='drag'||m==='view');cur.classList.toggle('link',m==='link');curTxt.textContent=m==='drag'?'Turn':m==='view'?'View':'Spritz'}
addEventListener('pointermove',e=>{if(e.pointerType==='mouse')document.body.classList.add('moved');tx=e.clientX;ty=e.clientY;dotc.style.transform=`translate(${tx}px,${ty}px)`});
$$('.mag').forEach(b=>{
  b.addEventListener('pointermove',e=>{if(!fine)return;const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.2}px,${(e.clientY-r.top-r.height/2)*.3}px)`});
  b.addEventListener('pointerleave',()=>{b.style.transition='transform .7s var(--ease),color .45s,background .45s';b.style.transform='';setTimeout(()=>b.style.transition='',700)});
});
document.addEventListener('mouseover',e=>{if(e.target.closest('a,button'))setCursor('link')});
document.addEventListener('mouseout',e=>{if(e.target.closest('a,button'))setCursor('')});

/* nav: hides on scroll down, flips colour over dark sections */
const nav=$('#nav'),navLinks=$$('.nav ul a'),darkSecs=$$('[data-theme="dark"]');let lastY=0;
function navTick(y,notesDark){
  nav.classList.toggle('down',y>40);
  nav.classList.toggle('hide',y>lastY+2&&y>400);if(y<lastY-2)nav.classList.remove('hide');lastY=y;
  let dark=notesDark;
  if(!dark)for(const s of darkSecs){if(s.id==='notes')continue;const r=s.getBoundingClientRect();if(r.top<=40&&r.bottom>40){dark=true;break}}
  nav.classList.toggle('dark',dark);cur.classList.toggle('inv',dark);
}

/* cart + box */
let cart=0;const cartN=$('#cartN');
function bump(n=1){cart+=n;cartN.textContent=cart;cartN.classList.add('bump');setTimeout(()=>cartN.classList.remove('bump'),300)}
const boxSel=[];let onBoxChange=()=>{};
function renderBox(){
  slotEls.forEach((s,i)=>{const f=boxSel[i];
    if(f){if(s.dataset.f!==f.id){s.innerHTML=`<span class="ph">0${i+1}</span>${mini(f)}<span class="nm">${f.name}</span>`;s.dataset.f=f.id;s.classList.remove('full');requestAnimationFrame(()=>requestAnimationFrame(()=>s.classList.add('full')))}}
    else{s.classList.remove('full');s.dataset.f='';s.innerHTML=`<span class="ph">0${i+1}</span>`}});
  $('#boxCount').textContent=boxSel.length===3?'Ready · 3 of 3':`${boxSel.length} of 3 chosen`;
  $('#boxGo').disabled=boxSel.length<3;
  onBoxChange(boxSel);
}
renderBox();
function addToBox(i){if(boxSel.length>=3)boxSel.shift();boxSel.push(FRAGS[i]);renderBox()}
[1,3,7].forEach(addToBox); // open on a curated trio: Flora Bella, Amber Nomad, Golden Temptation
$('#picks').addEventListener('click',e=>{const b=e.target.closest('.pick');if(b)addToBox(+b.dataset.i)});
$('#boxClear').addEventListener('click',()=>{boxSel.length=0;renderBox()});
$('#boxGo').addEventListener('click',()=>{bump(1);boxSel.length=0;renderBox()});
$$('[data-add]').forEach(b=>b.addEventListener('click',()=>bump(1)));
$('#newsF').addEventListener('submit',e=>{e.preventDefault();e.target.querySelector('button').textContent='Thank you';e.target.reset()});

/* collection card */
let collIdx=-1,photoFlip=false;
const cName=$('#cName'),cDesc=$('#cDesc'),cPrice=$('#cPrice'),cMrp=$('#cMrp'),cOff=$('#cOff'),cKick=$('#cKick'),cIdxEl=$('#cIdx'),cImgA=$('#cImgA'),cImgB=$('#cImgB'),cCap=$('#cCap');
const nameHTML=n=>n.split(' ').map(w=>`<span class="w"><span>${w}</span></span>`).join('');
cImgA.src='assets/img/'+FRAGS[0].img;cImgA.alt=FRAGS[0].name;
function showFrag(i){
  if(i===collIdx)return;const first=collIdx<0;collIdx=i;const f=FRAGS[i];
  swEls.forEach((s,k)=>s.setAttribute('aria-current',k===i));
  cIdxEl.textContent=String(i+1).padStart(2,'0');
  if(!first&&f.img){const show=photoFlip?cImgA:cImgB,hide=photoFlip?cImgB:cImgA;photoFlip=!photoFlip;show.src='assets/img/'+f.img;show.alt=f.name;show.classList.remove('hid');hide.classList.add('hid')}
  cCap.textContent=f.cap||f.name;
  const swap=()=>{cName.innerHTML=nameHTML(f.name);cName.classList.remove('out');cName.classList.add('pre');
    cDesc.innerHTML=f.desc+(f.notes?`<em>${f.notes}</em>`:'');cDesc.style.opacity=1;
    cPrice.textContent=inr(f.price);cMrp.textContent=inr(f.mrp);cOff.textContent=off(f)+'% OFF';
    cKick.textContent=[f.conc,f.who].filter(Boolean).join(' · ');
    requestAnimationFrame(()=>requestAnimationFrame(()=>cName.classList.remove('pre')))};
  if(first||reduce)swap();else{cName.classList.add('out');cDesc.style.opacity=0;clearTimeout(showFrag.t);showFrag.t=setTimeout(swap,300)}
}
showFrag(0);
const collSec=$('#collection');collSec.style.height=(FRAGS.length*70+100)+'vh';
function collStep(d){collScrollTo(clamp(collIdx+d,0,N-1))}
$('#cPrev').addEventListener('click',()=>collStep(-1));$('#cNext').addEventListener('click',()=>collStep(1));
addEventListener('keydown',e=>{const r=collSec.getBoundingClientRect();if(r.top>innerHeight*.3||r.bottom<innerHeight*.7)return;if(e.key==='ArrowRight'){e.preventDefault();collStep(1)}else if(e.key==='ArrowLeft'){e.preventDefault();collStep(-1)}});
function collScrollTo(i){const top=collSec.getBoundingClientRect().top+scrollY,span=collSec.offsetHeight-innerHeight;goTo(top+span*((i+.5)/FRAGS.length))}
$('#swatches').addEventListener('click',e=>{const b=e.target.closest('.sw');if(b)collScrollTo(+b.dataset.i)});
$('#cAdd').addEventListener('click',()=>bump(1));
$('#cBox').addEventListener('click',()=>{addToBox(Math.max(0,collIdx));goTo('#box')});

/* parallax for the gallery columns and quote image (transform only) */
const gcols=$$('.gcol'),quoteImg=$('#quoteImg');
function parallax(){
  const H=innerHeight;
  gcols.forEach(c=>{const r=c.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>H)return;c.style.transform=`translate3d(0,${(r.top+r.height/2-H/2)*+c.dataset.speed}px,0)`});
  const q=quoteImg.parentElement.getBoundingClientRect();if(q.bottom>0&&q.top<H)quoteImg.style.transform=`translate3d(0,${(q.top+q.height/2-H/2)*-.08}px,0)`;
}

/* intro */
const introBar=$('#introBar');let introDone=false,introT=-1;
function finishIntro(){
  if(introDone)return;introDone=true;introBar.style.transform='scaleX(1)';
  setTimeout(()=>{$('#intro').classList.add('open');document.body.classList.remove('locked');lenis&&lenis.start();introT=performance.now();armReveals();setTimeout(()=>$('#intro').remove(),1500)},reduce?0:420);
}
/* the bottle labels use fonts the page itself never renders, so load them explicitly */
const labelFonts=Promise.all(['700 100px "Libre Caslon Text"','600 40px Poppins','700 100px Outfit'].map(f=>document.fonts.load(f).catch(()=>{}))).then(()=>document.fonts.ready);

/* ============================================================
   THREE
   ============================================================ */
let THREE,RoundedBoxGeometry,renderer=null;
try{
  THREE=THREE_NS;RoundedBoxGeometry=RBG;
  renderer=new THREE.WebGLRenderer({canvas:$('#stage'),antialias:true,powerPreference:'high-performance'});
}catch(err){console.warn('3D unavailable',err);renderer=null}

if(!renderer){
  document.documentElement.classList.add('no-webgl');
  const tick=now=>{if(lenis)lenis.raf(now);const nr=$('#notes').getBoundingClientRect();navTick(scrollY,nr.top<=40&&nr.bottom>40);parallax();
    const cr=collSec.getBoundingClientRect();const e=clamp(-cr.top/(cr.height-innerHeight));showFrag(Math.min(N-1,Math.floor(e*N)));$('#cProg').style.transform=`scaleX(${e})`;
    const ne=clamp(-nr.top/(nr.height-innerHeight));tierEls.forEach((t,k)=>t.classList.toggle('on',ne>.15+k*.22));requestAnimationFrame(tick)};
  introBar.style.transform='scaleX(.6)';labelFonts.then(finishIntro);requestAnimationFrame(tick);
}else{
const canvas=renderer.domElement;
let DPR=Math.min(devicePixelRatio||1,innerWidth<900?1.75:2);let perfN=0,perfT=0;
renderer.setPixelRatio(DPR);
renderer.toneMapping=THREE.NoToneMapping; // keeps the paper backdrop exactly #FAF7F2 inside and outside the glass
renderer.outputColorSpace=THREE.SRGBColorSpace;

const scene=new THREE.Scene();scene.fog=new THREE.Fog('#FAF7F2',1000,1001);
const camera=new THREE.PerspectiveCamera(28,innerWidth/innerHeight,.1,100);
camera.position.set(0,1,11);scene.add(camera);

/* studio environment: warm paper room, white softboxes and black flags so glass edges read on a light set */
(()=>{
  const env=new THREE.Scene();env.background=new THREE.Color('#d9d3c8');
  const card=(w,h,x,y,z,col,k)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(k),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);env.add(m)};
  card(2.2,9,6,1,3,'#ffffff',3.2);
  card(1.2,9,-5.5,1,3.5,'#ffffff',2.2);
  card(9,1.6,0,7,0,'#ffffff',2.2);
  card(1.6,9,-6,.5,-1,'#000000',1);
  card(1.4,9,4.5,0,-6,'#000000',1);
  card(1.2,9,-3,0,-7,'#fff4e2',2);
  card(10,1,0,-3.6,5,'#f2e6d0',1.2);
  const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(env,.02).texture;pm.dispose();
})();
const key=new THREE.DirectionalLight('#fff6ea',1.5);key.position.set(4,6,5);scene.add(key);
const rim=new THREE.DirectionalLight('#ffffff',1.2);rim.position.set(-5,3,-4);scene.add(rim);
scene.add(new THREE.AmbientLight('#ffffff',.5));

/* ---------- backdrop: drawn into the scene so the glass and liquid refract it ---------- */
const BD={w:2048,h:1024,key:'light|LUSSO',target:'light|LUSSO',next:null,mix:0};
const bdA=document.createElement('canvas'),bdB=document.createElement('canvas');
const texA=new THREE.CanvasTexture(bdA),texB=new THREE.CanvasTexture(bdB);
[texA,texB].forEach(t=>{t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false});
function drawBackdrop(c,key,tex){
  const [theme,word]=key.split('|'),W=BD.w,H=BD.h;
  if(c.width!==W||c.height!==H){c.width=W;c.height=H;tex&&tex.dispose()}
  const g=c.getContext('2d'),dark=theme==='dark';
  g.fillStyle=dark?'#000000':'#FAF7F2';g.fillRect(0,0,W,H);
  if(!dark){
    // window light through leaves, as in the brand's packaging photography
    g.save();g.filter='blur(26px)';g.fillStyle='rgba(120,96,60,.07)';
    let s=5;const R=()=>(s=(s*16807)%2147483647)/2147483647;
    for(let i=0;i<22;i++){g.save();g.translate(W*(.72+R()*.32),H*(-.05+R()*.6));g.rotate(-.9+R()*1.1);g.beginPath();g.ellipse(0,0,W*.06+R()*W*.05,H*.018+R()*H*.02,0,0,Math.PI*2);g.fill();g.restore()}
    g.restore();
  }
  g.textAlign='center';g.textBaseline='middle';
  let fs=H*.5;g.font=`700 ${fs}px Lufga, Outfit, sans-serif`;
  const m=g.measureText(word).width;fs=Math.min(fs,fs*(W*.94)/m);g.font=`700 ${fs}px Lufga, Outfit, sans-serif`;
  g.fillStyle=dark?'rgba(255,255,255,.045)':'#EFEBE4';g.fillText(word,W*.5,H*.56);
}
const BD_OVER=1.04;
const BD_GLSL=`
uniform sampler2D tA,tB;uniform float uMix,uAsp,uArch,uDark,uArchW;uniform vec2 uOff,uGP;
vec3 backdrop(vec2 pv){
  vec2 uv=(pv-.5)*.96+.5+uOff;
  vec3 c=mix(texture2D(tA,uv).rgb,texture2D(tB,uv).rgb,smoothstep(0.,1.,uMix));
  vec2 p=(pv-uGP)*vec2(uAsp,1.);
  float w=uArchW,top=uArchW*.55,d;
  if(p.y>top)d=length(vec2(p.x,p.y-top))-w;else d=abs(p.x)-w;
  c=mix(c,c*vec3(.94,.925,.9),(1.-smoothstep(0.,.003,d))*uArch);
  float r=dot(p,p);c+=vec3(1.,.93,.86)*uDark*(exp(-r*6.)*.16+exp(-r*30.)*.22);
  return c;}`;
const BDU={tA:{value:texA},tB:{value:texB},uMix:{value:0},uAsp:{value:1},uArch:{value:1},uDark:{value:0},uArchW:{value:.2},uOff:{value:new THREE.Vector2()},uGP:{value:new THREE.Vector2(.7,.45)}};
const bdMat=new THREE.ShaderMaterial({uniforms:BDU,depthWrite:false,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`${BD_GLSL}
varying vec2 vUv;
void main(){
  gl_FragColor=vec4(backdrop(vUv),1.);
  #include <colorspace_fragment>
}`});
const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(1,1),bdMat);backdrop.position.z=-14;backdrop.renderOrder=-1;camera.add(backdrop);
function layoutBackdrop(){
  const a=innerWidth/innerHeight,h=2*14*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*BD_OVER;
  backdrop.scale.set(h*a,h,1);
  BD.w=2048;BD.h=Math.round(2048/a);if(BD.h>2048){BD.h=2048;BD.w=Math.round(2048*a)}
  drawBackdrop(bdA,BD.key,texA);texA.needsUpdate=true;
}
function tickBackdrop(dt){
  if(BD.mix===0&&BD.target!==BD.key){BD.next=BD.target;drawBackdrop(bdB,BD.next,texB);texB.needsUpdate=true;BD.mix=.0001}
  if(BD.mix>0){BD.mix=Math.min(1,BD.mix+dt*1.5);BDU.uMix.value=BD.mix;
    if(BD.mix>=1){drawBackdrop(bdA,BD.next,texA);texA.needsUpdate=true;BD.key=BD.next;BD.mix=0;BDU.uMix.value=0}}
}

/* ---------- materials ---------- */
/* The juice is opaque to three.js but fakes transmission: it samples the same backdrop at a refracted screen
   position with a Beer-Lambert tint, so the glass around it can still use real transmission. It also draws
   the dip tube, which in the real bottles is visible running down the middle of the liquid. */
const drawSize=new THREE.Vector2();
const FOGU={uFogN:{value:1000},uFogF:{value:1001},uFogC:{value:new THREE.Color('#FAF7F2').convertSRGBToLinear()}};
const liquidMat=()=>new THREE.ShaderMaterial({uniforms:{...BDU,...FOGU,uRes:{value:drawSize},uTint:{value:new THREE.Color()},uDensity:{value:.55},uGlow:{value:.05},uTube:{value:0}},
  vertexShader:`varying vec3 vN,vP,vAx,vON;
void main(){vON=normal;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vP=mv.xyz;vAx=(modelViewMatrix*vec4(0.,position.y,0.,1.)).xyz;gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`${BD_GLSL}
uniform vec2 uRes;uniform vec3 uTint,uFogC;uniform float uDensity,uGlow,uTube,uFogN,uFogF;varying vec3 vN,vP,vAx,vON;
void main(){
  vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 V=normalize(-vP);
  float nv=clamp(dot(N,V),0.,1.);
  vec2 s=gl_FragCoord.xy/uRes;
  vec2 rs=s-N.xy*(.03+.06*(1.-nv));
  vec3 bg=backdrop((rs-.5)/${BD_OVER.toFixed(2)}+.5);
  float th=1.45-.85*pow(nv,.6);   // light focuses through the middle, edges read deeper, as in the product shots
  vec3 col=bg*pow(max(uTint,vec3(.002)),vec3(uDensity*th));
  col+=uTint*uGlow*(.4+nv);
  if(uTube>0.&&N.z>.2){
    float d=abs(vP.x/-vP.z-vAx.x/-vAx.z)/(.0019*uTube);
    float tube=1.-smoothstep(.55,1.,d),edge=smoothstep(.35,.75,d)*tube;
    col=mix(col,col*.78+vec3(.12),tube*.5);col*=1.-edge*.25;
  }
  vec3 L=normalize(vec3(.45,.7,.6));col+=pow(max(dot(N,normalize(L+V)),0.),90.)*.35;
  col=mix(col,col*.72,pow(1.-nv,3.)*.5);
  col+=uTint*smoothstep(.2,.04,nv)*.3;                       // light caught just inside the glass wall
  if(vON.y>.6){col=mix(col,bg*1.02+uTint*.1,.55);col+=.06;}  // the liquid's surface line under the shoulder
  if(vON.y<-.6)col*=.82;
  col=mix(col,uFogC,smoothstep(uFogN,uFogF,-vP.z));
  gl_FragColor=vec4(col,1.);
  #include <colorspace_fragment>
}`});
const glassMat=(o={})=>new THREE.MeshPhysicalMaterial({color:'#ffffff',metalness:0,roughness:.01,transmission:1,thickness:o.thickness??.9,ior:o.ior??1.5,
  attenuationColor:new THREE.Color('#fbf6ec'),attenuationDistance:4,specularIntensity:1,envMapIntensity:1.2,flatShading:!!o.flat});
const M={
  black:new THREE.MeshPhysicalMaterial({color:'#050505',metalness:0,roughness:.12,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:.45}),
  gold:new THREE.MeshPhysicalMaterial({color:'#D4AE62',metalness:1,roughness:.2,envMapIntensity:1.3}),
};

/* travertine, echoing the stone in the brand photography: bedded noise, elongated pores, a bump map from the same pass */
function travertine(){
  const W=1024,H=512,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  let sd=11;const R=()=>(sd=(sd*16807)%2147483647)/2147483647;
  const G=97,grid=Array.from({length:G*G},R);
  const vn=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
    const at=(a,b)=>grid[((b%G+G)%G)*G+((a%G+G)%G)];const a=at(xi,yi),b=at(xi+1,yi),c2=at(xi,yi+1),d=at(xi+1,yi+1);return a+(b-a)*u+(c2-a)*v+(a-b-c2+d)*u*v};
  const img=g.createImageData(W,H),D=img.data;
  for(let y=0;y<H;y++){const band=vn(3.3,y/H*11);for(let x=0;x<W;x++){
    const n=vn(x/W*5,y/H*18)*.5+vn(x/W*18,y/H*55)*.3+vn(x/W*70,y/H*170)*.2;
    const k=.84+.17*n-.06*band,i=(y*W+x)*4;D[i]=228*k;D[i+1]=213*k;D[i+2]=188*k;D[i+3]=255}}
  g.putImageData(img,0,0);
  for(let i=0;i<900;i++){const x=R()*W,y=R()*H,rx=1.5+Math.pow(R(),2)*16,ry=.5+R()*2;
    g.fillStyle=`rgba(118,92,62,${.18+R()*.32})`;g.beginPath();g.ellipse(x,y,rx,ry,(R()-.5)*.08,0,Math.PI*2);g.fill();
    g.fillStyle='rgba(255,248,235,.22)';g.beginPath();g.ellipse(x,y-ry*.9,rx*.9,.6,0,0,Math.PI*2);g.fill()}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=8;return t}
const stoneTex=travertine();
M.stone=new THREE.MeshStandardMaterial({map:stoneTex,bumpMap:stoneTex,bumpScale:1.4,roughness:.84,metalness:0,envMapIntensity:.55});

/* ---------- printed labels ---------- */
const loadImg=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src});
const [IMG_MARK,IMG_WORD]=await Promise.all([loadImg(LOGO_MARK),loadImg(LOGO_WORD)]);
const INK='#141210',GOLD='#D2AE63';
function tintImg(img,col){if(!img)return null;const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);return c}
const MARK=tintImg(IMG_MARK,INK),WORD=tintImg(IMG_WORD,INK),MARK_G=tintImg(IMG_MARK,GOLD),WORD_G=tintImg(IMG_WORD,GOLD);

/* black ink straight on the glass, laid out like the real round, gem and square bottles */
function drawLabel(c,f,aspect){
  const W=1024,H=Math.round(W/aspect);c.width=W;c.height=H;const g=c.getContext('2d');g.clearRect(0,0,W,H);
  const words=f.name.toUpperCase().split(' ');
  const k=Math.min(W*.96/1000,H*.96/1080);g.save();g.translate(W/2,H/2-1080*k/2);g.scale(k,k);
  g.fillStyle=INK;g.textAlign='center';g.textBaseline='alphabetic';
  if(MARK)g.drawImage(MARK,-62,0,124,170);
  if(WORD)g.drawImage(WORD,-265,186,530,185);
  g.font='600 36px Poppins, sans-serif';g.fillText('THE LUXURY OF FLORENCE',0,410);
  let y=560;
  words.forEach((w,i)=>{let fs=i===0?172:124;g.font=`700 ${fs}px "Libre Caslon Text", Georgia, serif`;const mw=g.measureText(w).width;if(mw>960){fs*=960/mw;g.font=`700 ${fs}px "Libre Caslon Text", Georgia, serif`}
    g.fillText(w,0,y);y+=fs*.9});
  g.font='600 52px Poppins, sans-serif';g.fillText(f.conc.toUpperCase(),0,y+18);
  if(f.who){g.font='600 42px Poppins, sans-serif';g.fillText(f.who.toUpperCase(),0,y+112)}
  g.font='600 40px Poppins, sans-serif';g.fillText('100ML | 3.4 fl oz',0,y+(f.who?168:112));
  g.restore();
}
/* Golden Temptation: black diamond with a gold rule and gold type */
function drawDiamond(c,f,aspect){
  const W=1024,H=Math.round(W/aspect);c.width=W;c.height=H;const g=c.getContext('2d');g.clearRect(0,0,W,H);
  const s=Math.min(W,H)*.47,cx=W/2,cy=H/2;
  const dia=k=>{g.beginPath();g.moveTo(cx,cy-s*k);g.lineTo(cx+s*k,cy);g.lineTo(cx,cy+s*k);g.lineTo(cx-s*k,cy);g.closePath()};
  dia(1);g.fillStyle='#0b0a09';g.fill();g.lineWidth=s*.022;g.strokeStyle=GOLD;dia(.95);g.stroke();
  g.save();g.translate(cx,cy);const k=s/470;g.scale(k,k);g.fillStyle=GOLD;g.textAlign='center';
  if(MARK_G)g.drawImage(MARK_G,-26,-290,52,72);
  if(WORD_G)g.drawImage(WORD_G,-110,-210,220,77);
  g.font='600 15px Poppins, sans-serif';g.fillText('THE POINT OF OBSESSION',0,-112);
  const words=f.name.toUpperCase().split(' ');
  g.font='400 96px "Libre Caslon Text", Georgia, serif';g.fillText(words[0],0,-6);
  g.font='400 62px "Libre Caslon Text", Georgia, serif';g.fillText(words.slice(1).join(' '),0,66);
  g.font='500 30px Poppins, sans-serif';g.fillText(f.conc.toUpperCase(),0,128);
  g.font='500 28px Poppins, sans-serif';g.fillText((f.who||'').toUpperCase(),0,170);
  g.restore();
}

/* ---------- the four real bottle shapes, measured from the product photography ---------- */
const V2=(r,y)=>new THREE.Vector2(r,y);
const PX=1/150; // photo pixels -> scene units (Amber Nomad body = 189px wide)
function arc(out,cx,cy,rx,ry,a0,a1,n,stopY){for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry;if(stopY!==undefined&&y>stopY)break;out.push(V2(x,y))}}
const px=pts=>pts.map(v=>v.multiplyScalar(PX));
/* loft a plan polygon through (scale,y) sections: faceted glass with crisp chamfers */
function loft(plan,prof){
  const pos=[],n=plan.length,rings=prof.map(([k,y])=>plan.map(([x,z])=>[x*k*PX,y*PX,z*k*PX]));
  const tri=(a,b,c)=>pos.push(...a,...b,...c);
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<n;j++){const a=rings[i][j],b=rings[i][(j+1)%n],c=rings[i+1][(j+1)%n],d=rings[i+1][j];tri(a,b,c);tri(a,c,d)}
  const r0=rings[0],y0=r0[0][1],r1=rings[rings.length-1],y1=r1[0][1];
  for(let j=0;j<n;j++){tri([0,y0,0],r0[(j+1)%n],r0[j]);tri([0,y1,0],r1[j],r1[(j+1)%n])}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g;
}
const gemPlan=(fw,X,Z)=>{const c=X-fw;return[[fw,Z],[X,Z-c],[X,-(Z-c)],[fw,-Z],[-fw,-Z],[-X,-(Z-c)],[-X,Z-c],[-fw,Z]]};

const BUILD={
  round(){ // Amber Nomad, Aura Elegance, Miss Desire, Silver Elite: tall flask, thick base, clear collar, black cap
    const p=[V2(0,0),V2(84,0)];arc(p,84,10,10.5,10,-Math.PI/2,0,6);p.push(V2(94.5,293));arc(p,24,293,70.5,52,0,Math.PI/2,18);p.push(V2(24,352));
    const l=[V2(0,62),V2(80,62)];arc(l,80,70,8,8,-Math.PI/2,0,5);l.push(V2(88,293));arc(l,22,293,66,46,0,Math.PI/2,18,334);l.push(V2(0,334));
    const cap=new THREE.Group();
    const collar=new THREE.Mesh(new THREE.CylinderGeometry(52*PX,52*PX,122*PX,72),glassMat({thickness:.25,ior:1.25}));collar.position.y=61*PX;cap.add(collar);
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(23*PX,23*PX,118*PX,40),M.black);stem.position.y=60*PX;cap.add(stem);
    const top=new THREE.Mesh(new THREE.LatheGeometry(px([V2(0,0),V2(64,0),V2(69,5),V2(69,33),V2(64,38),V2(0,38)]),72),M.black);top.position.y=122*PX;cap.add(top);
    return{glass:new THREE.LatheGeometry(px(p),110),liquid:new THREE.LatheGeometry(px(l),110),cap,capY:352*PX,height:513*PX,tube:1,
      decal:new THREE.CylinderGeometry(95.3*PX,95.3*PX,215*PX,64,1,true,-.7,1.4),decalY:178*PX,decalZ:0,decalAspect:(1.4*95.3)/215,nozzleY:360*PX};
  },
  gem(){ // Flora Bella, Vaan Noir: faceted gem with chamfered shoulders, gold collar, clear faceted cap
    const glass=loft(gemPlan(100,148,80),[[.68,0],[1,44],[1,296],[.54,368]]);
    const liquid=loft(gemPlan(90,134,68),[[.66,30],[1,62],[1,290],[.62,350]]);
    const cap=new THREE.Group();
    const collar=new THREE.Mesh(new THREE.CylinderGeometry(44*PX,46*PX,48*PX,64),M.gold);collar.position.y=24*PX;cap.add(collar);
    for(const yy of [10,38]){const r=new THREE.Mesh(new THREE.TorusGeometry(46*PX,2*PX,8,64),M.gold);r.rotation.x=Math.PI/2;r.position.y=yy*PX;cap.add(r)}
    const noz=new THREE.Mesh(new THREE.CylinderGeometry(13*PX,13*PX,60*PX,24),M.gold);noz.position.y=70*PX;cap.add(noz);
    const cg=new THREE.Mesh(loft(gemPlan(56,84,52),[[.82,0],[1,14],[1,72],[.8,86]]),glassMat({flat:true,thickness:.5}));cg.position.y=46*PX;cap.add(cg);
    return{glass,liquid,cap,capY:368*PX,height:500*PX,tube:1,flat:true,
      decal:new THREE.PlaneGeometry(190*PX,250*PX),decalY:172*PX,decalZ:80*PX+.004,decalAspect:190/250,nozzleY:400*PX};
  },
  square(){ // Majesty Noir, Rouge Signature: rectangular block, black neck and black cap
    const glass=new RoundedBoxGeometry(1.75,2.73,1.1,5,.1);glass.translate(0,1.365,0);
    const liquid=new RoundedBoxGeometry(1.55,2.18,.9,4,.06);liquid.translate(0,.26+1.09,0);
    const cap=new THREE.Group();
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.5,48),M.black);neck.position.y=.25;cap.add(neck);
    const top=new THREE.Mesh(new RoundedBoxGeometry(.96,.56,.96,4,.05),M.black);top.position.y=.5+.28;cap.add(top);
    return{glass,liquid,cap,capY:2.73,height:3.79,tube:1,
      decal:new THREE.PlaneGeometry(1.45,1.7),decalY:1.25,decalZ:.554,decalAspect:1.45/1.7,nozzleY:2.8};
  },
  tumbler(){ // Golden Temptation: carved crystal tumbler, liquid sits in the lower half
    const R=1.05,H=3,SEG=360,RINGS=150,pos=[],idx=[];
    const fr=x=>x-Math.floor(x);
    // hand-cut crystal: fine diagonal flutes whose direction flips band to band, like the real bottle
    const rad=(th,y)=>{const u=th/(Math.PI*2)*18,band=Math.floor(y/.62),dir=band%2?1:-1;
      const t=Math.abs(2*fr(u+dir*y*1.6+band*.5)-1);const m=smooth(.14,.3,y)*(1-smooth(2.74,2.86,y));return R*(1-.028*(1-t*t)*m)};
    for(let j=0;j<=RINGS;j++){const y=j/RINGS*H;for(let i=0;i<=SEG;i++){const th=i/SEG*Math.PI*2,r=rad(th,y);pos.push(Math.sin(th)*r,y,Math.cos(th)*r)}}
    for(let j=0;j<RINGS;j++)for(let i=0;i<SEG;i++){const a=j*(SEG+1)+i,b=a+1,c=a+SEG+2,d=a+SEG+1;idx.push(a,b,c,a,c,d)}
    const cb=pos.length/3;pos.push(0,0,0);for(let i=0;i<SEG;i++)idx.push(cb,i+1,i);
    const ct=pos.length/3;pos.push(0,H,0);const top0=RINGS*(SEG+1);for(let i=0;i<SEG;i++)idx.push(ct,top0+i,top0+i+1);
    const glass=new THREE.BufferGeometry();glass.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));glass.setIndex(idx);glass.computeVertexNormals();
    const liquid=new THREE.CylinderGeometry(.86,.86,1.32,96);liquid.translate(0,.34+.66,0);
    return{glass,liquid,cap:new THREE.Group(),capY:H,height:H,tube:0,glassOpts:{thickness:1.6,ior:1.55},label:'diamond',
      decal:new THREE.CylinderGeometry(R+.012,R+.012,1.55,64,1,true,-.74,1.48),decalY:1.05,decalZ:0,decalAspect:(1.48*(R+.012))/1.55,nozzleY:H};
  }
};

function makeBottle(f){
  const def=BUILD[f.shape]();
  const root=new THREE.Group(),grp=new THREE.Group();root.add(grp);
  const lm=liquidMat();lm.uniforms.uTube.value=def.tube;
  const liq=new THREE.Mesh(def.liquid,lm);grp.add(liq);
  const gl=new THREE.Mesh(def.glass,glassMat({flat:def.flat,...def.glassOpts}));grp.add(gl);
  const lc=document.createElement('canvas'),lt=new THREE.CanvasTexture(lc);lt.colorSpace=THREE.SRGBColorSpace;lt.anisotropy=8;
  const decal=new THREE.Mesh(def.decal,new THREE.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
  decal.position.set(0,def.decalY,def.decalZ);decal.renderOrder=3;grp.add(decal);
  def.cap.position.y=def.capY;grp.add(def.cap);
  const b={f,root,grp,liq,lm,gl,lc,lt,cap:def.cap,capY:def.capY,nozzleY:def.nozzleY,height:def.height,aspect:def.decalAspect,label:def.label,
    tint:new THREE.Color(f.liquid).convertSRGBToLinear(),pick:[gl,liq,def.cap]};
  lm.uniforms.uTint.value.copy(b.tint);lm.uniforms.uDensity.value=f.dens??.55;drawB(b);return b;
}
function drawB(b){(b.label==='diamond'?drawDiamond:drawLabel)(b.lc,b.f,b.aspect);b.lt.needsUpdate=true}
const shTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const r=g.createRadialGradient(128,128,0,128,128,128);r.addColorStop(0,'rgba(40,25,10,.55)');r.addColorStop(.45,'rgba(40,25,10,.22)');r.addColorStop(1,'rgba(40,25,10,0)');g.fillStyle=r;g.fillRect(0,0,256,256);return new THREE.CanvasTexture(c)})();
const shadowMesh=(w,d)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:shTex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.004;return m};
const castTex=(()=>{const c=document.createElement('canvas');c.width=256;c.height=512;const g=c.getContext('2d');g.filter='blur(16px)';
  const gr=g.createLinearGradient(0,500,0,30);gr.addColorStop(0,'rgba(48,32,16,.5)');gr.addColorStop(.55,'rgba(48,32,16,.2)');gr.addColorStop(1,'rgba(48,32,16,0)');
  g.fillStyle=gr;g.beginPath();g.ellipse(128,300,74,220,0,0,Math.PI*2);g.fill();return new THREE.CanvasTexture(c)})();
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');const r=g.createRadialGradient(128,128,0,128,128,128);
  r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,256,256);return new THREE.CanvasTexture(c)})();
const LIGHT_YAW=Math.asin(.62); // key light sits front-right, so shadows fall back-left
function makeGround(b){
  const grp=new THREE.Group(),w=b.height*.5;
  const ao=shadowMesh(w*1.25,w*.95);ao.material.opacity=.9;grp.add(ao);
  const arm=new THREE.Group();arm.rotation.y=LIGHT_YAW;grp.add(arm);
  const cg=new THREE.PlaneGeometry(1,1);cg.translate(0,.5,0);
  const cast=new THREE.Mesh(cg,new THREE.MeshBasicMaterial({map:castTex,transparent:true,depthWrite:false,opacity:.85}));
  cast.rotation.x=-Math.PI/2;cast.position.y=.003;cast.scale.set(w*1.05,b.height*.95,1);arm.add(cast);
  const caustic=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:glowTex,color:new THREE.Color(b.f.liquid),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.32}));
  caustic.rotation.x=-Math.PI/2;caustic.position.set(0,.006,-w*.95);caustic.scale.set(w*.75,w*1.25,1);arm.add(caustic);
  grp.userData={ao,cast,caustic};return grp;
}

/* ---------- hero / notes stage: one bottle on a plinth ---------- */
const stage=new THREE.Group();scene.add(stage);
const spin=new THREE.Group();stage.add(spin);
const heroB=makeBottle(FRAGS[HERO_I]),notesB=makeBottle(FRAGS[NOTES_I]);
spin.add(heroB.root,notesB.root);notesB.root.visible=false;
let shown=heroB,target=heroB,morph=0;
const PR=1.85,PH=.5;
const plinth=new THREE.Mesh(new THREE.CylinderGeometry(PR,PR*1.01,PH,128,1),M.stone);plinth.position.y=-PH/2;stage.add(plinth);
const groundH=makeGround(heroB),groundN=makeGround(notesB);stage.add(groundH,groundN);groundN.visible=false;
const ring=new THREE.Mesh(new THREE.RingGeometry(.985,1,128),new THREE.MeshBasicMaterial({color:'#BD0000',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.008;stage.add(ring);

/* note orbs and red orbit rings for the dark set */
const orbGeo=new THREE.SphereGeometry(1,40,24),TY=[3.55,2,.6],TR=[1.95,2.15,2.35];
const orbs=NOTES.map((n,i)=>{
  const m=new THREE.Mesh(orbGeo,new THREE.MeshPhysicalMaterial({color:n.c,roughness:.18,clearcoat:1,clearcoatRoughness:.05,emissive:new THREE.Color(n.c),emissiveIntensity:.15}));
  m.scale.setScalar(0);stage.add(m);const same=NOTES.filter(x=>x.tier===n.tier);
  return{m,tier:n.tier,phase:same.indexOf(n)/same.length*Math.PI*2+n.tier*.7,size:.085+((i*37)%5)*.012};
});
const orbitRings=TY.map((y,i)=>{const r=new THREE.Mesh(new THREE.TorusGeometry(TR[i],.006,6,200),new THREE.MeshBasicMaterial({color:'#e01010',transparent:true,opacity:0,depthWrite:false}));r.rotation.x=Math.PI/2;r.position.y=y;stage.add(r);return r});

/* ---------- collection: every product on one travertine turntable ---------- */
const carousel=new THREE.Group();scene.add(carousel);carousel.visible=false;
const CR=2.8,STEP=Math.PI*2/N;
const disk=new THREE.Mesh(new THREE.CylinderGeometry(CR+1.05,CR+1.1,.42,180,1),M.stone);disk.position.y=-.21;carousel.add(disk);
const turn=new THREE.Group();carousel.add(turn);
const CB=FRAGS.map((f,i)=>{const b=makeBottle(f),a=i*STEP;b.root.position.set(Math.sin(a)*CR,0,Math.cos(a)*CR);b.root.rotation.y=a;
  b.ground=makeGround(b);carousel.add(b.ground);turn.add(b.root);b.i=i;return b});

/* ---------- gift box: the brand's terracotta coffret; the lid opens on scroll and the chosen bottles drop in ---------- */
function leatherTex(){
  const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
  g.fillStyle='#7A3220';g.fillRect(0,0,512,512);
  let sd=21;const R=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<9000;i++){const v=R();g.fillStyle=v>.5?`rgba(255,190,150,${.03+R()*.05})`:`rgba(40,10,0,${.04+R()*.07})`;g.fillRect(R()*512,R()*512,1+R()*2,1+R()*2)}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);return t}
const lthr=leatherTex();
const LEATHER=new THREE.MeshPhysicalMaterial({map:lthr,bumpMap:lthr,bumpScale:.5,roughness:.55,sheen:.8,sheenRoughness:.4,sheenColor:new THREE.Color('#e59a7a'),clearcoat:.3,clearcoatRoughness:.5,envMapIntensity:.8});
const SUEDE=new THREE.MeshStandardMaterial({color:'#EFE5D2',roughness:.96,envMapIntensity:.45});
const FOIL=(()=>{const IMG=tintImg(IMG_WORD,'#ffffff');const t=new THREE.CanvasTexture(IMG);
  return new THREE.MeshPhysicalMaterial({color:'#D9B56A',metalness:1,roughness:.24,alphaMap:t,transparent:true,depthWrite:false,envMapIntensity:1.5,polygonOffset:true,polygonOffsetFactor:-3})})();
const gift=new THREE.Group();gift.visible=false;scene.add(gift);
const GW=4.5,GD=2.55,GH=.95,GT=.09;
const slab=(w,h,d,mat,x,y,z,par=gift)=>{const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,.03),mat);m.position.set(x,y,z);par.add(m);return m};
slab(GW,GT,GD,LEATHER,0,GT/2,0);
slab(GW,GH,GT,LEATHER,0,GH/2,GD/2-GT/2);slab(GW,GH,GT,LEATHER,0,GH/2,-GD/2+GT/2);
slab(GT,GH,GD,LEATHER,GW/2-GT/2,GH/2,0);slab(GT,GH,GD,LEATHER,-GW/2+GT/2,GH/2,0);
const INS=.5;slab(GW-GT*2,INS,GD-GT*2,SUEDE,0,GT+INS/2,0);
for(const x of [-.75,.75])slab(.07,.3,GD-GT*2,SUEDE,x,GT+INS+.15,0);
const lid=new THREE.Group();lid.position.set(0,GH,-GD/2);gift.add(lid);
slab(GW+.1,.11,GD+.1,LEATHER,0,.055,GD/2,lid);
const lidIn=new THREE.Mesh(new THREE.PlaneGeometry(GW-.25,GD-.25),SUEDE);lidIn.rotation.x=Math.PI/2;lidIn.position.set(0,-.002,GD/2);lid.add(lidIn);
const foil=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.7*613/1755),FOIL);foil.rotation.x=Math.PI/2;foil.position.set(0,-.006,GD/2);lid.add(foil);
const foilTop=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.9*613/1755),FOIL);foilTop.rotation.x=-Math.PI/2;foilTop.position.set(0,.112,GD/2);lid.add(foilTop);
const giftShadow=shadowMesh(7.5,4.6);giftShadow.position.y=-.01;giftShadow.material.opacity=.75;gift.add(giftShadow);
const SLOT_X=[-1.5,0,1.5],FLOOR=GT+INS;
for(const x of SLOT_X){const w=shadowMesh(1.1,.8);w.position.set(x,FLOOR+.003,.05);gift.add(w)}
const slots=[null,null,null];let giftYaw=0;
onBoxChange=sel=>{for(let i=0;i<3;i++){const f=sel[i],sl=slots[i];
  if(sl&&sl.b.f===f)continue;
  if(sl){gift.remove(sl.b.root);slots[i]=null}
  if(f){const b=makeBottle(f);b.root.scale.setScalar(.44);b.root.position.set(SLOT_X[i],FLOOR,.05);gift.add(b.root);slots[i]={b,t0:performance.now()}}}};
onBoxChange(boxSel);
const pack3d=$('#pack3d'),boxSec=$('#box');
document.documentElement.classList.add('has3d');

/* ---------- mist ---------- */
const MN=700,mPos=new Float32Array(MN*3),mVel=new Float32Array(MN*3),mLife=new Float32Array(MN).fill(-1),mAlpha=new Float32Array(MN),mSize=new Float32Array(MN);
const mGeo=new THREE.BufferGeometry();mGeo.setAttribute('position',new THREE.BufferAttribute(mPos,3));mGeo.setAttribute('alpha',new THREE.BufferAttribute(mAlpha,1));mGeo.setAttribute('size',new THREE.BufferAttribute(mSize,1));
const mMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uPx:{value:innerHeight*DPR},uC:{value:new THREE.Color('#ffffff')},uDark:{value:0}},
  vertexShader:`attribute float alpha,size;uniform float uPx;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=size*uPx*.1/(-mv.z);vA=alpha;}`,
  fragmentShader:`uniform vec3 uC;uniform float uDark;varying float vA;
void main(){
  float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;
  vec3 c=mix(uC*.82,vec3(1.),uDark*.6);gl_FragColor=vec4(c,pow(1.-r,2.)*vA*mix(.22,.4,uDark));
  #include <colorspace_fragment>
}`});
const mist=new THREE.Points(mGeo,mMat);mist.frustumCulled=false;scene.add(mist);
let mHead=0;const _v=new THREE.Vector3(),_q=new THREE.Quaternion(),fwdL=new THREE.Vector3(.55,.35,1).normalize(),fwd=new THREE.Vector3();
function spritz(b,n=360){
  _v.set(0,b.nozzleY,0);b.grp.localToWorld(_v);b.grp.getWorldQuaternion(_q);fwd.copy(fwdL).applyQuaternion(_q);
  mMat.uniforms.uC.value.set(b.f.liquid);
  for(let i=0;i<n;i++){const k=mHead;mHead=(mHead+1)%MN;
    mPos[k*3]=_v.x;mPos[k*3+1]=_v.y;mPos[k*3+2]=_v.z;
    const sp=2.2+Math.random()*3.2;mVel[k*3]=(fwd.x+(Math.random()-.5)*.6)*sp;mVel[k*3+1]=(fwd.y+(Math.random()-.5)*.45)*sp;mVel[k*3+2]=(fwd.z+(Math.random()-.5)*.3)*sp;
    mLife[k]=0;mSize[k]=.5+Math.random()*1.5}
}
function tickMist(dt){
  for(let k=0;k<MN;k++){if(mLife[k]<0){mAlpha[k]=0;continue}
    mLife[k]+=dt;const L=mLife[k];if(L>2){mLife[k]=-1;mAlpha[k]=0;continue}
    const dr=Math.exp(-dt*2.6);mVel[k*3]*=dr;mVel[k*3+1]=mVel[k*3+1]*dr+dt*.15;mVel[k*3+2]*=dr;
    mPos[k*3]+=mVel[k*3]*dt;mPos[k*3+1]+=mVel[k*3+1]*dt;mPos[k*3+2]+=mVel[k*3+2]*dt;mSize[k]+=dt*2;mAlpha[k]=smooth(0,.06,L)*(1-smooth(.4,2,L))}
  mGeo.attributes.position.needsUpdate=mGeo.attributes.alpha.needsUpdate=mGeo.attributes.size.needsUpdate=true;
}
const pops=new Map();function doSpritz(b){pops.set(b,1);setTimeout(()=>spritz(b),reduce?0:240)}

function resize(){
  renderer.setSize(innerWidth,innerHeight,false);renderer.getDrawingBufferSize(drawSize);
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();mMat.uniforms.uPx.value=innerHeight*DPR;layoutBackdrop();
}
addEventListener('resize',resize);resize();

/* ---------- interaction ---------- */
let yaw=-.35,vel=0,drag=false,lastX=0,moved=0,mx=0,my=0,hover=null,interactive=true,inColl=false,activeI=0,pYaw=0;
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function pickAt(x,y){
  ndc.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(ndc,camera);
  const list=gift.visible?slots.filter(Boolean).map(s=>s.b):inColl?CB:[shown];
  let best=null,bd=1e9;
  for(const b of list){if(!b.root.visible)continue;const h=ray.intersectObjects(b.pick,true)[0];if(h&&h.distance<bd){bd=h.distance;best=b}}
  return best;
}
addEventListener('pointerdown',e=>{if(!interactive||e.target.closest('a,button,input,.card,.tiers,.swatches'))return;
  if(pickAt(e.clientX,e.clientY)||e.target.closest('#hero,#pack3d')){drag=true;lastX=e.clientX;moved=0;vel=0}});
addEventListener('pointermove',e=>{
  if(drag){const d=e.clientX-lastX;lastX=e.clientX;moved+=Math.abs(d);vel=d*.006;if(gift.visible)giftYaw+=vel;else if(inColl)pYaw+=vel;else yaw+=vel}
  hover=fine&&interactive&&!e.target.closest('a,button,input')?pickAt(e.clientX,e.clientY):null;
});
addEventListener('pointerup',e=>{
  if(drag&&moved<6&&interactive){const b=pickAt(e.clientX,e.clientY);
    if(b){if(inColl&&b.i!==activeI)collScrollTo(b.i);else doSpritz(b)}}
  drag=false});
addEventListener('pointercancel',()=>drag=false);

/* ---------- frame ---------- */
const notesSec=$('#notes'),pillSec=$('#pillars'),cProg=$('#cProg'),oilN=$('#oilN');
const easeOutBack=t=>{const c1=1.3,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
const easeOutExpo=t=>t>=1?1:1-Math.pow(2,-10*t);
const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));const _up=new THREE.Vector3(0,1,0);
let last=performance.now(),landed=false,heroChip=$('#heroChip'),ringT=-1,firstFrame=true,lastTier=-2,lastOil=-1,lastSec='';
const v3=new THREE.Vector3(),v4=new THREE.Vector3();

function capPose(b,lift,dt){
  let p=pops.get(b)||0;if(p>0){p=Math.max(0,p-dt*1.5);pops.set(b,p)}
  const pop=p>0?Math.sin((1-p)*Math.PI):0;
  b.cap.position.y=b.capY+lift*1.1+pop*.6;b.cap.rotation.y=lift*.6+pop*.8;b.cap.rotation.z=lift*.08;
}

function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
  if(lenis)lenis.raf(now);
  const y=scrollY,W=innerWidth,H=innerHeight,narrow=W<900;
  cx+=(tx-cx)*.2;cy+=(ty-cy)*.2;cur.style.transform=`translate(${cx}px,${cy}px)`;
  mx+=((tx/W-.5)-mx)*.05;my+=((ty/H-.5)-my)*.05;
  parallax();

  /* scroll state */
  const nr=notesSec.getBoundingClientRect(),cr=collSec.getBoundingClientRect(),pr=pillSec.getBoundingClientRect();
  const heroP=clamp(y/H);
  const nIn=smooth(0,1,clamp(1-nr.top/H)),nE=clamp(-nr.top/(nr.height-H));
  const cIn=smooth(0,1,clamp(1-cr.top/H)),cE=clamp(-cr.top/(cr.height-H));
  const darkK=nIn*(1-cIn);
  const pk=pack3d.getBoundingClientRect(),bxr=boxSec.getBoundingClientRect();
  const boxMode=bxr.top<H&&bxr.bottom>0&&pr.top<0;
  const covered=pr.top<=0&&!boxMode;
  inColl=cIn>.6&&!boxMode;
  interactive=boxMode||(!covered&&(heroP<.7||cIn>.9));
  navTick(y,darkK>.5&&nr.top<=40);
  const sec=pr.top<H*.5?'#pillars':cIn>.5?'#collection':nIn>.5?'#notes':'#hero';
  if(sec!==lastSec){lastSec=sec;navLinks.forEach(a=>a.classList.toggle('on',a.getAttribute('href')===sec))}

  /* intro drop */
  const it=introT<0?0:reduce?1:clamp((now-introT)/1000/1.9);
  const dropK=easeOutBack(clamp(it/.8));
  if(!landed&&it>=.4){landed=true;ringT=0}

  /* notes progress */
  const capLift=smooth(.04,.16,nE)*(1-smooth(.9,1,nE))*darkK;
  const tierP=[smooth(.14,.3,nE),smooth(.36,.52,nE),smooth(.58,.74,nE)].map(v=>v*nIn*(1-smooth(.15,.7,cIn)));
  const activeTier=nIn<.5?-1:nE<.14?-1:nE<.36?0:nE<.58?1:2;
  if(activeTier!==lastTier){lastTier=activeTier;tierEls.forEach((el,k)=>el.classList.toggle('on',k<=activeTier))}
  const oil=Math.round(35*smooth(.05,.5,nE)*nIn);if(oil!==lastOil){lastOil=oil;oilN.innerHTML=oil+'<sup>%</sup>'}

  /* hero <-> notes bottle swap (squash out, pop in) */
  target=nIn>.5?notesB:heroB;
  if(target!==shown&&morph===0)morph=.0001;
  if(morph>0){morph=Math.min(1,morph+dt*(reduce?10:3.2));
    if(morph>=.5&&shown!==target){shown.root.visible=false;shown=target;shown.root.visible=true}
    if(morph>=1)morph=target!==shown?.0001:0}
  const ms=morph===0?1:morph<.5?1-.55*smooth(0,.5,morph):.45+.55*easeOutBack(clamp((morph-.5)*2));
  shown.grp.scale.setScalar(ms);shown.grp.rotation.y=morph>0?(morph<.5?morph:morph-1)*Math.PI*1.2:0;

  /* collection: turntable position with a dwell on each bottle */
  const pf=cE*N-.5,base=Math.floor(pf),fr=pf-base;
  const eased=clamp(base+smooth(.55,.95,fr),0,N-1);
  const ci=Math.round(eased);
  if(cIn>.5)showFrag(ci);else if(cIn<.2)showFrag(0);
  activeI=cIn>.5?ci:0;
  cProg.style.transform=`scaleX(${cE.toFixed(4)})`;
  const activeF=FRAGS[activeI];

  /* backdrop */
  BD.target=boxMode?'light|GIFT':(cIn>.5?'light':nIn>.5?'dark':'light')+'|'+(cIn>.5?activeF.name.split(' ')[0].toUpperCase():nIn>.5?'NOTES':'LUSSO');
  tickBackdrop(dt);
  BDU.uOff.value.set(-mx*.01,my*.008);BDU.uDark.value=darkK;BDU.uArch.value=boxMode?0:1-darkK*.999-cIn*.35;
  for(const b of [heroB,notesB])b.lm.uniforms.uGlow.value=.04+darkK*.35;

  /* layout: hero -> notes */
  const camZ0=narrow?16.5:12.2;
  const halfH=camZ0*Math.tan(THREE.MathUtils.degToRad(14)),halfW=halfH*W/H;
  const P={hero:{x:narrow?0:halfW*.34,y:narrow?-halfH*.4:-1.6,s:narrow?.6:1},notes:{x:narrow?0:halfW*.18,y:narrow?-.6:-1.75,s:narrow?.55:.95}};
  const L2=k=>lerp(P.hero[k],P.notes[k],nIn);
  const drop=(1-dropK)*6.5;
  const stageK=1-smooth(.1,.5,cIn);
  stage.visible=stageK>.005;
  stage.position.set(L2('x')+(narrow?0:mx*.15),L2('y')+(reduce?0:Math.sin(t*.9)*.025)-(1-stageK)*2.5,0);
  stage.scale.setScalar(L2('s')*Math.max(.001,stageK));
  spin.position.y=drop;
  if(!drag||inColl){vel*=.94;if(!inColl)yaw+=vel+(reduce?0:dt*.2*(1-darkK*.5))}
  spin.rotation.y=yaw+(1-dropK)*Math.PI*2.5;
  spin.rotation.z=(1-dropK)*.3;
  capPose(shown,capLift,dt);

  /* camera */
  const orbitA=(nE-.5)*.5*darkK,camZ=lerp(lerp(camZ0,narrow?16.5:12.6,nIn),narrow?17.5:13.4,cIn);
  camera.position.set(Math.sin(orbitA)*camZ+mx*.3,1+my*-.25+darkK*.8+cIn*1.9,Math.cos(orbitA)*camZ);
  camera.lookAt(0,.1+darkK*.35+cIn*.2,0);

  /* carousel (with atmospheric haze toward the back of the turntable) */
  carousel.visible=cIn>.02&&!boxMode;
  const hz=carousel.visible?1:0;scene.fog.near=lerp(1000,camZ+.6,hz);scene.fog.far=lerp(1001,camZ+13,hz);FOGU.uFogN.value=scene.fog.near;FOGU.uFogF.value=scene.fog.far;
  if(carousel.visible){
    const rise=1-smooth(.2,.85,cIn);
    carousel.position.set(narrow?0:-halfW*.4,(narrow?-.9:-1.75)-rise*7,narrow?-3.3:-2.6);
    carousel.scale.setScalar(narrow?.82:1);
    if(!inColl)pYaw*=.9;
    turn.rotation.y=-eased*STEP+rise*2.2;
    for(const b of CB){
      const a=wrapA(b.i*STEP+turn.rotation.y),front=clamp(1-Math.abs(a)/STEP);
      const sc=.5+.38*front*front;b.root.scale.setScalar(sc);
      b.root.position.y=front*.18;
      const act=b.i===activeI&&cIn>.5;
      b.grp.rotation.y=lerp(b.grp.rotation.y,(act?(reduce?0:Math.sin(t*.55)*.35)+pYaw:0),1-Math.exp(-dt*4));
      capPose(b,0,dt);
      b.lm.uniforms.uGlow.value=.04;
      b.ground.position.set(b.root.position.x,0,b.root.position.z).applyAxisAngle(_up,turn.rotation.y);b.ground.scale.setScalar(sc);
    }
    if(!inColl)pYaw=0;
  }

  /* gift box: pinned to its slot in the layout, lid opens as the section scrolls in */
  gift.visible=boxMode;
  if(boxMode){
    camera.updateMatrixWorld();
    const hit=(sx,sy,o)=>{ndc.set(sx/W*2-1,-(sy/H)*2+1);ray.setFromCamera(ndc,camera);const r=ray.ray;return o.copy(r.origin).addScaledVector(r.direction,-r.origin.z/r.direction.z)};
    const cyp=pk.top+pk.height*.66;hit(pk.left+pk.width/2,cyp,v3);hit(pk.left,cyp,v4);const wl=v4.x;hit(pk.right,cyp,v4);
    const gs=(v4.x-wl)/(GW*1.32),enter=clamp(1-pk.top/H);
    gift.scale.setScalar(gs);gift.position.set(v3.x,v3.y-GH*gs*.35-(1-smooth(0,.45,enter))*2.5*gs,0);
    if(!drag)giftYaw*=.96;
    gift.rotation.set(.12,-.32+(reduce?0:Math.sin(t*.4)*.06)+mx*.12+giftYaw,0);
    lid.rotation.x=-1.92*smooth(.25,.75,enter);
    slots.forEach((sl,i)=>{if(!sl)return;const k=reduce?1:clamp((now-sl.t0)/700);sl.b.root.position.y=FLOOR+(1-easeOutBack(k))*3.2;
      sl.b.grp.rotation.y=(reduce?0:Math.sin(t*.5+i*2)*.25);capPose(sl.b,0,dt);sl.b.lm.uniforms.uGlow.value=.04});
  }

  /* orbs + labels */
  stage.updateMatrixWorld();v4.copy(stage.position).project(camera);const midX=(v4.x*.5+.5)*W;
  orbs.forEach((o,i)=>{
    const p=tierP[o.tier],a=o.phase+t*(.35-o.tier*.08)*(reduce?0:1),r=TR[o.tier]*(1+.25*(1-p));
    o.m.position.set(Math.cos(a)*r,TY[o.tier]+Math.sin(t*1.3+i)*.05,Math.sin(a)*r);
    o.m.scale.setScalar(o.size*easeOutBack(p));o.m.visible=p>.001;
    const el=noteEls[i];if(p<.02||narrow){el.style.opacity=0;return}
    o.m.getWorldPosition(v3);const front=v3.z-stage.position.z>-.2;v3.project(camera);
    const X=(v3.x*.5+.5)*W,Y=(-v3.y*.5+.5)*H,right=X>midX;
    el.classList.toggle('l',!right);el.style.opacity=(p*(front?1:.3)).toFixed(3);
    el.style.transform=`translate(${right?X+14:X-14}px,${Y}px) translate(${right?'0':'-100%'},-50%)`;
  });
  orbitRings.forEach((r,i)=>{r.material.opacity=tierP[i]*.6;r.scale.setScalar(1+.25*(1-tierP[i]))});

  /* landing ring, shadow, stone tone, mist */
  if(ringT>=0){ringT+=dt*.75;const k=easeOutExpo(clamp(ringT));ring.scale.setScalar(.95+k*.95);ring.material.opacity=(1-clamp(ringT))*.6;if(ringT>=1){ringT=-1;ring.material.opacity=0}}
  {const gr=shown===heroB?groundH:groundN;groundH.visible=gr===groundH;groundN.visible=gr===groundN;
   const gk=(1-clamp(drop/4))*ms;gr.scale.setScalar(1+clamp(drop/6)*.6);
   gr.userData.ao.material.opacity=.9*gk*(1-darkK*.4);gr.userData.cast.material.opacity=.85*gk*(1-darkK*.7);gr.userData.caustic.material.opacity=.32*gk*(1-darkK*.6)}
  M.stone.color.setScalar(1-darkK*.5);
  tickMist(dt);

  /* backdrop arch + glow follow the featured bottle on screen */
  const fb=boxMode?(slots.find(Boolean)?.b||CB[activeI]):inColl||cIn>.5?CB[activeI]:shown;
  v3.set(0,fb.height*.45,0);fb.grp.localToWorld(v3);v3.project(camera);BDU.uGP.value.set(v3.x*.5+.5,v3.y*.5+.5);BDU.uAsp.value=W/H;
  v4.set(0,0,0);fb.grp.localToWorld(v4);v4.project(camera);const yb=v4.y;v4.set(0,fb.height,0);fb.grp.localToWorld(v4);v4.project(camera);
  BDU.uArchW.value=Math.abs(v4.y-yb)*.5*.55;

  /* shoppable hero: a tag that hangs off the bottle's shoulder */
  if(heroChip){const hk=(1-smooth(.05,.35,heroP))*(introT<0?0:smooth(.55,.9,it));
    if(narrow||hk<.01){heroChip.style.opacity=0;heroChip.style.pointerEvents='none'}
    else{v3.set(0,heroB.height*.62,0);heroB.grp.localToWorld(v3);v3.project(camera);
      heroChip.style.opacity=hk.toFixed(3);heroChip.style.pointerEvents=hk>.6?'auto':'none';
      heroChip.style.transform=`translate(${(v3.x*.5+.5)*W+70}px,${(-v3.y*.5+.5)*H}px) translateY(-50%)`}}

  /* adaptive quality */
  if(introT>0&&now-introT>2500&&DPR>1){perfT+=dt;perfN++;if(perfN===90){if(perfT/perfN>.03){DPR=Math.max(1,DPR*.75);renderer.setPixelRatio(DPR);resize()}perfN=0;perfT=0}}

  setCursor(hover?(drag&&moved>6?'drag':(inColl&&hover.i!==activeI?'view':'spritz')):(cursorMode==='link'?'link':''));

  if(!covered||firstFrame){renderer.render(scene,camera);canvas.style.visibility='visible'}else canvas.style.visibility='hidden';
  if(firstFrame){firstFrame=false;introBar.style.transform='scaleX(.8)';
    labelFonts.then(()=>{[heroB,notesB,...CB].forEach(drawB);layoutBackdrop();setTimeout(finishIntro,reduce?0:450)})}
}
introBar.style.transform='scaleX(.45)';
requestAnimationFrame(frame);
}
})();
