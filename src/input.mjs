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
  let originX = 0;
  let originY = 0;

  function resetStick() {
    stickPointer = null;
    stickX = 0;
    stickY = 0;
    stick.hidden = true;
    knob.style.transform = "translate(-50%, -50%)";
  }

  function moveStick(event) {
    const rect = stick.getBoundingClientRect();
    const radius = rect.width * 0.36;
    let x = (event.clientX - originX) / radius;
    let y = (event.clientY - originY) / radius;
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    knob.style.transform = `translate(calc(-50% + ${x * radius}px), calc(-50% + ${y * radius}px))`;
    if (length < 0.22) { stickX = 0; stickY = 0; return; }
    const angle = Math.round(Math.atan2(y, x) / (Math.PI / 4));
    stickX = Math.round(Math.cos(angle * Math.PI / 4));
    stickY = Math.round(Math.sin(angle * Math.PI / 4));
  }

  zone.addEventListener("pointerdown", event => {
    if (event.button !== 0 || !canPlay() || stickPointer !== null) return;
    event.preventDefault();
    stickPointer = event.pointerId;
    originX = event.clientX;
    originY = event.clientY;
    const bounds = zone.getBoundingClientRect();
    stick.style.left = `${originX - bounds.left}px`;
    stick.style.top = `${originY - bounds.top}px`;
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
      if (event.button !== 0 || !canPlay()) return;
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
      const x = stickX || keyX;
      const y = stickY || keyY;
      const input = {
        move: x,
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

