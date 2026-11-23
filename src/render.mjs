import { VIEW } from "./levels.mjs";

const { width: W, height: H } = VIEW;

export function createRenderer(canvas) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const box = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  const polygon = (points, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
    ctx.closePath();
    ctx.fill();
  };

  const room = document.createElement("canvas");
  room.width = 1024;
  room.height = H;
  const roomCtx = room.getContext("2d");
  function makeRoom() {
    const rect = (x, y, w, h, color) => {
      roomCtx.fillStyle = color;
      roomCtx.fillRect(x, y, w, h);
    };
    const backdrop = roomCtx.createLinearGradient(0, 32, 0, 300);
    backdrop.addColorStop(0, "#5c7377");
    backdrop.addColorStop(0.55, "#3a555b");
    backdrop.addColorStop(1, "#263e45");
    rect(0, 0, room.width, H, backdrop);
    rect(0, 0, room.width, 58, "#293b44");
    rect(0, 57, room.width, 2, "#849194");
    rect(0, 60, room.width, 7, "#263e48");
    for (let x = -40; x < room.width; x += 190) {
      rect(x + 20, 26, 96, 10, "#1d2f38");
      rect(x + 24, 28, 88, 2, "#bbcbc5");
      rect(x + 24, 32, 88, 2, "#849e9f");
      rect(x + 35, 84, 132, 101, "#30464e");
      rect(x + 39, 88, 124, 90, "#748982");
      rect(x + 42, 91, 118, 79, "#7b9189");
      for (let y = 94; y < 167; y += 6) rect(x + 42, y, 118, 2, "#526d6c");
      rect(x + 96, 88, 4, 90, "#435c61");
      rect(x + 34, 177, 135, 5, "#2c414b");
      rect(x + 170, 58, 20, 230, "#889994");
      rect(x + 184, 58, 6, 230, "#6a8282");
    }
    rect(0, 308, room.width, 52, "#263b43");
    rect(0, 340, room.width, 2, "#2f484e");
    for (let x = 0; x < room.width; x += 58) rect(x, 340, 2, 20, "#1b3038");
  }
  makeRoom();

  function leaf(x, y) {
    box(x + 24, y + 8, 4, 48, "#3f6861");
    box(x + 13, y + 53, 25, 25, "#586f73");
    box(x + 10, y + 47, 31, 7, "#8a9995");
    polygon([[x + 25, y + 36], [x + 1, y + 16], [x + 13, y + 13], [x + 25, y + 20]], "#3e7568");
    polygon([[x + 26, y + 38], [x + 35, y + 17], [x + 53, y + 13], [x + 50, y + 28]], "#56887a");
    polygon([[x + 26, y + 23], [x + 16, y + 1], [x + 24, y - 4], [x + 35, y + 3]], "#5a8d7d");
  }

  function background(camera) {
    ctx.drawImage(room, -Math.round(camera * 0.17), 0);
    const shift = Math.round(camera * 0.36) % 292;
    for (let x = -shift - 292; x < W + 30; x += 292) {
      box(x + 12, 178, 252, 96, "#3c535be8");
      box(x + 14, 180, 248, 43, "#668082");
      for (let y = 186; y < 224; y += 10) box(x + 14, y, 248, 3, "#82999b");
      box(x + 14, 225, 248, 26, "#794551");
      box(x + 12, 178, 252, 4, "#a0a8a3");
      box(x + 12, 179, 4, 97, "#77888a");
      box(x + 260, 179, 4, 97, "#77888a");
      leaf(x + 218, 171);
      box(x + 17, 250, 244, 5, "#30454d");
    }
    box(0, 320, W, 40, "#10262f60");
  }

  function desk({ x, y, w, h }) {
    box(x + 7, y + h, 16, 68, "#4a6267");
    box(x + w - 24, y + h, 15, 68, "#4a6267");
    box(x + 12, y + h, 5, 68, "#63777a");
    box(x + w - 22, y + h, 5, 68, "#63777a");
    const cabinetX = x + w - 146;
    if (cabinetX > x) {
      box(cabinetX, y + h, 101, 66, "#4a4c43");
      for (let row = 0; row < 3; row++) {
        box(cabinetX + 4, y + h + row * 20 + 3, 91, 17, "#70695a");
        box(cabinetX + 43, y + h + row * 20 + 7, 15, 3, "#9d9582");
      }
    }
    box(x, y, w, h, "#9a6a4b");
    box(x, y + 1, w, 5, "#f4c188");
    box(x, y + 6, w, 3, "#da9e66");
    box(x, y + h - 4, w, 4, "#623f34");
    for (let i = 0; i < w - 12; i += 32) box(x + i, y + 10 + (i % 9), 11, 1, "#b88057");
  }

  function keyboard({ x, y, w, h }) {
    box(x, y, w, h, "#27363c");
    box(x, y, w, 3, "#95b2b0");
    box(x + 4, y + 4, w - 8, 14, "#4c6568");
    for (let i = 7; i < w - 10; i += 12) {
      box(x + i, y + 6, 9, 4, "#718e8f");
      box(x + i, y + 12, 9, 4, "#617e80");
    }
  }

  function books({ x, y, w, h }) {
    const spines = ["#936e4d", "#516e70", "#9e5362"];
    for (let row = 0; row < h; row += 12) {
      const height = Math.min(12, h - row);
      box(x, y + row, w, height, spines[(Math.round(x) + row / 12) % 3]);
      box(x + 5, y + row + 3, w - 10, Math.max(0, height - 5), "#e0cc9f");
      if (height >= 8) box(x + 12, y + row + 5, w - 22, 1, "#a89a7d");
    }
    box(x, y, w, 2, "#f5d395");
  }

  function stand({ x, y, w, h }) {
    box(x + 6, y + h, 10, 20, "#445d63");
    box(x + w - 16, y + h, 10, 20, "#445d63");
    box(x, y, w, h, "#3d565c");
    box(x, y, w, 3, "#9db6b2");
    box(x + 8, y + 6, w - 16, 4, "#2b4249");
  }

  function drawer({ x, y, w, h }) {
    box(x, y, w, h, "#8a6a48");
    box(x, y, w, 4, "#d8b07a");
    box(x + 4, y + 8, w - 8, h - 14, "#6d5238");
    box(x + w / 2 - 14, y + 14, 28, 6, "#b9a27a");
    box(x + w / 2 - 14, y + 14, 28, 2, "#dcc79d");
    box(x + 2, y + h - 6, w - 4, 4, "#4a3626");
  }

  function crate({ x, y, w, h }) {
    box(x, y, w, h, "#a98357");
    box(x, y, w, 3, "#d9b785");
    box(x + 3, y + 4, 3, h - 8, "#c19a68");
    box(x + w - 6, y + 4, 3, h - 8, "#c19a68");
    box(x + 3, y + h / 2 - 1, w - 6, 3, "#8b6a44");
  }

  function plank({ x, y, w, h }) {
    box(x, y, w, h, "#8d7050");
    box(x, y, w, 2, "#cda880");
    box(x, y + h - 2, w, 2, "#5f4a33");
    for (let i = 0; i < w - 8; i += 26) box(x + i + 6, y + 2, 1, h - 4, "#735a3e");
  }

  function shelf({ x, y, w, h }) {
    box(x, y, w, h, "#5c6f74");
    box(x, y, w, 2, "#b9c8c4");
    box(x, y + h - 2, w, 2, "#33464c");
    box(x + w - 4, y + h, 4, 10, "#3d5157");
    box(x, y + h, 4, 10, "#3d5157");
  }

  function platform(tile) {
    const { kind } = tile;
    if (kind === "keyboard") return keyboard(tile);
    if (kind === "books") return books(tile);
    if (kind === "stand") return stand(tile);
    if (kind === "drawer") return drawer(tile);
    if (kind === "crate") return crate(tile);
    if (kind === "plank") return plank(tile);
    if (kind === "shelf") return shelf(tile);
    return desk(tile);
  }

  function decorate({ x, y, kind }) {
    if (kind === "monitor") {
      box(x + 72, y - 32, 22, 33, "#293e46");
      box(x, y - 149, 167, 119, "#1d323b");
      box(x + 4, y - 146, 159, 107, "#253e48");
      box(x + 8, y - 142, 151, 97, "#304f58");
      polygon([[x + 9, y - 141], [x + 51, y - 141], [x + 9, y - 98]], "#3b6267");
      box(x + 12, y - 49, 143, 2, "#436775");
      box(x + 145, y - 37, 5, 3, "#72c198");
    } else if (kind === "cup") {
      box(x + 38, y - 35, 15, 22, "#819796");
      box(x + 39, y - 30, 9, 12, "#334951");
      box(x, y - 45, 40, 45, "#acbdb5");
      box(x + 2, y - 45, 36, 5, "#d6dacf");
      box(x + 1, y - 41, 36, 2, "#6f8585");
      box(x + 30, y - 38, 9, 36, "#819990");
    } else if (kind === "pen") {
      box(x, y - 6, 54, 6, "#3f5a63");
      box(x + 2, y - 5, 50, 2, "#8fb0ad");
      box(x + 50, y - 9, 10, 9, "#c9d6cd");
      box(x + 54, y - 7, 8, 5, "#6e8b86");
    } else if (kind === "eraser") {
      box(x, y - 16, 34, 16, "#d9cfae");
      box(x, y - 16, 34, 5, "#efe7cb");
      box(x + 4, y - 11, 26, 8, "#b9a97f");
    } else if (kind === "staple") {
      box(x, y - 12, 40, 12, "#4a5c63");
      box(x + 3, y - 18, 30, 7, "#6f858c");
      box(x + 6, y - 20, 22, 4, "#9fb4b4");
      box(x + 1, y - 6, 38, 3, "#2f3f45");
    } else if (kind === "pencil") {
      box(x, y - 5, 62, 6, "#d9a94e");
      box(x, y - 5, 62, 2, "#f0cd7f");
      polygon([[x + 62, y - 5], [x + 74, y - 2], [x + 62, y + 1]], "#e8dcc0");
      box(x - 8, y - 6, 9, 8, "#d98d8d");
    } else if (kind === "coil") {
      for (let i = 0; i < 4; i++) {
        box(x + i * 7, y - 20 + (i % 2) * 5, 22, 5, "#2d454e");
        box(x + i * 7, y - 20 + (i % 2) * 5, 22, 1, "#5d7c81");
      }
      box(x + 6, y - 6, 30, 6, "#22383f");
    } else if (kind === "crumbcoil") {
      box(x, y - 8, 46, 8, "#7b6146");
      box(x + 6, y - 14, 12, 6, "#96795a");
      box(x + 26, y - 12, 9, 5, "#8a6e50");
      box(x + 40, y - 6, 18, 6, "#2f464d");
    }
  }

  function hazard(t, h) {
    const { x, y, w, h: height, kind } = h;
    if (kind === "spill") {
      box(x, y + 2, w, height - 2, "#5f4128");
      box(x + 2, y, w - 4, 4, "#7d5734");
      box(x + 8, y + 5, w - 16, 3, "#4a3120");
      const bubble = Math.sin(t * 3 + x) > 0.6;
      if (bubble) box(x + w * 0.4, y + 1, 4, 3, "#a37a4d");
    } else if (kind === "cable") {
      box(x, y + height - 5, w, 5, "#20343b");
      for (let i = 0; i < w - 6; i += 12) {
        box(x + i, y + height - 9, 8, 4, "#2b4650");
        box(x + i + 2, y + height - 9, 4, 1, "#5a7d82");
      }
      const spark = Math.sin(t * 12 + x * 0.1) > 0.2;
      if (spark) {
        box(x + w * 0.5, y + 1, 3, 8, "#ffe37a");
        box(x + w * 0.5 - 3, y + 4, 9, 2, "#fff3b8");
      } else {
        box(x + w * 0.5, y + 3, 3, 6, "#7fa9a0");
      }
    } else if (kind === "vent") {
      box(x, y + height - 4, w, 4, "#3c5259");
      box(x + 2, y + height - 10, w - 4, 6, "#54707a");
      for (let i = 4; i < w - 4; i += 8) box(x + i, y + height - 10, 2, 6, "#2b4149");
      if (Math.sin(t * 2.4 + x) > 0) box(x + 6, y - 12, w - 12, 10, "#c9d8d6aa");
    } else {
      box(x, y + height - 6, w, 6, "#4b3a30");
      for (let i = 0; i < w - 4; i += 9) {
        box(x + i + 2, y + height - 12, 4, 7, "#8b6a52");
        box(x + i + 3, y + height - 13, 2, 2, "#b08a68");
      }
    }
  }

  function checkpoint(point, index, reached) {
    const color = reached ? "#79e0b2" : "#4a6570";
    box(point.x - 1, point.y - 26, 2, 26, color);
    polygon([[point.x + 1, point.y - 26], [point.x + 14, point.y - 21], [point.x + 1, point.y - 16]], color);
    box(point.x - 4, point.y - 2, 8, 2, reached ? "#4f9c7d" : "#3a4f57");
  }

  function portal(exit, t) {
    const { x, y, w, h } = exit;
    box(x - 4, y - 4, w + 8, h + 4, "#224b51");
    box(x, y, w, h, "#78a9a3");
    box(x + 3, y + 5, w - 6, h - 5, "#192d38");
    box(x + 6, y + 8, w - 12, h - 8, "#376261");
    box(x + 6, y + h - 4, w - 12, 4, "#7eb2a0");
    box(x + w - 8, y + 24, 3, 4, "#dce6c0");
    box(x - 7, y - 20, w + 14, 16, "#193b40");
    box(x - 7, y - 20, w + 14, 1, "#76bdab");
    ctx.fillStyle = Math.sin(t * 4) > -0.7 ? "#c6f3d7" : "#91cdbb";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("出口", x + w / 2, y - 8);
  }

  function drawPlayer(p, t) {
    if (p.invincible > 0 && Math.floor(p.invincible * 14) % 2) return;
    const stride = p.grounded && Math.abs(p.vx) > 20 ? Math.round(Math.sin(t * 28) * 3) : 0;
    ctx.save();
    ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y));
    ctx.scale(p.facing, 1);
    box(-7, 8, 15, 15, "#122638");
    box(-6, 9, 12, 12, "#d89a49");
    box(-6, 10, 4, 10, "#f1bd65");
    box(-7, 1, 14, 10, "#f8cc70");
    box(-5, 0, 11, 2, "#ffe8a3");
    box(0, 4, 9, 5, "#284752");
    box(5, 4, 3, 2, "#a9ded3");
    box(-6, 21, 5, 6 + stride, "#86a8ab");
    box(2, 21, 5, 6 - stride, "#576f7e");
    ctx.save();
    ctx.translate(3, 14);
    ctx.rotate(Math.atan2(p.aimY, p.aimX * p.facing));
    box(0, -2, 10, 5, "#63848c");
    box(6, -3, 7, 3, "#c0d0c8");
    if (p.flash > 0) {
      box(14, -3, 8, 5, "#ffdd75");
      box(15, -5, 3, 9, "#fff0b1");
    }
    ctx.restore();
    ctx.restore();
  }

  function drawPatrol(enemy, t) {
    const { x, y, w, h, direction, flash, health, maxHealth } = enemy;
    const walk = Math.sin(t * 17) > 0 ? 2 : 0;
    box(x + 2, y + 7, w - 4, h - 8, "#351d30");
    box(x + 5, y + 4, w - 8, 11, flash ? "#ffe0ad" : "#a04e77");
    box(x + 8, y + 1, w - 14, 5, "#e582a3");
    const eyeX = direction < 0 ? x + 4 : x + w - 9;
    box(eyeX, y + 8, 4, 3, "#fff0b8");
    box(x + 3, y + 15, 5, 5 - walk, "#c16484");
    box(x + w - 8, y + 15, 5, 3 + walk, "#c16484");
    if (flash) box(x + 3, y - 5, health * 6, 2, "#f8a2a1");
  }

  function drawGunner(enemy, t) {
    const { x, y, w, h, direction, flash, tell } = enemy;
    const charging = tell > 0;
    box(x + 2, y + 10, w - 4, h - 10, "#24303b");
    box(x + 4, y + 4, w - 8, 12, flash ? "#ffe9c2" : "#4c6d7c");
    box(x + 7, y, w - 14, 6, "#7fa3ae");
    const eyeX = direction < 0 ? x + 5 : x + w - 10;
    box(eyeX, y + 8, 5, 4, charging ? "#ffb347" : "#bff0e4");
    // 炮管
    const barrelX = direction < 0 ? x - 6 : x + w - 2;
    box(barrelX, y + 12, 8, 5, charging ? "#e88b4b" : "#5d7f88");
    box(x + 3, y + h - 4, 6, 4, "#3b5560");
    box(x + w - 9, y + h - 4, 6, 4, "#3b5560");
    if (charging) {
      const pulse = 1 + Math.sin(t * 30) * 0.5;
      box(barrelX + (direction < 0 ? -4 : 8), y + 13, 4 * pulse, 4, "#ffd27a");
    }
  }

  function drawFlyer(enemy, t) {
    const { x, y, w, h, flash, direction } = enemy;
    const flap = Math.sin(t * 18) > 0 ? 4 : 0;
    box(x + 4, y + 4, w - 8, h - 6, flash ? "#ffe6cf" : "#7a4f6d");
    box(x + 7, y + 1, w - 14, 5, "#a97b95");
    box(x - 3, y + 2 + flap, 8, 4, "#8d6182");
    box(x + w - 5, y + 2 + flap, 8, 4, "#8d6182");
    const eyeX = direction < 0 ? x + 6 : x + w - 11;
    box(eyeX, y + 7, 5, 4, "#ffe9a8");
  }

  function drawEnemy(enemy, t) {
    if (!enemy.health) return;
    if (enemy.type === "gunner") return drawGunner(enemy, t);
    if (enemy.type === "flyer") return drawFlyer(enemy, t);
    return drawPatrol(enemy, t);
  }

  function drawBoss(boss, config) {
    const { x, y, w, h } = boss;
    const fur = boss.flash > 0 ? '#fff1d5' : '#c69568';
    ctx.save();
    if (boss.state === 'dying') ctx.globalAlpha = Math.max(0, boss.timer / 0.8);
    ctx.translate(Math.round(x + w / 2), Math.round(y));
    ctx.scale(-boss.direction, 1);
    box(-24, 20, 48, 24, '#825b48');
    box(-22, 17, 44, 24, fur);
    box(-20, 38, 10, 10, '#77513e'); box(11, 38, 10, 10, '#77513e');
    box(-25, 7, 13, 20, '#805541'); box(13, 7, 12, 20, '#805541');
    box(-20, 3, 40, 31, fur); box(-16, 0, 32, 5, fur);
    box(-11, 16, 5, 4, '#302831'); box(6, 16, 5, 4, '#302831');
    box(-10, 23, 20, 10, '#edc9a0'); box(-3, 22, 6, 4, '#513934');
    if (boss.state === 'warnWave') box(-4, 29, 8, 4, '#573b39');
    box(-22, 7, 4, 17, '#eb7b35'); box(-20, 4, 7, 4, '#eb7b35');
    box(-15, 2, 29, 3, '#eb7b35'); box(12, 4, 6, 4, '#eb7b35');
    box(-20, 13, 8, 9, boss.state === 'warnWave' ? '#ffcf68' : '#f39042');
    if (boss.state === 'warnDash') { box(-27, -7, 54, 3, '#ffda72'); box(-20, -12, 40, 3, '#e88b4b'); }
    ctx.restore();
  }

  return function render(game) {
    const t = game.elapsed;
    const level = game.level;
    const left = game.camera - 48;
    const right = game.camera + W + 48;
    const visible = item => item.x + (item.w ?? 120) >= left && item.x <= right;

    background(game.camera);
    ctx.save();
    ctx.translate(-Math.round(game.camera), 0);
    for (const item of level.decoration) if (visible(item)) decorate(item);
    for (const tile of level.platforms) if (visible(tile)) platform(tile);
    for (const point of level.hazards) if (visible(point)) hazard(t, point);
    for (const [index, point] of level.checkpoints.entries()) {
      if (visible(point)) checkpoint(point, index, index <= game.checkpoint);
    }
    if (!level.boss || (game.boss && game.boss.state === 'defeated')) portal(level.exit, t);
    for (const supply of game.supplies) {
      if (supply.taken || !visible(supply)) continue;
      const y = supply.y + Math.sin(t * 5) * 2;
      box(supply.x, y, supply.w, supply.h, "#273c43");
      box(supply.x + 1, y + 1, 12, 12, supply.type === 'grenade' ? '#dca255' : supply.type ? '#729bc5' : '#69a98a');
      box(supply.x + 3, y + 6, 8, 2, "#e3f7cb");
      box(supply.x + 6, y + 3, 2, 8, "#e3f7cb");
      if (supply.type) {
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        const labels = { grenade: '雷', spread: '散', pierce: '穿', rapid: '疾', heavy: '重' };
        ctx.fillText(labels[supply.type], supply.x + 7, y - 3);
      }
    }
    for (const enemy of game.enemies) if (visible(enemy)) drawEnemy(enemy, t);
    if (game.boss) drawBoss(game.boss, level.boss);
    for (const wave of game.waves) { box(wave.x, wave.y, wave.w, wave.h, '#ffba6a'); box(wave.x + 3, wave.y + 4, 5, 12, '#fff0b2'); }
    for (const shot of game.enemyShots) {
      box(shot.x - 1, shot.y - 1, shot.w + 2, shot.h + 2, "#ff9d6b55");
      box(shot.x, shot.y, shot.w, shot.h, "#ff7a55");
    }
    for (const bullet of game.bullets) box(bullet.x, bullet.y, bullet.w, bullet.h, "#ffe78a");
    for (const grenade of game.grenades) { box(grenade.x, grenade.y, 6, 6, '#e5ab54'); box(grenade.x + 2, grenade.y - 2, 2, 2, '#f7e5a8'); }
    drawPlayer(game.player, t);
    for (const spark of game.sparks) box(spark.x, spark.y, 2, 2, spark.color);
    ctx.restore();
    const boss = game.boss;
    const config = level.boss;
    if (boss && config && !['waiting', 'defeated'].includes(boss.state)) {
      box(210, 57, 220, 18, '#14262d');
      box(212, 59, 216, 14, '#405357');
      box(213, 60, 214 * Math.max(0, boss.health) / boss.maxHealth, 12, '#e58257');
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(config.label, 320, 70);
    }
  };
}
