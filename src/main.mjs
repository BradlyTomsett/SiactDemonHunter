import { createGame, stepGame } from "./game.mjs";
import { createInput } from "./input.mjs";
import { LEVELS, PLAYER, WEAPONS } from "./levels.mjs";
import { createRenderer } from "./render.mjs";

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
const primary = byId("primary");
const guide = byId("guide");
const home = byId("home");
const install = byId("install");
const fullscreen = byId("fullscreen");
const orientationHint = byId("orientation-hint");
const gameView = byId("world").parentElement;
let installPrompt = null;
let installRequested = false;
const standalone = window.matchMedia('(display-mode: standalone)');
const isAndroid = /Android/i.test(navigator.userAgent);
const runsAsApp = () => standalone.matches || navigator.standalone === true;
const touch = window.matchMedia("(pointer: coarse)");
const portrait = window.matchMedia("(orientation: portrait)");
const step = 1 / 120;

let levelIndex = 0;
let completedTime = 0;
let game = null;
let screen = "title";
let accumulator = 0;
let lastTime = null;
let previousHealth = -1;
let previousLives = -1;
let previousRespawns = 0;
let noticeUntil = 0;
let primaryAction = start;

const input = createInput(controls, togglePause, () => screen === "playing");

for (let i = 0; i < PLAYER.maxHealth; i++) {
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
  orientationHint.hidden = screen !== "title" || !touch.matches || !portrait.matches;
}

function panel(next, title, message, label, action) {
  rewards.hidden = true;
  primary.hidden = false;
  byId("menu-title").textContent = title;
  byId("menu-message").textContent = message;
  byId("menu-chapter").textContent = game.level.name;
  primary.textContent = label;
  primaryAction = action;
  home.hidden = next === "title";
  install.hidden = next !== "title" || runsAsApp();
  fullscreen.hidden = next !== "title" && next !== "paused";
  guide.hidden = next !== "title";
  setScreen(next);
  primary.focus({ preventScroll: true });
}

function loadLevel(index, remainingLives, carry) {
  levelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
  game = createGame(LEVELS[levelIndex], { lives: remainingLives, carry });
  previousRespawns = game.respawns;
  previousHealth = -1;
  previousLives = -1;
  byId("level-name").textContent = game.level.name;
  updateHud();
}

function showTitle() {
  completedTime = 0;
  loadLevel(0, PLAYER.lives);
  panel(
    "title",
    "逃离办公室",
    "你在键盘旁醒来，身体只剩回形针那么高。穿过桌面，找到出口。",
    "开始游戏",
    start,
  );
}

function start() {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  setScreen("playing");
}

function pause(message = "点击继续，回到当前关卡。") {
  if (screen !== "playing") return;
  if (game.player.knockback <= 0) game.player.vx = 0;
  panel("paused", "已暂停", message, "继续游戏", resume);
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
    ? "左手移动和瞄准 · 按住射击连发"
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
  byId('equipment').textContent = `${weapon.name} ${game.player.ammo === Infinity ? '∞' : game.player.ammo}  炸弹 ${game.player.grenades}/6${game.player.boost > 0 ? ` 火力提升 ${Math.ceil(game.player.boost)}秒` : ''}`;
  if (hp !== previousHealth) {
    health.setAttribute("aria-label", `生命 ${hp} / ${PLAYER.maxHealth}`);
    for (const [i, heart] of [...health.children].entries()) heart.classList.toggle("empty", i >= hp);
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

function finish() {
  if (game.status === "lost") {
    panel(
      "lost",
      "行动失败",
      `${game.reason}从本段开头重新开始，命数恢复。`,
      "重试本段",
      () => {
        loadLevel(levelIndex, PLAYER.lives);
        start();
      },
    );
    return;
  }
  const used = timeText(game.elapsed);
  if (levelIndex < LEVELS.length - 1) {
    const nextLives = game.lives;
    panel(
      "cleared",
      "本段通过",
      `已抵达出口。用时 ${used}，剩余命数 ${nextLives + 1} 条。`,
      "下一段",
      () => {
        completedTime += game.elapsed;
        loadLevel(levelIndex + 1, nextLives, game.player);
        start();
      },
    );
    primary.hidden = true;
    rewards.hidden = false;
    const ammoButton = rewards.querySelector('[data-reward="ammo"]');
    ammoButton.textContent = game.player.weapon === 'basic' ? '获得满弹散射枪' : '补满当前武器弹药';
  } else {
    panel(
      "cleared",
      "第一关通关",
      `你越过了桌缝。总用时 ${timeText(completedTime + game.elapsed)}，剩余命数 ${game.lives + 1} 条。`,
      "再玩一局",
      () => {
        completedTime = 0;
        loadLevel(0, PLAYER.lives);
        start();
      },
    );
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
    carry.ammo = WEAPONS[carry.weapon].ammo;
  }
  completedTime += game.elapsed;
  loadLevel(levelIndex + 1, nextLives, carry);
  start();
});

function syncFullscreenButton() {
  fullscreen.textContent = document.fullscreenElement ? '退出全屏' : '全屏';
}
document.addEventListener('fullscreenchange', syncFullscreenButton);
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
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
    ? '已确认安装，请等待 Chrome 处理。在手机主屏幕上滑，搜索“逃离办公室”。找到图标后，长按并选择“添加到主屏幕”。若找不到，回到 Chrome 菜单检查安装选项。'
    : '安装请求已提交，请在系统的应用列表里查找“逃离办公室”。');
}

function showInstallHelp() {
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    showInstallStatus('请用 Safari 打开，点击分享，再选择“添加到主屏幕”。');
    return;
  }
  showInstallStatus(isAndroid
    ? '请打开 Chrome 右上角的 ⋮ 菜单，选择“安装应用”或“安装并创建快捷方式”。如果已经安装，请在手机的应用列表里搜索“逃离办公室”。'
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
for (const media of [touch, portrait]) media.addEventListener("change", updateDevice);
window.addEventListener("blur", () => {
  input.clear();
  pause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    input.clear();
    pause();
  }
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
  }
  if (!notice.hidden && performance.now() > noticeUntil) notice.hidden = true;
  render(game);
  requestAnimationFrame(frame);
}

showTitle();
updateDevice();
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(error => console.warn("离线功能注册失败", error));
}
requestAnimationFrame(frame);
