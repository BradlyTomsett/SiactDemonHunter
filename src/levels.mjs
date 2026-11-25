export const VIEW = { width: 640, height: 360 };
export const GROUND = 286;

export const PLAYER = {
  width: 19, height: 40, speed: 188, acceleration: 1650,
  gravity: 1080, jumpSpeed: 482, maxFallSpeed: 560,
  coyoteTime: 0.10, jumpBuffer: 0.13,
  maxHealth: 5, lives: 3, invincibleTime: 1.15, respawnInvincible: 1.8,
  knockbackSpeed: 145, knockbackTime: 0.16,
};

export const CHARACTERS = {
  minister: { name: '大老师', maxHealth: 8, ammoMultiplier: 1, pickupMultiplier: 1, infiniteGrenades: false },
  manager: { name: '张经理', maxHealth: 4, ammoMultiplier: 2, pickupMultiplier: 2, infiniteGrenades: false },
  ma: { name: '马经理', maxHealth: 4, ammoMultiplier: 1, pickupMultiplier: 1, infiniteGrenades: true },
};

// 射程 = speed × lifetime，全部拉到 675px 以上，超过整屏（VIEW.width = 640）。
export const WEAPONS = {
  basic: { name: '普通枪', ammo: Infinity, interval: 0.16, speed: 478, lifetime: 1.42, damage: 1, size: 4, color: '#ffb52e' },
  spread: { name: '霰弹枪', ammo: 40, interval: 0.135, speed: 520, lifetime: 1.3, damage: 1, size: 5, spread: 0.35, pellets: 5, color: '#ff558e' },
  pierce: { name: '穿透枪', ammo: 32, interval: 0.12, speed: 680, lifetime: 1, damage: 2, size: 5, pierce: 3, color: '#00d7f5' },
  rapid: { name: '疾射枪', ammo: 98, interval: 0.064, speed: 630, lifetime: 1.08, damage: 1, size: 4, color: '#8aff43' },
  heavy: { name: '重击枪', ammo: 18, interval: 0.14, speed: 475, lifetime: 1.43, damage: 4, size: 9, color: '#ad60ff' },
};

// 手榴弹：伤害在原版 5 点基础上提高 50%。max 是玩家可携带的上限。
export const GRENADE = { damage: 7.5, radius: 80, fuse: 1.1, max: 10 };

// 三种小狗共用耳机弹，移动方式、射程和射击节奏各有区别。
export const ENEMIES = {
  patrol: {
    width: 28, height: 22, speed: 58, health: 3, damage: 1,
    range: 170, interval: 3.5, telegraph: 0.65, shotSpeed: 151,
  },
  gunner: {
    width: 27, height: 26, speed: 0, health: 4, damage: 1,
    range: 310, interval: 2, telegraph: 0.55, shotSpeed: 195,
  },
  flyer: {
    width: 25, height: 20, speed: 74, health: 2, damage: 1,
    amplitude: 26, frequency: 1.7,
    range: 200, interval: 3.2, telegraph: 0.7, shotSpeed: 165,
  },
  // 冲刺狗：原地蓄力后沿直线冲过来，撞墙后短暂眩晕，是最容易躲也最容易翻车的一种。
  charger: {
    width: 30, height: 24, speed: 46, health: 4, damage: 1,
    range: 300, interval: 2.4, telegraph: 0.55, shotSpeed: 160,
    chargeSpeed: 205, chargeTime: 0.75, stun: 0.9,
  },
  // 盾牌狗：正面盾牌可以打碎，绕后射击或用手榴弹可直接伤到本体。
  shielder: {
    width: 30, height: 26, speed: 34, health: 6, shieldHealth: 3, damage: 1,
    range: 0, interval: 0, telegraph: 0,
  },
};

export const BOSS = {
  width: 78, height: 64, label: '6狗', ground: GROUND,
  intro: 1.0, warning: 1, dashSpeed: 181, dashDuration: 1.35,
  leapSpeed: 94, leapDuration: 1.5, leapHeight: 78,
  waveSpeed: 175, recovery: 1.1, damage: 1,
};

// BOSS 天降物：落地后不消失，按巡逻小怪的速度在地面来回滑，不打掉就一直弹。
// 场上同时最多 max 坨，达到上限后暂停投放，等玩家清掉再继续。
export const DROPPINGS = {
  size: 26, fallMin: 55, fallMax: 75, max: 6,
  rollSpeed: 30, damage: 1, heal: 1,
  edge: 2,
};

export const FOOD_ICONS = {
  老碗面: '🍜',
  米饭: '🍚',
  汉堡: '🍔',
  烤肉串: '🍢',
  啤酒: '🍺',
  冰激凌: '🍦',
  火锅: '🍲',
  饺子: '🥟',
  包子: '🥮',
  卷饼: '🌯',
};
const FOOD_TYPES = Object.keys(FOOD_ICONS);

function createChapter(id, name, width, subtitle) {
  return {
    id, name, width, height: VIEW.height, subtitle,
    spawn: { x: 56, y: GROUND },
    platforms: [], ladders: [], decoration: [], enemies: [], supplies: [], hazards: [],
    checkpoints: [], hints: [],
    exit: { x: width - 74, y: GROUND - 50, w: 34, h: 50 },
    boss: null,
  };
}

