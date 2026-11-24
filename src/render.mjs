import { FOOD_ICONS, VIEW, WEAPONS } from './levels.mjs';
import { cableActive } from './game.mjs';
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
  // 骡子的轮廓以脚底为基准，和首领碰撞框共用尺寸。
  const muleArt = {
    tail: new Path2D('M19 48 C9 47 6 54 7 64 Q2 69 6 75 Q13 73 12 65 Q11 56 21 55 Z'),
    body: new Path2D('M17 47 Q25 42 38 46 Q48 47 55 40 L67 38 L71 53 Q70 63 59 67 Q44 71 26 66 Q12 63 12 55 Q12 50 17 47 Z'),
    neck: new Path2D('M45 52 Q54 46 57 31 L70 30 Q79 41 71 56 Q64 63 54 60 Z'),
    mane: new Path2D('M49 52 L51 45 L45 46 L53 37 L49 37 L57 27 L55 24 L64 23 L73 31 L63 39 L55 50 Z'),
    earFar: new Path2D('M71 27 Q72 12 80 5 Q84 3 85 8 Q85 17 77 29 Z'),
    earNear: new Path2D('M61 29 Q53 19 55 7 Q55 2 59 4 Q68 9 69 28 Z'),
    earInner: new Path2D('M62 24 Q56 12 58 8 Q64 12 65 24 Z'),
    head: new Path2D('M61 26 Q66 22 75 24 Q84 27 86 34 L94 39 Q99 42 96 48 Q94 54 84 53 L73 49 Q63 47 59 41 Q56 33 61 26 Z'),
    muzzle: new Path2D('M84 34 Q87 37 94 39 Q99 42 96 48 Q94 53 85 52 Q77 49 78 44 Q79 38 84 34 Z'),
    forelock: new Path2D('M59 30 Q61 22 72 22 Q78 22 82 26 L75 26 L76 29 L68 27 L65 32 L64 29 Z'),
    collar: new Path2D('M53 46 Q59 53 72 51 L69 57 Q60 60 50 52 Z'),
  };

  function player(p, t) {
    ctx.save();
    const character = p.characterId ?? 'minister';
    const stride = p.grounded && Math.abs(p.vx) > 20 ? Math.sin(t * 22) : 0;
    const tucked = p.grounded ? 0 : p.vy < 0 ? 2 : 1;
    ctx.translate(p.x + p.w / 2, p.y);
    ctx.scale(p.facing, 1);
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
    const shirt = character === 'manager' ? '#f5f5ee' : character === 'ma' ? '#c1c9ca' : '#fa8b33';
    round(-4.6, 9.5, 8.5, 7.7, 2.2, shirt);
    if (character === 'manager') {
      for (const [x, y] of [[-4, 10], [0, 10], [-2, 13], [2, 13], [-4, 16], [0, 16]]) {
        round(x, y, 2, 2, 0, '#252b30');
      }
    } else {
      line(-3.1, 11, -2.8, 16, character === 'ma' ? '#e6ebea' : '#f8bd72', 1.1);
    }
    round(-4.3, 15.6, 8.1, 3.3, 1, '#485a67');
    oval(.7, 6.3, 4.2, 4.7, '#dda47c');
    round(-4.4, .5, 9.2, 5.2, 2.5, character === 'minister' ? '#2376cc' : '#403d3b');
    line(-3, 1.6, 2.5, 1.6, character === 'minister' ? '#90d0ff' : '#776e67', 1);
    if (character === 'minister') round(2.5, 4, 5.5, 1.5, .5, '#175ba1');
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
    if (character === 'manager') {
      round(-10.5, 14.5, 6.5, 4, 1.5, '#533930');
      oval(-7.3, 14.5, 3.3, 1.2, '#f0b763');
      line(-8, 11.5, -3, 5.5, '#e9c9a1', 0.8);
      line(-7, 11.5, -2, 5.5, '#e9c9a1', 0.8);
    } else if (character === 'ma') {
      round(-10, 12.5, 4, 6, 1, '#d69a32');
      round(-10, 12, 4, 1.5, .5, '#fff6d8');
      line(-6, 14, -4.8, 16, '#a96b28', .8);
    }
    if (p.health === 1) {
      ctx.save();
      ctx.globalAlpha = 0.2 + 0.22 * (0.5 + 0.5 * Math.sin(t * 3));
      round(-7, 0, 15, 27, 5, '#ff2020');
      ctx.restore();
    }
    ctx.restore();
    if (p.invincible > 0 || p.respawning) {
      const ripple = Math.sin(t * 5) * 0.8;
      oval(p.x + p.w / 2, p.y + p.h / 2, 14 + ripple, 20 - ripple / 2, '#77e8ff30');
      ctx.save();
      ctx.strokeStyle = '#a9f7ffbb'; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, 14 + ripple, 20 - ripple / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function foodItem(food, t) {
    const x = food.x + food.w / 2;
    const y = food.y + food.h / 2 + Math.sin(t * 3 + food.index) * 1.2;
    ctx.save();
    ctx.font = '20px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.fillStyle = '#263a43';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(FOOD_ICONS[food.type] ?? '🍽️', x, y);
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
  function furMarks(coat, head) {
    if (!coat || coat.pattern === 'solid') return;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(head ? 0 : -2, head ? 14 : 32, head ? 16.5 : 22, head ? 14 : 13, 0, 0, Math.PI * 2);
    ctx.clip();
    const y = head ? 14 : 31;
    if (coat.pattern === 'spots') {
      for (const [x, offset, rx, ry] of [[-14,-5,4,4], [-5,5,3,3], [13,-3,5,4], [5,-9,3,3], [13,8,3,2]]) {
        oval(x, y + offset, rx, ry, coat.mark);
      }
    } else if (coat.pattern === 'brindle') {
      for (const x of [-17, -9, 1, 12, 21]) line(x, y - 11, x - 5, y + 2, coat.mark, 3.4);
    } else if (coat.pattern === 'patch') {
      oval(-13, y - 5, 11, 9, coat.mark);
      oval(head ? 15 : 10, y + 9, 9, 6, coat.mark);
    } else if (coat.pattern === 'points') {
      oval(-8, y - 7, 4.5, 2.4, coat.mark);
      oval(8, y - 7, 4.5, 2.4, coat.mark);
      if (!head) oval(6, y + 5, 11, 7, coat.mark);
    } else {
      oval(head ? 0 : -5, y + 8, head ? 12 : 17, 9, coat.mark);
    }
    ctx.restore();
  }

  function dog(b, t, camera){
    if (!b || b.state === 'defeated' || (!b.health && b.state !== 'dying')) return;
    const puppy = Boolean(b.type);
    const intro = b.state === 'intro';
    const dashing = b.state === 'dash' || b.state === 'enter';
    const gait = dashing || b.type === 'patrol' || b.running ? Math.sin(t * (dashing ? 24 : 14)) * 4 : 0;
    const bob = intro ? Math.sin(t * 6) * 1.5 : 0;
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + bob);
    ctx.scale(b.direction * b.w / 64, b.h / 49);
    if (b.state === 'dying') ctx.globalAlpha = Math.min(1, Math.max(0, b.timer / .55));

    if (b.type === 'flyer') {
      const spread = Math.sin(t * 24) * 5;
      oval(-18, 28 + spread, 11, 5, '#2bdee9');
      oval(17, 27 - spread, 11, 5, '#78f3f2');
    }
    const coat = ctx.createLinearGradient(0, 4, 0, 46);
    coat.addColorStop(0, b.flash ? '#fff4dc' : b.coat?.light ?? '#e3a566');
    coat.addColorStop(1, b.coat?.dark ?? '#884a32');
    const ear = b.coat?.dark ?? '#713e2d';
    const tail = -12 + Math.sin(t * (intro ? 14 : 7)) * 4;
    line(-17, 33, -25, 32 + tail * .35, ear, 5);
    line(-25, 32 + tail * .35, -28, 33 + tail * .62, b.coat?.light ?? '#c18154', 4);
    oval(-2, 32, 22, 13, coat);
    furMarks(b.coat, false);
    if (!b.coat) oval(6, 34, 12, 12, '#edc399');
    if (b.type === 'gunner') line(-7, 30, 15, 31, '#226ec9', 4);
    for (const [x, stride] of [[-13, gait], [13, -gait]]) {
      line(x, 35, x + stride, 45, b.coat?.dark ?? '#9b5d40', 7);
      oval(x + stride + 1, 46, 4.7, 2.5, b.coat?.light ?? '#e2a77e');
    }

    ctx.save();
    ctx.translate(2, 0);
    if (intro) ctx.rotate(Math.sin(t * 4) * .14);
    else if (dashing) ctx.rotate(.13);
    // Pendant ears remain visible behind the cheek-mounted transducers.
    oval(-16, 15, 7, 15, ear);
    oval(16, 15, 7, 15, ear);
    oval(-17, 19, 3.5, 9, '#9a5a48');
    oval(16, 19, 3.5, 9, '#9a5a48');
    oval(0, 14, 16.5, 14, coat);
    furMarks(b.coat, true);
    if (!b.coat) oval(0, 12, 4, 7, '#efbf90');
    else {
      oval(-6, 12, 3.4, 3.6, '#f6e1c7');
      oval(6, 12, 3.4, 3.6, '#f6e1c7');
    }
    oval(-6, 12, 2.6, 2.9, '#241b1c');
    oval(6, 12, 2.6, 2.9, '#241b1c');
    oval(-5.5, 11, .8, .8, '#fff1dc');
    oval(6.5, 11, .8, .8, '#fff1dc');
    oval(0, 23, 11, 8, '#f2d0aa');
    if (b.state === 'warnWave' || b.state === 'dying' || b.speech > 0) oval(0, 26, 5, 4, '#502930');
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
    if (puppy) return;
    const speechX = Math.min(camera + W - 100, Math.max(camera + 100, b.x + b.w / 2));
    if (b.state === 'enter' && b.x < camera + W) bubble('骡子爹我来了', speechX, b.y - 10, '#873000', '#fff3d5', '#fb9a51');
    else if (b.state === 'dying') bubble('骡子救我！', speechX, b.y - 8, '#9a242b', '#fff7e3', '#f27551');
    else if (b.speech > 0) bubble('感谢骡子爹', speechX, b.y - 6, '#4a2f1d', '#fff7df', '#cfae7e');
    else if (intro) bubble('看我的橙色耳机！', speechX, b.y - 10, '#873000', '#fff3d5', '#fb9a51');
  }
  function dropping(d){
    const s=(d.w||18)/18;
    ctx.save();ctx.translate(d.x+d.w/2-9*s,d.y+d.h/2-10.5*s);
    // 落地滚动时轻微摇摆，和天上的下落状态区分开。
    if(d.state==='rolling'){ctx.rotate(d.direction*0.16);ctx.translate(0,-1);}
    ctx.scale(s,s);
    oval(9,14,9,4,'#754023');oval(9,10,7,5,'#92512b');oval(10,6,5,4,'#a66332');oval(11,3,3,3,'#b77840');oval(7,10,1.2,1.2,'#fff1d2');oval(12,10,1.2,1.2,'#fff1d2');ctx.restore();}
  function logicWave(wave, t) {
    if (wave.health <= 0) return;
    const cx = wave.x + wave.w / 2;
    ctx.save();
    ctx.translate(cx, wave.y);
    const w = wave.w, h = wave.h;
    const wind = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    wind.addColorStop(0, '#387998aa');
    wind.addColorStop(.5, wave.flash > 0 ? '#fff6cfee' : '#b7f3f5ee');
    wind.addColorStop(1, '#367995bb');
    ctx.beginPath();
    ctx.moveTo(-w * .48, 4);
    ctx.bezierCurveTo(-w * .48, h * .28, -w * .19, h * .55, -w * .10, h - 5);
    ctx.quadraticCurveTo(0, h + 4, w * .1, h - 5);
    ctx.bezierCurveTo(w * .19, h * .55, w * .48, h * .28, w * .48, 4);
    ctx.closePath();
    ctx.fillStyle = wind;
    ctx.fill();
    ctx.strokeStyle = wave.flash > 0 ? '#fff8d2' : '#e5ffff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const y = 7 + i * h * .19;
      const radius = w * (.42 - i * .075);
      const sway = Math.sin(t * 8 + i) * 3;
      ctx.beginPath();
      ctx.ellipse(sway, y, radius, 4, -.12, .1, Math.PI * 1.7);
      ctx.stroke();
    }
    ctx.fillStyle = '#143a53';
    ctx.font = 'bold 13px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('逻辑', 0, h * .38);
    ctx.restore();
  }

  function mule(b, t, camera) {
    if (!b || b.state === 'defeated' || b.state === 'hidden') return;
    const summoning = b.state === 'summon';
    const fallen = b.state === 'dying';
    const attacking = b.state === 'muleAttack';
    const windingUp = b.state === 'muleWindup';
    const walking = ['muleWalk', 'returning'].includes(b.state) || (attacking && b.attack === 'dash');
    const kick = b.attack === 'kick' && attacking;
    const jump = b.attack === 'leap' && attacking;
    const age = fallen ? Math.max(0, 2.25 - b.timer) : 0;
    const knees = Math.min(1, age / .58);
    const slump = Math.min(1, Math.max(0, age - .38) / .42);
    const hit = b.flash > 0;
    const outline = '#202a33';
    const paint = (path, color) => {
      ctx.fillStyle = color;
      ctx.fill(path);
      ctx.strokeStyle = outline;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = 'round';
      ctx.stroke(path);
    };

    ctx.save();
    oval(b.x + b.w / 2, b.cfg.ground - 1, b.w * .45, 3, '#18273240');
    ctx.translate(b.direction < 0 ? b.x + b.w : b.x, b.y + b.h);
    if (fallen) ctx.globalAlpha *= Math.min(1, Math.max(0, b.timer * 3));
    ctx.scale(b.direction * b.w / 100, b.h / 82);
    ctx.translate(0, -82);

    const stride = walking ? Math.sin(t * (attacking ? 24 : 13)) * 9 : 0;
    const crouch = windingUp ? 3 : 0;
    const leg = (x, rear, phase, color) => {
      const push = stride * phase;
      const extension = kick && rear ? 31 : 0;
      const fold = jump ? 10 : 0;
      const jointX = x + push * .4 - extension * .5 + knees * (rear ? 10 : -9);
      const jointY = 69 + knees * 8 - extension * .7 - fold;
      const hoofX = x + push - extension + knees * (rear ? -9 : 17);
      const hoofY = 79 - Math.max(0, push * .6) - extension * .75 - fold;
      line(x, 58 + knees * 14 + crouch, jointX, jointY, outline, 10);
      line(jointX, jointY, hoofX, hoofY, outline, 9);
      line(x, 58 + knees * 14 + crouch, jointX, jointY, color, 7);
      line(jointX, jointY, hoofX, hoofY, color, 5);
      line(hoofX - 3, hoofY, hoofX + 3, hoofY, '#252d36', 5);
    };
    leg(30, true, 1, '#4f5965');
    leg(66, false, -1, '#4f5965');
    leg(22, true, -1, '#727f8a');
    leg(56, false, 1, '#727f8a');
    if (kick) {
      ctx.beginPath();
      ctx.moveTo(-60, 63);
      ctx.quadraticCurveTo(-35, 42, -6, 50);
      ctx.strokeStyle = '#ffe29d';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.translate(42, 54 + 13 * knees + crouch);
    ctx.rotate(.26 * slump - (kick ? .24 : 0) - (jump ? .1 : 0));
    ctx.translate(-42, -54);
    paint(muleArt.tail, '#3d4651');

    const fur = ctx.createLinearGradient(0, 36, 0, 69);
    fur.addColorStop(0, hit ? '#f9c3a7' : '#b4c2cb');
    fur.addColorStop(1, hit ? '#a87070' : '#5a6978');
    paint(muleArt.body, fur);
    paint(muleArt.neck, fur);
    line(21, 52, 39, 53, '#d8e2e685', 1.6);

    ctx.save();
    const nod = fallen ? .28 * slump : summoning ? -.12 : Math.sin(t * 4) * .035;
    ctx.translate(63, 44);
    ctx.rotate(nod);
    ctx.translate(-63, -44);
    paint(muleArt.mane, '#293540');
    paint(muleArt.earFar, '#667481');
    paint(muleArt.earNear, '#8e9ca7');
    ctx.fillStyle = '#bd8b89';
    ctx.fill(muleArt.earInner);
    paint(muleArt.head, hit ? '#ffd2b1' : '#a7b6c0');
    paint(muleArt.muzzle, '#e4d7c9');
    paint(muleArt.forelock, '#293540');
    oval(93, 43, 1.9, 1.4, '#42404a');
    if (summoning || (attacking && b.attack === 'logic')) oval(89, 49, 5.2, 2.6, '#4a3236');
    else line(86, 49, 94, 48, '#75606a', 1.2);

    // 琥珀色圆镜片和粗眉在手机的小画面里也能分辨。
    const eyeY = 34;
    oval(76, eyeY, 6.8, 6.3, '#efd99e');
    if (fallen) line(73, eyeY, 79, eyeY, outline, 1.5);
    else {
      oval(78, eyeY + .4, 2.2, 2.7, '#302833');
      oval(79, eyeY - .5, .8, .8, '#fff8ec');
      line(70, 28, 78, 29.5, outline, 2.3);
    }
    line(62, 33, 69, 34, outline, 1.8);
    line(83, 34, 87, 35, outline, 1.5);
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(76, eyeY, 6.8, 6.3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    paint(muleArt.collar, '#176562');
    round(62, 53, 6, 5, 1, '#efbd61');
    ctx.restore();

    if (summoning) {
      const x = b.x + b.w / 2;
      const y = b.y - 8;
      ctx.save();
      ctx.font = 'bold 36px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#33160a';
      ctx.strokeText('狗来', x, y);
      ctx.fillStyle = '#ffdf6b';
      ctx.fillText('狗来', x, y);
      ctx.restore();
    } else if (b.state === 'intro') {
      const speechX = Math.min(camera + W - 100, Math.max(camera + 100, b.x + b.w / 2));
      bubble('我给你讲讲这个逻辑', speechX, b.y - 10, '#4a2f1d', '#fff7df', '#cfae7e');
    } else if (windingUp) {
      const labels = { dash: '冲刺', kick: '后踢', logic: '逻辑', leap: '起跳', manure: '当心落物' };
      ctx.save();
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      round(b.x + b.w / 2 - 35, b.y - 23, 70, 18, 6, '#513421');
      ctx.fillStyle = '#ffe5a0';
      ctx.fillText(labels[b.attack], b.x + b.w / 2, b.y - 10);
      ctx.restore();
    }
  }

  // 小型医疗包：白盒 + 红十字 + 提手。
  function medkit(x, y) {
    oval(x, y + 11, 20, 14, '#56deb255');
    round(x - 6, y - 5, 12, 6, 2, '#9fb9ac');
    round(x - 15, y, 30, 22, 5, '#f7fbf7');
    round(x - 13, y + 2, 26, 18, 4, '#eef6f0');
    ctx.strokeStyle = '#2f6f5a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(x - 15, y, 30, 22, 5);
    ctx.stroke();
    round(x - 2.5, y + 4, 5, 14, 1.6, '#e04b52');
    round(x - 7, y + 8.5, 15, 5, 1.6, '#e04b52');
  }

  function ammoBox(x, y) {
    oval(x, y + 11, 21, 14, '#ffcf6e55');
    round(x - 15, y, 30, 22, 4, '#2f3a2a');
    round(x - 13, y + 2, 26, 18, 3, '#8fae6a');
    for (let i = -7; i <= 3; i += 5) round(x + i, y + 4, 3.4, 9, 1.4, '#f2d071');
    ctx.fillStyle = '#20301c';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('弹药', x + 2, y + 17);
  }

  // 穿黑西装的「好人」：无敌、没有碰撞体积，只负责送补给。
  function helperNpc(h, t) {
    const bob = Math.sin(t * 6) * 1.1;
    ctx.save();
    ctx.translate(Math.round(h.x + h.w / 2), Math.round(h.y));
    ctx.scale(h.facing, 1);
    line(-3, 20, -4, 26, '#1b2027', 4);
    line(3, 20, 4, 26, '#1b2027', 4);
    round(-7, 8, 14, 14, 3, '#1e2530');
    round(-2.4, 9, 4.8, 11, 1, '#f2f5f7');
    line(0, 11, 0, 19, '#8f1f2a', 2.2);
    oval(0, 3 + bob, 4.6, 4.8, '#e8bd96');
    round(-4.8, -1.5 + bob, 9.6, 3.8, 1.6, '#20262e');
    round(6.5, 16, 9, 7, 1.5, '#3b2a1f');
    line(8.5, 16, 13.5, 16, '#c9a26a', 1);
    ctx.restore();
  }

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
    const cameraY = game.cameraY ?? 0;
    office.background(game.camera, cameraY, game.level);
    ctx.save();
    ctx.translate(-Math.round(game.camera), -Math.round(cameraY));
    office.gaps(game.level, game.camera);
    for (const d of game.level.decoration) if (office.visible(d, game.camera, cameraY)) office.decoration(d, game.camera);
    for (const ladder of game.level.ladders ?? []) {
      if (!office.visible(ladder, game.camera, cameraY)) continue;
      const { x, y, w, h } = ladder;
      line(x + 3, y, x + 3, y + h, '#674b38', 4);
      line(x + w - 3, y, x + w - 3, y + h, '#674b38', 4);
      for (let rung = y + 8; rung < y + h; rung += 12) line(x + 3, rung, x + w - 3, rung, '#e4c68a', 3);
    }
    for (const platform of game.platforms) {
      if (!office.visible(platform, game.camera, cameraY)) continue;
      ctx.save();
      // 攀爬关的平台可从下方穿过，用半透明的家具提示这一点。
      if (game.level.height > H && platform.oneway) ctx.globalAlpha = .76;
      office.platform(platform, game.camera);
      if (platform.motion) {
        ctx.fillStyle = '#fff4c6';
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('↔', platform.x + platform.w / 2, platform.y + Math.min(platform.h - 2, 15));
      }
      ctx.restore();
    }
    const arena = game.boss?.cfg;
    if (arena?.framedArena && !['waiting', 'defeated'].includes(game.boss.state)) {
      const { arenaLeft, arenaRight, ground } = arena;
      const top = cameraY + 82;
      for (const x of [arenaLeft, arenaRight]) {
        round(x - 4, top, 8, ground - top, 3, '#304a52cc');
        line(x, top + 4, x, ground - 2, '#ffd77f', 2);
        for (let y = top + 14; y < ground - 9; y += 23) line(x - 4, y + 4, x + 4, y - 4, '#ffd77f', 2);
        round(x - 8, ground - 7, 16, 7, 2, '#304a52');
      }
      line(arenaLeft, top, arenaRight, top, '#ffda8788', 1);
    }
    // A soft ground shadow shows where the player is lined up to land.
    const p = game.player;
    const center = p.x + p.w / 2;
    const support = game.platforms
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
    for (const h of game.hazards) {
      if (h.destroyed || !office.visible(h, game.camera, cameraY)) continue;
      if (h.kind === 'spill') {
        oval(h.x + h.w / 2, h.y + h.h - 3, h.w / 2, 6, '#774735');
        line(h.x + 8, h.y + h.h - 7, h.x + h.w - 8, h.y + h.h - 7, '#e9bb87', 2);
      } else if (h.kind === 'crumb') {
        for (let x = h.x + 4; x < h.x + h.w; x += 13) oval(x, h.y + h.h - 4, 6, 4, '#b88143');
      } else {
        line(h.x, h.y + h.h - 4, h.x + h.w, h.y + h.h - 4, '#334e5b', 5);
        if (cableActive(game.elapsed)) {
          for (let x = h.x + 8; x < h.x + h.w; x += 24) {
            line(x, h.y + 8, x + 5, h.y + 2, '#fff179', 2);
            line(x + 5, h.y + 2, x + 2, h.y + 10, '#83e9ff', 2);
          }
        }
      }
    }
    const firstPlatform = game.platforms.find(platform => platform.oneway);
    if ((game.level.height ?? 360) <= 360 && firstPlatform && game.player.x < firstPlatform.x + firstPlatform.w && office.visible(firstPlatform, game.camera, cameraY)) {
      const x = firstPlatform.x + firstPlatform.w / 2;
      const y = firstPlatform.y + 27 + Math.sin(game.elapsed * 4) * 3;
      round(x - 12, y - 12, 24, 23, 9, '#124958');
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.font = 'bold 20px sans-serif';
      ctx.fillText('↑', x, y + 6);
    }
    // 纵向关卡的攀爬指引：给「下一级够得着的平台」画箭头（落差 ≤ 100、水平距离 ≤ 230）。
    let guide = null;
    let guideScore = Infinity;
    const feet = game.player.y + game.player.h;
    for (const platform of game.platforms) {
      if (!platform.arrow) continue;
      const dy = feet - platform.y;
      if (dy <= 0 || dy > 100) continue;
      const dx = Math.max(0, platform.x - (game.player.x + game.player.w), game.player.x - (platform.x + platform.w));
      if (dx > 230) continue;
      const score = dy * 2 + dx;
      if (score < guideScore) { guideScore = score; guide = platform; }
    }
    if (guide) {
      let ax = guide.x + guide.w / 2;
      const ay = guide.y - 16 + Math.sin(game.elapsed * 4) * 3;
      let glyph = '↑';
      if (ax < game.camera + 18) { ax = game.camera + 18; glyph = '←'; }
      else if (ax > game.camera + W - 18) { ax = game.camera + W - 18; glyph = '→'; }
      round(ax - 11, ay - 11, 22, 21, 8, '#124958');
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(glyph, ax, ay + 6);
    }
    if(game.bosses.every(boss=>boss.state==='defeated')){const e=game.level.exit;round(e.x-4,e.y-4,e.w+8,e.h+4,9,'#bbdbc4');round(e.x,e.y,e.w,e.h,7,'#416e68');ctx.fillStyle='#fff7d4';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('出口',e.x+e.w/2,e.y-8);}
    for (const s of game.supplies) {
      if (s.taken || !office.visible(s, game.camera, cameraY)) continue;
      const x = s.x + s.w / 2;
      const y = s.y + Math.sin(game.elapsed * 5 + s.x * .04) * 1.7;
      if (!s.type) { medkit(x, y); continue; }
      if (s.type === 'ammo') { ammoBox(x, y); continue; }
      const color = s.type === 'grenade' ? '#ffb831' : WEAPONS[s.type]?.color ?? '#56deb2';
      oval(x, y + 11, 23, 16, color + '55');
      round(x - 18, y - 1, 36, 24, 7, '#173e53');
      round(x - 16, y + 1, 32, 19, 6, color);
      line(x - 10, y + 3, x + 10, y + 3, '#ffffffa8', 1.1);
      ctx.fillStyle = '#192d45';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(({grenade:'炸弹',spread:'霰弹',pierce:'穿透',rapid:'疾射',heavy:'重击'})[s.type] ?? '', x, y + 15);
    }
    for (const food of game.food) {
      if (!food.taken && office.visible(food, game.camera, cameraY)) foodItem(food, game.elapsed);
    }
    for (const e of game.enemies) if (office.visible(e, game.camera, cameraY)) dog(e, game.elapsed);
    if (game.boss?.kind === 'mule') mule(game.boss, game.elapsed, game.camera);
    else dog(game.boss, game.elapsed, game.camera);
    if (game.helper) {
      helperNpc(game.helper, game.elapsed);
      if (game.helper.speech > 0) {
        const x = Math.min(game.camera + W - 75, Math.max(game.camera + 75, game.helper.x + game.helper.w / 2));
        bubble('我是好人', x, game.helper.y - 8, '#245346', '#fff9e6', '#75b9a0');
      }
    }
    for(const d of game.droppings) if(!d.destroyed)dropping(d);
    for(const w of game.waves) w.kind === 'logic' ? logicWave(w, game.elapsed) : headphone(w,game.elapsed);
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
      const variant = boss.coat?.name ? ` · ${boss.coat.name}` : '';
      ctx.fillText(`${boss.label}${variant}${boss.total > 1 ? ` · ${boss.number}/${boss.total}` : ''}`, 320, 69.5);
    }
  };
}
