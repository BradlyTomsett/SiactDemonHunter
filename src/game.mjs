import { CHARACTERS, DROPPINGS, ENEMIES, GRENADE, PLAYER, VIEW, WEAPONS } from "./levels.mjs";

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const approach = (start, end, step) => start + clamp(end - start, -step, step);
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x
  && a.y < b.y + b.h && a.y + a.h > b.y;

export function createGame(level, options = {}) {
  const game = {
    level, player: null, status: "playing", reason: "", camera: 0, elapsed: 0,
    lives: options.lives ?? PLAYER.lives, respawns: 0, respawnReason: "", checkpoint: -1,
    enemies: [], supplies: [], bullets: [], enemyShots: [], sparks: [], grenades: [], waves: [],
    bosses: [], boss: null, clearedBosses: 0, helperDrops: 0,
    clearedHordes: new Set(), hordeStarts: 0,
    score: options.score ?? 0, collectedFood: new Set(), food: [],
    characterId: CHARACTERS[options.characterId] ? options.characterId : 'minister',
    stats: {
      startScore: options.score ?? 0, enemyKills: 0, bosses: [],
      foodCounts: {}, pickups: 0, bossProjectiles: 0,
      scoreByType: { enemies: 0, bosses: 0, projectiles: 0, food: 0, pickups: 0 },
    },
  };
  resetLevel(game, -1, options.carry);
  return game;
}

function enemyObstacle(platform) {
  return !platform.broken && !platform.oneway && platform.kind !== 'slope';
}

function makeEnemy(spawn, platforms) {
  const type = ENEMIES[spawn.type];
  const enemy = {
    ...spawn,
    y: spawn.y - type.height,
    baseY: spawn.y - type.height,
    w: type.width, h: type.height,
    direction: -1, health: type.health, maxHealth: type.health,
    flash: 0, tell: 0, cooldown: type.interval ? type.interval * 0.6 : 0,
    phase: spawn.phase ?? 0,
  };
  if (enemy.type === 'flyer') {
    let obstacle = platforms.find(item => enemyObstacle(item) && overlaps(enemy, item));
    while (obstacle) {
      enemy.y = obstacle.y - enemy.h;
      obstacle = platforms.find(item => enemyObstacle(item) && overlaps(enemy, item));
    }
    enemy.baseY = enemy.y;
  }
  return enemy;
}

function resetLevel(game, checkpointIndex = -1, keep = null) {
  const level = game.level;
  const point = checkpointIndex >= 0 ? level.checkpoints[checkpointIndex] : null;
  const spawnX = point ? point.x : level.spawn.x;
  const spawnY = point ? point.y : level.spawn.y;
  const character = CHARACTERS[game.characterId];
  game.player = {
    x: spawnX, y: spawnY - PLAYER.height,
    w: PLAYER.width, h: PLAYER.height, vx: 0, vy: 0, facing: 1, aimX: 1, aimY: 0,
    grounded: false, coyote: 0, jumpBuffer: 0, cooldown: 0, flash: 0, ladderCooldown: 0,
    characterId: game.characterId, maxHealth: character.maxHealth,
    health: Math.min(keep?.health ?? character.maxHealth, character.maxHealth), invincible: 0, knockback: 0,
    weapon: keep?.weapon ?? 'basic',
    ammo: keep?.ammo ?? Infinity,
    grenades: character.infiniteGrenades ? Infinity : (keep?.grenades ?? 2), boost: keep?.boost ?? 0,
  };
  game.platforms = level.platforms.map(platform => ({
    ...platform,
    baseX: platform.x,
    baseY: platform.y,
    crumbleTimer: 0,
    broken: false,
    respawnTimer: 0,
  }));
  game.blackout = { active: false, timer: 0, fired: false };
  game.enemies = level.enemies.map(spawn => makeEnemy(spawn, game.platforms));
  game.activeHordes = new Set();
  game.food = (level.food ?? []).map((item, index) => ({
    ...item, index, taken: game.collectedFood.has(index),
  }));
  game.hazards = level.hazards.map(hazard => ({ ...hazard, destroyed: false }));
  game.supplies = level.supplies.map(supply => ({
    ...supply, x: supply.x - 4, y: supply.y - 8, w: 22, h: 22, taken: false,
  }));
  // 把平台上的拾取物固定到平台，移动时保持相对位置。
  for (const item of [...game.food, ...game.supplies]) {
    const platform = game.platforms.find(surface => surface.motion
      && Math.abs(item.y + item.h - surface.y) <= 2
      && item.x >= surface.x && item.x + item.w <= surface.x + surface.w);
    if (platform) item.platform = platform;
  }
  game.bullets = [];
  game.enemyShots = [];
  game.grenades = [];
  game.blasts = [];
  game.waves = [];
  game.droppings = [];
  game.dropTimer = 2.5;
  game.sparks = [];
  game.checkpoint = checkpointIndex;
  const configs = level.bosses ?? (level.boss ? [level.boss] : []);
  game.bosses = configs.map((cfg, index) => ({
    x: cfg.spawnX, y: cfg.ground - cfg.height,
    w: cfg.width, h: cfg.height,
    health: cfg.health, maxHealth: cfg.health, speech: 0, coat: cfg.coat,
    state: 'waiting', timer: 0, attack: 'dash', direction: -1, flash: 0, attackIndex: 0, dashLeft: 0,
    label: cfg.displayName ?? cfg.name ?? cfg.label ?? '未知首领',
    kind: cfg.kind ?? 'dog', summoned: false, hidden: false,
    number: index + 1, total: configs.length, cfg,
  }));
  // 死亡重来时，已经打赢的 BOSS 保持倒地，否则会被迫回头重打。
  for (let i = 0; i < game.clearedBosses && i < game.bosses.length; i++) {
    game.bosses[i].state = 'defeated';
    game.bosses[i].health = 0;
  }
  game.boss = game.bosses.find(item => item.state !== 'defeated') ?? game.bosses[game.bosses.length - 1] ?? null;
  game.summon = null;
  game.helper = null;
  game.camera = clamp(spawnX - VIEW.width * 0.38, 0, Math.max(0, level.width - VIEW.width));
  const levelHeight = level.height ?? VIEW.height;
  game.cameraY = clamp(spawnY - VIEW.height * 0.66, 0, Math.max(0, levelHeight - VIEW.height));
  game.status = "playing";
  game.reason = "";
}

// 死亡后落到"已经过的、离死亡点最近"的检查点。往前面的检查点送会让玩家用死亡换进度，
// 所以只在身后找。
function nearestCheckpoint(game, player) {
  const points = game.level.checkpoints || [];
  let index = -1;
  // 纵向关卡按攀爬高度判断：只认已经爬到或爬过的检查点，取最高的那个。
  if ((game.level.height ?? VIEW.height) > VIEW.height) {
    let bestY = Infinity;
    for (let i = 0; i < points.length; i++) {
      if (player.y + player.h <= points[i].y + 6 && points[i].y < bestY) {
        bestY = points[i].y;
        index = i;
      }
    }
    return index;
  }
  for (let i = 0; i < points.length; i++) {
    if (points[i].x <= player.x + player.w / 2 && player.y + player.h <= points[i].y + 1) index = i;
  }
  return index;
}

function die(game, reason) {
  if (game.lives > 0) {
    const index = game.checkpoint;
    game.lives -= 1;
    game.respawns += 1;
    game.respawnReason = reason;
    resetLevel(game, index);
    game.player.respawnTargetY = game.player.y;
    game.player.y = Math.min(game.player.respawnTargetY, game.cameraY - game.player.h);
    game.player.respawning = true;
    game.player.invincible = PLAYER.respawnInvincible;
    return true;
  }
  game.status = "lost";
  game.reason = `${reason}命数已用完。`;
  return false;
}