const desk = (c, x, w) => c.platforms.push({ x, y: GROUND, w, h: 22, kind: 'desk' });
const keyboard = (c, x, y, w, h) => c.platforms.push({ x, y, w, h, kind: 'keyboard' });
const books = (c, x, y, w, h) => c.platforms.push({ x, y, w, h, kind: 'books' });
const stand = (c, x, y, w) => c.platforms.push({ x, y, w, h: 18, kind: 'stand' });
const drawer = (c, x, y, w, h = 40) => c.platforms.push({ x, y, w, h, kind: 'drawer' });
const crate = (c, x, y, w, h = 30) => c.platforms.push({ x, y, w, h, kind: 'crate' });
const plank = (c, x, y, w) => c.platforms.push({ x, y, w, h: 8, kind: 'plank', oneway: true });
const shelf = (c, x, y, w) => c.platforms.push({ x, y, w, h: 10, kind: 'shelf', oneway: true });
// 斜坡：从左端 (x, y) 走到右端 (x + w, y - rise)，rise 为正表示往右上坡。
const slope = (c, x, y, w, rise) => c.platforms.push({ x, y, w, h: 12, kind: 'slope', rise });
// 键盘键帽：踩上去会被弹得更高，用来够到高处的分支。
const springboard = (c, x, y, w, power = 1.45) => c.platforms.push({ x, y, w, h: GROUND - y, kind: 'keyboard', bounce: power });
// 会塌的书堆：站上去一会儿就散架，过几秒复原。
const crumbly = (c, x, y, w) => c.platforms.push({ x, y, w, h: 24, kind: 'books', crumble: { delay: 0.55, respawn: 2.8 } });

const patrol = (c, x, minX, maxX) => c.enemies.push({ type: 'patrol', x, y: GROUND, minX, maxX });
const gunner = (c, x) => c.enemies.push({ type: 'gunner', x, y: GROUND });
const flyer = (c, x, y, minX, maxX) => c.enemies.push({ type: 'flyer', x, y, minX, maxX });
// 高处的飞怪只在玩家上到高处后主动攻击，地面路线仍然轻松。
const upperFlyer = (c, x, y, minX, maxX) => c.enemies.push({ type: 'flyer', x, y, minX, maxX, upperOnly: true });
const charger = (c, x, minX, maxX) => c.enemies.push({ type: 'charger', x, y: GROUND, minX, maxX, direction: -1 });
const shielder = (c, x) => c.enemies.push({ type: 'shielder', x, y: GROUND, direction: -1 });

const health = (c, x, y, amount = 1) => c.supplies.push({ x, y, amount });
const weapon = (c, x, y, type) => c.supplies.push({ x, y, type });
const grenades = (c, x, y, amount = 2) => c.supplies.push({ x, y, type: 'grenade', amount });
const hazard = (c, x, w, y, kind, h = 14) => c.hazards.push({ x, y, w, h, kind, damage: 1 });
const cp = (c, x, y = GROUND) => c.checkpoints.push({ x, y });
const hint = (c, x, text) => c.hints.push({ x, text });
const decorate = (c, x, y, kind) => c.decoration.push({ x, y, kind });

// ── 第 1 关 · 双层工位：桌面捷径、文件板桥与桌下通道 ──────────────────────
const printerBlock = (c, x, y, w) => c.platforms.push({ x, y, w, h: 22, kind: 'printerTop' });
const stage1 = createChapter('ch1', '第 1 关 · 双层工位', 3700, '穿过桌面和桌下通道，前往最里面的工位');
stage1.arenaStart = 3000;
stage1.spawn = { x: 76, y: GROUND };

const worktopY = 202;
for (const [left, right] of [[0, 2248], [2322, 2860], [2934, 3000]]) {
  stage1.platforms.push({ x: left, y: GROUND, w: right - left, h: 22, kind: 'floor' });
}
desk(stage1, 3000, 654);
for (const [left, right] of [[230, 760], [948, 1585], [1775, 2245], [2333, 2690]]) {
  stage1.platforms.push({ x: left, y: worktopY, w: right - left, h: 15, kind: 'worktop', oneway: true });
}
// 文件板用现有的塌陷和复原机制。每组下方都留有可继续前进的路线。
for (const [x, w] of [[760, 62], [822, 63], [885, 63], [1585, 63], [1648, 63], [1711, 64]]) {
  stage1.platforms.push({ x, y: worktopY, w, h: 10, kind: 'clipboard', oneway: true,
    crumble: { delay: .29, respawn: 2.8 } });
}
shelf(stage1, 115, 246, 102);
shelf(stage1, 2710, 244, 138);
stage1.platforms.push({ x: 2640, y: worktopY - 18, w: 42, h: 18, kind: 'keyboard', bounce: 1.45 });
stage1.ladders = [470, 1280, 2070, 2580].map(x => ({ x, y: worktopY, w: 26, h: GROUND - worktopY }));

