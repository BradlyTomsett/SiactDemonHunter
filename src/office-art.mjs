import { GROUND, VIEW } from './levels.mjs';

const { width: W, height: H } = VIEW;
const BASES = new Set(['desk', 'floor', 'monitorTop', 'printerTop']);
const MATERIALS = {
  desk: ['#ffd28a', '#e6a14e', '#ad5d2a'],
  floor: ['#f7eee0', '#cdbdb0', '#928789'],
  monitorTop: ['#747f89', '#2e3847', '#131923'],
  printerTop: ['#faf9ef', '#c5cdd1', '#667781'],
  keyboard: ['#555c68', '#292f3c', '#171921'],
  books: ['#ba4835', '#eddbb1', '#963e2f'],
  stand: ['#aeb9c1', '#677883', '#394751'],
  drawer: ['#dabb8c', '#a67950', '#62412e'],
  crate: ['#e3bc83', '#bc8952', '#805730'],
  plank: ['#efdcb9', '#b48d5b', '#69482e'],
  shelf: ['#a3afb4', '#71818a', '#3d4b56'],
  worktop: ['#f4ce95', '#d99c59', '#896241'],
  clipboard: ['#f7e5b2', '#bf9968', '#6c5546'],
  tray: ['#bdecea', '#72bac2', '#417d8e'],
  cargoLift: ['#ecdd94', '#a7894e', '#4d655f'],
};

