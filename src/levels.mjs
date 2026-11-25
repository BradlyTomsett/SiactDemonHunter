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

// ── 第 1 关 · 键盘与文件堆：桌面主路 + 上层文件堆 / 显示器底座 ──────────────
// 参考《魂斗罗》第一关的节奏：开阔的横向推进、两处桌缝、上下两条可以互相换的路。
const monitorBase = (c, x, y, w) => c.platforms.push({ x, y, w, h: 24, kind: 'monitorTop' });
const printerBlock = (c, x, y, w) => c.platforms.push({ x, y, w, h: 22, kind: 'printerTop' });

const stage1 = createChapter('ch1', '第 1 关 · 键盘与文件堆', 3700, '从键盘旁沿桌面推进');
stage1.arenaStart = 3000;
stage1.spawn = { x: 170, y: GROUND };
// 下层主路：三大段桌面，中间两处桌缝要跳过去。
desk(stage1, 0, 700);
desk(stage1, 790, 710);
desk(stage1, 1590, 1410);
desk(stage1, 3000, 654);            // 关底竞技场
// 开局：键盘立在左手边
keyboard(stage1, 0, 258, 150, 28);
// 上层路线 1：文件堆阶梯 → 文具盒 → 搁板
books(stage1, 200, 254, 70, 32);
books(stage1, 305, 198, 65, 32);
books(stage1, 404, 190, 65, 32);
crate(stage1, 503, 178, 58, 30);   // 文具盒
shelf(stage1, 580, 146, 100);
// 上层路线 2：显示器底座 + 纸箱
monitorBase(stage1, 880, 206, 150);
monitorBase(stage1, 1090, 206, 150);
crate(stage1, 1300, 200, 110, 30);
plank(stage1, 1450, 196, 110);
// 上层路线 3：再过一组显示器底座，接回竞技场
monitorBase(stage1, 1720, 206, 150);
crate(stage1, 1950, 200, 110, 30);
shelf(stage1, 2110, 194, 130);
plank(stage1, 2270, 218, 110);
// 可塌书堆和键帽弹簧（保留上一版的动态地形）
crumbly(stage1, 560, 262, 70);
springboard(stage1, 2210, 262, 60);
decorate(stage1, 500, 286, 'cup');
decorate(stage1, 1230, 286, 'staple');
decorate(stage1, 2010, 286, 'eraser');
// 敌人：地面巡逻 + 底座上的射手 + 空中的飞怪
patrol(stage1, 430, 330, 640);
stage1.enemies.push({ type: 'gunner', x: 940, y: 206 });
patrol(stage1, 1260, 1240, 1390);
flyer(stage1, 1250, 210, 950, 1450);
stage1.enemies.push({ type: 'gunner', x: 1975, y: 200 });
patrol(stage1, 2180, 2080, 2330);
flyer(stage1, 2150, 210, 1900, 2350);
stage1.enemies.push({ type: 'gunner', x: 1150, y: 206 });
patrol(stage1, 2050, 1900, 2250);
flyer(stage1, 2800, 210, 2600, 3000);
hazard(stage1, 1140, 60, GROUND - 14, 'crumb');
hazard(stage1, 2340, 60, GROUND - 14, 'cable');
// 补给：主路上给基础物资，支线高台上给武器
health(stage1, 660, 270);
grenades(stage1, 380, 270);
weapon(stage1, 600, 132, 'spread');
health(stage1, 960, 192);
grenades(stage1, 1330, 186);
weapon(stage1, 1470, 182, 'rapid');
health(stage1, 1760, 192);
weapon(stage1, 2140, 180, 'pierce');
grenades(stage1, 2290, 270);
cp(stage1, 170); cp(stage1, 830); cp(stage1, 1690); cp(stage1, 2100);
hint(stage1, 0, '桌面是主路，文件堆和显示器底座是另一条路');
hint(stage1, 620, '桌缝，跳过去');
hint(stage1, 900, '踩上显示器底座能绕开地面的敌人');
hint(stage1, 1420, '第二道桌缝，助跑再跳');
hint(stage1, 2900, '6 狗就在前面');