decorate(stage1, 10, GROUND, 'keyboardDock');
decorate(stage1, 550, worktopY, 'staple');
decorate(stage1, 326, worktopY, 'deskPlant');
decorate(stage1, 1470, worktopY, 'monitor');
decorate(stage1, 1890, worktopY, 'deskPlant');
decorate(stage1, 2380, worktopY, 'cup');
decorate(stage1, 2400, GROUND, 'coil');
decorate(stage1, 2958, GROUND, 'cup');

stage1.enemies.push(
  { type: 'patrol', x: 540, y: worktopY, minX: 500, maxX: 665 },
  { type: 'gunner', x: 1205, y: worktopY },
  { type: 'gunner', x: 1905, y: worktopY },
  { type: 'gunner', x: 2500, y: worktopY },
);
patrol(stage1, 760, 638, 870);
patrol(stage1, 1480, 1370, 1580);
patrol(stage1, 2160, 2110, 2210);
flyer(stage1, 900, 142, 835, 1040);
flyer(stage1, 1670, 211, 1540, 1840);
flyer(stage1, 2820, 217, 2740, 2990);
hazard(stage1, 1325, 55, GROUND - 14, 'crumb');
hazard(stage1, 2440, 65, GROUND - 14, 'cable');

grenades(stage1, 490, GROUND - 14);
weapon(stage1, 566, worktopY - 14, 'spread');
health(stage1, 735, worktopY - 14);
health(stage1, 1130, GROUND - 14);
grenades(stage1, 1115, worktopY - 14);
weapon(stage1, 1525, worktopY - 14, 'rapid');
weapon(stage1, 2130, worktopY - 14, 'pierce');
grenades(stage1, 2369, GROUND - 14);
health(stage1, 2580, worktopY - 14);

const stage1FoodRows = [
  [GROUND, [78, 150, 220, 295, 365, 432, 560, 635, 712, 800, 880, 1035, 1100, 1180, 1260, 1405, 1520,
    1634, 1720, 1870, 2030, 2180, 2410, 2570, 2760, 2944]],
  [worktopY, [260, 345, 430, 520, 610, 682, 980, 1070, 1240, 1450, 1830, 1980, 2200, 2450]],
];
stage1.food = stage1FoodRows.flatMap(([y, positions]) => positions.map(x => ({ x, y: y - 20, w: 18, h: 20 })))
  .map((item, i) => ({ ...item, type: FOOD_TYPES[i % FOOD_TYPES.length] }));

cp(stage1, 76); cp(stage1, 830); cp(stage1, 1690); cp(stage1, 2080);
hint(stage1, 0, '可走桌面或桌下。靠近梯子向上或向下推，可在两层间切换。');
hint(stage1, 675, '文件板踩久会塌，可跳过松动的板子，也可以落到桌下继续走。');
hint(stage1, 1040, '上层有武器，下层也有补给。小心两侧涌来的小狗。');
hint(stage1, 1490, '前面还有一段文件板桥。桌下遇到空隙时记得跳过。');
hint(stage1, 2160, '前方两层都有缺口，先跳过去。走下层时可等电缆断电。');
hint(stage1, 2720, '从最后一张桌子下来，前面就是 6 狗。');


// ── 第 2 关 · 文件坡道 ───────────────────────────────────────────────────
const stage2 = createChapter('ch3', '第 2 关 · 文件坡道', 3600, '翻过办公推车坡道，前往打印区');
stage2.arenaStart = 2800;
stage2.spawn = { x: 360, y: GROUND };
const terrace = (c, x, y, w) => c.platforms.push({ x, y, w, h: 18, kind: 'worktop' });
terrace(stage2, 0, GROUND, 390);
slope(stage2, 378, GROUND, 222, 64);
terrace(stage2, 600, 228, 470);
slope(stage2, 1058, 228, 222, 66);
terrace(stage2, 1280, 168, 480);
terrace(stage2, 1832, 226, 511);
slope(stage2, 2325, 218, 260, -68);
desk(stage2, 2585, 215);
desk(stage2, 2800, 754);

shelf(stage2, 675, 154, 208);
shelf(stage2, 1378, 98, 214);
shelf(stage2, 1960, 148, 205);
for (const [x, y, kind] of [[160, 286, 'fileRack'], [650, 228, 'printerStack'],
  [1285, 168, 'fileRack'], [1610, 168, 'printerStack'], [2000, 226, 'fileRack'],
  [2646, 286, 'printerStack']]) decorate(stage2, x, y, kind);

