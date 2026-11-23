export const VIEW = { width: 640, height: 360 };
export const GROUND = 286;

export const PLAYER = {
  width: 17, height: 27, speed: 188, acceleration: 1650,
  gravity: 1080, jumpSpeed: 440, maxFallSpeed: 560,
  coyoteTime: 0.10, jumpBuffer: 0.13,
  maxHealth: 5, lives: 3, invincibleTime: 1.15, respawnInvincible: 1.8,
  knockbackSpeed: 145, knockbackTime: 0.16,
};

export const WEAPON = { interval: 0.16, speed: 478, lifetime: 0.92, damage: 1 };
export const WEAPONS = {
  basic: { name: '普通枪', ammo: Infinity, ...WEAPON },
  spread: { name: '散射枪', ammo: 30, interval: 0.32, speed: 410, lifetime: 0.65, damage: 1, spread: 0.23 },
  pierce: { name: '穿透枪', ammo: 20, interval: 0.4, speed: 560, lifetime: 1, damage: 2, pierce: 2 },
  rapid: { name: '疾射枪', ammo: 70, interval: 0.085, speed: 500, lifetime: 0.85, damage: 1 },
  heavy: { name: '重击枪', ammo: 12, interval: 0.6, speed: 330, lifetime: 1, damage: 4 },
};

// speed 只对会走动的类型生效；gunner 站桩射击，flyer 在巡逻区间内浮动。
export const ENEMIES = {
  patrol: { width: 25, height: 20, speed: 58, health: 3, damage: 1, label: '巡逻怪' },
  gunner: {
    width: 24, height: 26, speed: 0, health: 4, damage: 1, label: '射击怪',
    range: 330, interval: 1.9, telegraph: 0.5, shotSpeed: 205, shotLife: 2.4,
  },
  flyer: {
    width: 22, height: 18, speed: 74, health: 2, damage: 1, label: '飞怪',
    amplitude: 26, frequency: 1.7,
  },
};

// 第 2 段与最终段都有 Boss，其余段抵达出口即可通关。
export const BOSS = {
  health: 60, width: 58, height: 48, label: '6狗',
  trigger: 340, arenaLeft: 320, arenaRight: 960, spawnX: 690, ground: 286,
  intro: 3.0, warning: 1, dashSpeed: 250, dashDuration: 1.1,
  waveSpeed: 175, recovery: 1.1, damage: 1,
};

