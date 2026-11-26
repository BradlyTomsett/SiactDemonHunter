import assert from 'node:assert/strict';
import test from 'node:test';
import { createGame, restoreGame, stepGame } from '../src/game.mjs';
import { LEVELS, VIEW } from '../src/levels.mjs';
import { createOfficeArt } from '../src/office-art.mjs';
import { makeSnapshot } from '../src/save.mjs';

const [ramp, tower, shaft] = LEVELS.slice(1);
const idle = { move: 0, aimX: 0, aimY: 0, jump: false, fire: false, grenade: false };
const step = (game, input = {}) => stepGame(game, { ...idle, ...input }, 1 / 120);
const isolated = level => createGame({ ...level, enemies: [], hazards: [], hordes: [] });
const feet = game => game.player.y + game.player.h;
const center = game => game.player.x + game.player.w / 2;
const groundOn = (game, platform) => game.player.grounded && Math.abs(feet(game) - platform.y) < .001
  && center(game) >= platform.x - 3 && center(game) <= platform.x + platform.w + 3;
const overlap = (a, b) => a.x + a.w > b.x + .001 && a.x < b.x + b.w - .001
  && a.y + a.h > b.y + .001 && a.y < b.y + b.h - .001;
const clamp = (value, max) => Math.max(0, Math.min(value, max));

function walk(game, frames, direction = 0) {
  for (let frame = 0; frame < frames; frame++) step(game, { move: direction, aimX: direction });
}

function jumpTo(game, platform, [wait, walkDirection, walkFrames, direction], target) {
  walk(game, wait);
  walk(game, walkFrames, walkDirection);
  for (let frame = 0; frame < 127; frame++) {
    const dx = (target ?? platform.x + platform.w / 2) - center(game);
    const move = Math.sign(dx) === direction && Math.abs(dx) > 10 ? direction : 0;
    step(game, { move, aimX: move, jump: frame === 0 });
    if (frame >= 6 && groundOn(game, platform)) return;
  }
  assert.fail(`failed to land on ${platform.kind} at ${platform.x}, ${platform.y}`);
}

test('all four routes have the intended scale before their boss arena', () => {
  assert.ok((LEVELS[0].boss.trigger - LEVELS[0].spawn.x) / VIEW.width >= 11.5);
  assert.ok((ramp.boss.trigger - ramp.spawn.x) / VIEW.width >= 12);
  assert.ok((tower.spawn.y - tower.boss.ground) / VIEW.height >= 8);
  assert.ok((shaft.spawn.y - shaft.boss.ground) / VIEW.height >= 11);
  assert.ok(shaft.platforms.filter(p => p.kind === 'cargoLift')
    .reduce((sum, p) => sum + p.motion.bottom - p.motion.top, 0) > 3700);
});

test('stage two climbs five ramps, crosses the gap and clears traps at full health', () => {
  const game = createGame({ ...ramp, enemies: [], hordes: [] });
  const groundHeights = new Set();
  const edges = [790,3150,4750,6360,7600];
  for (let frame = 0; frame < 6200 && game.player.x < ramp.boss.trigger; frame++) {
    const { x, grounded } = game.player;
    const y = feet(game);
    const escapeDip = [920,4872,7720].some(edge => x > edge - 28 && x < edge && y > 232);
    const crossGap = edges.some(edge => x >= edge - 24 && x < edge);
    const avoidTrap = ramp.hazards.some(h => x >= h.x - 53 && x < h.x - 35 && y === h.y + h.h);
    step(game, { move: 1, jump: grounded && (escapeDip || crossGap || avoidTrap) });
    if (grounded) groundHeights.add(y);
  }
  assert.ok(game.player.x >= ramp.boss.trigger);
  assert.ok([660,590,505,415,327,232].every(height => groundHeights.has(height)));
  assert.equal(game.player.health, game.player.maxHealth);
  assert.equal(game.respawns, 0);
});

test('every stage-two ramp also supports a return trip', () => {
  for (const slope of ramp.platforms.filter(p => p.kind === 'slope')) {
    const game = isolated(ramp);
    const terrace = ramp.platforms.find(p => p.x === slope.x + slope.w);
    Object.assign(game.player, { x: terrace.x + 45, y: terrace.y - game.player.h, grounded: true });
    for (let frame = 0; frame < 300 && game.player.x > slope.x - 20; frame++) step(game, { move: -1 });
    assert.ok(game.player.x <= slope.x - 20);
    assert.equal(game.respawns, 0);
  }
});

