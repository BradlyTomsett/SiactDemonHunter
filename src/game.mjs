import { ENEMIES, PLAYER, VIEW, WEAPON } from "./levels.mjs";

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const approach = (start, end, step) => start + clamp(end - start, -step, step);
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x
  && a.y < b.y + b.h && a.y + a.h > b.y;

export function createGame(level) {
  const player = {
    x: level.spawn.x, y: level.spawn.y - PLAYER.height,
    w: PLAYER.width, h: PLAYER.height, vx: 0, vy: 0, facing: 1,
    grounded: false, coyote: 0, jumpBuffer: 0, cooldown: 0, flash: 0,
    health: PLAYER.maxHealth, invincible: 0, knockback: 0,
  };

  return {
    level, player, status: "playing", reason: "", camera: 0, elapsed: 0,
    enemies: level.enemies.map(spawn => {
      const type = ENEMIES[spawn.type];
      return {
        ...spawn, y: spawn.y - type.height, w: type.width, h: type.height,
        direction: -1, health: type.health, flash: 0,
      };
    }),
    supplies: level.supplies.map(supply => ({ ...supply, w: 14, h: 14, taken: false })),
    bullets: [], sparks: [],
  };
}

function movePlayer(game, input, dt) {
  const p = game.player;
  const platforms = game.level.platforms;
  p.coyote = p.grounded ? PLAYER.coyoteTime : Math.max(0, p.coyote - dt);
  p.jumpBuffer = input.jump ? PLAYER.jumpBuffer : Math.max(0, p.jumpBuffer - dt);

  if (input.move) p.facing = input.move;
  if (p.knockback <= 0) p.vx = approach(p.vx, input.move * PLAYER.speed, PLAYER.acceleration * dt);
  if (p.jumpBuffer > 0 && p.coyote > 0 && p.knockback <= 0) {
    p.vy = -PLAYER.jumpSpeed;
    p.jumpBuffer = 0;
    p.coyote = 0;
    p.grounded = false;
  }

  const oldX = p.x;
  p.x = clamp(p.x + p.vx * dt, 0, game.level.width - p.w);
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
    const x = p.facing > 0 ? p.x + p.w + 3 : p.x - 11;
    game.bullets.push({ x, y: p.y + 12, w: 8, h: 3, direction: p.facing, life: WEAPON.lifetime });
    p.cooldown = WEAPON.interval;
    p.flash = 0.06;
  }
  game.bullets = game.bullets.filter(bullet => {
    const dx = bullet.direction * WEAPON.speed * dt;
    const sweep = { ...bullet, x: Math.min(bullet.x, bullet.x + dx), w: bullet.w + Math.abs(dx) };
    bullet.x += dx;
    bullet.life -= dt;
    if (game.level.platforms.some(solid => overlaps(sweep, solid))) return false;
    const enemy = game.enemies.find(target => target.health > 0 && overlaps(target, sweep));
    if (!enemy) return bullet.life > 0 && bullet.x > -12 && bullet.x < game.level.width;
    enemy.health = Math.max(0, enemy.health - WEAPON.damage);
    enemy.flash = 0.12;
    sparks(game, bullet.x + 4, bullet.y, "#f8de83", enemy.health === 0 ? 11 : 4);
    return false;
  });
}

function damagePlayer(game, source, amount) {
  const p = game.player;
  if (p.invincible > 0) return;
  p.health = Math.max(0, p.health - amount);
  p.invincible = PLAYER.invincibleTime;
  p.knockback = PLAYER.knockbackTime;
  p.vx = PLAYER.knockbackSpeed * (p.x + p.w / 2 < source.x + source.w / 2 ? -1 : 1);
  p.vy = -185;
  sparks(game, p.x + p.w / 2, p.y + p.h / 2, "#fa8874", 7);
  if (!p.health) {
    game.status = "lost";
    game.reason = "生命耗尽。";
  }
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
    game.status = "lost";
    game.reason = "你跌下了桌面。";
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

  for (const enemy of game.enemies) {
    if (enemy.health && overlaps(p, enemy)) damagePlayer(game, enemy, ENEMIES[enemy.type].damage);
  }
  for (const hazard of game.level.hazards) {
    if (overlaps(p, hazard)) damagePlayer(game, hazard, hazard.damage);
  }
  for (const supply of game.supplies) {
    if (supply.taken || p.health >= PLAYER.maxHealth || !overlaps(p, supply)) continue;
    p.health = Math.min(PLAYER.maxHealth, p.health + supply.amount);
    supply.taken = true;
    sparks(game, supply.x + 7, supply.y + 7, "#89e0ae", 7);
  }
  if (game.status === "playing" && overlaps(p, game.level.exit)) game.status = "cleared";

  const target = clamp(p.x - VIEW.width * 0.38, 0, Math.max(0, game.level.width - VIEW.width));
  game.camera = approach(game.camera, target, 420 * dt);
  game.sparks = game.sparks.filter(spark => {
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vy += 240 * dt;
    spark.life -= dt;
    return spark.life > 0;
  });
}
