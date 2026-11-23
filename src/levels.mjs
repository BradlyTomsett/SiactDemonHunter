export const VIEW = { width: 640, height: 360 };

export const PLAYER = {
  width: 17, height: 27, speed: 188, acceleration: 1650,
  gravity: 1080, jumpSpeed: 400, maxFallSpeed: 560,
  coyoteTime: 0.10, jumpBuffer: 0.13,
  maxHealth: 3, invincibleTime: 1.15,
  knockbackSpeed: 145, knockbackTime: 0.16,
};

export const WEAPON = { interval: 0.16, speed: 478, lifetime: 0.92, damage: 1 };

export const ENEMIES = {
  patrol: { width: 25, height: 20, speed: 58, health: 3, damage: 1 },
};

export const LEVELS = [{
  name: "第一关 · 桌面醒来",
  width: 1536,
  spawn: { x: 88, y: 262 },
  platforms: [
    { x: 0, y: 286, w: 442, h: 22, kind: "desk" },
    { x: 48, y: 262, w: 166, h: 24, kind: "keyboard" },
    { x: 304, y: 267, w: 55, h: 19, kind: "books" },
    { x: 359, y: 251, w: 68, h: 35, kind: "books" },
    { x: 516, y: 286, w: 548, h: 22, kind: "desk" },
    { x: 591, y: 267, w: 110, h: 19, kind: "stand" },
    { x: 1126, y: 286, w: 410, h: 22, kind: "desk" },
  ],
  decoration: [
    { x: 558, y: 267, kind: "monitor" },
    { x: 1175, y: 286, kind: "cup" },
  ],
  enemies: [{ type: "patrol", x: 860, y: 286, minX: 770, maxX: 956 }],
  supplies: [{ x: 995, y: 264, amount: 1 }],
  hazards: [],
  endArea: { x: 1320, w: 216 },
  exit: { x: 1432, y: 236, w: 34, h: 50 },
  hints: [
    { x: 0, touch: "左手移动，右手跳跃或开火", desktop: "方向键移动，空格跳跃，按住 J 开火" },
    { x: 260, text: "跳上文件堆，再越过桌缝" },
    { x: 690, text: "前方有巡逻怪，按住开火可以连发" },
    { x: 970, text: "越过最后一道桌缝，抵达出口" },
    { x: 1240, text: "出口就在前面" },
  ],
}];
