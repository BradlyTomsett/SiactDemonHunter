import { createGame, stepGame } from "./game.mjs";
import { createInput } from "./input.mjs";
import { LEVELS, PLAYER } from "./levels.mjs";
import { createRenderer } from "./render.mjs";

const byId = id => document.getElementById(id);
const render = createRenderer(byId("world"));
const hud = byId("hud");
const health = byId("health");
const hint = byId("hint");
const controls = byId("controls");
const pauseButton = byId("pause");
const overlay = byId("overlay");
const primary = byId("primary");
const guide = byId("guide");
const home = byId("home");
const rotate = byId("rotate");
const touch = window.matchMedia("(pointer: coarse)");
const portrait = window.matchMedia("(orientation: portrait)");
const step = 1 / 120;

let levelIndex = 0;
let game = createGame(LEVELS[levelIndex]);
let screen = "title";
let rotationBlocked = false;
let accumulator = 0;
let lastTime = null;
let previousHealth = -1;
let primaryAction = start;

const input = createInput(controls, togglePause, () => screen === "playing" && !rotationBlocked);

for (let i = 0; i < PLAYER.maxHealth; i++) {
  const heart = document.createElement("span");
  heart.className = "heart";
  heart.setAttribute("aria-hidden", "true");
  health.append(heart);
}

function setScreen(next) {
  input.clear();
  accumulator = 0;
  screen = next;
  syncVisibility();
}

function syncVisibility() {
  const active = screen === "playing" && !rotationBlocked;
  hud.hidden = screen === "title" || rotationBlocked;
  controls.hidden = !active || !touch.matches;
  pauseButton.hidden = !active;
  hint.hidden = !active;
  overlay.hidden = screen === "playing" || rotationBlocked;
  rotate.hidden = !rotationBlocked;
}

function panel(next, title, message, label, action) {
  byId("menu-title").textContent = title;
  byId("menu-message").textContent = message;
  byId("menu-chapter").textContent = game.level.name;
  primary.textContent = label;
  primaryAction = action;
  home.hidden = next === "title";
  guide.hidden = next !== "title";
  setScreen(next);
  if (!rotationBlocked) primary.focus({ preventScroll: true });
}

function showTitle() {
  levelIndex = 0;
  game = createGame(LEVELS[0]);
  panel("title", "SiactDemonHunter", "你在键盘旁醒来，身体只剩回形针那么高。穿过桌面，找到出口。", "开始第一关", start);
  const accent = document.createElement("span");
  accent.textContent = "Demon";
  byId("menu-title").replaceChildren("Siact", accent, "Hunter");
}

function start() {
  if (rotationBlocked) return;
  game = createGame(LEVELS[levelIndex]);
  byId("level-name").textContent = game.level.name;
  updateHud();
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  setScreen("playing");
}

function pause(message = "点击继续，回到当前关卡。") {
  if (screen !== "playing") return;
  if (game.player.knockback <= 0) game.player.vx = 0;
  panel("paused", "已暂停", message, "继续游戏", resume);
}

function resume() {
  if (rotationBlocked) return;
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  setScreen("playing");
}

function togglePause() {
  if (screen === "playing") pause();
  else if (screen === "paused") resume();
}

function updateDevice() {
  const blocked = touch.matches && portrait.matches;
  const orientationChanged = blocked !== rotationBlocked;
  rotationBlocked = blocked;
  guide.textContent = touch.matches
    ? "左手移动 · 右手跳跃和开火"
    : "方向键移动 · 空格跳跃 · J 开火";
  if (orientationChanged) {
    input.clear();
    if (blocked) pause("横屏后点击继续。");
  }
  syncVisibility();
}

function updateHud() {
  const hp = game.player.health;
  if (hp !== previousHealth) {
    health.setAttribute("aria-label", `生命 ${hp} / ${PLAYER.maxHealth}`);
    for (const [i, heart] of [...health.children].entries()) heart.classList.toggle("empty", i >= hp);
    previousHealth = hp;
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
    panel("lost", "行动失败", game.reason, "重试本关", start);
  } else if (levelIndex < LEVELS.length - 1) {
    panel("cleared", "本关通过", "已抵达出口。", "下一关", () => {
      levelIndex++;
      start();
    });
  } else {
    panel("cleared", "本关通过", "你越过了桌缝，顺利抵达出口。", "再玩一局", start);
  }
}

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

function frame(now) {
  const seconds = lastTime === null ? 0 : Math.min(0.06, (now - lastTime) / 1000);
  lastTime = now;
  if (screen === "playing" && !rotationBlocked) {
    accumulator += seconds;
    while (accumulator >= step && game.status === "playing") {
      stepGame(game, input.read(), step);
      accumulator -= step;
    }
    updateHud();
    if (game.status !== "playing") finish();
  }
  render(game);
  requestAnimationFrame(frame);
}

updateDevice();
requestAnimationFrame(frame);