function movePlatforms(game) {
  const player = game.player;
  for (const platform of game.platforms) {
    if (!platform.motion || platform.broken) continue;
    const { distance, speed, axis } = platform.motion;
    const wave = Math.sin(game.elapsed * speed / distance);
    const standing = player.grounded && Math.abs(player.y + player.h - platform.y) < 1
      && player.x + player.w > platform.x && player.x < platform.x + platform.w;
    if (axis === 'y') {
      const y = platform.baseY + wave * distance;
      const dy = y - platform.y;
      platform.y = y;
      if (standing) player.y += dy;
      for (const item of [...game.food, ...game.supplies]) {
        if (item.platform === platform) item.y += dy;
      }
      continue;
    }
    const x = platform.baseX + wave * distance;
    const dx = x - platform.x;
    platform.x = x;
    if (standing) player.x = clamp(player.x + dx, 0, game.level.width - player.w);
    for (const item of [...game.food, ...game.supplies]) {
      if (item.platform === platform) item.x += dx;
    }
  }
}

function movePlayer(game, input, dt) {
  const p = game.player;
  const platforms = game.platforms;
  const slipping = p.grounded && game.hazards.some(h => h.kind === 'spill' && overlaps(p, h));
  const acceleration = PLAYER.acceleration * (slipping ? 0.22 : 1);

  p.coyote = p.grounded ? PLAYER.coyoteTime : Math.max(0, p.coyote - dt);
  p.jumpBuffer = input.jump ? PLAYER.jumpBuffer : Math.max(0, p.jumpBuffer - dt);

  if (input.move) p.facing = input.move;
  else if (input.aimX) p.facing = Math.sign(input.aimX);
  if (input.aimX || input.aimY) {
    const length = Math.hypot(input.aimX, input.aimY);
    p.aimX = input.aimX / length;
    p.aimY = input.aimY / length;
  } else {
    p.aimX = p.facing;
    p.aimY = 0;
  }
  p.ladderCooldown = Math.max(0, p.ladderCooldown - dt);
  const verticalInput = Math.abs(input.aimY ?? 0) > .5 ? Math.sign(input.aimY) : 0;
  const feet = p.y + p.h;
  const ladder = (game.level.ladders ?? []).find(item => {
    const center = p.x + p.w / 2;
    return center >= item.x - 6 && center <= item.x + item.w + 6
      && feet >= item.y - 1 && feet <= item.y + item.h + 3
      && (verticalInput > 0 || feet > item.y + .5);
  });
  if (p.climbing && input.jump) {
    p.climbing = false;
    p.coyote = PLAYER.coyoteTime;
    p.ladderCooldown = .35;
  } else if ((p.climbing || verticalInput) && ladder && p.knockback <= 0 && p.ladderCooldown <= 0) {
    p.climbing = true;
    p.x = ladder.x + (ladder.w - p.w) / 2;
    p.vx = 0;
    p.vy = 0;
    const nextFeet = clamp(feet + verticalInput * 95 * dt, ladder.y, ladder.y + ladder.h);
    p.y = nextFeet - p.h;
    p.grounded = nextFeet <= ladder.y || nextFeet >= ladder.y + ladder.h;
    if (p.grounded && verticalInput) p.climbing = false;
    return;
  } else {
    p.climbing = false;
  }
  if (p.knockback <= 0) p.vx = approach(p.vx, input.move * PLAYER.speed, acceleration * dt);
  if (p.jumpBuffer > 0 && p.coyote > 0 && p.knockback <= 0) {
    p.vy = -PLAYER.jumpSpeed;
    p.jumpBuffer = 0;
    p.coyote = 0;
    p.grounded = false;
  }

  const oldX = p.x;
  p.x = clamp(p.x + p.vx * dt, 0, game.level.width - p.w);
  const arena = game.boss;
  if (arena && !['waiting', 'defeated'].includes(arena.state)) {
    p.x = clamp(p.x, arena.cfg.arenaLeft, arena.cfg.arenaRight - p.w);
  }
  for (const solid of platforms) {
    if (solid.oneway || solid.broken || solid.kind === 'slope') continue;
    if (!overlaps(p, solid)) continue;
    if (oldX + p.w <= solid.x) p.x = solid.x - p.w;
    else if (oldX >= solid.x + solid.w) p.x = solid.x + solid.w;
    p.vx = 0;
  }

  const oldY = p.y;
  p.vy = Math.min(p.vy + PLAYER.gravity * dt, PLAYER.maxFallSpeed);
  p.y += p.vy * dt;
  p.grounded = false;
  for (const solid of platforms) {
    if (solid.broken || solid.kind === 'slope') continue;
    if (!overlaps(p, solid)) continue;
    // 单向平台只在下落途中接住玩家，跳上去时从下方穿过。
    const landing = p.vy >= 0 && oldY + p.h <= solid.y + 0.6;
    if (solid.oneway && !landing) continue;
    if (landing) {
      p.y = solid.y - p.h;
      p.vy = 0;
      p.grounded = true;
      // 键帽弹簧：落地直接把人弹得更高。
      if (solid.bounce) {
        p.vy = -PLAYER.jumpSpeed * solid.bounce;
        p.grounded = false;
        p.coyote = PLAYER.coyoteTime;
        sparks(game, p.x + p.w / 2, solid.y, '#ffd97a', 6);
      }
    } else if (p.vy < 0 && oldY >= solid.y + solid.h) {
      p.y = solid.y + solid.h;
      p.vy = 0;
    }
  }

  // 斜坡：按脚下的高度把人贴在坡面上，走上坡就是一路抬升。
  for (const solid of platforms) {
    if (solid.kind !== 'slope' || solid.broken) continue;
    const center = p.x + p.w / 2;
    if (center < solid.x || center > solid.x + solid.w) continue;
    const t = (center - solid.x) / solid.w;
    const surfaceY = solid.y - (solid.rise ?? 0) * t;
    const feetY = p.y + p.h;
    if (p.vy >= 0 && feetY >= surfaceY - 8 && feetY <= surfaceY + 24) {
      p.y = surfaceY - p.h;
      p.vy = 0;
      p.grounded = true;
    }
  }
}

function sparks(game, x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const vx = Math.cos(i * 2.4) * (20 + i * 9);
    game.sparks.push({ x, y, vx, vy: -35 - (i % 4) * 15, color, life: 0.24 + (i % 3) * 0.05 });
  }
}

// 会塌的书堆：站久了就散架，过一会儿复原。
function updatePlatforms(game, dt) {
  const p = game.player;
  const feet = p.y + p.h;
  for (const solid of game.platforms) {
    if (!solid.crumble) continue;
    if (solid.broken) {
      solid.respawnTimer -= dt;
      if (solid.respawnTimer <= 0 && !overlaps(p, solid)
        && !game.enemies.some(enemy => enemy.health > 0 && overlaps(enemy, solid))) {
        solid.broken = false;
        solid.crumbleTimer = 0;
      }
      continue;
    }
    const standing = p.grounded && Math.abs(feet - solid.y) < 1.5
      && p.x + p.w > solid.x && p.x < solid.x + solid.w;
    solid.crumbleTimer = standing
      ? solid.crumbleTimer + dt
      : Math.max(0, solid.crumbleTimer - dt * 2);
    if (solid.crumbleTimer >= solid.crumble.delay) {
      solid.broken = true;
      solid.respawnTimer = solid.crumble.respawn;
      sparks(game, solid.x + solid.w / 2, solid.y, '#d9b382', 9);
    }
  }
}

// 第 2 关的断电段：走进区域后画面变暗几秒，出来自动恢复。
function updateBlackout(game, dt) {
  const zone = game.level.blackout;
  const state = game.blackout;
  if (!state) return;
  const p = game.player;
  const center = p.x + p.w / 2;
  if (zone && !state.fired && center >= zone.x && center <= zone.x + zone.w) {
    state.fired = true;
    state.active = true;
    state.timer = zone.duration;
  }
  if (!state.active) return;
  state.timer -= dt;
  if (state.timer <= 0) state.active = false;
}