test('stage three can climb every step and all three moving trays with ordinary jumps', () => {
  const game = createGame({ ...tower, enemies: [], hordes: [] });
  const inputs = [
    [0,1,48,1], [0,1,36,1], [0,1,72,1], [0,1,72,1], [0,-1,24,-1], [0,-1,72,-1],
    [0,-1,72,-1], [0,-1,24,-1], [0,1,36,1], [0,1,96,1], [0,1,60,1], [0,1,36,1],
    [0,0,0,-1], [0,-1,72,-1], [0,-1,48,-1], [0,-1,60,-1], [0,1,12,1], [0,1,60,1],
    [0,1,48,1], [0,1,48,1], [0,0,0,-1], [0,-1,96,-1], [0,-1,24,-1], [0,-1,48,-1],
    [0,-1,24,-1], [0,1,24,1], [0,1,72,1], [0,1,84,1], [0,1,72,1], [0,-1,24,-1],
    [280,-1,84,-1], [0,-1,72,-1], [0,-1,36,-1], [0,1,12,1], [0,1,60,1], [0,0,0,1],
  ];
  const rows = game.platforms.filter(p => p.arrow);
  assert.equal(rows.length, inputs.length);
  walk(game, 20);
  for (const [index, row] of rows.entries()) {
    jumpTo(game, row, inputs[index], row.y === tower.boss.ground ? 633 : undefined);
  }
  assert.equal(game.respawns, 0);
  assert.equal(game.player.health, game.player.maxHealth);
});

test('stage four reaches the equipment floor by riding both lifts from bottom to top', () => {
  const game = isolated(shaft);
  const route = [
    [2,[0,0,0,0]], [3,[0,0,0,1]], [7,[0,1,60,1]],
    [4,[0,1,96,1]], [8,[0,1,144,1]], [6,[0,1,48,1],2993],
  ];
  const lifts = game.platforms.filter(p => p.kind === 'cargoLift');
  walk(game, 20);
  for (let frame = 0; frame < 1900 && center(game) < 1725; frame++) {
    step(game, { move: 1, jump: game.player.grounded && game.player.x > 1157 && game.player.x < 1180 });
  }
  assert.ok(center(game) >= 1725);
  assert.ok(lifts.every(lift => lift.y === lift.motion.bottom));
  for (const [index, inputs, x] of route) {
    const platform = game.platforms[index];
    jumpTo(game, platform, inputs, x);
    if (platform.kind !== 'cargoLift') continue;
    const pickup = game.food.find(item => item.platform === platform && !item.taken);
    const start = pickup?.y;
    let frames = 0;
    while (platform.y > platform.motion.top && frames++ < 2900) {
      step(game);
      assert.ok(groundOn(game, platform), 'the passenger stays on the lift');
    }
    assert.equal(platform.y, platform.motion.top);
    assert.ok(frames > 1500);
    if (pickup) assert.ok(Math.abs(start - pickup.y - (platform.motion.bottom - platform.motion.top)) < .01);
  }
  assert.equal(game.respawns, 0);
});

test('lifts keep rising during a jump and return when a rider walks off', () => {
  for (let index = 0; index < 2; index++) {
    const game = isolated(shaft);
    const lift = game.platforms.filter(p => p.kind === 'cargoLift')[index];
    const player = game.player;
    Object.assign(player, { x: lift.x + 37, y: lift.y - player.h, grounded: true });
    walk(game, 110);
    const beforeJump = lift.y;
    step(game, { jump: true });
    walk(game, 121);
    assert.ok(lift.y < beforeJump);
    assert.ok(groundOn(game, lift));

    walk(game, 96, -1);
    walk(game, 650);
    assert.equal(lift.y, lift.motion.bottom);
    assert.equal(game.respawns, 0);
  }
});

test('pit markers match the actual raised floor and the scrolling corridor', () => {
  const edges = [];
  const art = createOfficeArt({
    createLinearGradient: () => ({ addColorStop() {} }),
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, fill() {},
  }, { line: (x, y) => edges.push([x, y]) });
  for (const [level, camera, cameraY, x, y] of [
    [LEVELS[0], 5290, 0, 5550, 248], [ramp, 6100, 160, 6360, 327],
    [shaft, 900, 3972, 1180, 4210],
  ]) {
    edges.length = 0;
    art.gaps(level, camera, cameraY);
    assert.ok(edges.some(([edgeX, edgeY]) => edgeX === x && edgeY === y));
  }
});

