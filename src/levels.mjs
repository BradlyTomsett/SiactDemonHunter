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
const shelf = (c, x, y, w) => c.platforms.push({ x, y, w, h: 10, kind: 'shelf', oneway: true });
// 斜坡：从左端 (x, y) 走到右端 (x + w, y - rise)，rise 为正表示往右上坡。
const slope = (c, x, y, w, rise) => c.platforms.push({ x, y, w, h: 12, kind: 'slope', rise });
const flyer = (c, x, y, minX, maxX) => c.enemies.push({ type: 'flyer', x, y, minX, maxX });
const health = (c, x, y, amount = 1) => c.supplies.push({ x, y, amount });
const weapon = (c, x, y, type) => c.supplies.push({ x, y, type });
const grenades = (c, x, y, amount = 2) => c.supplies.push({ x, y, type: 'grenade', amount });
const hazard = (c, x, w, y, kind, h = 14) => c.hazards.push({ x, y, w, h, kind, damage: 1 });
const cp = (c, x, y = GROUND) => c.checkpoints.push({ x, y });
const hint = (c, x, text) => c.hints.push({ x, text });
const decorate = (c, x, y, kind) => c.decoration.push({ x, y, kind });

// ── 第 1 关 · 双层工位：桌面捷径、文件板桥与桌下通道 ──────────────────────
const stage1 = createChapter('ch1', '第 1 关 · 双层工位', 8350, '沿桌面越过文件板桥，绕过档柜抵达关底');
stage1.arenaStart = 7650;
stage1.checkpointLayout = 'workstations-long';
stage1.spawn = { x: 76, y: GROUND };

const lowerDesks = [
  [0, 286, 2248], [2322, 286, 868], [3288, 278, 852], [4240, 286, 820],
  [5160, 248, 390], [5638, 286, 252], [5980, 286, 760],
  [6840, 252, 340], [7270, 286, 380],
];
for (const [x, y, w] of lowerDesks) stage1.platforms.push({ x, y, w, h: 22, kind: 'floor' });
desk(stage1, 7650, 654);

const upperDesks = [
  [230, 202, 530], [948, 202, 637], [1775, 202, 470], [2333, 202, 412],
  [2690, 168, 500], [3290, 194, 570], [3800, 146, 340],
  [4240, 178, 630], [4800, 144, 260], [5160, 172, 390],
  [5960, 193, 480], [6365, 145, 375], [6840, 170, 340], [7270, 200, 340],
];
for (const [x, y, w] of upperDesks) {
  stage1.platforms.push({ x, y, w, h: 15, kind: 'worktop', oneway: true });
}
for (const [x, w] of [[760, 62], [822, 63], [885, 63], [1585, 63], [1648, 63], [1711, 64]]) {
  stage1.platforms.push({ x, y: 202, w, h: 10, kind: 'clipboard', oneway: true,
    crumble: { delay: .29, respawn: 2.8 } });
}
shelf(stage1, 115, 246, 102);
stage1.ladders = [
  [470,202,286], [1280,202,286], [2070,202,286], [2580,202,286],
  [2940,168,286], [3490,194,278], [4520,178,286], [5340,172,248],
  [6230,193,286], [6980,170,252], [7390,200,286],
].map(([x,y,bottom]) => ({ x, y, w: 26, h: bottom - y }));

for (const [x,y,kind] of [
  [10,286,'keyboardDock'], [326,202,'deskPlant'], [550,202,'staple'], [1470,202,'monitor'],
  [1890,202,'deskPlant'], [2380,202,'cup'], [2400,286,'coil'], [2810,168,'fileRack'],
  [3410,278,'fileRack'], [3905,146,'monitor'], [4450,178,'printerStack'],
  [4770,286,'deskPlant'], [5210,172,'cup'], [5660,286,'keyboardDock'],
  [6160,193,'fileRack'], [6510,145,'monitor'], [6880,170,'deskPlant'], [7435,286,'cup'],
]) decorate(stage1, x, y, kind);

function groundEnemy(level, type, x, y, minX, maxX) {
  level.enemies.push({ type, x, y, minX, maxX });
}

