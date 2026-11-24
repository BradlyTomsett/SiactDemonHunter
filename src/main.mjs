import { createGame, restoreGame, stepGame } from "./game.mjs";
import { createInput } from "./input.mjs";
import { CHARACTERS, FOOD_ICONS, LEVELS, PLAYER, WEAPONS } from "./levels.mjs";
import { createRenderer } from "./render.mjs";
import { drawCharacterPortraits } from "./portraits.mjs";
import { clearSave, makeSnapshot, readSave, writeSave } from "./save.mjs";

const byId = id => document.getElementById(id);
const render = createRenderer(byId("world"));
const hud = byId("hud");
const health = byId("health");
const lives = byId("lives");
const notice = byId("notice");
const hint = byId("hint");
const controls = byId("controls");
const pauseButton = byId("pause");
const overlay = byId("overlay");
const rewards = byId("rewards");
const characterSelect = byId("character-select");
const stageSummary = byId("stage-summary");
const primary = byId("primary");
const guide = byId("guide");
const home = byId("home");
const install = byId("install");
const fullscreen = byId("fullscreen");
const gameView = byId("world").parentElement;
let installPrompt = null;
let installRequested = false;
const standalone = window.matchMedia('(display-mode: standalone)');
const isAndroid = /Android/i.test(navigator.userAgent);
const runsAsApp = () => standalone.matches || navigator.standalone === true;
const touch = window.matchMedia("(pointer: coarse)");
const step = 1 / 120;

// 只按横屏运行：手机竖着拿时，CSS 把整个游戏外壳旋转 90° 铺满屏幕，
// 玩家把手机横过来后自动还原。这里只负责维护 html[data-rotated] 供输入换算使用。
const portraitView = window.matchMedia("(orientation: portrait)");

function applyOrientation() {
  const rotated = portraitView.matches;
  if (rotated) document.documentElement.dataset.rotated = "1";
  else delete document.documentElement.dataset.rotated;
}

async function lockLandscape() {
  try {
    await screen.orientation?.lock?.("landscape");
  } catch {
    // 桌面浏览器和 iOS 不支持屏幕方向锁定，靠上面的旋转兜底。
  }
}

let levelIndex = 0;
let selectedCharacter = 'minister';
let completedTime = 0;
let levelStartScore = 0;
let game = null;
let screen = "title";
let accumulator = 0;
let lastTime = null;
let previousHealth = -1;
let previousLives = -1;
let previousRespawns = 0;
let noticeUntil = 0;
let saveTimer = 0;
let primaryAction = start;

const input = createInput(controls, togglePause, () => screen === "playing");
drawCharacterPortraits(characterSelect);

for (let i = 0; i < Math.max(...Object.values(CHARACTERS).map(character => character.maxHealth)); i++) {
  const heart = document.createElement("span");
  heart.className = "heart";
  heart.setAttribute("aria-hidden", "true");
  health.append(heart);
}

