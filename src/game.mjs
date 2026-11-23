import { BOSS, ENEMIES, PLAYER, VIEW, WEAPONS } from "./levels.mjs";

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const approach = (start, end, step) => start + clamp(end - start, -step, step);
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x
  && a.y < b.y + b.h && a.y + a.h > b.y;

export function createGame(level) {
  const game = {
    level, player: null, status: "playing", reason: "", camera: 0, elapsed: 0,
    lives: PLAYER.lives, respawns: 0, respawnReason: "",
    enemies: [], supplies: [], bullets: [], sparks: [], grenades: [],
  };
  resetLevel(game);
  return game;
}

function resetLevel(game) {
  const level = game.level;
  game.player = {
    x: level.spawn.x, y: level.spawn.y - PLAYER.height,
    w: PLAYER.width, h: PLAYER.height, vx: 0, vy: 0, facing: 1, aimX: 1, aimY: 0,
    grounded: false, coyote: 0, jumpBuffer: 0, cooldown: 0, flash: 0,
    health: PLAYER.maxHealth, invincible: 0, knockback: 0, weapon: 'basic', ammo: Infinity, grenades: 2,
  };
  game.enemies = level.enemies.map(spawn => {
    const type = ENEMIES[spawn.type];
    return {
      ...spawn, y: spawn.y - type.height, w: type.width, h: type.height,
      direction: -1, health: type.health, flash: 0,
    };
  });
  game.supplies = level.supplies.map(supply => ({ ...supply, w: 14, h: 14, taken: false }));
  game.bullets = [];
  game.grenades = [];
  game.boss = { x: BOSS.arenaRight, y: BOSS.ground - BOSS.height, w: BOSS.width, h: BOSS.height, health: BOSS.health, state: 'waiting', timer: 0, attack: 'dash', direction: -1, flash: 0 };
  game.waves = [];
  game.sparks = [];
  game.camera = 0;
  game.elapsed = 0;
  game.status = "playing";
  game.reason = "";
}

function die(game, reason) {
  if (game.lives > 0) {
    game.lives -= 1;
    game.respawns += 1;
    game.respawnReason = reason;
    resetLevel(game);
    game.player.invincible = PLAYER.respawnInvincible;
    return true;
  }
  game.status = "lost";
  game.reason = `${reason}${PLAYER.lives + 1} 条命已用完。`;
  return false;
}

function movePlayer(game, input, dt) {
  const p = game.player;
  const platforms = game.level.platforms;
  p.coyote = p.grounded ? PLAYER.coyoteTime : Math.max(0, p.coyote - dt);
  p.jumpBuffer = input.jump ? PLAYER.jumpBuffer : Math.max(0, p.jumpBuffer - dt);

  if (input.move) p.facing = input.move;
  if (input.aimX || input.aimY) {
    const length = Math.hypot(input.aimX, input.aimY);
    p.aimX = input.aimX / length;
    p.aimY = input.aimY / length;
  } else {
    p.aimX = p.facing;
    p.aimY = 0;
  }
  if (p.knockback <= 0) p.vx = approach(p.vx, input.move * PLAYER.speed, PLAYER.acceleration * dt);
  if (p.jumpBuffer > 0 && p.coyote > 0 && p.knockback <= 0) {
    p.vy = -PLAYER.jumpSpeed;
    p.jumpBuffer = 0;
    p.coyote = 0;
    p.grounded = false;
  }

  const oldX = p.x;
  p.x = clamp(p.x + p.vx * dt, 0, game.level.width - p.w);
  if (game.boss && !['waiting', 'defeated'].includes(game.boss.state)) p.x = clamp(p.x, BOSS.arenaLeft, BOSS.arenaRight - p.w);
  for (const solid of platforms) {
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
    if (!overlaps(p, solid)) continue;
    if (p.vy >= 0 && oldY + p.h <= solid.y) {
      p.y = solid.y - p.h;
      p.vy = 0;
      p.grounded = true;
    } else if (p.vy < 0 && oldY >= solid.y + solid.h) {
      p.y = solid.y + solid.h;
      p.vy = 0;
    }
  }
}

function sparks(game, x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const vx = Math.cos(i * 2.4) * (20 + i * 9);
    game.sparks.push({ x, y, vx, vy: -35 - (i % 4) * 15, color, life: 0.24 + (i % 3) * 0.05 });
  }
}