const SCORE_PER_LIFE = 150;

function addScore(game, points, type) {
  const before = Math.floor(game.score / SCORE_PER_LIFE);
  game.score += points;
  game.stats.scoreByType[type] += points;
  game.lives += Math.floor(game.score / SCORE_PER_LIFE) - before;
}

function damageTarget(game, target, amount, flash) {
  if (target.health <= 0) return;
  // 出场亮相（展示耳机）的 1 秒内无敌。
  if (target === game.boss && ['waiting', 'summon', 'hidden', 'intro', 'enter', 'returning'].includes(target.state)) return;
  target.health = Math.max(0, target.health - amount);
  target.flash = flash;
  if (target.health > 0) return;
  if (target === game.boss) {
    const name = target.cfg.displayName ?? target.cfg.name ?? target.label ?? '未知首领';
    const variant = target.cfg.coat?.name;
    game.stats.bosses.push(variant ? `${name}（${variant}）` : name);
    addScore(game, 30, 'bosses');
  } else if (game.enemies.includes(target)) {
    game.stats.enemyKills += 1;
    addScore(game, 5, 'enemies');
    if (target.horde !== undefined && !game.enemies.some(enemy => enemy.horde === target.horde && enemy.health > 0)) {
      game.activeHordes.delete(target.horde);
      game.clearedHordes.add(target.horde);
    }
  } else if (game.waves.includes(target)) {
    game.stats.bossProjectiles += 1;
    addScore(game, 1, 'projectiles');
  }
  if (target !== game.boss) return;

  // 召唤出来的 6 狗不算「第 N 只首领」，否则死亡回退时会把骡子一起算成已击败。
  if (target.summoned) {
    target.state = 'dying';
    target.timer = 2.25;
    game.waves = [];
    return;
  }

  // 致命一击立即保存进度，倒地动画结束后才开放通道。
  game.clearedBosses += 1;
  target.state = 'dying';
  target.timer = 2.25;
  target.y = target.cfg.ground - target.h;
  game.waves = [];
}

function stepShots(game, fire, dt) {
  const p = game.player;
  p.cooldown = Math.max(0, p.cooldown - dt);
  if (fire && p.cooldown <= 0) {
    const kind = p.weapon;
    const weapon = WEAPONS[kind];
    const size = weapon.size;
    const x = p.x + p.w / 2 + p.aimX * 12 - size / 2;
    const y = p.y + p.h / 2 + p.aimY * 12 - size / 2;
    const angles = weapon.pellets
      ? Array.from({ length: weapon.pellets }, (_, index) =>
        -weapon.spread + (index + Math.random()) * 2 * weapon.spread / weapon.pellets)
      : [0];
    for (const angle of angles) {
      const vx = (p.aimX * Math.cos(angle) - p.aimY * Math.sin(angle)) * weapon.speed;
      const vy = (p.aimX * Math.sin(angle) + p.aimY * Math.cos(angle)) * weapon.speed;
      game.bullets.push({ x, y, w: size, h: size, vx, vy, kind, life: weapon.lifetime, damage: weapon.damage * (p.boost > 0 ? 1.5 : 1), pierce: weapon.pierce ?? 1, hit: [] });
    }
    p.cooldown = weapon.interval;
    p.flash = 0.06;
    p.flashColor = weapon.color;
    if (p.ammo !== Infinity && --p.ammo <= 0) { p.weapon = 'basic'; p.ammo = Infinity; }
  }
  const targets = [...game.waves, ...game.enemyShots, ...game.enemies];
  if (game.boss && game.boss.state !== 'waiting') targets.push(game.boss);
  game.bullets = game.bullets.filter(bullet => {
    const dx = bullet.vx * dt;
    const dy = bullet.vy * dt;
    const sweep = { ...bullet, x: Math.min(bullet.x, bullet.x + dx), y: Math.min(bullet.y, bullet.y + dy), w: bullet.w + Math.abs(dx), h: bullet.h + Math.abs(dy) };
    bullet.x += dx;
    bullet.y += dy;
    bullet.life -= dt;
    if (game.platforms.some(solid => !solid.broken && !solid.oneway && overlaps(sweep, solid))) return false;
    const crumb = game.hazards.find(h => h.kind === 'crumb' && !h.destroyed && overlaps(h, sweep));
    if (crumb) { crumb.destroyed = true; sparks(game, crumb.x + crumb.w / 2, crumb.y, '#c79555', 7); return false; }
    const dropping = game.droppings.find(item => !item.destroyed && overlaps(item, sweep));
    if (dropping) { dropping.destroyed = true; game.stats.bossProjectiles += 1; addScore(game, 1, 'projectiles'); sparks(game, dropping.x, dropping.y, "#d9a46c", 6); return false; }
    const enemy = targets.find(target => target.health > 0 && !bullet.hit.includes(target) && overlaps(target, sweep));
    if (!enemy) return bullet.life > 0 && bullet.x > -12 && bullet.x < game.level.width && bullet.y > -12 && bullet.y < (game.level.height ?? VIEW.height) + 12;
    // 盾牌狗正面挡子弹：从它面朝的方向打过来会被弹开，绕后或用手榴弹才有效。
    if (enemy.type === 'shielder' && Math.sign(bullet.vx) === -enemy.direction) {
      sparks(game, bullet.x + bullet.w / 2, bullet.y + bullet.h / 2, '#9fd0e0', 5);
      return false;
    }
    damageTarget(game, enemy, bullet.damage, 0.12);
    bullet.hit.push(enemy);
    sparks(game, bullet.x + bullet.w / 2, bullet.y + bullet.h / 2, WEAPONS[bullet.kind]?.color ?? '#ffb52e', enemy.health === 0 ? 9 : 3);
    return --bullet.pierce > 0;
  });
}

function fireEnemyShot(game, enemy) {
  const type = ENEMIES[enemy.type];
  const p = game.player;
  const ox = enemy.x + enemy.w / 2;
  const oy = enemy.y + enemy.h * 0.4;
  const angle = Math.atan2(p.y + p.h / 2 - oy, p.x + p.w / 2 - ox);
  const size = 13;
  const aimX = Math.cos(angle);
  const aimY = Math.sin(angle);
  game.enemyShots.push({
    x: ox - size / 2, y: oy - size / 2, w: size, h: size,
    vx: aimX * type.shotSpeed, vy: aimY * type.shotSpeed,
    life: 2.3, health: 1, maxHealth: 1, flash: 0,
  });
}

const hordeFormation = ['patrol', 'flyer', 'gunner', 'patrol', 'flyer', 'patrol', 'gunner', 'flyer', 'patrol', 'gunner'];

function startHordes(game) {
  if (game.boss && game.boss.state !== 'waiting') return;
  const player = game.player;
  const center = player.x + player.w / 2;
  const feet = player.y + player.h;
  for (const [id, {left, right, ground}] of (game.level.hordes ?? []).entries()) {
    if (game.activeHordes.has(id) || game.clearedHordes.has(id)) continue;
    if (center < left || center > right || feet > ground + 2 || feet < ground - 105) continue;
    const direction = center < (left + right) / 2 ? -1 : 1;
    let groundSlot = 0, airSlot = 0;
    for (const type of hordeFormation) {
      const flying = type === 'flyer';
      const slot = flying ? airSlot++ : groundSlot++;
      const width = ENEMIES[type].width;
      const offset = 8 + slot * (flying ? 36 : 24);
      const x = direction < 0 ? right - width - offset : left + offset;
      const enemy = makeEnemy({
        type, x, y: ground - (flying ? 54 + slot * 12 : 0), horde: id,
        minX: left, maxX: right - width, phase: slot * 1.8,
      }, game.platforms);
      enemy.direction = direction;
      enemy.cooldown += slot * .22;
      game.enemies.push(enemy);
    }
    game.activeHordes.add(id);
    game.hordeStarts++;
  }
}