stage2.enemies.push(
  { type: 'patrol', x: 230, y: GROUND, minX: 105, maxX: 340 },
  { type: 'patrol', x: 705, y: 228, minX: 630, maxX: 930 },
  { type: 'patrol', x: 987, y: 228, minX: 860, maxX: 1020 },
  { type: 'patrol', x: 1370, y: 168, minX: 1300, maxX: 1510 },
  { type: 'patrol', x: 2180, y: 226, minX: 2050, maxX: 2280 },
  { type: 'shielder', x: 895, y: 228, minX: 610, maxX: 1020 },
  { type: 'shielder', x: 1610, y: 168, minX: 1300, maxX: 1720 },
  { type: 'shielder', x: 2250, y: 226, minX: 1850, maxX: 2290 },
  { type: 'charger', x: 750, y: 228, minX: 660, maxX: 998 },
  { type: 'charger', x: 2040, y: 226, minX: 1885, maxX: 2260 },
  { type: 'gunner', x: 790, y: 154 },
  { type: 'gunner', x: 1470, y: 98 },
  { type: 'gunner', x: 2075, y: 148 },
  { type: 'gunner', x: 2660, y: GROUND },
);
flyer(stage2, 1010, 157, 910, 1200);
flyer(stage2, 1740, 124, 1650, 1960);
hazard(stage2, 920, 55, 214, 'cable');
hazard(stage2, 1510, 70, 154, 'spill');
hazard(stage2, 2150, 50, 212, 'crumb');

weapon(stage2, 775, 140, 'spread');
health(stage2, 630, 214);
grenades(stage2, 995, 214);
health(stage2, 1380, 154);
weapon(stage2, 2030, 134, 'heavy');
grenades(stage2, 2250, 212);
cp(stage2, 360); cp(stage2, 620, 228); cp(stage2, 1305, 168); cp(stage2, 2180, 226);
hint(stage2, 0, '沿推车坡道向右前进，架上的射手可以用斜上瞄准。');
hint(stage2, 615, '电缆会间歇通电，等灯熄灭再通过。');
hint(stage2, 1240, '进入打印区。咖啡渍会打滑，可以从纸架上绕开。');
hint(stage2, 1660, '前方两座工作台之间有缺口，起跳后向右落到下一张台面。');
hint(stage2, 2520, '沿缓坡下到打印间，骡子在前面。');


// ── 第 3 关 · 饮水角攀登 ──────────────────────────────────────────────────
const tower = createChapter('tower', '第 3 关 · 饮水角攀登', 1040, '借助盆栽架和接水盘爬上办公桌');
tower.height = 1600;
tower.spawn = { x: 90, y: 1520 };

function climbRows(level, rows) {
  for (const [x, y, w, kind, motion] of rows) {
    level.platforms.push({ x, y, w, h: 16, kind, oneway: true, arrow: true, motion });
  }
}

tower.platforms.push({ x: 0, y: 1520, w: 890, h: 22, kind: 'floor' });
climbRows(tower, [
  [70,1460,290,'drawer'], [280,1400,315,'shelf'], [515,1340,280,'shelf'],
  [410,1280,220,'tray',{distance:30,speed:43}], [160,1220,310,'shelf'],
  [100,1160,320,'drawer'], [300,1100,230,'tray',{distance:24,speed:38}],
  [465,1040,290,'shelf'], [595,980,300,'shelf'], [475,920,460,'worktop'],
  [260,860,320,'shelf'], [155,800,260,'drawer'], [290,740,300,'shelf'],
  [375,680,415,'worktop'], [640,620,260,'shelf'],
  [455,560,240,'tray',{distance:28,speed:40}], [225,500,310,'shelf'],
  [75,440,295,'drawer'], [115,380,295,'shelf'], [350,320,630,'desk'],
]);
tower.ladders = [
  { x: 145, y: 1460, w: 26, h: 60 }, { x: 305, y: 1160, w: 26, h: 60 },
  { x: 500, y: 860, w: 26, h: 60 }, { x: 325, y: 440, w: 26, h: 60 },
];
for (const [x, y] of [[49,1520], [536,1340], [111,1160], [193,800], [668,620], [105,440]]) {
  decorate(tower, x, y, 'deskPlant');
}
decorate(tower, 780, 920, 'waterDispenser');
hazard(tower, 700, 64, 906, 'cable');
health(tower, 135, 1506); weapon(tower, 580, 1326, 'spread');
health(tower, 550, 906); grenades(tower, 635, 666);
health(tower, 820, 606); weapon(tower, 160, 366, 'pierce');
health(tower, 500, 306); grenades(tower, 860, 306); weapon(tower, 740, 306, 'heavy');
tower.enemies.push(
  { type: 'patrol', x: 660, y: 1520, minX: 560, maxX: 820 },
  { type: 'gunner', x: 560, y: 1040 },
  { type: 'patrol', x: 580, y: 680, minX: 460, maxX: 706 },
  { type: 'gunner', x: 165, y: 380 },
);
flyer(tower, 780, 1160, 735, 970); flyer(tower, 95, 760, 50, 255);
cp(tower, 90, 1520); cp(tower, 500, 920); cp(tower, 410, 680);
cp(tower, 160, 380); cp(tower, 500, 320);
tower.hints = [
  { y: 1520, text: '沿盆栽架左右折返向上，接水盘可以站。' },
  { y: 1360, text: '等活动接水盘靠近再跳，落空还能回到下一层。' },
  { y: 930, text: '过饮水机旁的维修平台时，等电缆停止闪光。' },
  { y: 645, text: '跟上最后一个移动接水盘，再向左登上高处。' },
  { y: 360, text: '击败桌面上的 6 狗，从右侧离开。' },
];
tower.exit = { x: 920, y: 270, w: 34, h: 50 };
tower.boss = {
  ...BOSS, kind: 'dog', label: '6狗', coat: null, pattern: 1, health: 130,
  ground: 320, arenaLeft: 440, arenaRight: 960, trigger: 500, spawnX: 600,
};
tower.bosses = [tower.boss];