// ── 第 2 关 · 抽屉与设备区：从半开抽屉爬上办公设备，再进开阔地 ────────────
// 参考《魂斗罗》第二关第一段：起步低、沿设备一路上爬，最后在开阔区打首领。
const stage2 = createChapter('ch3', '第 2 关 · 抽屉与设备区', 3600, '抽屉、扶手、文件架到打印机');
stage2.arenaStart = 2800;
stage2.spawn = { x: 360, y: 236 };
// 下层：三段桌面，两处短缺口
desk(stage2, 0, 1150);
desk(stage2, 1210, 540);
desk(stage2, 1810, 990);
desk(stage2, 2800, 754);            // 骡子竞技场
// 起步：半开的抽屉 → 椅子扶手 → 文件架
drawer(stage2, 300, 236, 130, 50);
stand(stage2, 460, 208, 90);
shelf(stage2, 590, 178, 110);
// 打印机是这段最高的一级，踩上去能俯视整片设备区
printerBlock(stage2, 0, 150, 240);
crate(stage2, 760, 176, 90);
crate(stage2, 870, 200, 90);
crate(stage2, 990, 166, 90);
// 文件架下方留出 56 像素净空，玩家可以沿桌面走过去。
books(stage2, 1220, 216, 200, 14);
crate(stage2, 1450, 200, 90);
shelf(stage2, 1600, 196, 150);
// 开阔交战区：两张矮纸箱当掩体
crate(stage2, 1850, 250, 70, 36);
crate(stage2, 2020, 250, 70, 36);
// 动态地形：可塌书堆 + 键帽弹簧
crumbly(stage2, 700, 262, 70);
springboard(stage2, 1950, 262, 40);
decorate(stage2, 1080, 286, 'pencil');
decorate(stage2, 1640, 286, 'cup');
// 敌人
patrol(stage2, 493, 430, 560);
shielder(stage2, 900);
charger(stage2, 1350, 1230, 1600);
gunner(stage2, 1650);
flyer(stage2, 1500, 210, 1300, 1750);
patrol(stage2, 2215, 2090, 2290);
shielder(stage2, 2120);
// 设备区各段都放守卫，密度和旧版相当
patrol(stage2, 610, 565, 668);
patrol(stage2, 820, 700, 1000);
stage2.enemies.push({ type: 'gunner', x: 600, y: 178 });
flyer(stage2, 1200, 210, 1000, 1450);
shielder(stage2, 1600);
stage2.enemies.push({ type: 'gunner', x: 1475, y: 200 });
charger(stage2, 2130, 2090, 2240);
patrol(stage2, 2300, 2200, 2450);
gunner(stage2, 2380);
hazard(stage2, 1230, 70, GROUND - 14, 'cable');
hazard(stage2, 1640, 90, GROUND - 14, 'spill');
hazard(stage2, 1930, 50, GROUND - 14, 'crumb');
// 补给
weapon(stage2, 520, 136, 'spread');
health(stage2, 780, 162);
grenades(stage2, 1020, 152);
health(stage2, 1300, 202);
weapon(stage2, 1880, 236, 'heavy');
grenades(stage2, 2040, 236);
cp(stage2, 360, 236); cp(stage2, 620); cp(stage2, 1300); cp(stage2, 2180);
hint(stage2, 0, '从半开的抽屉出发');
hint(stage2, 320, '扶手、文件架、打印机都能踩');
hint(stage2, 1120, '可以从文件架下方走过，等电缆断电再通过');
hint(stage2, 1810, '开阔地带，先清掉守卫');
hint(stage2, 2750, '骡子在前面等着');

// ── 第 3 关 · 工位攀登：从办公室地面一路爬到桌面顶层 ────────────────────────
// 世界坐标向下为正，所以「往上爬」就是 y 越来越小。整关高度 1600，镜头要纵向跟随。
const tower = createChapter('tower', '第 3 关 · 绿植攀登', 1040, '穿过绿植与文件架，向桌面攀登');
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
step(340, 1400, 310, 'crate', 30);
step(180, 1340, 280, 'books', 24);
step(360, 1280, 290, 'shelf');
step(110, 1220, 300, 'drawer', 40);
step(350, 1160, 310, 'crate', 30);
step(140, 1100, 270, 'shelf');
step(340, 1040, 310, 'books', 24);
step(100, 980, 320, 'books', 24);
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
// 升降抽屉：在 920 和 680 两层大平台之间来回，等它到位置再跳上去。
tower.platforms.push({ x: 820, y: 800, w: 140, h: 20, kind: 'drawer', oneway: true,
  motion: { axis: 'y', distance: 110, speed: 55 } });
// 平台上的斜上坡 + 一小块高台，走上去就能拿补给
slope(tower, 620, 680, 160, 60);
tower.platforms.push({ x: 780, y: 620, w: 110, h: 14, kind: 'books', oneway: true });
health(tower, 820, 620 - 14);
crumbly(tower, 440, 901, 70);
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
side(530, 860, 120);
side(720, 560, 120);
health(tower, 120, 1520 - 14);
weapon(tower, 600, 1400 - 14, 'spread');
health(tower, 690, 920 - 14);
grenades(tower, 620, 680 - 14);
weapon(tower, 120, 380 - 14, 'pierce');
health(tower, 500, 320 - 14);
grenades(tower, 860, 320 - 14);
weapon(tower, 740, 320 - 14, 'heavy');

// 敌人：地面巡逻 + 平台上的射手 + 中段少量飞行怪
towerEnemy('patrol', 520, 1520, 420, 700);
towerEnemy('gunner', 550, 920);
towerEnemy('patrol', 500, 680, 400, 592);
towerEnemy('gunner', 150, 380);
towerEnemy('flyer', 700, 1150, 600, 795);
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
  health: 130,
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