function stepHordeEnemy(enemy, player, platforms, dt) {
  const flying = enemy.type === 'flyer';
  const aim = player.x + player.w / 2 - enemy.w / 2;
  enemy.direction = aim < enemy.x ? -1 : 1;
  const stopShort = enemy.type === 'gunner' ? 95 : 0;
  const target = Math.abs(aim - enemy.x) > stopShort
    ? clamp(aim - enemy.direction * stopShort, enemy.minX, enemy.maxX) : enemy.x;
  const speed = enemy.type === 'gunner' ? 70 : flying ? 112 : 140;
  const nextX = approach(enemy.x, target, speed * dt);
  const oldX = enemy.x;
  moveEnemy(enemy, nextX - oldX, 'x', platforms, enemy.minX, enemy.maxX);
  enemy.running = enemy.x !== oldX;
  if (flying) {
    enemy.phase += dt * 7;
    const height = clamp(player.y - 12, enemy.baseY - 28, enemy.baseY + 36);
    const nextY = approach(enemy.y, height + Math.sin(enemy.phase) * 9, 115 * dt);
    moveEnemy(enemy, nextY - enemy.y, 'y', platforms);
  }
}

function stepEnemies(game, dt) {
  const p = game.player;
  for (const enemy of game.enemies) {
    if (!enemy.health) continue;
    const type = ENEMIES[enemy.type];
    enemy.flash = Math.max(0, enemy.flash - dt);

    if (enemy.horde !== undefined) {
      stepHordeEnemy(enemy, p, game.platforms, dt);
      if (enemy.type === 'patrol') continue;
    } else if (enemy.type === 'patrol') {
      if (moveEnemy(enemy, enemy.direction * type.speed * dt, 'x', game.platforms, enemy.minX, enemy.maxX)) {
        enemy.direction *= -1;
      }
    } else if (enemy.type === 'gunner') {
      enemy.direction = p.x + p.w / 2 < enemy.x + enemy.w / 2 ? -1 : 1;
    } else if (enemy.type === 'flyer') {
      enemy.phase += dt * type.frequency * Math.PI * 2;
      if (moveEnemy(enemy, enemy.direction * type.speed * 0.55 * dt, 'x', game.platforms, enemy.minX, enemy.maxX)) {
        enemy.direction *= -1;
      }
      const dx = Math.abs(p.x + p.w / 2 - (enemy.x + enemy.w / 2));
      const diving = !enemy.upperOnly && dx < 120 && Math.abs(p.y - enemy.y) < 140;
      const target = diving ? p.y - 6 : enemy.baseY + Math.sin(enemy.phase) * type.amplitude;
      moveEnemy(enemy, approach(enemy.y, target, 150 * dt) - enemy.y, 'y', game.platforms);
    } else if (enemy.type === 'charger') {
      stepCharger(enemy, type, p, game.platforms, dt);
      continue;
    } else if (enemy.type === 'shielder') {
      // 盾牌狗：每 1.2 秒才转一次身，玩家可以趁它没转过来绕后开枪。
      enemy.turnTimer = (enemy.turnTimer ?? 1.2) - dt;
      if (enemy.turnTimer <= 0) {
        enemy.turnTimer = 1.2;
        enemy.direction = p.x + p.w / 2 < enemy.x + enemy.w / 2 ? -1 : 1;
      }
      const dx = Math.abs(p.x - enemy.x);
      if (dx > 26 && Math.abs(p.y - enemy.y) < 120) {
        moveEnemy(enemy, enemy.direction * type.speed * dt, 'x', game.platforms, 0, game.level.width - enemy.w);
      }
      continue;
    }

    if (enemy.upperOnly && p.y + p.h > 220) {
      enemy.tell = 0;
      continue;
    }
    if (enemy.tell > 0) {
      enemy.tell = Math.max(0, enemy.tell - dt);
      if (enemy.tell === 0) fireEnemyShot(game, enemy);
      continue;
    }
    enemy.cooldown = Math.max(0, enemy.cooldown - dt);
    if (enemy.cooldown === 0 && Math.abs(p.x - enemy.x) < type.range && Math.abs(p.y - enemy.y) < 90) {
      enemy.tell = type.telegraph;
      enemy.cooldown = type.interval;
    }
  }

  const shots = game.enemyShots;  const respawns = game.respawns;
  const remainingShots = shots.filter(shot => {
    if (game.respawns !== respawns || game.status !== "playing") return false;
    if (shot.health <= 0) return false;
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.life -= dt;
    if (shot.life <= 0) return false;
    if (game.platforms.some(solid => !solid.broken && !solid.oneway && overlaps(shot, solid))) return false;
    if (overlaps(shot, game.player)) {
      damagePlayer(game, shot, 1);
      return false;
    }
    return shot.x > -20 && shot.x < game.level.width + 20 && shot.y > -20 && shot.y < (game.level.height ?? VIEW.height) + 20;
  });
  if (game.respawns === respawns && game.status === "playing") game.enemyShots = remainingShots;
}

// 同一套轴向碰撞用于移动小怪，允许穿过和玩家一样可穿透的单向平台。
function moveEnemy(enemy, distance, axis, platforms, low = -Infinity, high = Infinity) {
  if (distance === 0) return false;
  const size = axis === 'x' ? 'w' : 'h';
  const cross = axis === 'x' ? 'y' : 'x';
  const crossSize = axis === 'x' ? 'h' : 'w';
  const start = enemy[axis];
  const end = start + distance;
  let next = clamp(end, low, high);
  for (const solid of platforms) {
    if (!enemyObstacle(solid)) continue;
    if (enemy[cross] >= solid[cross] + solid[crossSize] || enemy[cross] + enemy[crossSize] <= solid[cross]) continue;
    const near = solid[axis] - enemy[size];
    const far = solid[axis] + solid[size];
    if (distance > 0 && start <= near) next = Math.min(next, near);
    if (distance < 0 && start >= far) next = Math.max(next, far);
  }
  enemy[axis] = next;
  return next !== end;
}

// 冲刺狗：走动 → 蓄力（红圈预告）→ 直线冲刺 → 撞墙/冲完眩晕 → 继续走。
function stepCharger(enemy, type, p, platforms, dt) {
  enemy.state = enemy.state ?? 'walk';
  enemy.timer = Math.max(0, (enemy.timer ?? 0) - dt);
  enemy.cooldown = Math.max(0, (enemy.cooldown ?? 0) - dt);
  const dx = Math.abs(p.x - enemy.x);
  const dy = Math.abs(p.y - enemy.y);
  if (enemy.state === 'walk') {
    const left = Math.min(enemy.minX, enemy.x);
    const right = Math.max(enemy.maxX, enemy.x);
    if (moveEnemy(enemy, enemy.direction * type.speed * dt, 'x', platforms, left, right)) enemy.direction *= -1;
    if (enemy.cooldown <= 0 && dx < type.range && dy < 90) {
      enemy.state = 'wind';
      enemy.timer = type.telegraph;
      enemy.direction = p.x + p.w / 2 < enemy.x + enemy.w / 2 ? -1 : 1;
      enemy.tell = type.telegraph;
    }
  } else if (enemy.state === 'wind') {
    if (enemy.timer <= 0) {
      enemy.tell = 0;
      enemy.state = 'charge';
      enemy.timer = type.chargeTime;
    }
  } else if (enemy.state === 'charge') {
    const left = enemy.minX - 46;
    const right = enemy.maxX + 46;
    const hitWall = moveEnemy(enemy, enemy.direction * type.chargeSpeed * dt, 'x', platforms, left, right);
    if (hitWall || enemy.timer <= 0) {
      enemy.state = 'stun';
      enemy.timer = type.stun;
      enemy.cooldown = type.interval;
    }
  } else if (enemy.state === 'stun') {
    if (enemy.timer <= 0) enemy.state = 'walk';
  }
}

