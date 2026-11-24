const KEY_ACTION = {
  ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", Space: "jump", KeyJ: "fire", KeyK: "grenade",
};

export function createInput(controls, onPause, canPlay) {
  const keys = new Set();
  const pointers = new Map();
  let jumpPressed = false;
  let firePressed = false;
  let grenadePressed = false;
  const stick = document.getElementById("joystick");
  const zone = document.getElementById("stick-zone");
  const knob = stick.querySelector(".stick-knob");
  let stickPointer = null;
  let stickX = 0;
  let stickY = 0;
  let stickMove = 0;
  let originX = 0;
  let originY = 0;

  function resetStick() {
    stickPointer = null;
    stickX = 0;
    stickY = 0;
    stickMove = 0;
    stick.hidden = true;
    knob.style.transform = "translate(-50%, -50%)";
  }

  const isRotated = () => document.documentElement.dataset.rotated === "1";

  // 摇杆只有 8 个方向；推过这个阈值才真正移动，推得浅就站着不动（不再有"只瞄准"模式）。
  const MOVE_THRESHOLD = 0.35;

  function moveStick(event) {
    const rect = stick.getBoundingClientRect();
    const radius = rect.width * 0.36;
    const dx = event.clientX - originX;
    const dy = event.clientY - originY;
    // 竖屏时画面整体旋转了 90°，屏幕坐标要先换算回游戏内的横屏坐标。
    let x = (isRotated() ? dy : dx) / radius;
    let y = (isRotated() ? -dx : dy) / radius;
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    knob.style.transform = `translate(calc(-50% + ${x * radius}px), calc(-50% + ${y * radius}px))`;
    if (length < MOVE_THRESHOLD) { stickX = 0; stickY = 0; stickMove = 0; return; }
    const angle = Math.round(Math.atan2(y, x) / (Math.PI / 4)) * (Math.PI / 4);
    stickX = Math.abs(Math.cos(angle)) < 1e-6 ? 0 : Math.cos(angle);
    stickY = Math.abs(Math.sin(angle)) < 1e-6 ? 0 : Math.sin(angle);
    stickMove = Math.sign(stickX);
  }

  zone.addEventListener("pointerdown", event => {
    if (event.button !== 0 || !canPlay() || stickPointer !== null) return;
    event.preventDefault();
    stickPointer = event.pointerId;
    originX = event.clientX;
    originY = event.clientY;
    const bounds = zone.getBoundingClientRect();
    const dx = originX - (bounds.left + bounds.width / 2);
    const dy = originY - (bounds.top + bounds.height / 2);
    const localWidth = isRotated() ? bounds.height : bounds.width;
    const localHeight = isRotated() ? bounds.width : bounds.height;
    stick.style.left = `${localWidth / 2 + (isRotated() ? dy : dx)}px`;
    stick.style.top = `${localHeight / 2 + (isRotated() ? -dx : dy)}px`;
    stick.hidden = false;
    zone.setPointerCapture(event.pointerId);
    moveStick(event);
  });
  zone.addEventListener("pointermove", event => {
    if (event.pointerId === stickPointer) moveStick(event);
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) {
    zone.addEventListener(name, event => { if (event.pointerId === stickPointer) resetStick(); });
  }

  function active(action) {
    return keys.has(action) || [...pointers.values()].some(pointer => pointer.action === action);
  }

  function markPress(action, wasActive) {
    if (!action || wasActive) return;
    if (action === "jump") jumpPressed = true;
    if (action === "fire") firePressed = true;
    if (action === "grenade") grenadePressed = true;
  }

  const pads = [...controls.querySelectorAll("[data-action]")];
  function updatePads() {
    for (const pad of pads) pad.classList.toggle("pressed", active(pad.dataset.action));
  }

  function clear() {
    resetStick();
    keys.clear();
    pointers.clear();
    jumpPressed = false;
    firePressed = false;
    grenadePressed = false;
    updatePads();
  }

  function actionAt(event, group) {
    const button = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-action]");
    return button && group.contains(button) ? button.dataset.action : null;
  }

  function setPointer(event, group) {
    const action = actionAt(event, group);
    const wasActive = active(action);
    pointers.set(event.pointerId, { action });
    markPress(action, wasActive);
    updatePads();
  }

  for (const group of controls.querySelectorAll("[data-controls]")) {
    group.addEventListener("pointerdown", event => {
      if (event.button !== 0 || !canPlay() || !actionAt(event, group)) return;
      event.preventDefault();
      group.setPointerCapture(event.pointerId);
      setPointer(event, group);
    });
    group.addEventListener("pointermove", event => {
      if (pointers.has(event.pointerId)) setPointer(event, group);
    });
    const release = event => {
      pointers.delete(event.pointerId);
      updatePads();
    };
    for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) {
      group.addEventListener(name, release);
    }
    group.addEventListener("contextmenu", event => event.preventDefault());
  }

  window.addEventListener("keydown", event => {
    if (event.code === "Escape" && !event.repeat) {
      onPause();
      return;
    }
    const action = KEY_ACTION[event.code];
    if (!canPlay() || !action || event.ctrlKey || event.altKey || event.metaKey) return;
    if (document.activeElement instanceof HTMLButtonElement && event.code === "Space") return;
    event.preventDefault();
    if (event.repeat) return;
    const wasActive = active(action);
    keys.add(action);
    markPress(action, wasActive);
    updatePads();
  });
  window.addEventListener("keyup", event => {
    keys.delete(KEY_ACTION[event.code]);
    updatePads();
  });

  return {
    clear,
    read() {
      const keyX = Number(active("right")) - Number(active("left"));
      const keyY = Number(active("down")) - Number(active("up"));
      const x = stickPointer !== null ? stickX : keyX;
      const y = stickPointer !== null ? stickY : keyY;
      const input = {
        move: stickPointer !== null ? stickMove : keyX,
        aimX: x,
        aimY: y,
        jump: jumpPressed,
        fire: firePressed || active("fire"),
        grenade: grenadePressed,
      };
      jumpPressed = false;
      firePressed = false;
      grenadePressed = false;
      return input;
    },
  };
}

