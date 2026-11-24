export const VIEW = { width: 640, height: 360 };
export const GROUND = 286;

export const PLAYER = {
  width: 17, height: 27, speed: 188, acceleration: 1650,
  gravity: 1080, jumpSpeed: 482, maxFallSpeed: 560,
  coyoteTime: 0.10, jumpBuffer: 0.13,
  maxHealth: 5, lives: 3, invincibleTime: 1.15, respawnInvincible: 1.8,
  knockbackSpeed: 145, knockbackTime: 0.16,
};

export const CHARACTERS = {
  minister: { name: '大老师', maxHealth: 8, ammoMultiplier: 1, pickupMultiplier: 1, infiniteGrenades: false },
  manager: { name: '张经理', maxHealth: 5, ammoMultiplier: 2, pickupMultiplier: 2, infiniteGrenades: false },
  ma: { name: '马经理', maxHealth: 5, ammoMultiplier: 1, pickupMultiplier: 1, infiniteGrenades: true },
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

const patrol = (c, x, minX, maxX) => c.enemies.push({ type: 'patrol', x, y: GROUND, minX, maxX });
const gunner = (c, x) => c.enemies.push({ type: 'gunner', x, y: GROUND });
const flyer = (c, x, y, minX, maxX) => c.enemies.push({ type: 'flyer', x, y, minX, maxX });
// 高处的飞怪只在玩家上到高处后主动攻击，地面路线仍然轻松。
const upperFlyer = (c, x, y, minX, maxX) => c.enemies.push({ type: 'flyer', x, y, minX, maxX, upperOnly: true });

const health = (c, x, y, amount = 2) => c.supplies.push({ x, y, amount });
const weapon = (c, x, y, type) => c.supplies.push({ x, y, type });
const grenades = (c, x, y, amount = 2) => c.supplies.push({ x, y, type: 'grenade', amount });
const hazard = (c, x, w, y, kind, h = 14) => c.hazards.push({ x, y, w, h, kind, damage: 1 });
const cp = (c, x, y = GROUND) => c.checkpoints.push({ x, y });
const hint = (c, x, text) => c.hints.push({ x, text });
const decorate = (c, x, y, kind) => c.decoration.push({ x, y, kind });

// ── 1/9 键盘区：教学，平坦 + 一个断口 + 首个陷阱 ────────────────────────────
const ch1 = createChapter('ch1', '第一关 · 1/9 键盘区', 2300, '从键盘旁出发');
ch1.spawn = { x: 88, y: 262 };
desk(ch1, 0, 442);
keyboard(ch1, 48, 262, 166, 24);
books(ch1, 240, 267, 55, 19);
books(ch1, 295, 251, 68, 35);
desk(ch1, 516, 548);
stand(ch1, 591, 267, 110);
books(ch1, 900, 230, 70, 20);
plank(ch1, 980, 196, 90);
desk(ch1, 1126, 1174);
plank(ch1, 1300, 218, 170);
shelf(ch1, 1470, 158, 160);
decorate(ch1, 558, 267, 'monitor');
decorate(ch1, 1175, 286, 'cup');
patrol(ch1, 760, 700, 850);
patrol(ch1, 1600, 1520, 1720);
hazard(ch1, 1240, 60, GROUND - 14, 'crumb');
health(ch1, 307, 235);
weapon(ch1, 715, 251, 'spread');
grenades(ch1, 1010, 180);
health(ch1, 1350, 270);
grenades(ch1, 1535, 142);
weapon(ch1, 1900, 270, 'rapid');
cp(ch1, 120, 262); cp(ch1, 560); cp(ch1, 1150); cp(ch1, 1500); cp(ch1, 1900); cp(ch1, 2150);
hint(ch1, 0, '摇杆移动与瞄准，推得浅会站着不动');
hint(ch1, 240, '跳上书本，再越过桌缝');
hint(ch1, 700, '前方有巡逻怪，按住开火可以连发');
hint(ch1, 1126, '跳上悬空文件，往高处寻找补给');
hint(ch1, 1200, '面包屑可以开枪打掉');
hint(ch1, 1520, '小心地面障碍，跳过去或射击清除');

// ── 2/9 书堆迷宫：纵向爬升 + 射击怪 ────────────────────────────────────────
const ch2 = createChapter('ch2', '第一关 · 2/9 书堆迷宫', 3300, '堆叠的文件与书本');
desk(ch2, 0, 910);
books(ch2, 320, 250, 56, 36);
books(ch2, 376, 214, 56, 36);
books(ch2, 432, 178, 48, 36);
plank(ch2, 560, 150, 90);
desk(ch2, 1010, 430);
books(ch2, 1150, 246, 70, 40);
shelf(ch2, 1240, 210, 100);
desk(ch2, 1540, 470);
books(ch2, 1620, 240, 60, 46);
books(ch2, 1680, 200, 60, 40);
shelf(ch2, 1760, 170, 120);
desk(ch2, 2110, 1190);
decorate(ch2, 700, 286, 'pen');
decorate(ch2, 1300, 286, 'eraser');
decorate(ch2, 2300, 286, 'staple');
patrol(ch2, 800, 720, 880);
gunner(ch2, 1390);
patrol(ch2, 1880, 1820, 1970);
gunner(ch2, 2250);
patrol(ch2, 2400, 2340, 2520);
hazard(ch2, 2270, 50, GROUND - 14, 'crumb');
weapon(ch2, 590, 134, 'pierce');
weapon(ch2, 1800, 154, 'spread');
health(ch2, 700, 270);
grenades(ch2, 1300, 270);
health(ch2, 1900, 270);
health(ch2, 2460, 270);
cp(ch2, 100); cp(ch2, 520); cp(ch2, 1050); cp(ch2, 1580); cp(ch2, 2160); cp(ch2, 2570);
grenades(ch2, 2575, 270);
hint(ch2, 0, '书堆可以一路踩上去，高处的补给更好');
hint(ch2, 300, '淡色横板可以从下方穿过去');
hint(ch2, 1000, '前方有射击怪，别站着不动');
hint(ch2, 1500, '爬得越高，弹药越强');
hint(ch2, 2100, '前方是 6 狗，整理装备准备战斗');
hint(ch2, 2600, '击败 6 狗才能离开，小心从天上掉落的东西');

// ── 3/9 线缆区：放电陷阱 + 飞怪 + 断崖 ────────────────────────────────────
const ch3 = createChapter('ch3', '第一关 · 3/9 显示器线缆区', 2700, '缠绕的线与漏电');
desk(ch3, 0, 290);
desk(ch3, 390, 390);
desk(ch3, 880, 430);
desk(ch3, 1410, 370);
desk(ch3, 1870, 390);
desk(ch3, 2360, 340);
plank(ch3, 600, 230, 80);
books(ch3, 1480, 244, 70, 42);
shelf(ch3, 1570, 206, 110);
plank(ch3, 1830, 220, 70);
decorate(ch3, 700, 286, 'coil');
decorate(ch3, 2250, 286, 'pencil');
gunner(ch3, 1260);
gunner(ch3, 2180);
patrol(ch3, 1700, 1640, 1760);
patrol(ch3, 2450, 2400, 2600);
flyer(ch3, 500, 200, 430, 720);
flyer(ch3, 800, 190, 770, 900);
flyer(ch3, 2050, 180, 1980, 2240);
hazard(ch3, 470, 100, GROUND - 14, 'cable');
hazard(ch3, 1000, 110, GROUND - 14, 'cable');
hazard(ch3, 1160, 50, GROUND - 14, 'cable');
hazard(ch3, 1950, 100, GROUND - 14, 'cable');
weapon(ch3, 1600, 190, 'spread');
weapon(ch3, 900, 270, 'rapid');
grenades(ch3, 2600, 270);
health(ch3, 2400, 270);
cp(ch3, 80); cp(ch3, 920); cp(ch3, 1900); cp(ch3, 2400);
hint(ch3, 0, '电缆周期通电，暗淡时可安全通过');
hint(ch3, 260, '空中飘的飞怪会俯冲，提前射它');
hint(ch3, 800, '断崖之间有小跳板，别掉下去');
hint(ch3, 1400, '检查点每走一段就有一个');
hint(ch3, 1900, '离显示器越近，线越乱');
hint(ch3, 2300, '前方就是桌缝');

// ── 4/9 咖啡区：湿滑地面 + 混合敌人 ──────────────────────────────────────
const ch4 = createChapter('ch4', '第一关 · 4/9 咖啡渍区', 2800, '泼洒的咖啡与湿滑的桌面');
desk(ch4, 0, 350);
desk(ch4, 450, 710);
desk(ch4, 1260, 430);
desk(ch4, 1790, 390);
desk(ch4, 2280, 520);
plank(ch4, 470, 218, 165);
shelf(ch4, 650, 158, 170);
books(ch4, 880, 240, 60, 46);
books(ch4, 940, 200, 60, 40);
shelf(ch4, 950, 176, 100);
books(ch4, 1440, 250, 56, 36);
plank(ch4, 1500, 214, 90);
decorate(ch4, 620, 286, 'cup');
decorate(ch4, 1700, 286, 'crumbcoil');
decorate(ch4, 2500, 286, 'pen');
patrol(ch4, 700, 620, 900);
gunner(ch4, 1100);
gunner(ch4, 1560);
patrol(ch4, 2000, 1950, 2140);
gunner(ch4, 2400);
patrol(ch4, 2600, 2500, 2740);
flyer(ch4, 2100, 170, 2000, 2160);
hazard(ch4, 140, 90, GROUND - 14, 'spill');
hazard(ch4, 560, 95, GROUND - 14, 'spill');
hazard(ch4, 760, 95, GROUND - 14, 'spill');
hazard(ch4, 1350, 110, GROUND - 14, 'spill');
hazard(ch4, 1890, 90, GROUND - 14, 'spill');
hazard(ch4, 2040, 50, GROUND - 14, 'crumb');
weapon(ch4, 1000, 160, 'rapid');
health(ch4, 1300, 270);
grenades(ch4, 725, 142);
grenades(ch4, 1650, 270);
health(ch4, 2350, 270);
weapon(ch4, 2750, 270, 'heavy');
cp(ch4, 100); cp(ch4, 480); cp(ch4, 1300); cp(ch4, 1800); cp(ch4, 2320); cp(ch4, 2600);
hint(ch4, 0, '咖啡渍会打滑，转向和刹车变慢，跳过可免受伤害');
hint(ch4, 340, '滑行时很难刹车，提前起跳');
hint(ch4, 800, '注意高台上的射击怪');
hint(ch4, 1250, '两处咖啡渍之间是安全区');
hint(ch4, 1800, '飞怪会沿着咖啡的味道俯冲');
hint(ch4, 2300, '最后一段了，检查点很密');

// ── 第 3 关 · 工位攀登：从办公室地面一路爬到桌面顶层 ────────────────────────
// 世界坐标向下为正，所以「往上爬」就是 y 越来越小。整关高度 1600，镜头要纵向跟随。
const tower = createChapter('tower', '第 3 关 · 工位攀登', 1040, '踩着抽屉和文件盒爬到桌面顶层');
tower.height = 1600;
tower.spawn = { x: 90, y: 1520 };

const step = (x, y, w, kind, h) => {
  const oneway = true;
  tower.platforms.push({
    x, y, w, kind,
    h: h ?? (oneway ? 8 : 28),
    oneway,
    arrow: true,
  });
};
const landing = (x, y, w) => tower.platforms.push({ x, y, w, h: 22, kind: 'desk', oneway: true, arrow: true });
const side = (x, y, w) => {
  tower.platforms.push({ x, y, w, h: 14, kind: 'books', oneway: true });
};
const towerEnemy = (type, x, y, minX, maxX) => tower.enemies.push(
  maxX === undefined ? { type, x, y } : { type, x, y, minX, maxX },
);

// 底层：办公室地面
tower.platforms.push({ x: 0, y: 1520, w: 760, h: 22, kind: 'floor' });
// 主路：左右两列交替，每级上升 60px，相邻两级水平错开 40px（不会出现「头顶被压住」）
step(90, 1460, 260, 'drawer', 40);
step(390, 1400, 310, 'crate', 30);
step(150, 1340, 280, 'books', 24);
step(360, 1280, 290, 'shelf');
step(70, 1220, 300, 'drawer', 40);
step(390, 1160, 310, 'crate', 30);
step(100, 1100, 270, 'shelf');
step(340, 1040, 310, 'books', 24);
step(60, 980, 280, 'books', 24);
landing(380, 920, 380);
step(90, 860, 290, 'drawer', 40);
step(350, 800, 320, 'crate', 30);
step(130, 740, 280, 'shelf');
landing(380, 680, 400);
step(70, 620, 300, 'drawer', 40);
step(390, 560, 310, 'books', 24);
step(120, 500, 280, 'shelf');
step(360, 440, 300, 'crate', 30);
step(60, 380, 240, 'drawer', 40);
for (const y of [1400, 1100, 560]) {
  const platform = tower.platforms.find(item => item.arrow && item.y === y);
  platform.motion = { distance: 24, speed: 32 };
}
// 顶层：首领战场（从左侧的抽屉跳上来）
landing(350, 320, 630);

// 梯子连接相邻固定平台，摇杆或方向键向上、向下即可攀爬。
tower.ladders = [
  { x: 180, y: 1460, w: 26, h: 60 },
  { x: 385, y: 1280, w: 26, h: 60 },
  { x: 355, y: 800, w: 26, h: 60 },
  { x: 365, y: 440, w: 26, h: 60 },
];

// 偏离主路的支线平台：放食品和补给
side(760, 1400, 120);
side(400, 1340, 120);
side(760, 1160, 120);
side(760, 1040, 120);
side(400, 860, 120);
side(720, 560, 120);
health(tower, 120, 1520 - 14);
weapon(tower, 650, 1400 - 14, 'spread');
health(tower, 470, 920 - 14);
grenades(tower, 620, 680 - 14);
weapon(tower, 120, 380 - 14, 'pierce');
health(tower, 500, 320 - 14);
grenades(tower, 860, 320 - 14);
weapon(tower, 740, 320 - 14, 'heavy');

// 敌人：地面巡逻 + 平台上的射手 + 中段少量飞行怪
towerEnemy('patrol', 520, 1520, 420, 700);
towerEnemy('gunner', 500, 920);
towerEnemy('patrol', 500, 680, 400, 700);
towerEnemy('gunner', 150, 380);
towerEnemy('flyer', 700, 1150, 600, 880);
towerEnemy('flyer', 300, 900, 60, 400);

// 检查点按攀爬顺序摆放（纵向高度决定重生楼层）
cp(tower, 90, 1520);
cp(tower, 420, 920);
cp(tower, 420, 680);
cp(tower, 100, 380);
cp(tower, 500, 320);

// 提示按高度触发
tower.hints = [
  { y: 1500, text: '踩上抽屉往上跳；靠近梯子向上推即可攀爬' },
  { y: 1200, text: '跳跃时可以从平台下方穿过' },
  { y: 1000, text: '跳偏了会落回下一层，掉出画面底部才会扣命' },
  { y: 700, text: '注意空中的飞怪，先打掉再往上' },
  { y: 380, text: '最上层是一片大平台' },
  { y: 330, text: '击败 6 狗，从右边的出口离开' },
];

tower.exit = { x: 920, y: 320 - 50, w: 34, h: 50 };
tower.boss = {
  ...BOSS,
  kind: 'dog',
  label: '6狗',
  coat: null,
  pattern: 1,
  health: 100,
  ground: 320,
  arenaLeft: 440,
  arenaRight: 960,
  trigger: 500,
  spawnX: 600,
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
flyer(monitor, 720, 210, 640, 950); patrol(monitor, 1510, 1420, 1660);
gunner(monitor, 1000); flyer(monitor, 1100, 190, 1050, 1200);
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
hazard(printer, 1450, 55, GROUND - 14, 'crumb');
hazard(printer, 700, 90, GROUND - 14, 'cable');
hazard(printer, 1600, 80, GROUND - 14, 'cable');
health(printer, 700, 270); grenades(printer, 1330, 270); weapon(printer, 1800, 270, 'heavy');
weapon(printer, 1860, 270, 'heavy');
grenades(printer, 315, 142);
cp(printer, 120); cp(printer, 740); cp(printer, 1350); cp(printer, 1740);
hint(printer, 0, '沿纸张向上可获取补给，小心高处飞怪');

const CHAPTERS = [ch1, ch2, ch3, ch4, monitor, printer, ch6];

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

// 每关只在最后一段放 BOSS：第 1 关 ch2（6 狗）、第 2 关 ch4（骡子）、第 4 关 ch6。
// 第 3 关「工位攀登」的 BOSS 写在 tower 里，不走这张表。
const BOSS_CHAPTERS = new Map([
  [ch2, { health: 60, pattern: 0, coat: bossCoats[0], kind: 'dog', label: '6狗' }],
  [ch4, { health: 80, pattern: 0, coat: null, kind: 'mule', label: '骡子' }],
  [ch6, { health: 120, pattern: 2, coat: bossCoats[8], kind: 'dog', label: '6狗' }],
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
  const hasRoomAtEnd = level === ch2 || level === ch6;
  const arenaLeft = level === ch2 ? 2620 : level === ch6 ? 1180 : level.width;
  if (!hasRoomAtEnd) {
    const lastSurface = level.platforms.find(p => p.y === GROUND && p.x + p.w === level.width);
    lastSurface.w += 635;
    level.width += 635;
  }
  const arenaRight = level.width - 46;
  const spec = BOSS_CHAPTERS.get(level);
  if (!spec) {
    fillArena(level, arenaLeft, arenaRight);
    continue;
  }
  level.boss = {
    ...BOSS, arenaLeft, arenaRight,
    trigger: arenaLeft + 20,
    spawnX: arenaLeft + (level === ch2 ? 370 : 310),
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
      walkSpeed: 82,
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
function finalizeTower(chapter) {
  const route = chapter.platforms.filter(platform => platform.arrow || platform.kind === 'floor');
  chapter.food = [];
  // 每层均匀放两份，避开补给；顶层首领场地留给战斗。
  for (const platform of route.slice(0, -1)) {
    const chosen = [];
    for (const fraction of [.28, .72]) {
      const preferred = platform.x + platform.w * fraction;
      const candidates = Array.from({ length: Math.floor((platform.w - 40) / 10) }, (_, i) => platform.x + 20 + i * 10);
      candidates.sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred));
      const x = candidates.find(candidate => chosen.every(previous => Math.abs(candidate - previous) >= 42)
        && chapter.supplies.every(item => Math.abs(item.y - (platform.y - 14)) > 20 || Math.abs(item.x - candidate) >= 42));
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

// 9 段合并为 4 关：1+2、3+4、工位攀登、7+8+9。每关只有关尾一只 BOSS。
export const LEVELS = [
  mergeChapters('ch1', '第 1 关 · 键盘与书堆', '键盘区和书堆迷宫', [ch1, ch2]),
  mergeChapters('ch2', '第 2 关 · 线缆与咖啡渍', '显示器线缆区和咖啡渍区', [ch3, ch4]),
  finalizeTower(tower),
  mergeChapters('ch4', '第 4 关 · 屏幕到桌缝', '显示器顶部、打印机和桌缝终局', [monitor, printer, ch6]),
];