function stepGrenades(game, input, dt) {
  const p = game.player;
  if (input.grenade && p.grenades > 0) {
    if (p.grenades !== Infinity) p.grenades--;
    game.grenades.push({ x: p.x + p.w / 2 - 5, y: p.y + 8, w: 10, h: 10, vx: p.facing * 210, vy: -250, fuse: GRENADE.fuse, spin: 0 });
  }
  game.grenades = game.grenades.filter(g => {
    const oldX = g.x;
    const oldY = g.y;
    g.vy += 650 * dt;
    g.x += g.vx * dt;
    g.y += g.vy * dt;
    g.spin += g.vx * dt * 0.045;
    if (g.vy > 0) {
      // 单向平台允许炸弹从下方飞过，落下时和普通地面一样反弹。
      let landing = null;
      const oldBottom = oldY + g.h;
      const fall = g.y - oldY;
      for (const platform of game.platforms) {
        if (platform.broken) continue;
        if (platform.y < oldBottom || platform.y > oldBottom + fall) continue;
        const progress = (platform.y - oldBottom) / fall;
        const xAtImpact = oldX + (g.x - oldX) * progress;
        if (xAtImpact + g.w <= platform.x || xAtImpact >= platform.x + platform.w) continue;
        if (!landing || platform.y < landing.y) landing = platform;
      }
      if (landing) {
        g.y = landing.y - g.h;
        g.vy *= -0.28;
        g.vx *= 0.7;
      }
    }
    g.fuse -= dt;
    if (g.fuse > 0 && g.y < (game.level.height ?? VIEW.height) + 20) return true;
    const x = g.x + g.w / 2;
    const y = g.y + g.h / 2;
    const radius = GRENADE.radius;
    const inBlast = target => {
      const closestX = clamp(x, target.x, target.x + target.w);
      const closestY = clamp(y, target.y, target.y + target.h);
      return Math.hypot(closestX - x, closestY - y) <= radius;
    };
    const targets = [...game.enemies, ...game.waves, ...game.enemyShots];
    if (game.boss?.state !== 'waiting' && game.boss?.health > 0) targets.push(game.boss);
    for (const target of targets) {
      if (target.health > 0 && inBlast(target)) {
        damageTarget(game, target, GRENADE.damage, 0.15);
      }
    }
    for (const drop of game.droppings) {
      if (!drop.destroyed && inBlast(drop)) { drop.destroyed = true; game.stats.bossProjectiles += 1; addScore(game, 1, 'projectiles'); }
    }
    game.blasts.push({ x, y, radius, life: 0.36 });
    sparks(game, x, y, '#ff9e24', 16);
    return false;
  });
}

// Boss 的远程武器：橙色耳机。可以被子弹打掉（2 发），与地面齐平飞出，跳过或射掉都行。
function makeHeadphone(x, ground, direction) {
  return { x, y: ground - 24, w: 22, h: 24, direction, health: 2, maxHealth: 2, flash: 0 };
}

function stepBoss(game, dt) {
  const boss = game.boss;
  if (!boss) return false;
  const cfg = boss.cfg;
  if (!cfg || boss.state === 'defeated') return false;
  if (boss.kind === 'mule') return stepMule(game, boss, cfg, dt);
  if (boss.state === 'enter') {
    boss.x = approach(boss.x, boss.entryTarget, 280 * dt);
    if (boss.x === boss.entryTarget) {
      boss.timer -= dt;
      if (boss.timer <= 0) {
        boss.state = 'recovery';
        boss.timer = cfg.recovery;
      }
    }
    return false;
  }
  if (boss.state === 'waiting') {
    const previousCleared = game.bosses.slice(0, boss.number - 1).every(item => item.state === 'defeated');
    // 纵向场地只有在玩家落到首领平台后才能封闭入口。
    const vertical = (game.level.height ?? VIEW.height) > VIEW.height;
    const onArena = !vertical || (game.player.grounded
      && Math.abs(game.player.y + game.player.h - cfg.ground) < 1
      && game.player.x >= cfg.arenaLeft
      && game.player.x + game.player.w <= cfg.arenaRight);
    if (!previousCleared || !onArena || game.player.x < cfg.trigger) return false;
    boss.state = 'intro'; boss.timer = cfg.intro;
  }
  boss.flash = Math.max(0, boss.flash - dt);
  // 血量越低节奏越快：三阶段
  const ratio = boss.health / boss.maxHealth;
  const rage = ratio > 0.66 ? 1 : ratio > 0.33 ? 1.2 : 1.42;
  const warning = cfg.warning / rage;
  boss.timer -= dt;
  if (boss.state === 'intro') boss.x = approach(boss.x, cfg.spawnX, 85 * dt);
  if (boss.state === 'dash') boss.x = clamp(boss.x + boss.direction * cfg.dashSpeed * rage * dt, cfg.arenaLeft, cfg.arenaRight - boss.w);
  if (boss.state === 'leap') {
    const progress = 1 - Math.max(0, boss.timer) / cfg.leapDuration;
    boss.x = clamp(boss.x + boss.direction * cfg.leapSpeed * dt, cfg.arenaLeft, cfg.arenaRight - boss.w);
    boss.y = cfg.ground - boss.h - Math.sin(progress * Math.PI) * cfg.leapHeight;
  }
  if (boss.timer <= 0) {
    if (boss.state === 'dying') {
      boss.state = 'defeated';
      const next = game.bosses.find(item => item.state !== 'defeated');
      if (next) game.boss = next;
      return false;
    }
    if (boss.state === 'intro' || boss.state === 'recovery') {
      const patterns = [
        ['dash', 'wave', 'dash', 'wave'],
        ['doubleDash', 'wave', 'leap', 'wave'],
        ['dash', 'wave', 'dash', 'dash', 'doubleWave', 'leap'],
      ];
      const pattern = patterns[cfg.pattern ?? 0];
      boss.attack = pattern[boss.attackIndex++ % pattern.length];
      boss.dashLeft = boss.attack === 'doubleDash' ? 2 : 1;
      boss.direction = game.player.x < boss.x ? -1 : 1;
      boss.state = ['dash', 'doubleDash'].includes(boss.attack) ? 'warnDash' : boss.attack === 'leap' ? 'warnLeap' : 'warnWave'; boss.timer = warning;
    } else if (boss.state === 'warnDash') {
      boss.state = 'dash'; boss.timer = cfg.dashDuration;
    } else if (boss.state === 'warnLeap') {
      boss.state = 'leap'; boss.timer = cfg.leapDuration;
    } else if (boss.state === 'leap') {
      boss.y = cfg.ground - boss.h;
      game.waves.push(makeHeadphone(boss.x, cfg.ground, -1), makeHeadphone(boss.x + boss.w - 22, cfg.ground, 1));
      boss.state = 'recovery'; boss.timer = cfg.recovery / rage; boss.attack = 'dash';
    } else if (boss.state === 'warnWave') {
      game.waves.push(makeHeadphone(
        clamp(boss.direction < 0 ? boss.x - 22 : boss.x + boss.w, cfg.arenaLeft + 2, cfg.arenaRight - 24),
        cfg.ground,
        boss.direction,
      ));
      if (boss.attack === 'doubleWave') {
        game.waves.push(makeHeadphone(
          clamp(boss.x + boss.w / 2 - 11, cfg.arenaLeft + 2, cfg.arenaRight - 24),
          cfg.ground,
          -boss.direction,
        ));
      }
      boss.state = 'recovery'; boss.timer = cfg.recovery / rage; boss.attack = 'leap';
    } else if (boss.state === 'dash') {
      boss.dashLeft -= 1;
      if (boss.dashLeft > 0) {
        boss.direction = game.player.x < boss.x ? -1 : 1;
        boss.state = 'warnDash'; boss.timer = 0.55;
      } else {
        boss.state = 'recovery'; boss.timer = (cfg.pattern === 2 ? 0.7 : cfg.recovery) / rage;
      }
    }
  }
  const player = game.player;
  if (boss.state !== 'dying' && boss.state !== 'intro' && player.invincible <= 0 && overlaps(player, boss)) {
    if (damagePlayer(game, boss, cfg.damage)) return true;
    separateBoss(game, player, boss, cfg);
  }
  const remainingWaves = [];
  for (const wave of game.waves) {
    wave.flash = Math.max(0, wave.flash - dt);
    wave.x += wave.direction * cfg.waveSpeed * rage * dt;
    if (wave.health <= 0) {
      sparks(game, wave.x + wave.w / 2, wave.y + wave.h / 2, '#ffb052', 12);
      continue;
    }
    if (overlaps(game.player, wave)) {
      if (damagePlayer(game, wave, cfg.damage)) return true;
      continue;
    }
    if (wave.x > cfg.arenaLeft - 30 && wave.x < cfg.arenaRight + 30) remainingWaves.push(wave);
  }
  game.waves = remainingWaves;
  return false;
}

