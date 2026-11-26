import assert from 'node:assert/strict';
import test from 'node:test';
import { createGame, restoreGame, stepGame } from '../src/game.mjs';
import { GROUND, LEVELS, VIEW } from '../src/levels.mjs';

const level = LEVELS[0];
const terrainOnly = { ...level, enemies: [], hordes: [], hazards: [] };
const idle = { move: 0, aimX: 0, aimY: 0, jump: false, fire: false, grenade: false };
const step = (game, input = {}) => stepGame(game, { ...idle, ...input }, 1 / 120);
const feet = game => game.player.y + game.player.h;
const overlap = (a, b) => a.x + a.w > b.x + .001 && a.x < b.x + b.w - .001
  && a.y + a.h > b.y + .001 && a.y < b.y + b.h - .001;

test('both paths can reach the boss arena without losing a life to terrain', () => {
  for (const upperRoute of [false, true]) {
    const game = createGame({ ...level, enemies: [], hordes: [] });
    let reachedUpper = false;
    for (let frame = 0; frame < 6800 && game.player.x < level.boss.trigger; frame++) {
      const p = game.player;
      const climb = upperRoute && !reachedUpper && p.x > 456;
      const jumpFromUpper = upperRoute && [720,1550,2210,3140,3840,4116,5033,5528,6715,7156]
        .some(edge => p.x >= edge && p.x < edge + 24);
      const jumpFromLower = [2248,3190,4140,5060,5550,5890,6740,7180]
        .some(edge => p.x >= edge - 24 && p.x < edge);
      const jumpOverTrap = level.hazards.some(h => p.x >= h.x - 53 && p.x < h.x - 35 && feet(game) === h.y + h.h);
      step(game, {
        move: climb ? 0 : 1,
        aimY: climb ? -1 : 0,
        jump: p.grounded && (jumpFromUpper || jumpFromLower || jumpOverTrap),
      });
      if (p.grounded && p.x < 650 && feet(game) === 202) reachedUpper = true;
    }
    assert.ok(game.player.x >= level.boss.trigger);
    assert.equal(reachedUpper, upperRoute);
    assert.equal(game.player.health, game.player.maxHealth);
    assert.equal(game.respawns, 0);
  }
});

test('each ladder works in both directions and both bridges land on a lower floor', () => {
  for (const ladder of level.ladders) {
    const game = createGame(terrainOnly);
    Object.assign(game.player, { x: ladder.x + 3, y: ladder.y + ladder.h - game.player.h });
    for (let frame = 0; frame < 180; frame++) step(game, { aimY: -1 });
    assert.equal(feet(game), ladder.y);
    for (let frame = 0; frame < 180; frame++) step(game, { aimY: 1 });
    assert.equal(feet(game), ladder.y + ladder.h);
  }
  for (const x of [772, 1600]) {
    const game = createGame(terrainOnly);
    const bridge = game.platforms.find(p => p.crumble && p.x <= x && p.x + p.w > x);
    Object.assign(game.player, { x, y: bridge.y - game.player.h });
    for (let frame = 0; frame < 140; frame++) step(game);
    assert.ok(bridge.broken);
    assert.equal(feet(game), GROUND);
    assert.equal(game.respawns, 0);
    for (let frame = 0; frame < 330; frame++) step(game);
    assert.equal(bridge.broken, false);
  }
});

test('checkpoints resume in the same section and scenery and pickups have support', () => {
  // 上一版已经发布的第一关存档使用这些检查点。
  const corresponding = [0,1,2,3,level.checkpoints.length-1];
  for (const [index, target] of corresponding.entries()) {
    const game = restoreGame(createGame(terrainOnly), { checkpoint: index, score: 145, lives: 2 });
    assert.equal(game.checkpoint, target);
    assert.equal(game.player.x, level.checkpoints[target].x);
    for (let frame = 0; frame < 140; frame++) step(game);
    assert.equal(feet(game), GROUND);
    assert.equal(game.score, 145 + game.collectedFood.size);
    assert.equal(game.lives, 2);
  }
  const supported = (x, y, w) => level.platforms.some(p => !p.crumble && p.y === y && p.x <= x && p.x + p.w >= x + w);
  assert.equal(level.food.length, 40);
  for (const item of level.food) assert.ok(supported(item.x, item.y + item.h, item.w));
  for (const item of level.supplies) assert.ok(supported(item.x - 4, item.y + 14, 22));
  for (const item of level.decoration.filter(d => d.kind === 'cup')) assert.ok(supported(item.x, item.y, 34));
});

test('both routes trigger ten enemies from outside the screen without a solid-terrain overlap', () => {
  for (const [id, horde] of level.hordes.entries()) {
    const upper = level.platforms.find(p => p.kind === 'worktop' && p.x < horde.left && p.x + p.w >= horde.right);
    assert.ok(upper);
    for (const y of [upper.y, GROUND]) {
      for (const fraction of [.05, .5, .95]) {
        const game = createGame(level);
        const x = horde.left + (horde.right - horde.left) * fraction - game.player.w / 2;
        Object.assign(game.player, { x, y: y - game.player.h, invincible: 100, grounded: true });
        const camera = game.camera = x - VIEW.width * .38;
        step(game);
        const wave = game.enemies.filter(e => e.horde === id);
        assert.equal(wave.length, 10);
        for (const e of wave) {
          const { from } = e.entry;
          assert.ok(from.x + e.w < camera || from.x > camera + VIEW.width || from.y + e.h < 0);
        }
        for (let frame = 0; frame < 660; frame++) {
          step(game);
          assert.ok(wave.every(e => !game.platforms.some(p => !p.oneway && !p.broken && overlap(e, p))));
        }
        assert.ok(wave.every(e => e.entry === null));
      }
    }
  }
});
