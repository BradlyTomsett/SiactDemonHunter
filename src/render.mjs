import { VIEW, WEAPONS } from './levels.mjs';
import { createOfficeArt } from './office-art.mjs';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const { width: W, height: H } = VIEW;
  const scale = 3;
  canvas.width = W * scale; canvas.height = H * scale;
  const round = (x,y,w,h,r,color) => { ctx.fillStyle=color; ctx.beginPath(); ctx.roundRect(x,y,w,h,Math.max(0,Math.min(r,w/2,h/2))); ctx.fill(); };
  const oval = (x,y,rx,ry,color) => { ctx.fillStyle=color; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill(); };
  const line = (x1,y1,x2,y2,color,width=1) => { ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineCap='round'; ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke(); };
  const office = createOfficeArt(ctx, { round, oval, line });
  const headphoneBand = new Path2D('M-9 3 C-12 -12 12 -12 9 3');

  function player(p, t) {
    ctx.save();
    const stride = p.grounded && Math.abs(p.vx) > 20 ? Math.sin(t * 22) : 0;
    const tucked = p.grounded ? 0 : p.vy < 0 ? 2 : 1;
    ctx.translate(p.x + p.w / 2, p.y);
    ctx.scale(p.facing, 1);
    if (p.invincible > 0 && Math.floor(p.invincible * 14) % 2) ctx.globalAlpha = .55;
    const leg = (x, gait, color) => {
      const foot = x + gait * 4;
      const ankle = 25 - tucked - Math.max(0, gait) * 1.5;
      line(x, 18, foot - gait, 22 - tucked, color, 3.3);
      line(foot - gait, 22 - tucked, foot, ankle, color, 3);
      line(foot - 1, ankle, foot + 2, ankle, '#172532', 3.1);
      line(foot - .5, ankle + .8, foot + 2, ankle + .8, '#e0d4bd', .7);
    };
    leg(-2.7, -stride, '#283944');
    leg(2.2, stride, '#4f6471');
    round(-7.6, 9, 4.7, 10, 1.5, '#283c47');
    round(-5.7, 9, 10.9, 10.5, 2.7, '#283846');
    round(-4.6, 9.5, 8.5, 7.7, 2.2, '#fa8b33');
    line(-3.1, 11, -2.8, 16, '#f8bd72', 1.1);
    round(-4.3, 15.6, 8.1, 3.3, 1, '#485a67');
    oval(.7, 6.3, 4.2, 4.7, '#dda47c');
    round(-4.4, .5, 9.2, 5.2, 2.5, '#df9a46');
    line(-3, 1.6, 2.5, 1.6, '#ffda8e', 1);
    round(1.3, 4.5, 4.4, 2.4, 1, '#344652');
    oval(2.7, 7.8, 1.5, .8, '#f0b88b');

    ctx.save();
    ctx.translate(1, 12.6);
    ctx.rotate(Math.atan2(p.aimY, p.aimX * p.facing));
    line(-2, 1.5, 5, 2, '#c17b49', 3.4);
    oval(6, 2, 2.1, 1.7, '#e5b290');
    round(4, -1.7, 8, 3.7, 1, '#273440');
    round(6, -1.8, 6, 1, .4, '#abbac2');
    if (p.flash > 0) {
      oval(15.5, 0, 4.4, 2.5, p.flashColor ?? '#ffab42');
      oval(14.2, 0, 2.7, 1, '#fff4aa');
    }
    ctx.restore();
    ctx.restore();
  }
  // 台词气泡：20px 粗体（原来 10px），带描边、投影和小尾巴，明显突出
  function bubble(text,cx,baseY,fg,bg,border){
    ctx.font='bold 20px sans-serif';
    const w=ctx.measureText(text).width+30, h=36, x=cx-w/2, y=baseY-h;
    round(x+2,y+4,w,h,11,'#00000055');
    round(x,y,w,h,11,bg);
    ctx.strokeStyle=border;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,11);ctx.stroke();
    ctx.fillStyle=bg;ctx.beginPath();ctx.moveTo(cx-8,y+h-1);ctx.lineTo(cx+8,y+h-1);ctx.lineTo(cx,y+h+10);ctx.closePath();ctx.fill();
    ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(text,cx,y+h/2+1);
    ctx.textBaseline='alphabetic';
  }
  function dog(b, t){
    if (!b || b.state === 'waiting' || b.state === 'defeated' || (!b.health && b.state !== 'dying')) return;
    const puppy = Boolean(b.type);
    const intro = b.state === 'intro';
    const dashing = b.state === 'dash';
    const gait = dashing || b.type === 'patrol' ? Math.sin(t * (dashing ? 24 : 14)) * 4 : 0;
    const bob = intro ? Math.sin(t * 6) * 1.5 : 0;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + bob);
    ctx.scale(b.direction * b.w / 64, b.h / 49);
    if (b.state === 'dying') ctx.globalAlpha = Math.max(0, b.timer / .8);

    if (b.type === 'flyer') {
      const spread = Math.sin(t * 24) * 5;
      oval(-18, 28 + spread, 11, 5, '#2bdee9');
      oval(17, 27 - spread, 11, 5, '#78f3f2');
    }
    const coat = ctx.createLinearGradient(0, 4, 0, 46);
    coat.addColorStop(0, b.flash ? '#fff4dc' : '#e3a566');
    coat.addColorStop(1, '#884a32');
    const tail = -12 + Math.sin(t * (intro ? 14 : 7)) * 4;
    line(-17, 33, -25, 32 + tail * .35, '#75412d', 5);
    line(-25, 32 + tail * .35, -28, 33 + tail * .62, '#c18154', 4);
    oval(-2, 32, 22, 13, coat);
    oval(6, 34, 12, 12, '#edc399');
    if (b.type === 'gunner') line(-7, 30, 15, 31, '#226ec9', 4);
    for (const [x, stride] of [[-13, gait], [13, -gait]]) {
      line(x, 35, x + stride, 45, '#9b5d40', 7);
      oval(x + stride + 1, 46, 4.7, 2.5, '#e2a77e');
    }

    ctx.save();
    ctx.translate(2, 0);
    if (intro) ctx.rotate(Math.sin(t * 4) * .14);
    else if (dashing) ctx.rotate(.13);
    // Pendant ears remain visible behind the cheek-mounted transducers.
    oval(-16, 15, 7, 15, '#713e2d');
    oval(16, 15, 7, 15, '#713e2d');
    oval(-17, 19, 3.5, 9, '#9a5a48');
    oval(16, 19, 3.5, 9, '#9a5a48');
    oval(0, 14, 16.5, 14, coat);
    oval(0, 12, 4, 7, '#efbf90');
    oval(-6, 12, 2.6, 2.9, '#241b1c');
    oval(6, 12, 2.6, 2.9, '#241b1c');
    oval(-5.5, 11, .8, .8, '#fff1dc');
    oval(6.5, 11, .8, .8, '#fff1dc');
    oval(0, 23, 11, 8, '#f2d0aa');
    if (b.state === 'warnWave' || b.speech > 0) oval(0, 26, 5, 4, '#502930');
    oval(0, 20, 4.6, 3.4, '#241c20');
    oval(1, 19, 1.6, .8, '#a2938a');
    line(0, 22, 0, 25, '#754d3d', 1);

    ctx.strokeStyle = b.tell > 0 ? '#ffbc24' : '#ff6d13';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-21, 12);
    ctx.bezierCurveTo(-23, -3, 23, -3, 21, 12);
    ctx.stroke();
    for (const side of [-1, 1]) {
      line(side * 20, 11, side * 18, 19, '#fe7b1c', 4);
      oval(side * 17, 19, 4.4, 3.7, b.tell > 0 ? '#fff075' : '#ff8e21');
      oval(side * 17, 18, 2.1, .9, '#ffe6a8');
    }
    ctx.restore();
    if (intro) {
      const reach = 2 + Math.sin(t * 6) * 2;
      line(13, 34, 19, 24 + reach, '#a76947', 6);
      oval(19, 23 + reach, 4, 3, '#e5ad7c');
      line(25, 3, 28, -1, '#fff3a0', 2);
      line(28, 10, 32, 8, '#ffb229', 2);
    }
    if (b.state === 'warnLeap') line(-29, -8, 29, -8, '#ffdd73', 2);
    if (b.tell > 0) {
      oval(0, -6, 5, 5, '#cf451d');
      line(0, -8.5, 0, -6, '#fff9df', 1.5);
      oval(0, -3.7, .8, .8, '#fff9df');
    }
    ctx.restore();
    if (!puppy && b.state==='intro' && b.speech<=0)bubble('看我的橙色耳机！',b.x+b.w/2,b.y-10,'#873000','#fff3d5','#fb9a51');
    if(b.speech>0)bubble('感谢骡子爹',b.x+b.w/2,b.y-6,'#4a2f1d','#fff7df','#cfae7e');
  }
  function dropping(d){
    const s=(d.w||18)/18;
    ctx.save();ctx.translate(d.x+d.w/2-9*s,d.y+d.h/2-10.5*s);ctx.scale(s,s);
    oval(9,14,9,4,'#754023');oval(9,10,7,5,'#92512b');oval(10,6,5,4,'#a66332');oval(11,3,3,3,'#b77840');oval(7,10,1.2,1.2,'#fff1d2');oval(12,10,1.2,1.2,'#fff1d2');ctx.restore();}
  function headphone(shot, t) {
    if (shot.health <= 0) return;
    ctx.save();
    ctx.translate(shot.x + shot.w / 2, shot.y + shot.h / 2);
    ctx.rotate(Math.sin(t * 15) * .18);
    ctx.scale(shot.w / 22, shot.h / 24);
    ctx.strokeStyle = '#9a3917';
    ctx.lineWidth = 5;
    ctx.stroke(headphoneBand);
    ctx.strokeStyle = shot.flash > 0 ? '#fff7bd' : '#ff8423';
    ctx.lineWidth = 3;
    ctx.stroke(headphoneBand);
    for (const side of [-1, 1]) {
      oval(side * 8, 4, 3.5, 4.3, '#9b351a');
      oval(side * 8, 3, 2.5, 3.1, '#ff9a29');
      oval(side * 8, 2, 1.1, .8, '#fff0a2');
    }
    ctx.restore();
  }

  function projectile(bullet) {
    ctx.save();
    ctx.translate(bullet.x + bullet.w / 2, bullet.y + bullet.h / 2);
    ctx.rotate(Math.atan2(bullet.vy, bullet.vx));
    const color = WEAPONS[bullet.kind]?.color ?? WEAPONS.basic.color;
    if (bullet.kind === 'spread') {
      line(-9, 0, 0, 0, '#bf2057', 3.5);
      oval(0, 0, 3.4, 2.4, color);
      oval(1, 0, 1.5, 1.1, '#fff4e1');
    } else if (bullet.kind === 'pierce') {
      line(-22, 0, 4, 0, '#075481', 4.5);
      line(-21, 0, 4, 0, color, 2.5);
      line(-6, 0, 5, 0, '#ebffff', 1.3);
    } else if (bullet.kind === 'rapid') {
      line(-10, 0, 2, 0, '#43620c', 3.8);
      line(-9, 0, 2, 0, color, 2);
      line(-5, 2.7, -1, 2.7, '#b8ed65', 1.2);
    } else if (bullet.kind === 'heavy') {
      line(-16, 0, -4, 0, '#7130b9', 5);
      oval(0, 0, 6.3, 4.8, '#4e2284');
      oval(0, 0, 4.7, 3.5, color);
      oval(2, -.4, 2, 1.8, '#fff3fb');
    } else {
      oval(0, 0, 3.4, 2.4, '#874b16');
      oval(.5, 0, 2.4, 1.4, color);
    }
    ctx.restore();
  }

  function grenade(item, t) {
    ctx.save();
    ctx.translate(item.x + item.w / 2, item.y + item.h / 2);
    ctx.rotate(item.spin);
    round(-6, -6, 12, 13, 4, '#317a67');
    round(-5, -5, 10, 10, 3, '#82ba81');
    for (let y = -3; y <= 5; y += 3) line(-4.5, y, 4.5, y, '#285848', 1.35);
    line(-.5, -4.5, -.5, 5, '#234c40', 1.15);
    round(-2, -8, 5, 3.5, 1, '#263a48');
    oval(2.1, -6.7, 1.6, 1.5, Math.sin(t * 40) > 0 ? '#ff6641' : '#ffe375');
    ctx.restore();
  }

  function explosion(blast) {
    const progress = 1 - blast.life / .36;
    const radius = Math.max(4, blast.radius * Math.sqrt(progress));
    ctx.save();
    ctx.globalAlpha = (1 - progress) * .65;
    oval(blast.x, blast.y, radius, radius, '#ffb946');
    ctx.strokeStyle = '#ff7338';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(blast.x, blast.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    oval(blast.x, blast.y, radius * .5, radius * .5, '#fff5bc');
    ctx.restore();
  }
  return function render(game){
    ctx.setTransform(scale,0,0,scale,0,0);
    office.background(game.camera, game.level);
    ctx.save();
    ctx.translate(-game.camera,0);
    office.gaps(game.level, game.camera);
    for (const d of game.level.decoration) if (office.visible(d, game.camera)) office.decoration(d, game.camera);
    for (const p of game.level.platforms) if (office.visible(p, game.camera)) office.platform(p, game.camera);
    // A soft ground shadow shows where the player is lined up to land.
    const p = game.player;
    const center = p.x + p.w / 2;
    const support = game.level.platforms
      .filter(surface => center >= surface.x && center <= surface.x + surface.w && p.y + p.h <= surface.y + 1)
      .reduce((closest, surface) => !closest || surface.y < closest.y ? surface : closest, null);
    if (support) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(support.x, support.y, support.w, support.h);
      ctx.clip();
      const height = Math.max(0, support.y - p.y - p.h);
      ctx.globalAlpha = .52 * (1 - Math.min(.85, height / 140));
      oval(center, support.y + 3, 8 + height * .036, 2.8, '#1a2229');
      ctx.restore();
    }
    for(const h of game.level.hazards){
      if (!office.visible(h, game.camera)) continue;
      // 亮色警示边界与条纹均处于实际碰撞范围内。
      round(h.x,h.y,h.w,h.h,3,'#9d2024');
      ctx.save();ctx.beginPath();ctx.rect(h.x,h.y,h.w,h.h);ctx.clip();
      for(let x=h.x-h.h;x<h.x+h.w;x+=14){ctx.fillStyle='#ffd846';ctx.beginPath();ctx.moveTo(x,h.y+h.h);ctx.lineTo(x+8,h.y+h.h);ctx.lineTo(x+8+h.h,h.y);ctx.lineTo(x+h.h,h.y);ctx.closePath();ctx.fill();}
      ctx.restore();
      line(h.x,h.y,h.x+h.w,h.y,'#fff19b',2);
      const cx=h.x+h.w/2; oval(cx,h.y+7,6,6,'#9d2024');ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 10px sans-serif';ctx.fillText('!',cx,h.y+10);
    }
    for(const [i,c] of game.level.checkpoints.entries()){line(c.x,c.y-26,c.x,c.y,'#d7e8d4',2);round(c.x,c.y-26,14,9,3,i<=game.checkpoint?'#72e5ad':'#678483');}
    if(!game.level.boss || game.boss?.state==='defeated'){const e=game.level.exit;round(e.x-4,e.y-4,e.w+8,e.h+4,9,'#bbdbc4');round(e.x,e.y,e.w,e.h,7,'#416e68');ctx.fillStyle='#fff7d4';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('出口',e.x+e.w/2,e.y-8);}
    for (const s of game.supplies) {
      if (s.taken || !office.visible(s, game.camera)) continue;
      const y = s.y + Math.sin(game.elapsed * 5) * 2;
      const color = s.type === 'grenade' ? '#ffc454' : WEAPONS[s.type]?.color ?? '#64ddb4';
      round(s.x - 1, y - 1, s.w + 2, s.h + 2, 5, '#27464f');
      round(s.x, y, s.w, s.h, 4, color);
      ctx.fillStyle = '#192d45';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(({grenade:'雷',spread:'散',pierce:'穿',rapid:'疾',heavy:'重'})[s.type] ?? '+', s.x + 7, y + 10.5);
    }
    for (const e of game.enemies) if (office.visible(e, game.camera)) dog(e, game.elapsed);
    dog(game.boss,game.elapsed);
    for(const d of game.droppings) if(!d.destroyed)dropping(d);
    for(const w of game.waves) headphone(w,game.elapsed);
    for(const s of game.enemyShots) headphone(s,game.elapsed);
    for(const b of game.bullets) projectile(b);
    for(const g of game.grenades) grenade(g,game.elapsed);
    for(const blast of game.blasts) explosion(blast);
    player(game.player,game.elapsed);for(const s of game.sparks)oval(s.x,s.y,1.5,1.5,s.color);ctx.restore();
    const boss = game.boss;
    if (boss && !['waiting', 'defeated'].includes(boss.state)) {
      round(208, 56, 224, 20, 10, '#963827');
      round(210, 58, 220, 16, 8, '#ffe1c7');
      round(212, 60, 216 * boss.health / boss.maxHealth, 12, 6, '#ff9561');
      ctx.fillStyle = '#5c2525';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(game.level.boss.label, 320, 69.5);
    }
  };
}