// 骡子的攻击顺序固定，玩家可以记住前摇并反击。
const muleAttacks = ['dash', 'kick', 'logic', 'leap', 'manure'];

function warnMuleAttack(boss, player) {
  const side = player.x + player.w / 2 < boss.x + boss.w / 2 ? -1 : 1;
  boss.attack = muleAttacks[boss.attackIndex++ % muleAttacks.length];
  boss.direction = boss.attack === 'kick' ? -side : side;
  boss.state = 'muleWindup';
  boss.timer = boss.attack === 'logic' ? boss.cfg.warning : .65;
}

function startMuleAttack(game, boss, cfg) {
  if (boss.attack === 'logic') spawnLogicWave(game, boss, cfg);
  if (boss.attack === 'manure' && game.droppings.length < DROPPINGS.max) {
    const size = DROPPINGS.size;
    const rear = boss.direction === 1 ? boss.x - size : boss.x + boss.w;
    game.droppings.push({
      x: clamp(rear, cfg.arenaLeft, cfg.arenaRight - size),
      y: cfg.ground - size - 20, w: size, h: size,
      speed: 125, state: 'falling', direction: -boss.direction,
    });
  }
  boss.state = 'muleAttack';
  boss.attackDuration = { dash: .84, kick: .27, logic: .34, leap: 1.03, manure: .4 }[boss.attack];
  boss.timer = boss.attackDuration;
}

function spawnLogicWave(game, boss, cfg) {
  const w = 46;
  const h = boss.h;
  const x = boss.direction < 0 ? boss.x - w - 4 : boss.x + boss.w + 4;
  game.waves.push({
    x, y: cfg.ground - h, w, h,
    direction: boss.direction,
    health: 5, maxHealth: 5, flash: 0,
    kind: 'logic',
    speed: cfg.logicSpeed ?? DROPPINGS.rollSpeed,
  });
}

// 召唤出来的 6 狗：和游戏里第一只 6 狗同样的血量、招式和外观。
function createSummon(game, mule, cfg) {
  const dogCfg = {
    ...cfg,
    kind: 'dog',
    label: '6狗',
    coat: cfg.summonCoat ?? null,
    pattern: cfg.summonPattern ?? 0,
    health: cfg.summonHealth ?? 45,
    droppings: true,
  };
  const dog = {
    x: Math.max(cfg.arenaRight, game.camera + VIEW.width) + 8, y: cfg.ground - cfg.height,
    w: cfg.width, h: cfg.height,
    health: dogCfg.health, maxHealth: dogCfg.health,
    speech: 0, coat: dogCfg.coat, state: 'enter', timer: 0.6,
    entryTarget: clamp(game.camera + VIEW.width - cfg.width - 35, cfg.arenaLeft + 20, cfg.arenaRight - cfg.width - 10),
    attack: 'dash', direction: -1, flash: 0, attackIndex: 0, dashLeft: 0,
    label: '6狗', kind: 'dog', summoned: true, hidden: false,
    number: mule.number, total: mule.total, cfg: dogCfg,
  };
  game.bosses.push(dog);
  game.summon = dog;
  game.dropTimer = 1.4;
  return dog;
}

function stepMule(game, boss, cfg, dt) {
  const player = game.player;
  boss.flash = Math.max(0, boss.flash - dt);
  boss.timer -= dt;

  if (boss.state === 'dying') {
    if (boss.timer <= 0) {
      boss.state = 'defeated';
      const next = game.bosses.find(item => item.state !== 'defeated');
      if (next) game.boss = next;
    }
    return false;
  }

  if (boss.state === 'returning') {
    boss.x = approach(boss.x, boss.entryTarget, 180 * dt);
    if (boss.x === boss.entryTarget) {
      boss.state = 'intro';
      boss.timer = 1.4;
    }
    return false;
  }

  if (boss.state === 'waiting') {
    const previousCleared = game.bosses.slice(0, boss.number - 1).every(item => item.state === 'defeated');
    if (!previousCleared || player.x < cfg.trigger) return false;
    boss.state = 'intro';
    boss.timer = cfg.intro;
  }

  // 喊「狗来」：期间不攻击、打不掉，喊完躲到后场。
  if (boss.state === 'summon') {
    if (boss.timer <= 0) {
      boss.state = 'hidden';
      boss.hidden = true;
      boss.x = cfg.arenaRight + 40;
      game.boss = createSummon(game, boss, cfg);
      game.waves = [];
      game.droppings = [];
    }
    return false;
  }

  // 躲在后场：等召唤出来的 6 狗倒下再回来。
  if (boss.state === 'hidden') {
    const dog = game.summon;
    if (!dog || dog.state === 'defeated') {
      boss.hidden = false;
      boss.state = 'returning';
      boss.x = Math.max(cfg.arenaRight, game.camera + VIEW.width) + 10;
      boss.entryTarget = clamp(game.camera + VIEW.width - boss.w - 45, cfg.arenaLeft + 20, cfg.arenaRight - boss.w - 10);
      boss.direction = -1;
      boss.y = cfg.ground - boss.h;
      game.summon = null;
      game.boss = boss;
    }
    return false;
  }

  if (!boss.calledDog && boss.health <= boss.maxHealth * (cfg.summonAt ?? 0.5)) {
    boss.calledDog = true;
    boss.state = 'summon';
    boss.timer = cfg.summonTime ?? 2.8;
    boss.y = cfg.ground - boss.h;
    game.waves = [];
    return false;
  }

  if (boss.state === 'intro') {
    if (boss.timer <= 0) warnMuleAttack(boss, player);
  } else if (boss.state === 'muleWindup') {
    if (boss.timer <= 0) startMuleAttack(game, boss, cfg);
  } else if (boss.state === 'muleAttack') {
    const speed = boss.attack === 'dash' ? 260 : boss.attack === 'leap' ? 145 : 0;
    boss.x = clamp(boss.x + boss.direction * speed * dt, cfg.arenaLeft, cfg.arenaRight - boss.w);
    if (boss.attack === 'leap') {
      const progress = 1 - Math.max(0, boss.timer) / boss.attackDuration;
      boss.y = cfg.ground - boss.h - Math.sin(progress * Math.PI) * 76;
    }
    if (boss.timer <= 0) {
      boss.y = cfg.ground - boss.h;
      boss.state = 'muleRecover';
      boss.timer = .62;
    }
  } else if (boss.state === 'muleRecover' && boss.timer <= 0) {
    boss.state = 'muleWalk';
    boss.timer = .88;
    // 移到玩家附近，但留出后踢及其他招式的反应距离。
    const side = player.x < boss.x ? -1 : 1;
    boss.walkTarget = clamp(player.x - boss.w / 2 - side * 56, cfg.arenaLeft + 10, cfg.arenaRight - boss.w - 10);
  } else if (boss.state === 'muleWalk') {
    if (boss.timer <= 0) warnMuleAttack(boss, player);
    else {
      if (boss.x !== boss.walkTarget) boss.direction = Math.sign(boss.walkTarget - boss.x);
      boss.x = approach(boss.x, boss.walkTarget, cfg.walkSpeed * dt);
    }
  }

  if (boss.state === 'muleAttack' && boss.attack === 'kick' && player.invincible <= 0) {
    const rear = { x: boss.direction === 1 ? boss.x - 48 : boss.x + boss.w, y: cfg.ground - 43, w: 48, h: 39 };
    if (overlaps(player, rear) && damagePlayer(game, rear, cfg.damage)) return true;
  }

  if (player.invincible <= 0 && boss.state !== 'intro' && overlaps(player, boss)) {
    if (damagePlayer(game, boss, cfg.damage)) return true;
    separateBoss(game, player, boss, cfg);
  }

  const remainingWaves = [];
  for (const wave of game.waves) {
    wave.flash = Math.max(0, wave.flash - dt);
    wave.x += wave.direction * (wave.speed ?? cfg.logicSpeed ?? cfg.waveSpeed) * dt;
    if (wave.health <= 0) {
      sparks(game, wave.x + wave.w / 2, wave.y + wave.h / 2, '#8fd8ff', 12);
      continue;
    }
    if (overlaps(player, wave)) {
      if (damagePlayer(game, wave, cfg.damage)) return true;
      continue;
    }
    if (wave.x > cfg.arenaLeft - 70 && wave.x < cfg.arenaRight + 70) remainingWaves.push(wave);
  }
  game.waves = remainingWaves;
  return false;
}