for (const [x,y,left,right] of [
  [540,202,500,665], [760,286,638,870], [1480,286,1370,1580],
  [2160,286,2110,2210], [2860,286,2735,3100], [3430,278,3305,3760],
  [4480,286,4350,4820], [5370,248,5265,5480], [6130,286,6020,6450], [7040,252,6885,7150],
]) groundEnemy(stage1, 'patrol', x, y, left, right);
for (const [x,y] of [[1205,202],[1905,202],[2500,202],[3060,168],[4015,146],[4720,178],[6570,145],[7490,200]]) {
  groundEnemy(stage1, 'gunner', x, y);
}
for (const [x,y,a,b] of [[900,142,835,1040],[1670,211,1540,1840],[3570,169,3420,3780],
  [4780,133,4630,5010],[5740,205,5570,5950],[6700,122,6540,6830],[7410,190,7300,7570]]) {
  flyer(stage1,x,y,a,b);
}
hazard(stage1, 1325, 55, 272, 'crumb');
hazard(stage1, 2440, 65, 272, 'cable');
hazard(stage1, 4570, 54, 272, 'crumb');
hazard(stage1, 6580, 56, 272, 'cable');

grenades(stage1, 490, 272); weapon(stage1, 566, 188, 'spread'); health(stage1, 735, 188);
health(stage1, 1130, 272); grenades(stage1, 1115, 188);
weapon(stage1, 1525, 188, 'rapid'); weapon(stage1, 2130, 188, 'pierce');
grenades(stage1, 2369, 272); health(stage1, 2580, 188);
health(stage1, 3310, 264); grenades(stage1, 4010, 264);
weapon(stage1, 4600, 164, 'spread'); health(stage1, 5240, 234);
weapon(stage1, 6240, 179, 'pierce'); grenades(stage1, 7030, 238);
health(stage1, 7490, 272); weapon(stage1, 7545, 272, 'heavy');

for (const [x, y] of [[76,286],[830,286],[1690,286],[2400,286],[3390,278],
  [4360,286],[5260,248],[6050,286],[6910,252],[7360,286]]) cp(stage1, x, y);
hint(stage1, 0, '从键盘旁出发。靠近梯子向上或向下推，可以切换桌面和桌下。');
hint(stage1, 675, '文件板踩久会塌，跳过松动的板子，或落到桌下继续走。');
hint(stage1, 1040, '上层有武器，桌下也有补给。小心两侧的小狗。');
hint(stage1, 1490, '前面还有一组文件板桥。桌下遇到空隙时记得跳过。');
hint(stage1, 2290, '桌下有电缆。可以等断电，也可以从上层绕行。');
hint(stage1, 3100, '前面是独立档柜。两条路线都有缺口，留一点助跑距离。');
hint(stage1, 4190, '打印工位的桌面更高，下方通道也能前进。');
hint(stage1, 5440, '前面两张矮台隔着桌缝，落稳后再跳下一次。');
hint(stage1, 6480, '越过电缆和最后两道柜缝。跟着亮边找落脚点。');
hint(stage1, 7390, '最后一排工位通向 6 狗的场地。');


// ── 第 2 关 · 文件坡道 ─────────────────────────────────────────────────
const stage2 = createChapter('ch2', '第 2 关 · 文件坡道', 8650, '踏上连续坡道，穿过高低火力点');
stage2.height = 752;
stage2.scroll = 'diagonal';
stage2.arenaStart = 7900;
stage2.arenaGround = 232;
stage2.checkpointLayout = 'printing-rise';
stage2.spawn = { x: 90, y: 660 };
const terrace = (c, x, y, w) => c.platforms.push({ x, y, w, h: 18, kind: 'worktop' });
for (const [x,y,w] of [
  [0,660,790], [790,700,130], [920,660,510], [1640,590,810], [2680,505,470],
  [3240,505,550], [4040,415,710], [4750,457,122], [4872,415,458],
  [5550,327,810], [6452,327,428], [7130,232,470], [7600,278,120],
  [7720,232,180], [7900,232,704],
]) terrace(stage2,x,y,w);
for (const [x,y,w,rise] of [[1417,660,223,77],[2437,590,243,92],
  [3777,505,263,97],[5317,415,233,95],[6867,327,263,102]]) slope(stage2,x,y,w,rise);

for (const [x,y,w] of [[380,576,235],[1040,585,188],[1780,516,260],[2100,505,210],
  [2830,425,225],[3445,426,205],[4160,336,300],[4920,337,235],
  [5600,250,250],[6650,248,200],[7250,151,225]]) shelf(stage2,x,y,w);
