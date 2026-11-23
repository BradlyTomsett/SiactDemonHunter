import { VIEW } from './levels.mjs';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const { width: W, height: H } = VIEW;
  const scale = 2;
  canvas.width = W * scale; canvas.height = H * scale;
  const round = (x,y,w,h,r,color) => { ctx.fillStyle=color; ctx.beginPath(); ctx.roundRect(x,y,w,h,Math.max(0,Math.min(r,w/2,h/2))); ctx.fill(); };
  const oval = (x,y,rx,ry,color) => { ctx.fillStyle=color; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill(); };
  const line = (x1,y1,x2,y2,color,width=1) => { ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineCap='round'; ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke(); };
  function background(camera) {
    const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#b0c8c6'); bg.addColorStop(.65,'#6c9091'); bg.addColorStop(1,'#354f54'); ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    const shift=(camera*.15)%240;
    for(let x=-240-shift;x<W+240;x+=240) {
      round(x+16,35,175,126,7,'#47676a'); round(x+22,41,163,114,5,'#9db9b1');
      const light=ctx.createLinearGradient(x+22,41,x+170,155);light.addColorStop(0,'#d8e7db');light.addColorStop(1,'#87aaa5');round(x+26,45,155,106,3,light);
      line(x+103,45,x+103,151,'#678b89',3);line(x+26,98,x+181,98,'#769896',2);
      round(x-4,198,234,82,9,'#587879');round(x+3,205,220,26,5,'#739491');round(x+3,235,220,39,5,'#855e5e');
      oval(x+205,202,25,15,'#507d6d');oval(x+188,190,13,25,'#6fa38b');oval(x+213,185,15,27,'#5c9780');round(x+192,205,22,31,5,'#c5af8b');
    }
    const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#ffffff18');shade.addColorStop(1,'#102f3c55');ctx.fillStyle=shade;ctx.fillRect(0,0,W,H);
  }
  function platform(p) {
    const colors={desk:['#bd8b60','#754c37'],keyboard:['#547176','#253f4a'],books:['#dfc69c','#896a56'],stand:['#8daaa8','#3e5c63'],drawer:['#bd946c','#77533b'],crate:['#d8ad77','#90683f'],plank:['#caa67d','#785b40'],shelf:['#adbfbb','#5a7779']};
    const [top,bottom]=colors[p.kind] || colors.desk;
    if(p.kind==='desk'){round(p.x+12,p.y+p.h-2,15,72,5,'#66817e');round(p.x+p.w-27,p.y+p.h-2,15,72,5,'#66817e');}
    const grad=ctx.createLinearGradient(0,p.y,0,p.y+p.h);grad.addColorStop(0,top);grad.addColorStop(1,bottom);round(p.x,p.y,p.w,p.h,Math.min(5,p.h/2),grad);
    line(p.x+3,p.y+2,p.x+p.w-3,p.y+2,'#ffffff55',1.2);
    if(p.kind==='keyboard') for(let x=p.x+9;x<p.x+p.w-8;x+=14)for(let y=p.y+6;y<p.y+p.h-4;y+=8)round(x,y,10,5,2,'#a1b8b2');
    if(p.kind==='books') for(let y=p.y+8;y<p.y+p.h-2;y+=10)line(p.x+5,y,p.x+p.w-5,y,'#f7e3bb',2);
    if(p.kind==='drawer')round(p.x+p.w/2-11,p.y+12,22,5,3,'#e4c399');
  }
  function decoration(d){
    const {x,y,kind}=d;
    if(kind==='monitor'){round(x,y-150,165,115,9,'#263f49');round(x+6,y-144,153,100,5,'#80a5a1');round(x+12,y-138,141,88,3,'#426a70');line(x+25,y-132,x+65,y-94,'#b5d0c255',6);round(x+73,y-35,20,34,4,'#334e54');}
    else if(kind==='cup'){oval(x+20,y-41,21,7,'#e7e2d0');round(x,y-43,40,43,9,'#d2ded2');oval(x+20,y-42,17,5,'#80563e');ctx.strokeStyle='#d2ded2';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x+40,y-25,10,-1.4,1.4);ctx.stroke();}
    else {round(x,y-8,55,7,4,kind==='pencil'?'#e6bb60':'#5d797b');oval(x+54,y-5,4,3,'#d9d2bb');}
  }
  function player(p,t){
    if(p.invincible>0 && Math.floor(p.invincible*14)%2)return;
    ctx.save();ctx.translate(p.x+p.w/2,p.y);ctx.scale(p.facing,1);
    const stride=p.grounded && Math.abs(p.vx)>20?Math.sin(t*18)*2:0;
    line(-3,20,-4,26+stride,'#263b4b',4);line(4,20,5,26-stride,'#263b4b',4);
    round(-7,9,14,14,5,'#d79b4c');oval(0,6,7,7,'#f5cf8a');round(0,3,8,5,2,'#355b68');
    ctx.save();ctx.translate(3,14);ctx.rotate(Math.atan2(p.aimY,p.aimX*p.facing));round(0,-2,15,5,2,'#b7c9c0');if(p.flash>0)oval(18,0,5,4,'#ffdf79');ctx.restore();ctx.restore();
  }
  function enemy(e,t){if(!e.health)return;const color=e.flash?'#ffe8d4':e.type==='gunner'?'#5d8795':e.type==='flyer'?'#a26c91':'#b66383';oval(e.x+e.w/2,e.y+e.h*.58,e.w*.48,e.h*.42,color);oval(e.x+e.w/2,e.y+e.h*.33,e.w*.38,e.h*.32,color);oval(e.x+(e.direction<0?7:e.w-7),e.y+e.h*.38,2.5,2.5,'#fff4c3');if(e.type==='flyer'){oval(e.x+1,e.y+6,7,3,'#d7a1be');oval(e.x+e.w-1,e.y+6,7,3,'#d7a1be');}else{line(e.x+5,e.y+e.h-3,e.x+3,e.y+e.h,'#493847',4);line(e.x+e.w-5,e.y+e.h-3,e.x+e.w-3,e.y+e.h,'#493847',4);}}
  function dog(b){
    if(!b || ['waiting','defeated'].includes(b.state))return;
    ctx.save();ctx.translate(b.x+b.w/2,b.y);ctx.scale(-b.direction,1);if(b.state==='dying')ctx.globalAlpha=Math.max(0,b.timer/.8);
    const fur=b.flash?'#fff2df':'#bd8357';
    oval(0,32,25,15,'#8b5e43'); oval(0,28,24,14,fur);
    line(-15,36,-17,46,'#77503a',7);line(13,36,15,46,'#77503a',7);
    oval(-17,13,8,16,'#79503a');oval(17,13,8,16,'#79503a');oval(0,15,19,16,fur);
    oval(-7,13,3,3,'#352923');oval(7,13,3,3,'#352923');oval(-6.5,12.3,.8,.8,'white');oval(7.5,12.3,.8,.8,'white');
    oval(0,23,11,8,'#f0d3af');oval(0,20,4,3,'#342521');line(0,23,0,27,'#704737',1);line(-4,28,4,28,'#704737',1);
    ctx.strokeStyle='#ff7900';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,10,19,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
    round(-21,9,6,13,3,'#ff8300');round(15,9,6,13,3,'#ff8300');oval(-17,19,4,4,'#ffae32');oval(17,19,4,4,'#ffae32');
    ctx.restore();
    if(b.speech>0){const x=b.x+b.w/2;round(x-48,b.y-27,96,19,8,'#fff7df');ctx.fillStyle='#503323';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('感谢骡子爹',x,b.y-14);}
  }
  function dropping(d){ctx.save();ctx.translate(d.x,d.y);oval(9,14,9,4,'#754023');oval(9,10,7,5,'#92512b');oval(10,6,5,4,'#a66332');oval(11,3,3,3,'#b77840');oval(7,10,1.2,1.2,'#fff1d2');oval(12,10,1.2,1.2,'#fff1d2');ctx.restore();}
  return function render(game){
    ctx.setTransform(scale,0,0,scale,0,0);background(game.camera);ctx.save();ctx.translate(-game.camera,0);
    for(const d of game.level.decoration) decoration(d);
    for(const p of game.level.platforms) platform(p);
    for(const h of game.level.hazards){round(h.x,h.y,h.w,h.h,5,h.kind==='spill'?'#83552ec9':h.kind==='cable'?'#e3b954':'#a66550');}
    for(const [i,c] of game.level.checkpoints.entries()){line(c.x,c.y-26,c.x,c.y,'#d7e8d4',2);round(c.x,c.y-26,14,9,3,i<=game.checkpoint?'#72e5ad':'#678483');}
    if(!game.level.boss || game.boss?.state==='defeated'){const e=game.level.exit;round(e.x-4,e.y-4,e.w+8,e.h+4,9,'#bbdbc4');round(e.x,e.y,e.w,e.h,7,'#416e68');ctx.fillStyle='#fff7d4';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('出口',e.x+e.w/2,e.y-8);}
    for(const s of game.supplies){if(s.taken)continue;round(s.x,s.y+Math.sin(game.elapsed*5)*2,s.w,s.h,4,s.type==='grenade'?'#e6b36f':s.type?'#83b2d0':'#79caa0');ctx.fillStyle='#fff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(({grenade:'雷',spread:'散',pierce:'穿',rapid:'疾',heavy:'重'})[s.type]||'+',s.x+7,s.y+11);}
    for(const e of game.enemies)enemy(e,game.elapsed);dog(game.boss);
    for(const d of game.droppings) if(!d.destroyed)dropping(d);
    for(const w of game.waves)round(w.x,w.y,w.w,w.h,5,'#ffb762');
    for(const s of game.enemyShots)oval(s.x+3,s.y+3,4,4,'#ff8b62');
    for(const b of game.bullets)oval(b.x+2,b.y+2,3,3,'#ffe895');
    for(const g of game.grenades)oval(g.x+3,g.y+3,4,4,'#e7b260');
    player(game.player,game.elapsed);for(const s of game.sparks)oval(s.x,s.y,1.5,1.5,s.color);ctx.restore();
    const b=game.boss;if(b && !['waiting','defeated'].includes(b.state)){round(210,57,220,18,9,'#172c33dd');round(213,60,214*Math.max(0,b.health)/b.maxHealth,12,6,'#f28b52');ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(game.level.boss.label,320,70);}
  };
}