// 受伤时优先推向最近的空地，无敌期间可穿过 Boss，避免被追着挤回墙角。
function separateBoss(game, player, boss, arena) {
  const left = boss.x - player.w - 0.5;
  const right = boss.x + boss.w + 0.5;
  const positions = Math.abs(player.x - left) <= Math.abs(player.x - right) ? [left, right] : [right, left];
  for (const x of positions) {
    if (x < arena.arenaLeft || x + player.w > arena.arenaRight) continue;
    if (game.platforms.some(solid => !solid.broken && !solid.oneway && overlaps({ ...player, x }, solid))) continue;
    player.vx = Math.sign(x - player.x) * PLAYER.knockbackSpeed;
    player.x = x;
    return;
  }
}

function stepDroppings(game, dt) {
  const boss = game.boss;
  if (!boss || ['waiting', 'dying', 'defeated', 'summon', 'hidden', 'enter'].includes(boss.state)) { game.droppings = []; return false; }
  const cfg = boss.cfg;
  boss.speech = Math.max(0, boss.speech - dt);
  game.dropTimer -= dt;
  if (cfg.droppings !== false && game.dropTimer <= 0) {
    if (game.droppings.length >= DROPPINGS.max) {
      // 场上已经满了，先不投，等玩家清掉一坨再继续。
      game.dropTimer = 0.8;
    } else {
      const target = Math.random() < 0.5 ? game.player.x : boss.x;
      const size = DROPPINGS.size;
      const x = clamp(target + (Math.random() - 0.5) * 100, cfg.arenaLeft, cfg.arenaRight - size);
      game.droppings.push({
        x, y: -size, w: size, h: size,
        speed: DROPPINGS.fallMin + Math.random() * (DROPPINGS.fallMax - DROPPINGS.fallMin),
        state: 'falling',
        direction: Math.random() < 0.5 ? -1 : 1,
      });
      game.dropTimer = 2.6 + Math.random() * 1.8;
    }
  }
  const respawns = game.respawns;
  const remaining = game.droppings.filter(item => {
    if (item.destroyed || game.respawns !== respawns || game.status !== 'playing') return false;
    if (item.state === 'rolling') {
      // 落地后像巡逻小怪一样在地面左右滑，撞到竞技场边缘就掉头，不打掉就一直弹。
      item.x += item.direction * DROPPINGS.rollSpeed * dt;
      const left = cfg.arenaLeft + DROPPINGS.edge;
      const right = cfg.arenaRight - item.w - DROPPINGS.edge;
      if (item.x <= left) { item.x = left; item.direction = 1; }
      else if (item.x >= right) { item.x = right; item.direction = -1; }
    } else {
      item.y += item.speed * dt;
      if (boss.kind !== 'mule' && overlaps(item, boss)) {
        boss.health = Math.min(boss.maxHealth, boss.health + DROPPINGS.heal);
        boss.speech = 2.4;
        return false;
      }
      if (item.y + item.h >= cfg.ground) {
        item.y = cfg.ground - item.h;
        item.state = 'rolling';
      }
    }
    if (overlaps(item, game.player)) damagePlayer(game, item, DROPPINGS.damage);
    return true;
  });
  if (game.respawns !== respawns || game.status !== 'playing') return true;
  game.droppings = remaining;
  return false;
}

// 穿黑西装的「好人」：无敌、没有碰撞体积，只在 BOSS 战期间出现，定期送补给。
function updateHelper(game, dt) {
  const boss = game.boss;
  const active = boss && !['waiting', 'defeated', 'hidden'].includes(boss.state);
  if (!active) { game.helper = null; return; }
  if (!game.helper) {
    if (['intro', 'enter', 'returning', 'summon', 'dying'].includes(boss.state)) return;
    game.helper = {
      x: Math.min(game.camera - 20, boss.cfg.arenaLeft - 20),
      y: boss.cfg.ground - 26, w: 14, h: 26,
      timer: 0, facing: 1, bob: 0, speech: 0, entering: true,
      photoTimer: 5 + Math.random() * 7, photoPose: 0,
    };
  }
  const helper = game.helper;
  helper.y = boss.cfg.ground - helper.h;
  helper.bob += dt;
  helper.speech = Math.max(0, helper.speech - dt);
  helper.photoPose = Math.max(0, helper.photoPose - dt);
  if (!helper.entering && !['intro', 'enter', 'returning', 'dying'].includes(boss.state)) {
    helper.photoTimer -= dt;
    if (helper.photoTimer <= 0) {
      helper.photoTimer += 5 + Math.random() * 7;
      helper.photoPose = 1;
    }
  }
  const target = clamp(game.player.x + 80, 24, game.level.width - 40);
  const destination = clamp(target, boss.cfg.arenaLeft + 6, boss.cfg.arenaRight - 22);
  if (helper.photoPose > 0) {
    helper.facing = boss.x + boss.w / 2 < helper.x + helper.w / 2 ? -1 : 1;
  } else {
    helper.facing = destination < helper.x ? -1 : 1;
    helper.x = approach(helper.x, destination, 105 * dt);
  }
  if (helper.entering) {
    if (helper.x < Math.max(boss.cfg.arenaLeft + 6, game.camera + 16)) return;
    helper.entering = false;
  }
  helper.timer -= dt;
  if (helper.timer > 0) return;
  helper.timer = 4 + Math.random() * 4;
  helper.speech = 1.5;
  game.helperDrops += 1;
  const heal = Math.random() < 0.5 || game.player.health >= game.player.maxHealth;
  game.supplies.push({
    x: clamp(helper.x - 4, boss.cfg.arenaLeft, boss.cfg.arenaRight - 22),
    y: helper.y - 20,
    w: 22, h: 22,
    type: heal ? undefined : 'ammo',
    amount: 1,
    taken: false,
    gift: true,
    giftVx: Math.sign(game.player.x - helper.x) * 55,
    giftVy: -150,
    giftGround: boss.cfg.ground,
    giftLeft: boss.cfg.arenaLeft,
    giftRight: boss.cfg.arenaRight,
  });
}