for (const [x,y,kind] of [[310,660,'fileRack'],[1050,660,'printerStack'],[1725,590,'fileRack'],
  [1950,590,'printerStack'],[2780,505,'fileRack'],[3480,505,'printerStack'],[4090,415,'printerStack'],
  [4960,415,'fileRack'],[5630,327,'printerStack'],[6610,327,'fileRack'],[7220,232,'printerStack']]) {
  decorate(stage2,x,y,kind);
}
for (const [type,x,y,left,right] of [
  ['patrol',430,660,320,670],['patrol',1130,660,965,1340],
  ['shielder',1850,590,1675,1970],['charger',2280,590,2150,2370],
  ['patrol',2930,505,2740,3100],['shielder',3580,505,3300,3720],
  ['patrol',4250,415,4070,4500],['charger',4580,415,4420,4680],
  ['shielder',5070,415,4900,5280],['patrol',5680,327,5580,5820],
  ['patrol',6070,327,5890,6300],['charger',6650,327,6540,6790],
  ['patrol',7450,232,7320,7555],
]) groundEnemy(stage2,type,x,y,left,right);
for (const [x,y] of [[550,576],[850,700],[1160,585],[1940,516],[2200,505],
  [2985,425],[3525,426],[4300,336],[4800,457],[5050,337],[5790,250],
  [6750,248],[7350,151],[7648,278]]) groundEnemy(stage2,'gunner',x,y);
for (const [x,y,a,b] of [[1250,543,1100,1480],[3080,408,2960,3320],
  [4460,303,4300,4710],[5900,238,5750,6180],[6990,192,6850,7250]]) flyer(stage2,x,y,a,b);

hazard(stage2, 1840, 56, 576, 'cable');
hazard(stage2, 3510, 65, 491, 'spill');
hazard(stage2, 4480, 56, 401, 'crumb');
hazard(stage2, 5990, 58, 313, 'cable');
hazard(stage2, 7480, 44, 218, 'crumb');
health(stage2, 690, 646); weapon(stage2, 1070, 571, 'spread'); grenades(stage2, 1770, 576);
health(stage2, 2070, 576); weapon(stage2, 2870, 411, 'pierce');
health(stage2, 3340, 491); grenades(stage2, 3630, 491); weapon(stage2, 4190, 322, 'rapid');
health(stage2, 4910, 401); grenades(stage2, 5670, 313); weapon(stage2, 5770, 236, 'heavy');
health(stage2, 6550, 313); grenades(stage2, 7170, 218); weapon(stage2, 7810, 218, 'heavy');
for (const [x,y] of [[90,660],[1030,660],[1690,590],[2720,505],[3320,505],
  [4090,415],[4920,415],[5580,327],[6520,327],[7200,232],[7800,232]]) cp(stage2,x,y);
hint(stage2, 0, '从低处推车道出发，小心前方坡顶和凹槽里的射手。');
hint(stage2, 742, '跳过或经过浅槽，再沿推车坡道往上。');
hint(stage2, 1660, '电缆有断电窗口。可以利用上方打印架躲开。');
hint(stage2, 3020, '前方是两张工作台间的空档，从亮边起跳。');
hint(stage2, 3290, '进入高处打印区。咖啡渍可从纸架上方绕过。');
hint(stage2, 5390, '断电区在前面。等火花停下再过电线。');
hint(stage2, 7050, '继续上高坡，跨过最后一处浅槽就到骡子的场地。');

// ── 第 3 关 · 饮水角攀登 ──────────────────────────────────────────────────
const tower = createChapter('tower', '第 3 关 · 饮水角攀登', 1240, '从盆栽架登上饮水间顶层');
const towerBottom = 3210;
tower.height = 3310;
tower.checkpointLayout = 'garden-ascent';
tower.spawn = { x: 98, y: towerBottom };

function climbRows(level, rows) {
  for (const [x, y, w, kind, motion] of rows) {
    level.platforms.push({ x, y, w, h: 16, kind, oneway: true, arrow: true, motion });
  }
}