// ── 9/9 桌缝终局：Boss 竞技场 ────────────────────────────────────────────
const ch6 = createChapter('ch6', '第一关 · 9/9 桌缝终局', 1800, '桌缝尽头的守卫');
desk(ch6, 0, 240);
desk(ch6, 300, 1500);
decorate(ch6, 900, 286, 'monitor');
decorate(ch6, 1400, 286, 'cup');
grenades(ch6, 60, 270);
weapon(ch6, 120, 270, 'heavy');
health(ch6, 200, 270);
weapon(ch6, 1120, 270, 'heavy');
cp(ch6, 210);
hint(ch6, 0, '把最后一发手榴弹留在这里');
hint(ch6, 280, '它冲过来时跳起来躲开，落地的震波要跳过');

const monitor = createChapter('monitor', '第一关 · 7/9 显示器顶部', 1900, '攀过屏幕与线缆');
for (const [x,w] of [[0,520],[600,540],[1220,680]]) monitor.platforms.push({ x, y: GROUND, w, h: 22, kind: 'monitorTop' });
crate(monitor, 350, 256, 50); shelf(monitor, 800, 225, 100); crate(monitor, 1470, 256, 48);
flyer(monitor, 720, 210, 640, 950); patrol(monitor, 1545, 1518, 1660);
gunner(monitor, 1000); flyer(monitor, 1100, 190, 1050, 1200);
shielder(monitor, 900);
hazard(monitor, 740, 60, GROUND - 14, 'cable');
hazard(monitor, 1000, 100, GROUND - 14, 'spill');
health(monitor, 640, 270); weapon(monitor, 1250, 270, 'pierce');
weapon(monitor, 1830, 270, 'heavy');
cp(monitor, 120); cp(monitor, 1260); cp(monitor, 1680);
hint(monitor, 0, '沿显示器顶部前进，小心屏幕间的空隙');

const printer = createChapter('printer', '第一关 · 8/9 打印机', 1900, '穿越纸张与设备');
for (const [x,w] of [[0,610],[690,530],[1300,600]]) printer.platforms.push({ x, y: GROUND, w, h: 22, kind: 'printerTop' });
plank(printer, 50, 218, 180); shelf(printer, 245, 158, 160);
books(printer, 380, 258, 60, 28); crate(printer, 900, 256, 48); shelf(printer, 1500, 220, 100);
gunner(printer, 850); patrol(printer, 1650, 1530, 1770); flyer(printer, 1100, 200, 1000, 1200);
patrol(printer, 1400, 1330, 1520);
upperFlyer(printer, 490, 130, 460, 535);
upperFlyer(printer, 900, 130, 850, 950);
charger(printer, 1000, 700, 1200);
shielder(printer, 1600);
hazard(printer, 1450, 55, GROUND - 14, 'crumb');
hazard(printer, 700, 90, GROUND - 14, 'cable');
hazard(printer, 1600, 80, GROUND - 14, 'cable');
health(printer, 700, 270); grenades(printer, 1330, 270); weapon(printer, 1800, 270, 'heavy');
weapon(printer, 1860, 270, 'heavy');
grenades(printer, 315, 142);
cp(printer, 120); cp(printer, 740); cp(printer, 1350); cp(printer, 1740);
hint(printer, 0, '沿纸张向上可获取补给，小心高处飞怪');

const CHAPTERS = [stage1, stage2, monitor, printer, ch6];

const bossCoats = [
  { name: '金黄', light: '#efaf43', dark: '#955028', mark: '#ffd88d', pattern: 'solid' },
  { name: '黑白花', light: '#fff9f1', dark: '#9b9b9f', mark: '#272630', pattern: 'patch' },
  { name: '灰狼色', light: '#a3b8c3', dark: '#3e5464', mark: '#e0ebee', pattern: 'mask' },
  { name: '棕色条纹', light: '#de924e', dark: '#814323', mark: '#61341f', pattern: 'brindle' },
  { name: '白底黑斑', light: '#fffcf2', dark: '#b5bec1', mark: '#252f38', pattern: 'spots' },
  { name: '黑褐', light: '#54505d', dark: '#24202d', mark: '#d58346', pattern: 'points' },
  { name: '红棕白花', light: '#d98456', dark: '#873b31', mark: '#fff0d7', pattern: 'patch' },
  { name: '蓝灰斑', light: '#9ba9c5', dark: '#4b5874', mark: '#354360', pattern: 'spots' },
  { name: '奶油白', light: '#fff8de', dark: '#c3a782', mark: '#f9dfaf', pattern: 'mask' },
];

// 每关只在最后一段放 BOSS：第 1 关 stage1（6 狗）、第 2 关 stage2（骡子）、第 4 关 ch6。
// 第 3 关「工位攀登」的 BOSS 写在 tower 里，不走这张表。
const BOSS_CHAPTERS = new Map([
  [stage1, { health: 78, pattern: 0, coat: bossCoats[0], kind: 'dog', label: '6狗' }],
  [stage2, { health: 104, pattern: 0, coat: null, kind: 'mule', label: '骡子' }],
  [ch6, { health: 156, pattern: 2, coat: bossCoats[8], kind: 'dog', label: '6狗' }],
]);

