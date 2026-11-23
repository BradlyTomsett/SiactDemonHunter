const KEY_ACTION = {
  ArrowLeft: "left", ArrowRight: "right", Space: "jump", KeyJ: "fire",
};

export function createInput(controls, onPause, canPlay) {
  const keys = new Set();
  const pointers = new Map();
  let jumpPressed = false;
  let firePressed = false;

  function active(action) {
    return keys.has(action) || [...pointers.values()].some(pointer => pointer.action === action);
  }

  function markPress(action, wasActive) {
    if (!action || wasActive) return;
    if (action === "jump") jumpPressed = true;
    if (action === "fire") firePressed = true;
  }

  const pads = [...controls.querySelectorAll("[data-action]")];
  function updatePads() {
    for (const pad of pads) pad.classList.toggle("pressed", active(pad.dataset.action));
  }

  function clear() {
    keys.clear();
    pointers.clear();
    jumpPressed = false;
    firePressed = false;
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
      const input = {
        move: Number(active("right")) - Number(active("left")),
        jump: jumpPressed,
        fire: firePressed || active("fire"),
      };
      jumpPressed = false;
      firePressed = false;
      return input;
    },
  };
}
