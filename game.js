const $=s=>document.querySelector(s),rnd=Math.random,K='lpfb1',now=()=>Date.now();
const W=320,H=200,cv=$('#c'),g=cv.getContext('2d');cv.width=W;cv.height=H;
const def=()=>({stars:3,tot:0,seen:0,name:'Mochi',own:['daisy','tulip'],decor:[],sel:'daisy',tool:'plant',sound:true,started:0,last:now(),plots:Array(24).fill(null)});
let S=def();try{const r=JSON.parse(localStorage.getItem(K));if(r)S=Object.assign(def(),r)}catch(e){}
const away=now()-S.last;
if(!S.started){S.plots[8]={t:'daisy',g:9000,wet:now()+90000,done:0};S.plots[9]={t:'tulip',g:3000,wet:now()+90000,done:0}}
else S.plots.forEach(p=>{if(p&&p.wet>S.last)p.g=Math.min(T[p.t].ms,p.g+Math.min(now(),p.wet)-S.last)});
const save=()=>{S.last=now();try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
setInterval(save,5000);document.addEventListener('visibilitychange',save);
/* audio */
let ac,SC=[523,587,659,784,880,1047];
function tone(f,d=.5,v=.05,ty='sine'){if(!S.sound)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),n=ac.createGain();o.type=ty;o.frequency.value=f;n.gain.setValueAtTime(v,ac.currentTime);n.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(n).connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
const chime=i=>tone(SC[i%6],.7);
/* ui helpers */
let sayT;function say(t){const e=$('#say');e.textContent=t;clearTimeout(sayT);sayT=setTimeout(()=>e.textContent='',4500)}
const blooms=()=>S.plots.filter(p=>p&&p.g>=T[p.t].ms).length;
const avail=()=>Math.floor(S.tot/3)+1;
function hud(){$('#st').textContent=S.stars;$('#fl').textContent=blooms();$('#badge').style.display=avail()>S.seen?'block':'none';
document.querySelectorAll('#tools button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===S.tool));
$('#seeds').style.display=S.tool==='plant'?'flex':'none';
$('#seeds').innerHTML=S.own.map(k=>`<button data-s="${k}" aria-pressed="${S.sel===k}">${T[k].n}</button>`).join('');
$('#bSound').textContent=S.sound?'🔊':'🔇'}
const M=$('#modal');
function open(h,lock){M.innerHTML='<div class="card">'+h+'</div>';M.classList.add('on');M.dataset.lock=lock?1:''}
function close(){M.classList.remove('on')}
M.addEventListener('click',e=>{if(e.target===M&&!M.dataset.lock)close()});
/* state: world */
const cat={x:150,y:150,tx:150,ty:150,f:1,pet:0,wt:3};
const fs=[{x:90,y:130,vy:0,rest:130},{x:240,y:160,vy:0,rest:160}];let sp=4,P=[];
const COLS=6,ROWS=4,TW=32,TH=20,OX=64,OY=100;
const tufts=Array.from({length:50},()=>[rnd()*W,95+rnd()*100]);
const sstars=Array.from({length:40},()=>[rnd()*W,rnd()*70,rnd()]);
function burst(x,y,n,c,k='s'){for(let i=0;i<n;i++)P.push({x,y,vx:(rnd()-.5)*40,vy:-10-rnd()*25,l:1,c,k})}
/* actions */
function pet(){cat.pet=1.6;burst(cat.x+6,cat.y-18,4,'#ff7a8a','h');tone(110,.35,.04,'triangle');setTimeout(()=>tone(115,.35,.04,'triangle'),260);say(S.name+': '+CAT[Math.floor(rnd()*CAT.length)])}
function ring(){[0,1,2].forEach(i=>setTimeout(()=>chime(Math.floor(rnd()*6)),i*180))}
function plot(i){const p=S.plots[i],c=i%COLS,r=Math.floor(i/COLS);cat.tx=OX+c*TW+TW/2-14;cat.ty=Math.min(188,OY+r*TH+TH+8);
const x=OX+c*TW+TW/2,y=OY+r*TH+TH/2;
if(S.tool==='plant'){if(p)return say('Something is already growing here.');S.plots[i]={t:S.sel,g:0,wet:0,done:0};chime(1);burst(x,y,6,'#fff3c4');say('Planted. Water it whenever you feel like it.')}
else if(S.tool==='water'){if(!p)return say('Nothing planted here yet.');p.wet=now()+90000;burst(x,y-6,8,'#6ec1ff','w');tone(380,.12,.03);setTimeout(()=>tone(440,.12,.03),90);say(p.g>=T[p.t].ms?'Still happy.':'Drink up, little one.')}
else{if(!p)return;S.plots[i]=null;say('Cleared. Fresh soil.')}
hud()}
cv.addEventListener('pointerdown',e=>{const rc=cv.getBoundingClientRect(),x=(e.clientX-rc.left)/rc.width*W,y=(e.clientY-rc.top)/rc.height*H;
const si=fs.findIndex(s=>Math.hypot(s.x-x,s.y-y)<14);
if(si>=0){const s=fs.splice(si,1)[0];S.stars++;S.tot++;chime(Math.floor(rnd()*6));burst(s.x,s.y,8,'#ffe27a');hud();return}
if(x>cat.x-12&&x<cat.x+16&&y>cat.y-20&&y<cat.y+4)return pet();
if(x>286&&y>28&&y<70&&S.decor.includes('chime'))return ring();
const c=Math.floor((x-OX)/TW),r=Math.floor((y-OY)/TH);
if(c>=0&&c<COLS&&r>=0&&r<ROWS)return plot(r*COLS+c);
if(y>100){cat.tx=Math.max(20,Math.min(300,x));cat.ty=Math.max(120,Math.min(188,y))}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
if(d.t){S.tool=d.t;hud()}
if(d.s){S.sel=d.s;hud()}
if(d.buy){const[k,id]=d.buy.split(':'),it=(k==='s'?T:D)[id];if(S.stars<it.cost)return;S.stars-=it.cost;(k==='s'?S.own:S.decor).push(id);chime(3);setTimeout(()=>chime(5),150);say(it.n+' added to your garden.');hud();shop()}
if(d.act==='close')close();
if(d.act==='prev'&&cur>0)note(cur-1);
if(d.act==='next'&&cur<S.seen-1)note(cur+1);
if(d.act==='bstop'){bstop=1;clearTimeout(btm);close()}
if(d.act==='go'){S.name=($('#nm').value.trim()||'Mochi').slice(0,14);S.started=1;close();say('Hi. Take your time.');chime(2);save()}});
/* notes */
let cur=0;
function note(i){cur=i;open(`<h2>A note</h2><p class="note">${NOTES[i%NOTES.length]}</p><div class="row"><button data-act="prev" aria-label="Previous">‹</button><small>${i+1} of ${S.seen}</small><button data-act="next" aria-label="Next">›</button></div><div class="row"><button data-act="close">Close</button></div>`)}
$('#bNotes').onclick=()=>{if(avail()>S.seen)S.seen++;hud();note(S.seen-1)};
/* shop */
function shop(){const row=(k,id,it)=>{const own=(k==='s'?S.own:S.decor).includes(id);return `<div class="item"><span>${it.n}</span>${own?'<small>yours</small>':`<button data-buy="${k}:${id}" ${S.stars<it.cost?'disabled style="opacity:.5"':''}>⭐ ${it.cost}</button>`}</div>`};
open(`<h2>Shop</h2><small>Seeds</small>${Object.keys(T).map(k=>row('s',k,T[k])).join('')}<small>For the garden</small>${Object.keys(D).map(k=>row('d',k,D[k])).join('')}<div class="row"><button data-act="close">Close</button></div>`)}
$('#bShop').onclick=shop;
$('#bSound').onclick=()=>{S.sound=!S.sound;hud();tone(660,.2)};
/* breathe */
let bstop=0,btm;
$('#bBreathe').onclick=()=>{bstop=0;open('<h2>Breathe</h2><div class="bw"><div id="bc"></div></div><p id="bt">Get comfortable…</p><div class="row"><button data-act="bstop">Stop</button></div>',1);let n=0;const bt=t=>{const e=$('#bt');if(e)e.textContent=t},bc=()=>$('#bc');
const inn=()=>{if(bstop)return;bt('Breathe in…');bc().style.transition='transform 4s ease-in-out';bc().style.transform='scale(1)';btm=setTimeout(out,4000)};
const out=()=>{if(bstop)return;bt('…and slowly out');bc().style.transition='transform 6s ease-in-out';bc().style.transform='scale(.5)';btm=setTimeout(()=>{n++;n>=4?fin():inn()},6000)};
const fin=()=>{S.stars+=3;S.tot+=3;hud();close();say('Nicely done. +3 ⭐');[0,2,4].forEach((v,i)=>setTimeout(()=>chime(v),i*220))};
btm=setTimeout(inn,400)};
/* drawing */
const fr=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),rgb=a=>`rgb(${a.map(Math.round)})`;
function darkness(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;if(h>=8&&h<17)return 0;if(h>=17&&h<20)return(h-17)/3;if(h>=5&&h<8)return 1-(h-5)/3;return 1}
function glow(x,y,r,c,a){g.globalCompositeOperation='lighter';const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.globalAlpha=1;g.globalCompositeOperation='source-over'}
const stage=p=>{const r=p.g/T[p.t].ms;return r>=1?3:r>=.4?2:r>=.1?1:0};
let gl=[];
function flower(x,y,p,tm){const t=T[p.t],st=stage(p),sw=st>=2?Math.round(Math.sin(tm/900+x)):0;
if(st===0)return fr(x-2,y-1,4,2,'#5a3d2b');
const h=st===1?4:st===2?Math.round(t.h*.6):t.h,cx=x+sw,cy=y-h;
fr(cx,cy,1,h,'#3f8a46');fr(cx-2,y-Math.round(h/2),2,1,'#4f9a4a');if(st>=2)fr(cx+1,y-Math.round(h/2)-2,2,1,'#4f9a4a');
if(st===1)return;
if(st===2)return fr(cx-1,cy-2,3,3,t.m);
const c=t.c,m=t.m;
if(p.t==='daisy'||p.t==='moon'){fr(cx-3,cy-1,7,3,c);fr(cx-1,cy-3,3,7,c);fr(cx-2,cy-2,5,5,c);fr(cx-1,cy-1,3,3,m)}
else if(p.t==='sunflower'){fr(cx-4,cy-2,9,5,c);fr(cx-2,cy-4,5,9,c);fr(cx-3,cy-3,7,7,c);fr(cx-2,cy-2,5,5,m)}
else if(p.t==='tulip'){fr(cx-3,cy-3,7,5,c);fr(cx-3,cy-5,2,2,c);fr(cx+2,cy-5,2,2,c);fr(cx-1,cy-4,3,2,m)}
else if(p.t==='lavender'){fr(cx-3,cy-5,2,7,c);fr(cx+2,cy-5,2,7,c);fr(cx-1,cy-8,3,10,m)}
else{fr(cx-3,cy-3,7,7,m);fr(cx-2,cy-4,5,9,c);fr(cx-1,cy-1,3,3,m)}
if(p.t==='moon')gl.push([cx,cy,16,'rgba(150,200,255,1)'])}
function drawCat(tm){const{x,y,f}=cat,moving=Math.hypot(cat.tx-x,cat.ty-y)>1,by=moving?Math.round(Math.sin(tm/90)):0;
g.save();g.translate(Math.round(x),Math.round(y+by));g.scale(f,1);
const c='#f3ece0',blink=cat.pet>0||(tm%4000)<140;
fr(-12,-7+Math.round(Math.sin(tm/300)*2),3,2,c);fr(-13,-12+Math.round(Math.sin(tm/300)*2),2,6,c);
fr(-9,-8,15,8,c);fr(-7,-8,7,4,'#c9a37a');fr(-8,-2,3,3,'#e6dccb');fr(3,-2,3,3,'#e6dccb');
fr(3,-15,10,9,c);fr(3,-18,3,4,c);fr(10,-18,3,4,c);fr(4,-17,1,2,'#f2a7b5');fr(11,-17,1,2,'#f2a7b5');fr(6,-15,3,3,'#c9a37a');
if(blink){fr(5,-10,3,1,'#3a2f2a');fr(10,-10,3,1,'#3a2f2a')}else{fr(6,-11,2,2,'#3a2f2a');fr(10,-11,2,2,'#3a2f2a')}
fr(9,-8,2,1,'#e58a9b');g.restore()}
function render(tm,d){
const top=d<.5?mix([159,214,238],[120,100,160],d*2):mix([120,100,160],[16,26,54],(d-.5)*2),bot=d<.5?mix([251,236,205],[245,166,140],d*2):mix([245,166,140],[58,56,104],(d-.5)*2);
const sg=g.createLinearGradient(0,0,0,95);sg.addColorStop(0,rgb(top));sg.addColorStop(1,rgb(bot));g.fillStyle=sg;g.fillRect(0,0,W,95);
sstars.forEach(s=>{g.globalAlpha=Math.max(0,d-.3)*(.5+.5*Math.sin(tm/700+s[2]*20));fr(s[0],s[1],1,1,'#fff')});g.globalAlpha=1;
if(d<.55){g.fillStyle='#ffe58a';g.beginPath();g.arc(272,30,10,0,7);g.fill()}else{g.fillStyle='#f4f1dc';g.beginPath();g.arc(272,30,9,0,7);g.fill();g.fillStyle=rgb(top);g.beginPath();g.arc(277,27,8,0,7);g.fill()}
if(blooms()>=6&&d<.6){g.globalAlpha=.35;['#ff6b6b','#ffb347','#ffe66d','#7bd88f','#6ec1ff','#a68be0'].forEach((c,i)=>{g.strokeStyle=c;g.lineWidth=2;g.beginPath();g.arc(170,100,70-i*2,Math.PI,0);g.stroke()});g.globalAlpha=1}
g.fillStyle='#9fb0d0';g.beginPath();[[0,92],[40,60],[80,80],[130,45],[190,85],[240,55],[320,88],[320,92]].forEach((q,i)=>i?g.lineTo(...q):g.moveTo(...q));g.fill();
g.fillStyle='#6f8fb0';g.beginPath();[[0,92],[60,72],[110,90],[170,66],[230,90],[290,70],[320,92]].forEach((q,i)=>i?g.lineTo(...q):g.moveTo(...q));g.fill();
fr(0,90,W,110,'#7fb069');fr(0,90,W,3,'#93c47d');tufts.forEach(t=>fr(t[0],t[1],1,2,'#5e9455'));
/* tree */fr(16,82,7,40,'#7a5230');fr(2,52,36,30,'#4f9a4a');fr(-2,60,44,18,'#5aa956');fr(8,44,24,12,'#4f9a4a');
if(S.decor.includes('bench')){fr(26,134,30,3,'#8a5a36');fr(27,137,2,6,'#6d4326');fr(53,137,2,6,'#6d4326');fr(26,127,30,2,'#8a5a36');fr(27,129,2,5,'#6d4326');fr(53,129,2,5,'#6d4326')}
if(S.decor.includes('pond')){fr(262,138,50,34,'#6a8f6a');fr(264,140,46,30,'#5fa8d3');fr(268,144,38,20,'#7cc0e6');fr(290,150,6,3,'#4f9a4a');const fx=Math.round(272+(Math.sin(tm/1200)+1)*12);fr(fx,156,4,2,'#ff9e4a');fr(fx+(Math.cos(tm/1200)>0?4:-1),156,1,2,'#ff7a2a');fr(300-(fx-272)*.6,162,3,1,'#ffd27a')}
gl=[];
for(let i=0;i<24;i++){const c=i%COLS,r=Math.floor(i/COLS),p=S.plots[i],X=OX+c*TW,Y=OY+r*TH;
fr(X+2,Y+2,TW-4,TH-4,p&&now()<p.wet?'#4a3326':'#6b4a35');fr(X+2,Y+2,TW-4,1,'#7d5a42');
if(p)flower(X+TW/2,Y+TH/2+5,p,tm)}
if(S.decor.includes('chime')){const sw=Math.round(Math.sin(tm/700));fr(300,28,1,14,'#999');for(let i=0;i<4;i++)fr(293+i*4+sw,42+i%2*3,2,12-i%2*3,['#c9d6ea','#b5c4dd','#c9d6ea','#a5b6d4'][i])}
if(S.decor.includes('lights')){for(let x=0;x<W;x+=2)fr(x,12+Math.abs(Math.sin(x/80*Math.PI))*8,1,1,'#444');for(let x=10;x<W;x+=20){const y=12+Math.abs(Math.sin(x/80*Math.PI))*8,c=['#ff9aa8','#ffd36e','#9ae6b4','#8fc2f0'][(x/20|0)%4];fr(x,y+1,3,4,c);gl.push([x+1,y+3,12,c])}}
drawCat(tm);
if(S.decor.includes('butter')){const n=Math.min(6,1+blooms());for(let i=0;i<n;i++){const bx=170+Math.sin(tm/2200*(.6+i*.13)+i*2)*115,by=125+Math.cos(tm/1700*(.5+i*.1)+i)*38,fl=Math.sin(tm/70+i)>0?2:3;fr(bx-fl,by,fl,2,['#ffb3c7','#ffd36e','#a68be0'][i%3]);fr(bx+1,by,fl,2,['#ffb3c7','#ffd36e','#a68be0'][i%3]);fr(bx,by,1,2,'#333')}}
fs.forEach((s,i)=>{g.globalAlpha=.75+.25*Math.sin(tm/300+i*3);fr(s.x-1,s.y-4,2,8,'#ffd84a');fr(s.x-4,s.y-1,8,2,'#ffd84a');fr(s.x-1,s.y-1,2,2,'#fff6c2');g.globalAlpha=1;gl.push([s.x,s.y,14,'rgba(255,220,100,1)'])});
P.forEach(q=>{g.globalAlpha=Math.max(0,q.l);if(q.k==='h'){g.fillStyle=q.c;g.font='9px sans-serif';g.fillText('♥',q.x,q.y)}else if(q.k==='w')fr(q.x,q.y,1,2,q.c);else fr(q.x,q.y,2,2,q.c)});g.globalAlpha=1;
g.fillStyle=`rgba(12,18,56,${d*.38})`;g.fillRect(0,0,W,H);
gl.forEach(([x,y,r,c])=>glow(x,y,r,c,c.includes('255,220')?.5:Math.min(1,d*1.1)));
if(d>.25)for(let i=0;i<10;i++){const x=30+(i*29+Math.sin(tm/1500+i)*20)%270,y=105+(i*17%75)+Math.cos(tm/1100+i*2)*8;glow(x,y,7,'rgba(220,255,120,1)',d*(.4+.4*Math.sin(tm/500+i)))}}
/* loop */
let last=performance.now(),spT=0;
function frame(t){const dt=Math.min(.1,(t-last)/1000);last=t;const d=darkness();
S.plots.forEach(p=>{if(!p)return;const tt=T[p.t];if(now()<p.wet&&p.g<tt.ms)p.g=Math.min(tt.ms,p.g+dt*1000);
if(p.g>=tt.ms&&!p.done){p.done=1;S.stars+=2;S.tot+=2;chime(4);burst(0,0,0);hud();say('A flower just bloomed. +2 ⭐')}});
const dx=cat.tx-cat.x,dy=cat.ty-cat.y,dist=Math.hypot(dx,dy);
if(dist>1){const s=Math.min(dist,38*dt);cat.x+=dx/dist*s;cat.y+=dy/dist*s;if(Math.abs(dx)>1)cat.f=dx>0?1:-1}
else{cat.wt-=dt;if(cat.wt<=0){cat.tx=70+rnd()*190;cat.ty=125+rnd()*58;cat.wt=6+rnd()*8}}
cat.pet=Math.max(0,cat.pet-dt);
sp-=dt;if(sp<=0&&fs.length<5){fs.push({x:12+rnd()*296,y:-4,vy:8+rnd()*6,rest:115+rnd()*70});sp=6+rnd()*6}
fs.forEach(s=>{if(s.y<s.rest)s.y+=s.vy*dt});
P.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=40*dt;q.l-=dt*1.1});P=P.filter(q=>q.l>0);
render(t,d);requestAnimationFrame(frame)}
/* start */
hud();
if(!S.started){open(`<h2>A little place to feel better</h2><p>A quiet garden, a cat, and nothing you have to do. No timers, no goals. Come and go whenever you like.</p><p><small>Your cat’s name</small><br><input id="nm" value="${S.name}" maxlength="14"></p><div class="row"><button data-act="go">Step inside</button></div>`,1)}
else if(away>36e5)say('Welcome back. Your garden kept growing while you were away.');
else say('Hi again.');
requestAnimationFrame(frame);