test('supplies and legacy checkpoints have support and ladders reach real floors', () => {
  for (const level of [ramp, tower, shaft]) {
    const supported = (x, y, w) => level.platforms.some(p => p.kind !== 'slope'
      && p.y === y && p.x <= x && p.x + p.w >= x + w);
    assert.equal(level.food.length, 40);
    for (const item of level.food) assert.ok(supported(item.x, item.y + item.h, item.w));
    for (const item of level.supplies) assert.ok(supported(item.x - 4, item.y + 14, 22));
    for (const [legacy, current] of Object.entries(level.legacyCheckpoints ?? {})) {
      const game = restoreGame(isolated(level), { checkpoint: Number(legacy), score: 89, lives: 2 });
      assert.equal(game.checkpoint, current);
      assert.ok(supported(game.player.x, feet(game), game.player.w));
      walk(game, 5);
      assert.ok(game.player.grounded);
      assert.equal(game.lives, 2);
    }
    for (const ladder of level.ladders ?? []) {
      const game = isolated(level);
      const player = game.player;
      const x = ladder.x + (ladder.w - player.w) / 2;
      assert.ok(supported(x, ladder.y, player.w));
      assert.ok(supported(x, ladder.y + ladder.h, player.w));
      player.x = x;
      player.y = ladder.y + ladder.h - player.h;
      for (let frame = 0; frame < 110; frame++) step(game, { aimY: -1 });
      assert.equal(feet(game), ladder.y);
      for (let frame = 0; frame < 110; frame++) step(game, { aimY: 1 });
      assert.equal(feet(game), ladder.y + ladder.h);
    }
  }
});

test('vertical checkpoints unlock on a real floor and survive a fall', () => {
  for (const level of [tower, shaft]) {
    const game = isolated(level);
    walk(game, 5);
    assert.equal(game.checkpoint, 0);
    const landing = level.checkpoints[1];
    Object.assign(game.player, { x: 20, y: landing.y - game.player.h - 1, vy: -100, grounded: false });
    walk(game, 1);
    assert.equal(game.checkpoint, 0);

    Object.assign(game.player, { x: landing.x, y: landing.y - game.player.h, vy: 0 });
    walk(game, 1);
    assert.equal(game.checkpoint, 1);
    game.player.y = level.height + 20;
    walk(game, 130);
    assert.equal(game.respawns, 1);
    assert.equal(game.player.x, landing.x);
    assert.equal(feet(game), landing.y);
  }
});

test('all eight hordes enter from outside the visible area and clear solid terrain', () => {
  for (const level of LEVELS) {
    for (const [id, wave] of level.hordes.entries()) {
      for (const ratio of [.05, .25, .5, .75, .95]) {
        for (const above of [0, 45, 80]) {
          const game = createGame(level);
          const x = wave.left + (wave.right - wave.left) * ratio - game.player.w / 2;
          Object.assign(game.player, { x, y: wave.ground - above - game.player.h, grounded: above === 0, invincible: 100 });
          game.camera = clamp(x - 243, level.width - VIEW.width);
          game.cameraY = clamp(feet(game) - 238, level.height - VIEW.height);
          const { camera, cameraY } = game;
          step(game);
          const enemies = game.enemies.filter(e => e.horde === id);
          assert.equal(enemies.length, 10);
          for (const enemy of enemies) {
            const { from } = enemy.entry;
            assert.ok(from.x + enemy.w < camera || from.x > camera + VIEW.width || from.y + enemy.h < cameraY);
          }
          for (let frame = 0; frame < 720; frame++) {
            step(game);
            assert.ok(enemies.every(e => !game.platforms.some(p => !p.oneway && p.kind !== 'slope' && overlap(e, p))));
          }
          assert.ok(enemies.every(e => !e.entry));
        }
      }
    }
  }
});

