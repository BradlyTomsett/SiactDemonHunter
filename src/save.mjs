// 本地存档：把一局的进度写进 localStorage，页面被系统回收后能接着玩。
const KEY = "sdh-save-v1";
const VERSION = 1;

const packNumber = value => (value === Infinity ? "inf" : value);
const unpackNumber = value => (value === "inf" ? Infinity : value);

export function makeSnapshot(game, extra = {}) {
  const p = game.player;
  return {
    v: VERSION,
    at: Date.now(),
    characterId: game.characterId,
    levelIndex: extra.levelIndex ?? 0,
    lives: game.lives,
    score: game.score,
    stats: game.stats,
    elapsed: game.elapsed,
    completedTime: extra.completedTime ?? 0,
    levelStartScore: extra.levelStartScore ?? 0,
    collectedFood: [...game.collectedFood],
    clearedHordes: [...game.clearedHordes],
    clearedBosses: game.clearedBosses,
    muleReturnHealth: game.muleReturnHealth,
    checkpoint: game.checkpoint,
    checkpointLayout: game.level.checkpointLayout,
    nextLevel: extra.nextLevel ?? null,
    carry: {
      health: p.health,
      weapon: p.weapon,
      ammo: packNumber(p.ammo),
      grenades: packNumber(p.grenades),
      boost: p.boost,
    },
  };
}

export function decodeCarry(carry) {
  if (!carry) return null;
  return { ...carry, ammo: unpackNumber(carry.ammo), grenades: unpackNumber(carry.grenades) };
}

export function isValidSave(save) {
  return Boolean(save && save.v === VERSION && Number.isFinite(save.levelIndex) && Number.isFinite(save.score));
}

export function writeSave(snapshot) {
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function readSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const save = JSON.parse(raw);
    return isValidSave(save) ? save : null;
  } catch {
    return null;
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 隐私模式下写不了 localStorage，忽略即可。
  }
}