const towerY = elevation => towerBottom - elevation;
tower.platforms.push({ x: 0, y: towerBottom, w: 1100, h: 22, kind: 'floor' });
climbRows(tower, [
  [145,68,320,'drawer'], [330,144,300,'shelf'], [565,228,270,'shelf'],
  [800,307,250,'worktop'], [665,395,250,'shelf'], [435,477,270,'shelf'],
  [218,561,270,'drawer'], [70,643,255,'shelf'], [200,709,315,'worktop'],
  [475,800,270,'shelf'], [690,876,270,'shelf'], [885,954,226,'drawer'],
  [760,1032,270,'shelf'], [520,1108,275,'shelf'], [310,1188,290,'worktop'],
  [125,1274,260,'drawer'], [220,1364,315,'shelf'], [425,1437,330,'shelf'],
  [565,1515,440,'worktop'], [872,1594,230,'shelf'], [815,1675,270,'drawer'],
  [560,1756,265,'shelf'], [405,1843,215,'tray',{distance:44,speed:46}],
  [219,1924,285,'shelf'], [92,2008,220,'drawer'],
  [260,2097,225,'tray',{distance:40,speed:43}], [446,2172,285,'shelf'],
  [669,2250,290,'worktop'], [910,2341,240,'drawer'], [780,2431,245,'shelf'],
  [530,2511,231,'tray',{distance:44,speed:47}], [310,2586,240,'shelf'],
  [158,2670,234,'drawer'], [248,2756,297,'shelf'], [490,2828,230,'shelf'],
  [588,2880,594,'desk'],
].map(([x,up,w,kind,motion]) => [x,towerY(up),w,kind,motion]));

tower.ladders = [[198,68,0],[907,1032,954],[485,1437,1364],[501,2828,2756]]
  .map(([x,upper,lower]) => ({ x, y: towerY(upper), w: 26, h: upper - lower }));
for (const [x,up] of [[65,0],[176,68],[585,228],[833,307],[226,561],[711,876],
  [942,954],[350,1188],[158,1274],[885,1675],[100,2008],[671,2250],[183,2670]]) {
  decorate(tower,x,towerY(up),'deskPlant');
}
decorate(tower, 826, towerY(1515), 'waterDispenser');
tower.fallers = [
  { x: 1040, top: towerY(395), distance: 286, period: 4.6, offset: .4 },
  { x: 160, top: towerY(709), distance: 300, period: 4.9, offset: 1.6 },
  { x: 687, top: towerY(954), distance: 286, period: 4.7, offset: .8 },
  { x: 194, top: towerY(1364), distance: 292, period: 5.1, offset: 2.3 },
  { x: 1022, top: towerY(2250), distance: 305, period: 4.9, offset: 1.1 },
];
hazard(tower, 711, 55, towerY(1515) - 14, 'cable');
hazard(tower, 926, 48, towerY(1515) - 14, 'cable');
for (const [x,up] of [[138,0],[815,307],[790,1032],[465,1437],[935,1594],[727,2250],[670,2880]]) {
  health(tower,x,towerY(up)-14);
}
for (const [x,up,type] of [[610,228,'spread'],[400,709,'rapid'],[802,1515,'pierce'],
  [173,2008,'spread'],[642,2828,'pierce'],[847,2880,'heavy']]) weapon(tower,x,towerY(up)-14,type);
for (const [x,up] of [[290,643],[246,1274],[899,1675],[491,2172],[1100,2880]]) grenades(tower,x,towerY(up)-14);

for (const [type,x,up,l,r] of [
  ['patrol',590,0,475,790], ['gunner',913,307], ['gunner',321,709],
  ['patrol',982,954,902,1070], ['gunner',338,1188], ['patrol',618,1515,580,686],
  ['gunner',1000,1675], ['gunner',180,2008], ['patrol',748,2250,704,910],
  ['gunner',1008,2341], ['gunner',260,2670],
]) groundEnemy(tower,type,x,towerY(up),l,r);
for (const [x,up,l,r] of [[760,488,670,960],[403,917,322,553],[841,1324,750,993],
  [751,1870,620,911],[487,2290,386,620],[412,2700,326,525]]) flyer(tower,x,towerY(up),l,r);