function stepShots(game, fire, dt) {
  const p = game.player;
  p.cooldown = Math.max(0, p.cooldown - dt);
  if (fire && p.cooldown <= 0) {
    const weapon = WEAPONS[p.weapon];
    const x = p.x + p.w / 2 + p.aimX * 12 - 2;
    const y = p.y + p.h / 2 + p.aimY * 12 - 2;
    const angles = weapon.spread ? [-weapon.spread, 0, weapon.spread] : [0];
    for (const angle of angles) {
      const vx = (p.aimX * Math.cos(angle) - p.aimY * Math.sin(angle)) * weapon.speed;
      const vy = (p.aimX * Math.sin(angle) + p.aimY * Math.cos(angle)) * weapon.speed;
      game.bullets.push({ x, y, w: 4, h: 4, vx, vy, life: weapon.lifetime, damage: weapon.damage, pierce: weapon.pierce || 1, hit: [] });
    }
    p.cooldown = weapon.interval;
    p.flash = 0.06;
    if (p.ammo !== Infinity && --p.ammo <= 0) { p.weapon = 'basic'; p.ammo = Infinity; }
  }
  game.bullets = game.bullets.filter(bullet => {
    const dx = bullet.vx * dt;
    const dy = bullet.vy * dt;
    const sweep = { ...bullet, x: Math.min(bullet.x, bullet.x + dx), y: Math.min(bullet.y, bullet.y + dy), w: bullet.w + Math.abs(dx), h: bullet.h + Math.abs(dy) };
    bullet.x += dx;
    bullet.y += dy;
    bullet.life -= dt;
    if (game.level.platforms.some(solid => overlaps(sweep, solid))) return false;
    const targets = [...game.enemies, ...(game.boss && !['waiting', 'defeated'].includes(game.boss.state) ? [game.boss] : [])];
    const enemy = targets.find(target => target.health > 0 && !bullet.hit.includes(target) && overlaps(target, sweep));
    if (!enemy) return bullet.life > 0 && bullet.x > -12 && bullet.x < game.level.width && bullet.y > -12 && bullet.y < VIEW.height;
    enemy.health = Math.max(0, enemy.health - bullet.damage);
    bullet.hit.push(enemy);
    enemy.flash = 0.12;
    sparks(game, bullet.x + 4, bullet.y, "#f8de83", enemy.health === 0 ? 11 : 4);
    return --bullet.pierce > 0;
  });
}

function stepGrenades(game, input, dt) {
  const p = game.player;
  if (input.grenade && p.grenades > 0) {
    p.grenades--;
    game.grenades.push({ x: p.x + p.w / 2, y: p.y + 8, vx: p.facing * 210, vy: -250, fuse: 1.1 });
  }
  game.grenades = game.grenades.filter(g => {
    const oldY = g.y;
    g.vy += 650 * dt;
    g.x += g.vx * dt;
    g.y += g.vy * dt;
    for (const solid of game.level.platforms) {
      if (g.vy > 0 && oldY + 6 <= solid.y && g.y + 6 >= solid.y && g.x + 6 > solid.x && g.x < solid.x + solid.w) {
        g.y = solid.y - 6; g.vy = -Math.abs(g.vy) * 0.28; g.vx *= 0.7;
      }
    }
    g.fuse -= dt;
    if (g.fuse > 0 && g.y < VIEW.height + 20) return true;
    const targets = [...game.enemies, ...(game.boss && !['waiting', 'defeated'].includes(game.boss.state) ? [game.boss] : [])];
    for (const enemy of targets) {
      if (enemy.health && Math.hypot(enemy.x + enemy.w / 2 - g.x, enemy.y + enemy.h / 2 - g.y) < 74) {
        enemy.health = Math.max(0, enemy.health - 4); enemy.flash = 0.15;
      }
    }
    sparks(game, g.x, g.y, '#ffbf62', 18);
    return false;
  });
}