// 办公设备井道：错层货架与升降抽屉组成独立的竖向路线。
const shaft = createChapter('shaft', '第 4 关 · 设备井道', 1040, '沿文件架与升降抽屉抵达求救电脑');
shaft.height = 1600;
shaft.spawn = { x: 650, y: 1520 };
shaft.platforms.push({ x: 160, y: 1520, w: 720, h: 22, kind: 'floor' });
const shaftRows = [
  [470, 1460, 300, 'drawer'], [240, 1400, 310, 'shelf'],
  [390, 1340, 310, 'books'], [150, 1280, 300, 'crate'],
  [370, 1220, 310, 'shelf'], [170, 1160, 300, 'drawer'],
  [350, 1100, 310, 'books'], [150, 1040, 300, 'shelf'],
  [350, 980, 310, 'crate'], [200, 920, 492, 'desk'],
  [430, 860, 300, 'shelf'], [250, 800, 300, 'drawer'],
  [420, 740, 300, 'books'], [220, 680, 484, 'desk'],
  [400, 620, 300, 'crate'], [220, 560, 300, 'shelf'],
  [400, 500, 300, 'drawer'], [220, 440, 300, 'books'],
  [80, 380, 300, 'shelf'], [350, 320, 630, 'desk'],
];
for (const [x, y, w, kind] of shaftRows) {
  shaft.platforms.push({ x, y, w, h: 14, kind, oneway: true, arrow: true });
}
for (const y of [1400, 1100, 560]) {
  shaft.platforms.find(platform => platform.y === y).motion = { distance: 24, speed: 32 };
}
shaft.platforms.push({ x: 745, y: 800, w: 145, h: 20, kind: 'drawer', oneway: true,
  motion: { axis: 'y', distance: 110, speed: 55 } });
shaft.ladders = [
  { x: 500, y: 1460, w: 26, h: 60 },
  { x: 400, y: 1220, w: 26, h: 60 },
  { x: 440, y: 860, w: 26, h: 60 },
  { x: 440, y: 440, w: 26, h: 60 },
];
shaft.enemies.push(
  { type: 'patrol', x: 400, y: 1520, minX: 260, maxX: 650 },
  { type: 'gunner', x: 530, y: 920 },
  { type: 'patrol', x: 400, y: 680, minX: 260, maxX: 600 },
  { type: 'gunner', x: 130, y: 380 },
  { type: 'flyer', x: 700, y: 1120, minX: 630, maxX: 720 },
  { type: 'flyer', x: 120, y: 820, minX: 40, maxX: 210 },
);
health(shaft, 700, 1506); weapon(shaft, 300, 1386, 'spread');
grenades(shaft, 560, 906); health(shaft, 300, 666);
weapon(shaft, 120, 366, 'pierce'); health(shaft, 500, 306);
grenades(shaft, 860, 306); weapon(shaft, 740, 306, 'heavy');
cp(shaft, 650, 1520); cp(shaft, 300, 920); cp(shaft, 300, 680);
cp(shaft, 100, 380); cp(shaft, 500, 320);
shaft.hints = [
  { y: 1500, text: '沿文件架向上攀登，梯子可以连接楼层' },
  { y: 960, text: '右侧有升降抽屉，也可以沿固定搁板继续向上' },
  { y: 700, text: '留意两侧的飞怪，继续向上' },
  { y: 330, text: '击败 6 狗，到右侧电脑发出求救信号' },
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
  for (const item of [...level.enemies, ...level.checkpoints, ...level.hints]) item.y = floorY(item.y);
}

// 每关只在关尾配置一只主 BOSS。
export const LEVELS = [
  mergeChapters('ch1', '第 1 关 · 键盘与文件堆', '桌面主路、文件堆阶梯和显示器底座', [stage1]),
  mergeChapters('ch2', '第 2 关 · 抽屉与设备区', '抽屉、扶手、文件架和打印机', [stage2]),
  finalizeTower(tower),
  finalizeTower(shaft),
];

// 改版前的长地图用了更多检查点。只迁移新版不存在的编号，避免重解释新版存档。
LEVELS[0].legacyCheckpoints = { 5: 1, 6: 2, 7: 2, 8: 3, 9: 3, 10: 3, 11: 4, 12: 4 };
LEVELS[1].legacyCheckpoints = { 5: 2, 6: 3, 7: 3, 8: 4, 9: 4, 10: 4 };

// 第 2 关的断电段：走进 1450~2300 这片区域会黑掉 7 秒，只剩角色周围一圈光。
LEVELS[1].blackout = { x: 1450, w: 1200, duration: 7 };

// 每波使用没有实体障碍的连续地面；第三关分在两个不同高度的平台上。
const hordeSpans = [
  [[1240, 1490], [2270, 2570]],
  [[770, 1070], [2090, 2390]],
  [[510, 750, floorY(920)], [390, 620, floorY(680)]],
  [[240, 620, floorY(920)], [240, 620, floorY(680)]],
];
for (const [index, level] of LEVELS.entries()) {
  level.hordes = hordeSpans[index].map(([left, right, ground = GROUND]) => ({ left, right, ground }));
}