// 原来有 BOSS 但被取消的场地：长度保留，改成一片巡逻队把守的区域。
function fillArena(level, arenaLeft, arenaRight) {
  patrol(level, arenaLeft + 90, arenaLeft + 30, arenaRight - 140);
  gunner(level, Math.min(arenaLeft + 300, arenaRight - 70));
  if (arenaRight - arenaLeft > 480) flyer(level, arenaLeft + 210, 190, arenaLeft + 70, arenaRight - 110);
  health(level, arenaLeft + 470, GROUND - 34);
  hint(level, arenaLeft + 10, '这里原本有首领驻守，现在换成了巡逻队。');
}

for (const level of CHAPTERS) {
  const spec = BOSS_CHAPTERS.get(level);
  const hasRoomAtEnd = !!spec;
  // 有 BOSS 的段用 arenaStart 指定竞技场起点，否则整段都算（后面再接一段巡逻区）。
  const arenaLeft = hasRoomAtEnd ? (level.arenaStart ?? level.width - 640) : level.width;
  if (!hasRoomAtEnd) {
    const lastSurface = level.platforms.find(p => p.y === GROUND && p.x + p.w === level.width);
    lastSurface.w += 635;
    level.width += 635;
  }
  const arenaRight = level.width - 46;
  if (!spec) {
    fillArena(level, arenaLeft, arenaRight);
    continue;
  }
  level.boss = {
    ...BOSS, arenaLeft, arenaRight,
    trigger: arenaLeft + 20,
    spawnX: arenaLeft + (spec.kind === 'mule' ? 310 : 370),
    health: spec.health,
    coat: spec.coat,
    pattern: spec.pattern,
    kind: spec.kind,
    label: spec.label,
  };
  // 骡子半血时喊一次「狗来」召唤 6 狗。
  if (spec.kind === 'mule') {
    Object.assign(level.boss, {
      warning: 0.9,
      framedArena: true,
      movement: { walkSpeed: 132, dashSpeed: 315, leapSpeed: 180, returnSpeed: 220, walkTime: .95, recovery: .52 },
      logicSpeed: DROPPINGS.rollSpeed,
      summonAt: 0.5,
      summonTime: 2.8,
      summonHealth: 60,
      summonPattern: 0,
      summonCoat: bossCoats[0],
      droppings: false,
    });
  }
  level.exit = { ...level.exit, x: arenaRight + 7 };
  cp(level, arenaLeft - 48);
  hint(level, arenaLeft - 10, `击败前方的 ${spec.label} 才能继续前进。`);
}

// 把两段或多段拼成一段：坐标整体右移，BOSS 各自保留自己的竞技场，
// 只保留最后一段的出口，途中的出口全部丢弃。
function shift(items, dx) {
  return items.map(item => {
    const copy = { ...item, x: item.x + dx };
    if (typeof item.minX === 'number') copy.minX = item.minX + dx;
    if (typeof item.maxX === 'number') copy.maxX = item.maxX + dx;
    return copy;
  });
}

function mergeChapters(id, name, subtitle, parts) {
  const merged = createChapter(id, name, 0, subtitle);
  merged.platforms = [];
  merged.decoration = [];
  merged.enemies = [];
  merged.supplies = [];
  merged.hazards = [];
  merged.checkpoints = [];
  merged.hints = [];
  merged.bosses = [];
  merged.regions = [];
  let offset = 0;
  for (const part of parts) {
    merged.regions.push({ x: offset, end: offset + part.width, theme: part.id });
    merged.platforms.push(...shift(part.platforms, offset));
    merged.ladders.push(...shift(part.ladders, offset));
    merged.decoration.push(...shift(part.decoration, offset));
    merged.enemies.push(...shift(part.enemies, offset));
    merged.supplies.push(...shift(part.supplies, offset));
    merged.hazards.push(...shift(part.hazards, offset));
    merged.checkpoints.push(...shift(part.checkpoints, offset));
    merged.hints.push(...shift(part.hints, offset));
    if (part.boss) {
      merged.bosses.push({
        ...part.boss,
        arenaLeft: part.boss.arenaLeft + offset,
        arenaRight: part.boss.arenaRight + offset,
        trigger: part.boss.trigger + offset,
        spawnX: part.boss.spawnX + offset,
      });
    }
    offset += part.width;
  }
  merged.width = offset;
  merged.spawn = { ...parts[0].spawn };
  const last = parts[parts.length - 1];
  merged.exit = { ...last.exit, x: last.exit.x + (offset - last.width) };
  merged.boss = merged.bosses[0];
  if (parts.length === 1 && parts[0].food) {
    merged.food = parts[0].food;
    return merged;
  }
  // 每段从安全的地面位置中均匀选出 40 个，避开缺口、障碍和首领战场。
  const candidates = [];
  const groundKinds = new Set(['desk', 'floor', 'monitorTop', 'printerTop']);
  for (let x = 90; x < merged.width - 90; x += 35) {
    const area = { x, y: GROUND - 28, w: 18, h: 28 };
    const overlaps = object => area.x < object.x + object.w && area.x + area.w > object.x
      && area.y < object.y + object.h && area.y + area.h > object.y;
    const supported = merged.platforms.some(platform => groundKinds.has(platform.kind)
      && platform.x <= x - 8 && platform.x + platform.w >= x + 26);
    const blocked = merged.platforms.some(platform => !platform.oneway && overlaps(platform))
      || merged.hazards.some(overlaps)
      || merged.supplies.some(item => Math.abs(item.x - x) < 30 && Math.abs(item.y - GROUND) < 45)
      || merged.bosses.some(boss => x >= boss.arenaLeft - 40 && x <= boss.arenaRight + 40);
    if (supported && !blocked) candidates.push(x);
  }
  if (candidates.length < 40) throw new Error(`食品位置不足：${name}`);
  merged.food = Array.from({ length: 40 }, (_, index) => ({
    x: candidates[Math.floor((index + 0.5) * candidates.length / 40)],
    y: GROUND - 22, w: 18, h: 20, type: FOOD_TYPES[index % FOOD_TYPES.length],
  }));
  return merged;
}