function stepBoss(game, dt) {
  const boss = game.boss;
  if (!boss || boss.state === 'defeated') return false;
  if (boss.state === 'waiting') {
    if (game.player.x < BOSS.trigger) return false;
    boss.state = 'intro'; boss.timer = BOSS.intro;
  }
  boss.flash = Math.max(0, boss.flash - dt);
  if (boss.health <= 0 && boss.state !== 'dying') {
    boss.state = 'dying'; boss.timer = 0.8; game.waves = [];
  }
  boss.timer -= dt;
  if (boss.state === 'intro') boss.x = approach(boss.x, BOSS.spawnX, 85 * dt);
  if (boss.state === 'dash') boss.x = clamp(boss.x + boss.direction * BOSS.dashSpeed * dt, BOSS.arenaLeft, BOSS.arenaRight - boss.w);
  if (boss.timer <= 0) {
    if (boss.state === 'dying') { boss.state = 'defeated'; return false; }
    if (boss.state === 'intro' || boss.state === 'recovery') {
      boss.direction = game.player.x < boss.x ? -1 : 1;
      boss.state = boss.attack === 'dash' ? 'warnDash' : 'warnWave'; boss.timer = BOSS.warning;
    } else if (boss.state === 'warnDash') {
      boss.state = 'dash'; boss.timer = BOSS.dashDuration;
    } else if (boss.state === 'warnWave') {
      game.waves.push({ x: clamp(boss.direction < 0 ? boss.x - 12 : boss.x + boss.w, BOSS.arenaLeft + 2, BOSS.arenaRight - 14), y: BOSS.ground - 20, w: 12, h: 20, direction: boss.direction });
      boss.state = 'recovery'; boss.timer = BOSS.recovery; boss.attack = 'dash';
    } else if (boss.state === 'dash') {
      boss.state = 'recovery'; boss.timer = BOSS.recovery; boss.attack = 'wave';
    }
  }
  if (boss.state !== 'dying' && overlaps(game.player, boss) && damagePlayer(game, boss, BOSS.damage)) return true;
  game.waves = game.waves.filter(wave => {
    wave.x += wave.direction * BOSS.waveSpeed * dt;
    if (overlaps(game.player, wave)) {
      if (damagePlayer(game, wave, BOSS.damage)) return false;
      return false;
    }
    return wave.x > BOSS.arenaLeft && wave.x < BOSS.arenaRight;
  });
  return false;
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

export function stepGame(game, input, dt) {
  if (game.status !== "playing") return;
  const p = game.player;
  game.elapsed += dt;
  p.invincible = Math.max(0, p.invincible - dt);
  p.knockback = Math.max(0, p.knockback - dt);
  p.flash = Math.max(0, p.flash - dt);
  movePlayer(game, input, dt);
  if (p.y > VIEW.height + 18) {
    die(game, "你跌下了桌面。");
    return;
  }

  for (const enemy of game.enemies) {
    if (!enemy.health) continue;
    enemy.flash = Math.max(0, enemy.flash - dt);
    enemy.x += enemy.direction * ENEMIES[enemy.type].speed * dt;
    if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
      enemy.x = clamp(enemy.x, enemy.minX, enemy.maxX);
      enemy.direction *= -1;
    }
  }
  stepShots(game, input.fire, dt);
  stepGrenades(game, input, dt);
  const respawns = game.respawns;
  const interrupted = stepBoss(game, dt);
  if (game.respawns !== respawns) { game.waves = []; return; }
  if (interrupted || game.status !== 'playing') return;

  for (const enemy of game.enemies) {
    if (enemy.health && overlaps(p, enemy) && damagePlayer(game, enemy, ENEMIES[enemy.type].damage)) return;
  }
  for (const hazard of game.level.hazards) {
    if (overlaps(p, hazard) && damagePlayer(game, hazard, hazard.damage)) return;
  }
  for (const supply of game.supplies) {
    if (supply.taken || !overlaps(p, supply)) continue;
    if (supply.type === 'grenade') {
      if (p.grenades >= 6) continue;
      p.grenades = Math.min(6, p.grenades + supply.amount);
    } else if (WEAPONS[supply.type]) {
      p.weapon = supply.type; p.ammo = WEAPONS[supply.type].ammo;
    } else {
      if (p.health >= PLAYER.maxHealth) continue;
      p.health = Math.min(PLAYER.maxHealth, p.health + supply.amount);
    }
    supply.taken = true;
    sparks(game, supply.x + 7, supply.y + 7, "#89e0ae", 7);
  }
  if (game.status === "playing" && game.boss.state === 'defeated' && overlaps(p, game.level.exit)) game.status = "cleared";

  const target = game.boss && !['waiting', 'defeated'].includes(game.boss.state) ? BOSS.arenaLeft - 20 : clamp(p.x - VIEW.width * 0.38, 0, Math.max(0, game.level.width - VIEW.width));
  game.camera = approach(game.camera, target, 420 * dt);
  game.sparks = game.sparks.filter(spark => {
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vy += 240 * dt;
    spark.life -= dt;
    return spark.life > 0;
  });
}