function damagePlayer(game, source, amount) {
  const p = game.player;
  if (p.invincible > 0) return false;
  p.health = Math.max(0, p.health - amount);
  p.invincible = PLAYER.invincibleTime;
  p.knockback = PLAYER.knockbackTime;
  p.vx = PLAYER.knockbackSpeed * (p.x + p.w / 2 < source.x + source.w / 2 ? -1 : 1);
  p.vy = -185;
  sparks(game, p.x + p.w / 2, p.y + p.h / 2, "#fa8874", 7);
  if (!p.health) {
    die(game, "生命耗尽。");
    return true;
  }
  return false;
}

export function cableActive(elapsed) {
  return elapsed % 3 < 1.5;
}

export function stepGame(game, input, dt) {
  if (game.status !== "playing") return;
  const p = game.player;
  game.elapsed += dt;
  if (p.respawning) {
    p.y = Math.min(p.respawnTargetY, p.y + 260 * dt);
    if (p.y >= p.respawnTargetY) {
      p.respawning = false;
      p.grounded = true;
    }
    return;
  }
  p.invincible = Math.max(0, p.invincible - dt);
  p.knockback = Math.max(0, p.knockback - dt);
  p.flash = Math.max(0, p.flash - dt);
  p.boost = Math.max(0, p.boost - dt);
  movePlatforms(game);
  movePlayer(game, input, dt);
  const levelHeight = game.level.height ?? VIEW.height;
  if (p.y > levelHeight + 18) {
    die(game, "你跌下了桌面。");
    return;
  }

  game.checkpoint = Math.max(game.checkpoint, nearestCheckpoint(game, p));
  // 会塌的书堆 / 键帽弹簧 / 断电桥段
  updatePlatforms(game, dt);
  updateBlackout(game, dt);
  startHordes(game);
  const beforeEnemies = game.respawns;
  stepShots(game, input.fire, dt);
  stepEnemies(game, dt);
  if (game.respawns !== beforeEnemies || game.status !== "playing") return;
  stepGrenades(game, input, dt);
  const respawns = game.respawns;
  const interrupted = stepBoss(game, dt);
  if (game.respawns !== respawns) { game.waves = []; return; }
  if (interrupted || game.status !== 'playing') return;
  if (stepDroppings(game, dt)) return;
  updateHelper(game, dt);

  for (const enemy of game.enemies) {
    if (enemy.health && overlaps(p, enemy) && damagePlayer(game, enemy, ENEMIES[enemy.type].damage)) return;
  }
  for (const hazard of game.hazards) {
    if (!hazard.destroyed && (hazard.kind !== 'cable' || cableActive(game.elapsed)) && overlaps(p, hazard) && damagePlayer(game, hazard, hazard.damage)) return;
  }
  for (const supply of game.supplies) {
    if (supply.giftVy !== undefined) {
      supply.giftVy += 480 * dt;
      supply.x = clamp(supply.x + supply.giftVx * dt, supply.giftLeft, supply.giftRight - supply.w);
      supply.y += supply.giftVy * dt;
      if (supply.y + supply.h >= supply.giftGround) {
        supply.y = supply.giftGround - supply.h;
        delete supply.giftVy;
      }
    }
    if (supply.taken || !overlaps(p, supply)) continue;
    if (supply.type === 'grenade') {
      if (p.grenades >= GRENADE.max) continue;
      p.grenades = Math.min(GRENADE.max, p.grenades + supply.amount * CHARACTERS[game.characterId].pickupMultiplier);
    } else if (supply.type === 'ammo') {
      // 好人送的弹药：普通枪时换成一把满弹的霰弹枪，否则只补满当前武器。
      const kind = p.weapon === 'basic' ? 'spread' : p.weapon;
      p.weapon = kind;
      p.ammo = WEAPONS[kind].ammo * CHARACTERS[game.characterId].ammoMultiplier;
    } else if (WEAPONS[supply.type]) {
      p.weapon = supply.type; p.ammo = WEAPONS[supply.type].ammo * CHARACTERS[game.characterId].ammoMultiplier;
    } else {
      if (p.health >= p.maxHealth) continue;
      p.health = Math.min(p.maxHealth, p.health + supply.amount * CHARACTERS[game.characterId].pickupMultiplier);
    }
    supply.taken = true;
    game.stats.pickups += 1;
    addScore(game, CHARACTERS[game.characterId].pickupMultiplier, 'pickups');
    sparks(game, supply.x + 7, supply.y + 7, "#89e0ae", 7);
  }
  for (const food of game.food) {
    if (food.taken || !overlaps(p, food)) continue;
    food.taken = true;
    game.collectedFood.add(food.index);
    game.stats.foodCounts[food.type] = (game.stats.foodCounts[food.type] ?? 0) + 1;
    addScore(game, CHARACTERS[game.characterId].pickupMultiplier, 'food');
    sparks(game, food.x + 9, food.y + 10, "#ffd873", 5);
  }
  const gateOpen = game.bosses.every(boss => boss.state === 'defeated');
  if (gateOpen && game.status === "playing" && overlaps(p, game.level.exit)) game.status = "cleared";

  const arena = game.boss?.cfg;
  const locked = arena?.framedArena && !gateOpen && game.boss.state !== 'waiting';
  let cameraTarget = p.x - VIEW.width * .38;
  if (locked) {
    const center = (arena.arenaLeft + arena.arenaRight - VIEW.width) / 2;
    const margin = 16;
    const left = Math.min(center, arena.arenaLeft - margin);
    const right = Math.max(center, arena.arenaRight + margin - VIEW.width);
    cameraTarget = clamp(p.x + p.w / 2 - VIEW.width / 2, left, right);
  }
  const target = clamp(cameraTarget, 0, Math.max(0, game.level.width - VIEW.width));
  game.camera = approach(game.camera, target, 420 * dt);
  // 纵向关卡：镜头跟着往上抬，让上面的落点提前进画面。
  const targetY = clamp(p.y + p.h - VIEW.height * 0.66, 0, Math.max(0, levelHeight - VIEW.height));
  game.cameraY = approach(game.cameraY ?? 0, targetY, 460 * dt);
  game.blasts = game.blasts.filter(blast => (blast.life -= dt) > 0);
  game.sparks = game.sparks.filter(spark => {
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vy += 240 * dt;
    spark.life -= dt;
    return spark.life > 0;
  });
}

// 从本地存档恢复一局：分数、命数、统计、食品、已击败的首领都要在重建关卡前设好。
export function restoreGame(game, snapshot) {
  if (!snapshot) return game;
  if (Number.isFinite(snapshot.score)) game.score = snapshot.score;
  if (Number.isFinite(snapshot.lives)) game.lives = snapshot.lives;
  if (snapshot.stats) game.stats = snapshot.stats;
  if (Array.isArray(snapshot.collectedFood)) game.collectedFood = new Set(snapshot.collectedFood);
  if (Array.isArray(snapshot.clearedHordes)) game.clearedHordes = new Set(snapshot.clearedHordes);
  if (Number.isFinite(snapshot.clearedBosses)) game.clearedBosses = snapshot.clearedBosses;
  if (Number.isFinite(snapshot.elapsed)) game.elapsed = snapshot.elapsed;
  const carry = snapshot.carry ? {
    ...snapshot.carry,
    ammo: snapshot.carry.ammo === "inf" ? Infinity : snapshot.carry.ammo,
    grenades: snapshot.carry.grenades === "inf" ? Infinity : snapshot.carry.grenades,
  } : null;
  const savedCheckpoint = Number.isInteger(snapshot.checkpoint) ? snapshot.checkpoint : -1;
  const usesCurrentLayout = game.level.checkpointLayout && snapshot.checkpointLayout === game.level.checkpointLayout;
  const legacyCheckpoint = usesCurrentLayout ? undefined : game.level.legacyCheckpoints?.[savedCheckpoint];
  const checkpoint = legacyCheckpoint ?? savedCheckpoint;
  resetLevel(game, game.level.checkpoints[checkpoint] ? checkpoint : -1, carry);
  game.player.invincible = Math.max(game.player.invincible, 1.2);
  return game;
}