// 纵向关卡按主路线分层放置食品。
function routeFood(chapter, surfaces) {
  const candidates = [];
  for (const platform of surfaces) {
    for (let x = platform.x + 20; x + 32 <= platform.x + platform.w; x += 35) {
      const y = platform.y;
      if (chapter.hazards.some(h => x < h.x + h.w + 10 && x + 28 > h.x && y - 22 < h.y + h.h && y > h.y)) continue;
      if (chapter.supplies.some(s => Math.abs(s.x - x) < 35 && Math.abs(s.y + 14 - y) < 35)) continue;
      candidates.push({ x, y: y - 20, w: 18, h: 20 });
    }
  }
  if (candidates.length < 40) throw new Error(`食品位置不足：${chapter.name}`);
  return Array.from({ length: 40 }, (_, i) => ({
    ...candidates[Math.floor((i + .5) * candidates.length / 40)], type: FOOD_TYPES[i % FOOD_TYPES.length],
  }));
}

stage2.food = routeFood(stage2, stage2.platforms.filter(p => p.kind !== 'slope' && p.x < stage2.arenaStart));

function finalizeTower(chapter) {
  const route = chapter.platforms.filter(p => (p.kind === 'floor' || p.arrow) && p.y > chapter.boss.ground);
  chapter.food = [];
  // 每层均匀放两份，避开补给和电缆；移动盘上的食品随盘移动。
  for (const platform of route) {
    const chosen = [];
    for (const fraction of [.28, .72]) {
      const preferred = platform.x + platform.w * fraction;
      const candidates = Array.from({ length: Math.floor((platform.w - 40) / 10) }, (_, i) => platform.x + 20 + i * 10);
      candidates.sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred));
      const x = candidates.find(candidate => chosen.every(previous => Math.abs(candidate - previous) >= 42)
        && chapter.supplies.every(item => Math.abs(item.y - (platform.y - 14)) > 20 || Math.abs(item.x - candidate) >= 42)
        && chapter.hazards.every(h => h.y + h.h !== platform.y || candidate + 28 <= h.x || candidate >= h.x + h.w + 10));
      if (x === undefined) throw new Error('工位攀登食品位置不足');
      chosen.push(x);
      const index = chapter.food.length;
      chapter.food.push({ x, y: platform.y - 20, w: 18, h: 20, type: FOOD_TYPES[index % FOOD_TYPES.length] });
    }
  }
  chapter.regions = [{ x: 0, end: chapter.width, theme: 'tower' }];
  chapter.bosses = chapter.bosses ?? (chapter.boss ? [chapter.boss] : []);
  return chapter;
}