for (const [x,up] of [[98,0],[250,709],[445,1437],[906,1675],[144,2008],[735,2250],[230,2670],[690,2880]]) {
  cp(tower,x,towerY(up));
}
tower.hints = [
  [0,'沿盆栽架折返向上，台面的亮边是落脚点。'],
  [270,'收纳盒掉落前会先闪光，看到标记可稍等或换边。'],
  [1364,'维修桥上有两处间歇通电区，中间可停下来观察。'],
  [1675,'中间的接水盘会左右移动，看准它靠近再跳。'],
  [2250,'窗侧还有落物，留意靠近落脚点的提示。'],
  [2700,'上到顶层后，击败 6 狗并从右侧离开。'],
].map(([up,text]) => ({ y:towerY(up), text }));
tower.exit = { x: 1140, y: 280, w: 34, h: 50 };
tower.boss = {
  ...BOSS, kind: 'dog', label: '6狗', coat: null, pattern: 1, health: 130,
  ground: 330, arenaLeft: 638, arenaRight: 1130, trigger: 670, spawnX: 887,
};
tower.bosses = [tower.boss];

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

const bossSpecs = [
  [stage1, { health: 78, pattern: 0, coat: bossCoats[0], kind: 'dog', label: '6狗' }],
  [stage2, { health: 104, pattern: 0, coat: null, kind: 'mule', label: '骡子' }],
];
for (const [level, spec] of bossSpecs) {
  const arenaLeft = level.arenaStart;
  const arenaRight = level.width - 46;
  const ground = level.arenaGround ?? GROUND;
  level.boss = {
    ...BOSS, ...spec, ground, arenaLeft, arenaRight,
    trigger: arenaLeft + 20,
    spawnX: arenaLeft + (spec.kind === 'mule' ? 310 : 370),
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
  level.bosses = [level.boss];
  level.exit = { ...level.exit, x: arenaRight + 7, y: ground - level.exit.h };
  cp(level, arenaLeft - 48, ground);
  hint(level, arenaLeft - 10, `击败前方的 ${spec.label} 才能继续前进。`);
}

// 沿可站立的路线均匀分布积分食品。
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

const shaft = createChapter('shaft', '第 4 关 · 档案货梯', 3780, '穿过档案走廊，乘两部货梯到设备层');
shaft.height = 4320;
shaft.spawn = { x: 92, y: 4210 };
shaft.checkpointLayout = 'cargo-shafts-long';
shaft.checkpointMigrations = { 'equipment-shaft': { 0:0, 1:2, 2:3, 3:4, 4:4 } };
shaft.platforms.push(
  { x: 0, y: 4210, w: 1180, h: 22, kind: 'floor' },
  { x: 1262, y: 4210, w: 568, h: 22, kind: 'floor' },
);
climbRows(shaft, [[1610,4140,250,'drawer'],[1690,4070,230,'worktop']]);
terrace(shaft, 2220, 2430, 395);
shelf(shaft, 2430, 2358, 183);
terrace(shaft, 2905, 250, 829);

function cargoLift(level, x, w, bottom, top, speed) {
  level.platforms.push({ x, y: bottom, w, h: 18, kind: 'cargoLift', oneway: true,
    motion: { axis: 'y', bottom, top, speed } });
}
cargoLift(shaft, 1928, 266, 4070, 2430, 112);
cargoLift(shaft, 2625, 260, 2450, 250, 126);

shaft.ladders = [
  { x: 1670, y: 4140, w: 26, h: 70 }, { x: 1740, y: 4070, w: 26, h: 70 },
];

for (const [x,y,w,side] of [
  [1725,3830,159,'left'], [2240,3640,190,'right'], [1710,3415,180,'left'],
  [2230,3220,186,'right'], [1710,3000,175,'left'], [2245,2815,168,'right'],
  [1710,2625,180,'left'], [2915,2210,181,'right'], [2405,2000,170,'left'],
  [2910,1775,172,'right'], [2400,1555,175,'left'], [2920,1325,185,'right'],
  [2395,1095,172,'left'], [2910,875,194,'right'], [2405,620,175,'left'], [2910,410,195,'right'],
]) {
  shelf(shaft, x, y, w);
  groundEnemy(shaft, 'gunner', x + (side === 'left' ? w - 48 : 18), y);
  decorate(shaft, x + 17, y, 'liftPanel');
}
for (const [x,y,l,r] of [[2210,3710,2200,2315],[1885,3350,1795,1950],[2210,2850,2150,2315],
  [2910,2255,2860,3060],[2585,1850,2450,2650],[2925,1440,2860,3050],
  [2588,1010,2460,2650],[2910,570,2860,3050]]) flyer(shaft,x,y,l,r);
for (const [type,x,y,l,r] of [['patrol',250,4210,160,365],['patrol',850,4210,750,1050],
  ['shielder',1380,4210,1280,1570],['gunner',1780,4140],['patrol',2535,2430,2460,2570]]) {
  groundEnemy(shaft,type,x,y,l,r);
}
for (const [x,y] of [[100,4210],[374,4210],[893,4210],[1270,4210],[1700,4140],[2300,2430],[3030,250]]) {
  decorate(shaft,x,y,'fileRack');
}
hazard(shaft, 1075, 56, 4196, 'cable');
health(shaft, 245, 4196); weapon(shaft, 984, 4196, 'spread'); grenades(shaft, 1490, 4196);
health(shaft, 1780, 4056); weapon(shaft, 2010, 4056, 'rapid');
health(shaft, 2250, 2416); grenades(shaft, 2420, 2416); weapon(shaft, 2525, 2344, 'pierce');
health(shaft, 2710, 2436); health(shaft, 2950, 236); weapon(shaft, 3060, 236, 'heavy');
grenades(shaft, 3570, 236);
for (const [x,y] of [[92,4210],[1780,4070],[2270,2430],[2510,2358],[2940,250]]) cp(shaft,x,y);
shaft.hints = [
  { x: 0, text: '先穿过档案走廊。越过地缝后，从右侧梯子上货梯站台。' },
  { x: 1650, text: '跳到货梯上就会启动。乘梯时留心两侧架上的射手。' },
  { y: 2432, text: '从第一部货梯向右跳到中转层，穿过档案台换乘。' },
  { x: 2550, text: '第二部货梯直达设备层，途中注意两边飞来的小狗。' },
  { y: 260, text: '向右离开货梯。击败 6 狗，到电脑发出求救信号。' },
];
shaft.exit = { x: 3680, y: 200, w: 34, h: 50, kind: 'terminal' };
shaft.boss = { ...BOSS, kind: 'dog', health: 156, pattern: 2, coat: bossCoats[8], ground: 250, arenaLeft: 2990, arenaRight: 3630, trigger: 3020, spawnX: 3330 };
shaft.bosses = [shaft.boss];

export const LEVELS = [
  stage1,
  stage2,
  tower,
  shaft,
];

const [first, second] = LEVELS;
first.regions = [
  { x:0, end:3200, theme:'ch1' }, { x:3200, end:4200, theme:'monitor' },
  { x:4200, end:5550, theme:'printer' }, { x:5550, end:7650, theme:'floor' },
  { x:7650, end:first.width, theme:'ch6' },
];
second.regions = [
  { x:0, end:2670, theme:'ch3' }, { x:2670, end:5330, theme:'printer' },
  { x:5330, end:7900, theme:'monitor' }, { x:7900, end:second.width, theme:'ch6' },
];
first.legacyCheckpoints = { 0:0,1:1,2:2,3:3,4:10,5:1,6:2,7:2,8:3,9:3,10:3,11:10,12:10 };
second.legacyCheckpoints = { 0:0,1:2,2:3,3:6,4:11,5:3,6:6,7:6,8:11,9:11,10:11 };
tower.legacyCheckpoints = { 0:0,1:2,2:3,3:6,4:7 };
shaft.legacyCheckpoints = { 0:0,1:0,2:2,3:2,4:3,5:3,6:4,7:4,8:4 };

second.blackout = { x: 5500, w: 850, duration: 7 };
const hordeSpans = [
  [[1190,1450,286], [6040,6380,286]],
  [[1970,2330,590], [5800,6200,327]],
  [[580,900,towerY(1515)], [695,925,towerY(2250)]],
  [[520,895,4210], [2250,2595,2430]],
];
for (const [index, level] of LEVELS.entries()) {
  level.hordes = hordeSpans[index].map(([left,right,ground]) => ({ left,right,ground }));
}
first.food = routeFood(first, first.platforms.filter(p => !p.crumble && p.x < first.boss.arenaLeft));
second.food = routeFood(second, second.platforms.filter(p => p.kind !== 'slope' && p.x < second.boss.arenaLeft));
tower.food = routeFood(tower, tower.platforms.filter(p => p.y > tower.boss.ground));
shaft.food = routeFood(shaft, shaft.platforms.filter(p => p.kind === 'floor' || p.kind === 'cargoLift'
  || p.kind === 'drawer' || p.kind === 'worktop' && p.y > shaft.boss.ground));