function createChapter(id, name, width, subtitle) {
  return {
    id, name, width, subtitle,
    spawn: { x: 56, y: GROUND },
    platforms: [], decoration: [], enemies: [], supplies: [], hazards: [],
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
decorate(ch1, 558, 267, 'monitor');
decorate(ch1, 1175, 286, 'cup');
patrol(ch1, 760, 700, 850);
patrol(ch1, 1600, 1520, 1720);
hazard(ch1, 1240, 60, GROUND - 14, 'crumb');
health(ch1, 307, 235);
weapon(ch1, 715, 251, 'spread');
grenades(ch1, 1010, 180);
health(ch1, 1350, 270);
weapon(ch1, 1900, 270, 'rapid');
cp(ch1, 120, 262); cp(ch1, 560); cp(ch1, 1150); cp(ch1, 1500); cp(ch1, 1900);
hint(ch1, 0, '摇杆移动与瞄准，红黄警示区会伤人');
hint(ch1, 240, '跳上书本，再越过桌缝');
hint(ch1, 700, '前方有巡逻怪，按住开火可以连发');
hint(ch1, 1126, '高处的平台能省一段路');
hint(ch1, 1520, '红色区域会伤人，跳过去');

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
weapon(ch2, 1800, 154, 'heavy');
health(ch2, 700, 270);
grenades(ch2, 1300, 270);
health(ch2, 1900, 270);
health(ch2, 2460, 270);
cp(ch2, 100); cp(ch2, 520); cp(ch2, 1050); cp(ch2, 1580); cp(ch2, 2160); cp(ch2, 2570);
ch2.boss = { ...BOSS, health: 40, trigger: 2640, arenaLeft: 2620, arenaRight: 3260, spawnX: 2990, ground: GROUND };
ch2.exit = { x: 3260, y: GROUND - 50, w: 34, h: 50 };
grenades(ch2, 2575, 270);
hint(ch2, 0, '书堆可以一路踩上去，高处的补给更好');
hint(ch2, 300, '淡色横板可以从下方穿过去');
hint(ch2, 1000, '前方有射击怪，别站着不动');
hint(ch2, 1500, '爬得越高，弹药越强');
hint(ch2, 2100, '前方是 6 狗，经过旗帜后准备战斗');
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
hazard(ch3, 1140, 50, GROUND - 14, 'cable');
hazard(ch3, 1950, 100, GROUND - 14, 'cable');
weapon(ch3, 1600, 190, 'spread');
health(ch3, 900, 270);
grenades(ch3, 2600, 270);
health(ch3, 2400, 270);
cp(ch3, 80); cp(ch3, 400); cp(ch3, 920); cp(ch3, 1450); cp(ch3, 1900); cp(ch3, 2400);
hint(ch3, 0, '地面上的电缆会放电，跳过去或者走上层');
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
hazard(ch4, 560, 140, GROUND - 14, 'spill');
hazard(ch4, 760, 120, GROUND - 14, 'spill');
hazard(ch4, 1350, 110, GROUND - 14, 'spill');
hazard(ch4, 1890, 130, GROUND - 14, 'spill');
hazard(ch4, 2000, 60, GROUND - 14, 'crumb');
weapon(ch4, 1000, 160, 'rapid');
health(ch4, 1300, 270);
grenades(ch4, 1650, 270);
health(ch4, 2350, 270);
weapon(ch4, 2750, 270, 'heavy');
cp(ch4, 100); cp(ch4, 480); cp(ch4, 1300); cp(ch4, 1800); cp(ch4, 2320); cp(ch4, 2600);
hint(ch4, 0, '咖啡渍又滑又疼，最好跳过去');
hint(ch4, 340, '滑行时很难刹车，提前起跳');
hint(ch4, 800, '注意高台上的射击怪');
hint(ch4, 1250, '两处咖啡渍之间是安全区');
hint(ch4, 1800, '飞怪会沿着咖啡的味道俯冲');
hint(ch4, 2300, '最后一段了，检查点很密');

// ── 5/9 抽屉军械库：高台攀爬 + 密集战斗 ──────────────────────────────────
const ch5 = createChapter('ch5', '第一关 · 5/9 抽屉军械库', 2600, '抽屉里的武器与硬仗');
desk(ch5, 0, 330);
desk(ch5, 430, 300);
desk(ch5, 800, 310);
desk(ch5, 1210, 450);
desk(ch5, 1710, 380);
desk(ch5, 2190, 410);
drawer(ch5, 520, 246, 110, 40);
crate(ch5, 860, 256, 46, 30);
drawer(ch5, 1280, 240, 110, 40);
drawer(ch5, 1400, 196, 110, 44);
crate(ch5, 1760, 250, 40, 36);
crate(ch5, 1810, 214, 40, 36);
decorate(ch5, 600, 286, 'staple');
decorate(ch5, 1300, 286, 'pencil');
decorate(ch5, 2300, 286, 'eraser');
gunner(ch5, 1050);
gunner(ch5, 1560);
gunner(ch5, 2050);
gunner(ch5, 2250);
gunner(ch5, 2420);
patrol(ch5, 1950, 1880, 2060);
patrol(ch5, 2520, 2460, 2580);
weapon(ch5, 1440, 180, 'pierce');
health(ch5, 700, 270);
weapon(ch5, 1000, 270, 'spread');
health(ch5, 2350, 270);
grenades(ch5, 2220, 270);
weapon(ch5, 2480, 270, 'heavy');
cp(ch5, 100); cp(ch5, 500); cp(ch5, 830); cp(ch5, 1250); cp(ch5, 1730); cp(ch5, 2230);
hint(ch5, 0, '抽屉可以踩，是一层一层的高台');
hint(ch5, 300, '这一段的敌人最密，善用手榴弹');
hint(ch5, 800, '抽屉上通常放着武器');
hint(ch5, 1200, '穿过抽屉往上走，能绕开地面火力');
hint(ch5, 1700, '弹药有限，用完会自动换回普通枪');
hint(ch5, 2200, '打完这一批就是桌缝了');

// ── 9/9 桌缝终局：Boss 竞技场 ────────────────────────────────────────────
const ch6 = createChapter('ch6', '第一关 · 9/9 桌缝终局', 1800, '桌缝尽头的守卫');
desk(ch6, 0, 240);
desk(ch6, 300, 1500);
decorate(ch6, 900, 286, 'monitor');
decorate(ch6, 1400, 286, 'cup');
grenades(ch6, 60, 270);
weapon(ch6, 120, 270, 'heavy');
health(ch6, 200, 270);
ch6.boss = { ...BOSS, trigger: 340, arenaLeft: 320, arenaRight: 960, spawnX: 690, ground: GROUND };
ch6.exit = { x: 1745, y: GROUND - 50, w: 34, h: 50 };
cp(ch6, 210);
hint(ch6, 0, '把最后一发手榴弹留在这里');
hint(ch6, 280, '它冲过来时跳起来躲开，落地的震波要跳过');

// 新增三个可通行场景：地面、显示器顶部与打印机。
const floor = createChapter('floor', '第一关 · 6/9 办公室地面', 2100, '穿越工位与绿植');
for (const [x,w] of [[0,620],[690,550],[1310,790]]) floor.platforms.push({ x, y: GROUND, w, h: 22, kind: 'floor' });
crate(floor, 350, 256, 52); crate(floor, 960, 256, 50);
patrol(floor, 820, 740, 900); gunner(floor, 1650); flyer(floor, 1500, 205, 1400, 1620);
hazard(floor, 800, 60, GROUND - 14, 'cable');
health(floor, 580, 270); grenades(floor, 1370, 270); weapon(floor, 1820, 270, 'rapid');
cp(floor, 150); cp(floor, 750); cp(floor, 1350); cp(floor, 1850);
hint(floor, 0, '来到办公室地面，越过桌腿和线缆'); hint(floor, 760, '警示条纹的区域会造成伤害');

const monitor = createChapter('monitor', '第一关 · 7/9 显示器顶部', 1900, '攀过屏幕与线缆');
for (const [x,w] of [[0,520],[600,540],[1220,680]]) monitor.platforms.push({ x, y: GROUND, w, h: 22, kind: 'monitorTop' });
crate(monitor, 350, 256, 50); shelf(monitor, 800, 225, 100); crate(monitor, 1470, 256, 48);
flyer(monitor, 720, 210, 640, 950); patrol(monitor, 1510, 1420, 1660);
hazard(monitor, 740, 60, GROUND - 14, 'cable');
health(monitor, 640, 270); weapon(monitor, 1250, 270, 'pierce');
cp(monitor, 120); cp(monitor, 640); cp(monitor, 1260); cp(monitor, 1680);
hint(monitor, 0, '沿显示器顶部前进，小心屏幕间的空隙');

const printer = createChapter('printer', '第一关 · 8/9 打印机', 1900, '穿越纸张与设备');
for (const [x,w] of [[0,610],[690,530],[1300,600]]) printer.platforms.push({ x, y: GROUND, w, h: 22, kind: 'printerTop' });
books(printer, 380, 258, 60, 28); crate(printer, 900, 256, 48); shelf(printer, 1500, 220, 100);
gunner(printer, 850); patrol(printer, 1650, 1530, 1770); flyer(printer, 1100, 200, 1000, 1200);
hazard(printer, 1450, 55, GROUND - 14, 'crumb');
health(printer, 700, 270); grenades(printer, 1330, 270); weapon(printer, 1800, 270, 'heavy');
cp(printer, 120); cp(printer, 740); cp(printer, 1350); cp(printer, 1740);
hint(printer, 0, '踏上打印机顶盖，越过纸张和出纸口');

export const LEVELS = [ch1, ch2, ch3, ch4, ch5, floor, monitor, printer, ch6];