// 第 4 关先横向进入货梯区，再经两段货梯抵达设备桌。
const shaft = createChapter('shaft', '第 4 关 · 档案货梯', 1040, '穿过档案走廊，换乘货梯抵达求救电脑');
shaft.height = 1600;
shaft.spawn = { x: 92, y: 1520 };
shaft.platforms.push({ x: 42, y: 1520, w: 946, h: 22, kind: 'floor' });
climbRows(shaft, [
  [722,1460,250,'drawer'], [736,1400,220,'shelf'], [725,1340,244,'worktop'],
  [360,1040,605,'worktop'], [445,980,285,'shelf'], [276,920,296,'shelf'],
  [175,860,310,'worktop'], [672,560,278,'worktop'], [505,500,280,'drawer'],
  [300,440,292,'shelf'], [135,380,290,'shelf'], [350,320,630,'desk'],
]);
shaft.platforms.push(
  { x: 560, y: 1200, w: 149, h: 18, kind: 'cargoLift', oneway: true,
    motion: { axis: 'y', distance: 160, speed: 95 } },
  { x: 497, y: 720, w: 158, h: 18, kind: 'cargoLift', oneway: true,
    motion: { axis: 'y', distance: 160, speed: 95 } },
);
shaft.ladders = [
  { x: 795, y: 1460, w: 26, h: 60 }, { x: 772, y: 1340, w: 26, h: 60 },
  { x: 470, y: 980, w: 26, h: 60 }, { x: 390, y: 380, w: 26, h: 60 },
];
for (const [x, y] of [[123,1520], [583,1520], [775,1040], [690,560]]) {
  decorate(shaft, x, y, 'fileRack');
}
shaft.enemies.push(
  { type: 'patrol', x: 430, y: 1520, minX: 320, maxX: 565 },
  { type: 'patrol', x: 860, y: 1040, minX: 790, maxX: 930 },
  { type: 'gunner', x: 365, y: 860 }, { type: 'gunner', x: 185, y: 380 },
);
flyer(shaft, 896, 1240, 807, 979); flyer(shaft, 180, 665, 85, 300);
health(shaft, 686, 1506); weapon(shaft, 830, 1386, 'spread');
grenades(shaft, 550, 1026); health(shaft, 220, 846);
weapon(shaft, 890, 546, 'pierce'); health(shaft, 500, 306);
grenades(shaft, 860, 306); weapon(shaft, 740, 306, 'heavy');
cp(shaft, 92, 1520); cp(shaft, 760, 1040); cp(shaft, 255, 860);
cp(shaft, 170, 380); cp(shaft, 500, 320);
shaft.hints = [
  { y: 1520, text: '先穿过档案走廊。右侧有梯子，通往第一部货梯。' },
  { y: 1360, text: '等左侧货梯升到站台附近，再跳到货梯上。' },
  { y: 1050, text: '在右侧下货梯，穿过中转层去找第二部货梯。' },
  { y: 875, text: '第二部货梯在右侧。到顶后向右跳上档案台。' },
  { y: 385, text: '击败 6 狗，到右侧电脑发出求救信号。' },
];
shaft.exit = { x: 920, y: 270, w: 34, h: 50, kind: 'terminal' };
shaft.boss = { ...ch6.boss, ground: 320, arenaLeft: 440, arenaRight: 960, trigger: 500, spawnX: 600 };
shaft.bosses = [shaft.boss];
shaft.checkpointLayout = 'equipment-shaft';
shaft.legacyCheckpoints = { 0: 0, 1: 0, 2: 1, 3: 1, 4: 2, 5: 2, 6: 3, 7: 3, 8: 4 };

// 关尾桌面位置固定，以下楼层的间距由 60 扩至 76 像素。
const floorY = y => Math.round(320 + (y - 320) * 76 / 60);
for (const level of [tower, shaft]) {
  level.height = floorY(level.height);
  level.spawn.y = floorY(level.spawn.y);
  for (const platform of level.platforms) {
    platform.y = floorY(platform.y);
    if (platform.oneway) platform.h = Math.min(platform.h, 20);
    if (platform.rise) platform.rise = floorY(320 + platform.rise) - 320;
    if (platform.motion?.axis === 'y') platform.motion.distance = floorY(320 + platform.motion.distance) - 320;
  }
  for (const ladder of level.ladders) {
    ladder.h = floorY(ladder.y + ladder.h) - floorY(ladder.y);
    ladder.y = floorY(ladder.y);
  }
  for (const item of level.supplies) item.y = floorY(item.y + 14) - 14;
  for (const item of level.hazards) item.y = floorY(item.y + item.h) - item.h;
  for (const item of [...level.enemies, ...level.checkpoints, ...level.hints, ...level.decoration]) item.y = floorY(item.y);
}

// 每关只在关尾配置一只主 BOSS。
export const LEVELS = [
  mergeChapters('ch1', stage1.name, stage1.subtitle, [stage1]),
  mergeChapters('ch2', stage2.name, stage2.subtitle, [stage2]),
  finalizeTower(tower),
  shaft,
];
shaft.food = routeFood(shaft, shaft.platforms.filter(p => !p.motion && p.y > shaft.boss.ground));

// 改版前的长地图用了更多检查点。只迁移新版不存在的编号，避免重解释新版存档。
LEVELS[0].legacyCheckpoints = { 5: 1, 6: 2, 7: 2, 8: 3, 9: 3, 10: 3, 11: 4, 12: 4 };
LEVELS[1].legacyCheckpoints = { 5: 2, 6: 3, 7: 3, 8: 4, 9: 4, 10: 4 };

// 第 2 关打印区断电 7 秒，只剩角色周围一圈光。
LEVELS[1].blackout = { x: 1450, w: 1200, duration: 7 };

// 每波使用没有实体障碍的连续地面；第三关分在两个不同高度的平台上。
const hordeSpans = [
  [[1190, 1450], [1970, 2240]],
  [[640, 1015, 228], [1880, 2275, 226]],
  [[535, 865, floorY(920)], [413, 739, floorY(680)]],
  [[225, 590, floorY(1520)], [640, 930, floorY(1040)]],
];
for (const [index, level] of LEVELS.entries()) {
  level.hordes = hordeSpans[index].map(([left, right, ground = GROUND]) => ({ left, right, ground }));
}
