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
    box(cabinetX, y + h, 101, 66, "#4a4c43");
    for (let row = 0; row < 3; row++) {
      box(cabinetX + 4, y + h + row * 20 + 3, 91, 17, "#70695a");
      box(cabinetX + 43, y + h + row * 20 + 7, 15, 3, "#9d9582");
    }
    box(x, y, w, h, "#9a6a4b");
    box(x, y + 1, w, 5, "#f4c188");
    box(x, y + 6, w, 3, "#da9e66");
    box(x, y + h - 4, w, 4, "#623f34");
    for (let i = 0; i < w - 12; i += 32) box(x + i, y + 10 + (i % 9), 11, 1, "#b88057");
  }

  function platform(tile) {
    const { x, y, w, h, kind } = tile;
    if (kind === "desk") return desk(tile);
    if (kind === "keyboard") {
      box(x, y, w, h, "#27363c");
      box(x, y, w, 3, "#95b2b0");
      box(x + 4, y + 4, w - 8, 14, "#4c6568");
      for (let i = 7; i < w - 10; i += 12) {
        box(x + i, y + 6, 9, 4, "#718e8f");
        box(x + i, y + 12, 9, 4, "#617e80");
      }
      return;
    }
    if (kind === "books") {
      const spines = ["#936e4d", "#516e70", "#9e5362"];
      for (let row = 0; row < h; row += 12) {
        const height = Math.min(12, h - row);
        box(x, y + row, w, height, spines[(Math.round(x) + row / 12) % 3]);
        box(x + 5, y + row + 3, w - 10, Math.max(0, height - 5), "#e0cc9f");
        if (height >= 8) box(x + 12, y + row + 5, w - 22, 1, "#a89a7d");
      }
      box(x, y, w, 2, "#f5d395");
      return;
    }
    box(x, y, w, h, "#314955");
    box(x, y, w, 3, "#94aaa7");
    box(x + 4, y + h - 4, w - 8, 2, "#203640");
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
    }
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
    box(4, 13, 10, 5, "#63848c");
    box(9, 12, 7, 3, "#c0d0c8");
    box(-6, 21, 5, 6 + stride, "#86a8ab");
    box(2, 21, 5, 6 - stride, "#576f7e");
    if (p.flash > 0) {
      box(17, 11, 8, 5, "#ffdd75");
      box(18, 9, 3, 9, "#fff0b1");
    }
    ctx.restore();
  }

  function drawEnemy(enemy, t) {
    if (!enemy.health) return;
    const { x, y, w, h, direction, flash, health } = enemy;
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

  return function render(game) {
    const t = game.elapsed;
    background(game.camera);
    ctx.save();
    ctx.translate(-Math.round(game.camera), 0);
    for (const decoration of game.level.decoration) decorate(decoration);
    for (const tile of game.level.platforms) platform(tile);
    for (const hazard of game.level.hazards) box(hazard.x, hazard.y, hazard.w, hazard.h, "#e07966");
    portal(game.level.exit, t);
    for (const supply of game.supplies) {
      if (supply.taken) continue;
      const y = supply.y + Math.sin(t * 5) * 2;
      box(supply.x, y, supply.w, supply.h, "#273c43");
      box(supply.x + 1, y + 1, 12, 12, "#69a98a");
      box(supply.x + 3, y + 6, 8, 2, "#e3f7cb");
      box(supply.x + 6, y + 3, 2, 8, "#e3f7cb");
    }
    for (const enemy of game.enemies) drawEnemy(enemy, t);
    for (const bullet of game.bullets) box(bullet.x, bullet.y, bullet.w, bullet.h, "#ffe78a");
    drawPlayer(game.player, t);
    for (const spark of game.sparks) box(spark.x, spark.y, 2, 2, spark.color);
    ctx.restore();
  };
}