function timeText(seconds) {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes} 分 ${String(total % 60).padStart(2, "0")} 秒`;
}

function setScreen(next) {
  input.clear();
  accumulator = 0;
  screen = next;
  syncVisibility();
}

function syncVisibility() {
  const active = screen === "playing";
  gameView.dataset.screen = screen;
  hud.hidden = screen === "title";
  controls.hidden = !active || !touch.matches;
  pauseButton.hidden = !active;
  hint.hidden = !active;
  notice.hidden = true;
  overlay.hidden = active;
}

function panel(next, title, message, label, action) {
  rewards.hidden = true;
  stageSummary.hidden = true;
  characterSelect.hidden = next !== 'title';
  primary.hidden = false;
  byId("menu-title").textContent = title;
  const menuMessage = byId("menu-message");
  menuMessage.textContent = message;
  menuMessage.hidden = !message;
  byId("menu-chapter").textContent = game.level.name;
  primary.textContent = label;
  primaryAction = action;
  home.hidden = next === "title";
  install.hidden = next !== "title" || runsAsApp();
  fullscreen.hidden = next !== "title" && next !== "paused";
  guide.hidden = next !== "title";
  setScreen(next);
  overlay.scrollTop = 0;
  primary.focus({ preventScroll: true });
}

function loadLevel(index, remainingLives, carry, score = 0) {
  levelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
  levelStartScore = score;
  game = createGame(LEVELS[levelIndex], { lives: remainingLives, carry, score, characterId: selectedCharacter });
  previousRespawns = game.respawns;
  previousHealth = -1;
  previousLives = -1;
  byId("level-name").textContent = game.level.name;
  updateHud();
}

// 把当前进度写进 localStorage，页面被系统回收后还能接着玩。
function persist(extra = {}) {
  if (!game) return;
  writeSave(makeSnapshot(game, { levelIndex, completedTime, levelStartScore, ...extra }));
}

function clearProgress() {
  saveTimer = 0;
  clearSave();
}

function resumeFromSave(save) {
  const index = Math.max(0, Math.min(LEVELS.length - 1, save.levelIndex ?? 0));
  const next = save.nextLevel;
  const target = Number.isFinite(next) ? Math.min(LEVELS.length - 1, next) : index;
  selectedCharacter = CHARACTERS[save.characterId] ? save.characterId : "minister";
  levelIndex = target;
  completedTime = save.completedTime ?? 0;
  levelStartScore = save.levelStartScore ?? 0;
  const carry = save.carry ? {
    ...save.carry,
    ammo: save.carry.ammo === "inf" ? Infinity : save.carry.ammo,
    grenades: save.carry.grenades === "inf" ? Infinity : save.carry.grenades,
  } : null;
  game = createGame(LEVELS[target], {
    lives: save.lives ?? PLAYER.lives,
    carry,
    score: save.score ?? 0,
    characterId: selectedCharacter,
  });
  if (!Number.isFinite(next)) restoreGame(game, save);
  previousRespawns = game.respawns;
  previousHealth = -1;
  previousLives = -1;
  byId("level-name").textContent = game.level.name;
  updateHud();
  setScreen("playing");
  showNotice(`已继续上次进度：${game.level.name}`);
  saveTimer = 2;
}

function showTitle() {
  completedTime = 0;
  clearProgress();
  loadLevel(0, PLAYER.lives);
  panel(
    "title",
    "公司打狗",
    "你在键盘旁醒来，身体只剩回形针那么高。穿过桌面，找到出口。",
    "开始游戏",
    start,
  );
}

function start() {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  lockLandscape();
  setScreen("playing");
  saveTimer = 2;
  persist();
}

characterSelect.addEventListener('click', event => {
  const button = event.target.closest('[data-character]');
  const characterId = button?.dataset.character;
  if (screen !== 'title' || !CHARACTERS[characterId]) return;
  selectedCharacter = characterId;
  for (const option of characterSelect.querySelectorAll('[data-character]')) {
    option.setAttribute('aria-pressed', String(option.dataset.character === characterId));
  }
  loadLevel(0, PLAYER.lives);
});

function pause(message = "点击继续，回到当前关卡。") {
  if (screen !== "playing") return;
  if (game.player.knockback <= 0) game.player.vx = 0;
  panel("paused", "已暂停", message, "继续游戏", resume);
  persist();
}

function resume() {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  setScreen("playing");
}

function togglePause() {
  if (screen === "playing") pause();
  else if (screen === "paused") resume();
}

function updateDevice() {
  guide.textContent = touch.matches
    ? "轻推瞄准 · 推远移动 · 按住射击连发"
    : "方向键移动和瞄准 · 空格跳跃 · 按住 J 连发 · K 投掷";
  input.clear();
  syncVisibility();
}

function showNotice(message) {
  notice.textContent = message;
  notice.hidden = false;
  noticeUntil = performance.now() + 2600;
}

function updateHud() {
  const hp = game.player.health;
  const weapon = WEAPONS[game.player.weapon];
  byId('score').textContent = game.score;
  byId('score-display').setAttribute('aria-label', `积分 ${game.score}`);
  const grenades = game.player.grenades === Infinity ? '∞' : `${game.player.grenades}/6`;
  byId('equipment').textContent = `${CHARACTERS[game.characterId].name} · ${weapon.name} ${game.player.ammo === Infinity ? '∞' : game.player.ammo}  炸弹 ${grenades}${game.player.boost > 0 ? ` 火力提升 ${Math.ceil(game.player.boost)}秒` : ''}`;
  if (hp !== previousHealth) {
    health.setAttribute("aria-label", `生命 ${hp} / ${game.player.maxHealth}`);
    for (const [i, heart] of [...health.children].entries()) {
      heart.hidden = i >= game.player.maxHealth;
      heart.classList.toggle("empty", i >= hp);
    }
    previousHealth = hp;
  }
  if (game.respawns !== previousRespawns) {
    previousRespawns = game.respawns;
    const stage = game.checkpoint >= 0 ? `第 ${game.checkpoint + 1} 处检查点` : "本段起点";
    showNotice(`${game.respawnReason}已回到${stage}，还剩 ${game.lives + 1} 条命`);
  }
  const totalLives = game.status === 'lost' ? 0 : game.lives + 1;
  if (totalLives !== previousLives) {
    lives.textContent = `×${totalLives}`;
    lives.setAttribute("aria-label", `剩余命数 ${totalLives}`);
    lives.classList.toggle("depleted", game.lives === 0);
    previousLives = totalLives;
  }
  let entry;
  for (const candidate of game.level.hints) {
    if (game.player.x < candidate.x) break;
    entry = candidate;
  }
  const message = entry?.text ?? (touch.matches ? entry?.touch : entry?.desktop) ?? "";
  if (hint.textContent !== message) hint.textContent = message;
}

function showStageSummary(finalStage) {
  const player = game.player;
  const stats = game.stats;
  const amount = value => value === Infinity ? '∞' : String(value);
  const summaryList = byId('summary-list');
  const points = stats.scoreByType;
  summaryList.replaceChildren();

  function addItem(icon, label, value, names = '') {
    const item = document.createElement('li');
    item.title = `${label} ${value}${names ? ` · ${names}` : ''}`;
    item.setAttribute('aria-label', item.title);
    const symbol = document.createElement('span');
    symbol.className = 'summary-icon';
    symbol.textContent = icon;
    symbol.setAttribute('aria-hidden', 'true');
    const number = document.createElement('span');
    number.textContent = `× ${value}`;
    number.setAttribute('aria-hidden', 'true');
    item.append(symbol, number);
    if (names) {
      const caption = document.createElement('small');
      caption.textContent = names;
      caption.setAttribute('aria-hidden', 'true');
      item.append(caption);
    }
    summaryList.append(item);
  }

  addItem('🏆', '累计积分', game.score);
  addItem('⭐', '本段积分', game.score - stats.startScore);
  addItem('♥️', '生命值', `${player.health}/${player.maxHealth}`, CHARACTERS[game.characterId].name);
  addItem('💚', '剩余命数', game.lives + 1);
  addItem('🔫', '武器弹药', amount(player.ammo), WEAPONS[player.weapon].name);
  addItem('💣', '手榴弹', amount(player.grenades));
  if (player.boost > 0) addItem('⚡', '火力提升剩余时间', `${Math.ceil(player.boost)} 秒`);
  addItem('👾', `击败小兵（${points.enemies} 分）`, stats.enemyKills);
  addItem('👑', `击败首领（${points.bosses} 分）`, stats.bosses.length, stats.bosses.join('、'));
  addItem('🎯', `击落首领投掷物（${points.projectiles} 分）`, stats.bossProjectiles);
  addItem('📦', `拾取道具（${points.pickups} 分）`, stats.pickups);
  addItem('🍽️', `食品收集（${points.food} 分）`, `${game.collectedFood.size}/${game.level.food.length}`);
  addItem('⏱️', '本段用时', timeText(game.elapsed));
  if (finalStage) addItem('⌛', '总用时', timeText(completedTime + game.elapsed));
  for (const [type, icon] of Object.entries(FOOD_ICONS)) {
    addItem(icon, type, stats.foodCounts[type] ?? 0);
  }
  byId('reward-prompt').hidden = finalStage;
  stageSummary.hidden = false;
}

function finish() {
  if (game.status === "lost") {
    clearProgress();
    panel(
      "lost",
      "行动失败",
      `${game.reason}从本段开头重新开始，命数恢复。`,
      "重试本段",
      () => {
        loadLevel(levelIndex, PLAYER.lives, undefined, levelStartScore);
        start();
      },
    );
    return;
  }
  if (levelIndex < LEVELS.length - 1) {
    const nextLives = game.lives;
    // 结算页被打断时，下次直接从下一段继续。
    persist({ nextLevel: levelIndex + 1 });
    panel(
      "cleared",
      "本段通过",
      "",
      "下一段",
      () => {
        completedTime += game.elapsed;
        loadLevel(levelIndex + 1, nextLives, game.player, game.score);
        start();
      },
    );
    showStageSummary(false);
    primary.hidden = true;
    rewards.hidden = false;
    const ammoButton = rewards.querySelector('[data-reward="ammo"]');
    ammoButton.querySelector('.ammo-reward-label').textContent = game.player.weapon === 'basic' ? '获得满弹霰弹枪' : '补满当前武器弹药';
    rewards.querySelector('button').focus({ preventScroll: true });
  } else {
    panel(
      "cleared",
      "第一关通关",
      "",
      "再玩一局",
      () => {
        completedTime = 0;
        loadLevel(0, PLAYER.lives);
        start();
      },
    );
    showStageSummary(true);
    clearProgress();
  }
}

rewards.addEventListener('click', event => {
  const choice = event.target.closest('[data-reward]')?.dataset.reward;
  if (!choice || rewards.hidden || screen !== 'cleared') return;
  const carry = { ...game.player, boost: 0 };
  let nextLives = game.lives;
  if (choice === 'life') nextLives += 1;
  if (choice === 'boost') carry.boost = 30;
  if (choice === 'ammo') {
    if (carry.weapon === 'basic') carry.weapon = 'spread';
    carry.ammo = WEAPONS[carry.weapon].ammo * CHARACTERS[selectedCharacter].ammoMultiplier;
  }
  completedTime += game.elapsed;
  loadLevel(levelIndex + 1, nextLives, carry, game.score);
  persist();
  start();
});

function syncFullscreenButton() {
  fullscreen.textContent = document.fullscreenElement ? '退出全屏' : '全屏';
}
document.addEventListener('fullscreenchange', syncFullscreenButton);
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
      await lockLandscape();
      applyOrientation();
    }
    else alert('当前浏览器不支持网页全屏。可使用“安装”将游戏添加到主屏幕，再从主屏幕打开以隐藏浏览器地址栏。');
  } catch (error) {
    alert('无法进入全屏。可使用“安装”将游戏添加到主屏幕，再从主屏幕打开。');
  }
});
function showInstallStatus(message) {
  const status = byId('install-status');
  status.textContent = message;
  status.hidden = !message;
}

function confirmInstallRequest() {
  installPrompt = null;
  installRequested = true;
  install.textContent = '安装帮助';
  showInstallStatus(isAndroid
    ? '已确认安装，请等待 Chrome 处理。在手机主屏幕上滑，搜索“公司打狗”。找到图标后，长按并选择“添加到主屏幕”。若找不到，回到 Chrome 菜单检查安装选项。'
    : '安装请求已提交，请在系统的应用列表里查找“公司打狗”。');
}

function showInstallHelp() {
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    showInstallStatus('请用 Safari 打开，点击分享，再选择“添加到主屏幕”。');
    return;
  }
  showInstallStatus(isAndroid
    ? '请打开 Chrome 右上角的 ⋮ 菜单，选择“安装应用”或“安装并创建快捷方式”。如果已经安装，请在手机的应用列表里搜索“公司打狗”。'
    : '请打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。');
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installRequested = false;
  install.textContent = '安装';
});
window.addEventListener('appinstalled', confirmInstallRequest);

async function installGame() {
  if (!installPrompt) {
    showInstallHelp();
    return;
  }

  const prompt = installPrompt;
  installPrompt = null;
  install.disabled = true;
  try {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      if (!installRequested) confirmInstallRequest();
    } else {
      showInstallStatus('已取消安装。需要时可以从浏览器菜单再次安装。');
    }
  } catch {
    showInstallHelp();
  } finally {
    install.disabled = false;
  }
}
install.addEventListener('click', installGame);
primary.addEventListener("click", () => primaryAction());
home.addEventListener("click", showTitle);
pauseButton.addEventListener("click", togglePause);
for (const media of [touch]) media.addEventListener("change", updateDevice);
window.addEventListener("resize", applyOrientation);
window.addEventListener("orientationchange", applyOrientation);
window.visualViewport?.addEventListener("resize", applyOrientation);
window.addEventListener("blur", () => {
  input.clear();
  pause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    input.clear();
    pause();
    persist();
  }
});
window.addEventListener("pagehide", () => persist());
window.addEventListener("pageshow", event => {
  // 从 bfcache 恢复时补一次暂停，避免回来就被怪追着打。
  if (event.persisted) pause();
});

function playDefeatVoice() {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
  const cry = new SpeechSynthesisUtterance("骡子救我！");
  cry.lang = "zh-CN";
  cry.pitch = 1.18;
  const voice = speechSynthesis.getVoices().find(item => /^zh[-_]CN$/i.test(item.lang));
  if (voice) cry.voice = voice;
  speechSynthesis.speak(cry);
}

function frame(now) {
  const seconds = lastTime === null ? 0 : Math.min(0.06, (now - lastTime) / 1000);
  lastTime = now;
  if (screen === "playing") {
    accumulator += seconds;
    const priorDefeats = game.clearedBosses;
    while (accumulator >= step && game.status === "playing") {
      stepGame(game, input.read(), step);
      accumulator -= step;
    }
    if (game.clearedBosses !== priorDefeats) playDefeatVoice();
    updateHud();
    if (game.status !== "playing") finish();
    saveTimer -= seconds;
    if (saveTimer <= 0) {
      saveTimer = 2;
      persist();
    }
  }
  if (!notice.hidden && performance.now() > noticeUntil) notice.hidden = true;
  render(game);
  requestAnimationFrame(frame);
}

applyOrientation();
const savedGame = readSave();
if (savedGame) resumeFromSave(savedGame);
else showTitle();
updateDevice();
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(error => console.warn("离线功能注册失败", error));
}
requestAnimationFrame(frame);