test('grenades bounce on both sloping directions and all three boss floors', () => {
  for (const level of [ramp, tower, shaft]) {
    for (const floor of [...level.platforms.filter(p => p.kind === 'slope'),
      level.platforms.find(p => p.y === level.boss.ground && p.x <= level.boss.trigger && p.x + p.w > level.boss.trigger)]) {
      const game = isolated(level);
      const x = floor.kind === 'slope' ? floor.x + floor.w / 2 : level.boss.trigger + 35;
      const y = floor.y - (floor.rise ?? 0) * (x - floor.x) / floor.w;
      game.grenades.push({ x: x - 5, y: y - 37, w: 10, h: 10, vx: 0, vy: 130, fuse: 1, spin: 0 });
      let bounced = false;
      for (let frame = 0; frame < 50; frame++) {
        step(game);
        const grenade = game.grenades[0];
        assert.ok(grenade.y + grenade.h <= y + .001, 'grenade must stay on top of terrain');
        bounced ||= grenade.vy < 0;
      }
      assert.ok(bounced);
    }
  }
});
test('all four boss fights take damage and unlock their exits', t => {
  t.mock.method(Math, 'random', () => .4);
  for (const level of LEVELS) {
    const game = restoreGame(createGame({ ...level, enemies: [], hordes: [] }, { characterId: 'ma' }), {
      checkpoint: level.checkpoints.length - 1, checkpointLayout: level.checkpointLayout,
      carry: { weapon: 'heavy', ammo: 18 },
    });
    // 测关底机关和战斗收尾，免伤只用于避免操作脚本耗尽命数。
    game.player.invincible = 180;
    let summoned = false;
    let grenadeDamage = false;
    for (let frame = 0; frame < 18000 && game.status === 'playing'; frame++) {
      const player = game.player;
      const boss = game.bosses.find(b => !b.hidden && b.state !== 'defeated');
      const delta = boss ? boss.x + boss.w / 2 - center(game) : 330;
      const aimX = Math.sign(delta) || 1;
      const move = !boss || boss.state === 'waiting' ? 1
        : Math.abs(delta) > 123 ? aimX
          : Math.abs(delta) < 84 ? -aimX : 0;
      const aimY = boss && boss.y + boss.h < player.y + 5 ? -.414 : 0;
      const health = boss?.health ?? 0;
      step(game, { move, aimX, aimY, fire: true, grenade: frame % 54 === 0 });
      grenadeDamage ||= health - (boss?.health ?? 0) === 7.5;
      summoned ||= game.bosses.some(b => b.summoned);
    }
    assert.equal(game.status, 'cleared');
    assert.ok(grenadeDamage);
    assert.equal(summoned, level === ramp);
    assert.equal(game.stats.bosses.length, level === ramp ? 2 : 1);
  }
  assert.equal(shaft.exit.kind, 'terminal');
});

test('defeating the summoned dog preserves the second phase of the mule fight', () => {
  const game = restoreGame(isolated(ramp), { checkpoint: ramp.checkpoints.length - 1 });
  const mule = game.boss;
  Object.assign(game.player, { x: ramp.boss.trigger + 1, invincible: 100 });
  Object.assign(mule, { state: 'recovery', health: 48 });
  for (let frame = 0; frame < 450 && !game.summon; frame++) step(game);
  const dog = game.summon;
  assert.ok(dog);
  Object.assign(dog, { state: 'recovery', health: 1, x: game.player.x + 30 });
  game.grenades.push({ x: dog.x + 5, y: dog.y + 15, w: 10, h: 10, vx: 0, vy: 0, fuse: 0, spin: 0 });
  step(game);
  assert.equal(dog.state, 'dying');
  assert.equal(game.score, 30);

  const snapshot = JSON.parse(JSON.stringify(makeSnapshot(game, { levelIndex: 1 })));
  const resumed = restoreGame(isolated(ramp), snapshot);
  assert.equal(resumed.boss.health, 48);
  assert.equal(resumed.boss.calledDog, true);
  assert.equal(resumed.score, 30);
  assert.equal(resumed.summon, null);
  const { muleReturnHealth, ...legacy } = snapshot;
  assert.equal(muleReturnHealth, 48);
  assert.equal(restoreGame(isolated(ramp), legacy).boss.calledDog, true);

  game.player.y = ramp.height + 20;
  walk(game, 1);
  assert.equal(game.respawns, 1);
  assert.equal(game.boss.health, 48);
  assert.equal(game.boss.calledDog, true);
  assert.equal(game.summon, null);
});