export function createOfficeArt(ctx, { round, oval, line }) {
  const gapsByLevel = new WeakMap();
  const fill = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  function gradient(y, h, ...colors) {
    const paint = ctx.createLinearGradient(0, y, 0, y + h);
    colors.forEach((color, i) => paint.addColorStop(i / (colors.length - 1), color));
    return paint;
  }
  function visible(item, camera, cameraY = 0, margin = 6) {
    const x = item.x;
    const y = item.y ?? 0;
    const w = item.w ?? 180;
    const h = item.h ?? 60;
    return x + w >= camera - margin && x <= camera + W + margin
      && y + h >= cameraY - margin && y <= cameraY + H + margin;
  }

  function gardenWindow(camera, cameraY) {
    fill(0, 0, W, H, gradient(0, H, '#edf8dd', '#c5dfbe', '#7db5a7'));
    const first = -(camera * .31 % 370);
    const row = -(cameraY * .29 % 275);
    for (let x = first - 370; x < W; x += 370) {
      fill(x + 19, 0, 11, H, '#7ea39a88');
      fill(x + 25, 0, 3, H, '#e8f6d8');
      for (let y = row - 275; y < H + 180; y += 275) {
        line(x + 26, y + 110, x + 144, y + 30, '#75a99290', 4);
        oval(x + 127, y + 70, 81, 27, '#71a48767');
        oval(x + 202, y + 37, 69, 22, '#8cbc8986');
        oval(x + 75, y + 122, 57, 22, '#51947766');
        fill(x + 25, y + 170, 351, 3, '#f4ffe4aa');
      }
    }
  }

  function cargoShaft(camera, cameraY, level) {
    fill(0, 0, W, H, gradient(0, H, '#354452', '#344955', '#202e39'));
    const row = -(cameraY * .52 % 128);
    const offset = -(camera * .32 % 212);
    for (let x = offset - 212; x < W; x += 212) {
      fill(x, 0, 16, H, '#192a36');
      fill(x + 16, 0, 3, H, '#718893');
      for (let y = row - 128; y < H + 128; y += 128) {
        fill(x + 29, y + 31, 168, 10, '#192a36');
        fill(x + 34, y + 34, 45, 3, '#829d9e');
        for (let vent = 0; vent < 4; vent++) fill(x + 130, y + 67 + vent * 6, 56, 2, '#263a47');
      }
    }
    if (cameraY > level.spawn.y - H) {
      fill(0, 68, W, 16, '#a64d50');
      fill(0, 66, W, 3, '#d08371');
    }
  }

  function background(camera, cameraY = 0, level) {
    if (level.id === 'tower') {
      gardenWindow(camera, cameraY);
      return;
    }
    if (level.id === 'shaft') {
      cargoShaft(camera, cameraY, level);
      return;
    }
    fill(0, 0, W, H, gradient(0, H, '#edfef8', '#c0e8dd', '#88cebd', '#54a9ab'));
    // 远处的巨大显示器和隔板只作为背景，留出清楚的跳跃轮廓。
    ctx.save();
    ctx.globalAlpha = 0.28;
    const towers = -(camera * 0.09 % 420);
    for (let x = towers - 420; x < W; x += 420) {
      round(x + 52, 16, 180, 122, 8, '#4d6979');
      round(x + 59, 23, 166, 108, 4, '#c4e1de');
      fill(x + 75, 39, 100, 3, '#78a7a6');
      fill(x + 75, 49, 124, 3, '#90b7b0');
      fill(x + 75, 59, 82, 3, '#90b7b0');
      fill(x + 134, 138, 16, 37, '#6d8687');
    }
    ctx.restore();
    const ceiling = -(camera * .12 % 180);
    for (let x = ceiling - 180; x < W + 180; x += 180) {
      line(x, 0, x + 45, 70, '#b4bec2', 1);
      round(x + 28, 27, 100, 12, 2, '#aebabe');
      fill(x + 34, 30, 88, 4, '#faf9e9');
    }
    line(0, 67, W, 67, '#a8b4b9', 2);

    // 上方的叶片随视差缓慢移动，让玩家感到自己身处大型办公家具之间。
    ctx.save();
    ctx.globalAlpha = 0.34;
    const foliage = -(camera * 0.16 % 370);
    for (let x = foliage - 370; x < W; x += 370) {
      line(x + 324, 4, x + 292, 80, '#44755c', 3);
      oval(x + 304, 37, 28, 9, '#4b946b');
      oval(x + 280, 68, 25, 8, '#70aa78');
      oval(x + 333, 55, 23, 8, '#559f72');
    }
    ctx.restore();

    const partition = -(camera * .25 % 260);
    for (let x = partition - 260; x < W; x += 260) {
      fill(x + 12, 77, 46, 103, '#74676b');
      fill(x + 15, 81, 40, 99, '#b49484');
      fill(x + 66, 79, 182, 63, gradient(79, 63, '#86c4b5', '#a8ddd1'));
      for (let y = 86; y < 142; y += 7) fill(x + 69, y, 176, 2, '#d0dad580');
      fill(x, 138, 256, 46, '#aebbbdcc');
      for (let y = 145; y < 180; y += 7) fill(x, y, 256, 2, '#e2e9e0b0');
      fill(x, 184, 256, 15, '#e35743');
      fill(x, 135, 3, 65, '#d9ded7');

      if (level.id === 'floor') {
        round(x + 31, 164, 96, 15, 3, '#b2a187');
        fill(x + 38, 179, 9, 58, '#7d898c');
        fill(x + 109, 179, 9, 58, '#7d898c');
      }
      round(x + 181, 160, 19, 24, 4, '#c2c7bc');
      for (const [dx, dy, rx, ry] of [[-8, -10, 10, 5], [9, -16, 12, 6], [-3, -22, 7, 11], [9, -5, 9, 4]]) {
        oval(x + 191 + dx, 160 + dy, rx, ry, '#30865a');
      }
    }
    // The part behind the jumping path has no sharp horizontal features.
    fill(0, 164, W, H - 164, gradient(164, 135, '#c9f0e400', '#b9e9ddec', '#9ad3ca'));
    const region = level.regions?.find(item => camera + W / 2 >= item.x && camera + W / 2 < item.end);
    const tint = {
      ch1: '#f4ad6120', ch2: '#b58b5628', ch3: '#427ed133',
      ch4: '#ae653530', ch5: '#92605a30', floor: '#478a6630',
      monitor: '#2679d66b', printer: '#ffd89270', ch6: '#1a243d99',
    }[region?.theme];
    if (tint) fill(0, 0, W, H, tint);
  }

  function gaps(level, camera, cameraY) {
    if (level.id === 'tower') return;
    let gaps = gapsByLevel.get(level);
    if (!gaps) {
      const bases = level.platforms.filter(item => level.id === 'shaft' ? item.kind === 'floor'
        : BASES.has(item.kind) || (!item.oneway && (item.kind === 'slope' || item.kind === 'worktop')));
      bases.sort((a, b) => a.x - b.x);
      gaps = [];
      let edge;
      for (const base of bases) {
        if (edge && base.x > edge.x) {
          const top = Math.min(edge.y, base.y);
          gaps.push({ x: edge.x, w: base.x - edge.x, y: top,
            h: Math.max(edge.y, base.y) - top + 92, leftY: edge.y, rightY: base.y });
        }
        const right = base.x + base.w;
        if (!edge || right > edge.x) edge = { x: right, y: base.y - (base.rise ?? 0) };
      }
      gapsByLevel.set(level, gaps);
    }
    for (const gap of gaps) {
      if (!visible(gap, camera, cameraY)) continue;
      const { x, w, y, h, leftY, rightY } = gap;
      ctx.fillStyle = gradient(y, h, '#253644', '#121c25', '#090e16');
      ctx.beginPath();
      ctx.moveTo(x, leftY);
      ctx.lineTo(x + w, rightY);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();
      line(x, leftY, x, leftY + 13, '#ffc583', 2);
      line(x + w, rightY, x + w, rightY + 13, '#ffc583', 2);
    }
  }

  function liftGuide(platform) {
    const top = platform.motion.top ?? platform.baseY - platform.motion.distance;
    const bottom = platform.motion.bottom ?? platform.baseY + platform.motion.distance;
    for (const x of [platform.baseX + 12, platform.baseX + platform.w - 12]) {
      fill(x - 2, top, 5, bottom - top, '#48616d50');
      line(x, top, x, bottom, '#dce8e6', 1);
      round(x - 6, top - 4, 12, 8, 2, '#729092');
      round(x - 6, bottom - 4, 12, 8, 2, '#729092');
    }
  }

  function screen(x, y, w, h, camera) {
    round(x, y, w, h, 4, gradient(y, h, '#43505c', '#151a26'));
    round(x + 4, y + 4, w - 8, h - 8, 2, gradient(y + 4, h - 8, '#21384d', '#102431'));
    for (let row = 0; row < Math.min(8, Math.floor((h - 12) / 5)); row++) {
      const tone = ['#619991', '#a58cb8', '#819caf'][row % 3];
      for (let left = Math.max(x + 12, x + 12 + Math.floor((camera - x - 56) / 108) * 108); left + 20 < Math.min(x + w - 8, camera + W + 8); left += 108) {
        const length = Math.min(30 + (row * 23 % 62), x + w - left - 8);
        fill(left + (row % 2) * 5, y + 9 + row * 5, Math.max(1, length - 5), 1, tone);
      }
    }
    line(x + 6, y + 5, x + w - 6, y + 5, '#e7f4fb32');
  }

  function platform(p, camera) {
    const { x, y, w, h, kind } = p;
    const end = x + w;
    if (kind === 'slope') {
      // 斜上坡：上表面就是从 (x, y) 到 (x + w, y - rise) 的坡面。
      const rise = p.rise ?? 0;
      ctx.fillStyle = '#a9825b';
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(end, y - rise + h);
      ctx.lineTo(end, y - rise);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d9b184';
      ctx.beginPath();
      ctx.moveTo(x, y + 2);
      ctx.lineTo(end, y - rise + 2);
      ctx.lineTo(end, y - rise + 6);
      ctx.lineTo(x, y + 6);
      ctx.closePath();
      ctx.fill();
      line(x, y + 1, end, y - rise + 1, '#f3ddb8', 1.6);
      for (let i = 1; i < 6; i++) {
        const t = i / 6;
        line(x + w * t, y - rise * t + 7, x + w * t, y - rise * t + h - 1, '#7d5f42', 1);
      }
      return;
    }
    const [light, mid, dark] = MATERIALS[kind];
    const stripe = (spacing, paint) => {
      const start = Math.max(0, Math.floor((camera - x - spacing) / spacing));
      for (let i = start; x + i * spacing < Math.min(end, camera + W + spacing); i++) paint(x + i * spacing, i);
    };
    if (kind === 'desk') {
      const cabinet = Math.min(82, w * .26);
      fill(x + 7, y + h - 1, 12, Math.max(0, H - y - h + 1), gradient(y + h, 55, '#909ca5', '#394653'));
      fill(end - 19, y + h - 1, 12, Math.max(0, H - y - h + 1), '#65757f');
      round(end - cabinet - 25, y + h - 2, cabinet, 62, 3, gradient(y + h, 55, '#a78765', '#675546'));
      for (let i = 1; i <= 3; i++) {
        line(end - cabinet - 24, y + h + i * 13, end - 26, y + h + i * 13, '#42372e');
        round(end - cabinet / 2 - 28, y + h + i * 13 - 5, 8, 2, 1, '#c6b8a6');
      }
    } else if (kind === 'monitorTop') {
      screen(x, y + 7, w, Math.min(124, Math.max(30, H - y + 2)), camera);
    } else if (kind === 'printerTop') {
      fill(x, y + h - 1, w, Math.min(120, Math.max(0, H - y - h + 1)), gradient(y + h, 55, '#c7ced0', '#778b93'));
      round(x + w * .1, y + 29, w * .73, 21, 4, '#202934');
      round(x + w * .16, y + 39, w * .52, 15, 2, '#ebede3');
      line(x + w * .19, y + 43, x + w * .65, y + 43, '#a4b2bc');
      round(end - 46, y + 29, 33, 13, 3, '#285066');
      oval(end - 18, y + 35, 2, 2, '#83f1b4');
    } else if (kind === 'worktop' && y < GROUND) {
      for (const post of [x + 18, end - 29]) {
        fill(post, y + h - 1, 11, GROUND - y - h + 1, '#657d7d78');
      }
    } else if (kind === 'floor') {
      fill(x, y + h - 1, w, Math.max(0, H - y - h + 1), gradient(y + h, 50, '#65707a', '#292f3a'));
    }
    fill(x, y, w, h, gradient(y, h, light, mid, dark));

    if (kind === 'desk') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      stripe(39, (start, i) => {
        const yy = y + 5 + i * 7 % 13;
        const length = 29 + i * 11 % 52;
        ctx.beginPath();
        ctx.moveTo(start, yy);
        ctx.bezierCurveTo(start + 13, yy - 2, start + length * .6, yy + 2, start + length, yy);
        ctx.strokeStyle = i % 2 ? '#f9e6c16b' : '#6744296b';
        ctx.lineWidth = .65;
        ctx.stroke();
      });
      ctx.restore();
      line(x + 1, y + h - 3, end - 1, y + h - 3, '#5e422e72', 1);
    } else if (kind === 'floor') {
      stripe(68, start => line(start, y + 3, start, y + h - 1, '#625f5d', 1));
      line(x + 1, y + 12, end - 1, y + 12, '#826f60', 1);
    } else if (kind === 'keyboard') {
      for (let key = x + 5, i = 0; key + 10 < end - 4; key += 12, i++) {
        round(key, y + 4, 10, 7, 1.5, '#101721');
        round(key + 1, y + 4, 8, 5, 1, '#76808d');
        round(key, y + 13, 10, 6, 1.5, '#444e60');
        if (i % 2 === 0) fill(key + 3, y + 6, 3, 1, '#d6dce1');
      }
    } else if (kind === 'books') {
      for (let page = y + 5; page < y + h - 3; page += 10) {
        const thickness = Math.min(7, y + h - 3 - page);
        fill(x + 4, page, w - 8, thickness, '#eadfc5');
        for (let row = page + 2; row < page + thickness; row += 2) fill(x + 5, row, w - 10, .5, '#a69c85');
      }
      round(x + 2, y + 4, 3, h - 6, 1, '#d0a164');
    } else if (kind === 'drawer' || kind === 'crate') {
      round(x + 3, y + 4, w - 6, h - 7, 2, '#63422e60');
      round(x + w / 2 - 9, y + 9, 18, 4, 2, '#d8c8ab');
    } else if (kind === 'worktop') {
      stripe(42, start => line(start + 4, y + 7, Math.min(start + 21, end), y + 9, '#905f3d78', 1));
    } else if (kind === 'clipboard') {
      round(x + 4, y + 3, w - 10, 4, 1, '#f8eece');
      round(end - 13, y + 3, 8, 4, 1, '#6d7d83');
    } else if (kind === 'tray' || kind === 'cargoLift') {
      stripe(18, left => line(left + 3, y + 6, Math.min(left + 10, end), y + h - 3,
        kind === 'tray' ? '#e5f8ed' : '#4f625d', 2));
    } else if (kind === 'monitorTop' || kind === 'printerTop') {
      stripe(13, start => {
        if (start > x + 5 && start + 5 < end - 3) fill(start, y + 5, 5, 2, '#202a36');
      });
    }

    // The rim coincides with the collision top and ends exactly at each edge.
    fill(x, y, w, p.oneway ? 3 : 4, '#55706c');
    fill(x, y, w, p.oneway ? 1.5 : 2, p.oneway ? '#c7f5f8' : '#fff3cc');
    fill(x, y + 2, 1, Math.min(h - 2, 8), '#fff0c7');
    fill(end - 1, y + 2, 1, Math.min(h - 2, 8), '#fff0c7');
  }

  function decoration({ x, y, kind }, camera) {
    if (kind === 'fileRack') {
      round(x, y - 68, 126, 68, 4, '#819695');
      for (let i = 0; i < 6; i++) {
        round(x + 8 + i * 18, y - 60, 12, 49, 2, i % 2 ? '#c5beae' : '#9fabaa');
      }
    } else if (kind === 'liftPanel') {
      round(x, y - 45, 54, 36, 3, '#202f39');
      fill(x + 8, y - 38, 38, 7, '#5e8594');
      for (let button = 0; button < 3; button++) oval(x + 12 + button * 13, y - 21, 3, 3, '#ffc377');
    } else if (kind === 'printerStack') {
      round(x, y - 47, 104, 47, 5, '#879fa3');
      round(x + 13, y - 38, 78, 10, 2, '#536f77');
      round(x + 24, y - 21, 60, 15, 2, '#dce1d0');
    } else if (kind === 'waterDispenser') {
      round(x + 12, y - 88, 42, 40, 8, '#76b9c6');
      round(x + 17, y - 82, 32, 3, 2, '#def2ef');
      round(x, y - 55, 68, 55, 5, '#b7cfcd');
      round(x + 13, y - 43, 42, 23, 4, '#638c8d');
      round(x + 22, y - 40, 8, 5, 2, '#a96964');
      round(x + 37, y - 40, 8, 5, 2, '#8ecfdf');
    } else if (kind === 'keyboardDock') {
      round(x, y - 22, 101, 22, 4, '#394851');
      for (let i = 0; i < 8; i++) {
        round(x + 5 + i * 12, y - 24, 9, 7, 1, '#748692');
        round(x + 5 + i * 12, y - 14, 9, 5, 1, '#667c86');
      }
    } else if (kind === 'deskPlant') {
      round(x + 10, y - 26, 39, 26, 4, '#a5684e');
      line(x + 30, y - 21, x + 27, y - 60, '#4a815e', 3);
      for (const [dx, dy, rx] of [[14, -42, 14], [42, -51, 15], [22, -63, 12]]) {
        oval(x + dx, y + dy, rx, 6, '#5f9d73');
      }
    } else if (kind === 'monitor') {
      round(x + 65, y - 39, 25, 37, 3, gradient(y - 39, 37, '#415262', '#18242d'));
      screen(x, y - 144, 155, 111, camera);
      oval(x + 146, y - 39, 1.3, 1, '#8ecfc1');
    } else if (kind === 'cup') {
      ctx.strokeStyle = '#aab7bc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x + 34, y - 24, 9, -1.55, 1.55);
      ctx.stroke();
      round(x, y - 39, 34, 39, 7, gradient(y - 39, 39, '#e1e5d9', '#9caeae'));
      oval(x + 17, y - 38, 17, 4, '#f0ebda');
      oval(x + 17, y - 38, 13, 2.5, '#744b38');
    } else if (kind === 'coil' || kind === 'crumbcoil') {
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = i % 2 ? '#4f626c' : '#2d3a46';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(x + 11 + 8 * i, y - 4, 11, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (kind === 'staple') {
      round(x, y - 5, 40, 5, 2, '#56626a');
      line(x + 4, y - 8, x + 36, y - 11, '#8c3d46', 5);
    } else {
      const color = kind === 'pencil' ? '#c99539' : kind === 'eraser' ? '#b98d89' : '#3a6a82';
      round(x, y - 6, 41, 5, 2, color);
      line(x + 7, y - 5, x + 35, y - 5, '#e5ded590');
    }
  }

  return { background, gaps, liftGuide, platform, decoration, visible };
}
