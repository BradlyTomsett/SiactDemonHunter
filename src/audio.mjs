// 原创八位机音色。旋律、低音和枪声均在浏览器生成。
const melody = [0, null, 7, 3, 10, 7, null, 5, 2, null, 9, 5, 12, 10, 7, null,
  3, 7, 12, null, 14, 12, 10, 7, 5, null, 8, 10, 15, 12, 10, 2];
const bass = [0, 0, 2, 2, 3, 3, 5, 0];
const stages = [{ root: 50, beat: .125 }, { root: 47, beat: .118 },
  { root: 53, beat: .141 }, { root: 45, beat: .113 }];
const gunRange = { basic: [535, 155], spread: [380, 75], pierce: [900, 275], rapid: [680, 210], heavy: [260, 54] };
const hz = midi => 440 * 2 ** ((midi - 69) / 12);

export function createAudio() {
  let ctx, music, effects;
  let active = false;
  let stage = 0;
  let beat = 0;
  let nextNote = 0;

  function updateMix() {
    if (!ctx) return;
    music.gain.setTargetAtTime(active ? .48 : 0, ctx.currentTime, .012);
    effects.gain.setTargetAtTime(active ? .58 : 0, ctx.currentTime, .012);
  }

  function unlock() {
    if (!ctx) {
      const Audio = globalThis.AudioContext ?? globalThis.webkitAudioContext;
      if (!Audio) return;
      try { ctx = new Audio(); } catch { return; }
      music = ctx.createGain();
      effects = ctx.createGain();
      for (const bus of [music, effects]) {
        bus.gain.value = 0;
        bus.connect(ctx.destination);
      }
      updateMix();
    }
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
  }

  function setPlaying(playing, levelIndex = stage) {
    if (levelIndex !== stage) { stage = levelIndex; beat = 0; }
    nextNote = 0;
    active = playing;
    updateMix();
  }

  function tone(bus, type, start, duration, gain, frequency, end = frequency) {
    const voice = ctx.createOscillator();
    const envelope = ctx.createGain();
    voice.type = type;
    voice.frequency.setValueAtTime(frequency, start);
    if (end !== frequency) voice.frequency.exponentialRampToValueAtTime(end, start + duration);
    envelope.gain.setValueAtTime(.001, start);
    envelope.gain.linearRampToValueAtTime(gain, start + .004);
    envelope.gain.exponentialRampToValueAtTime(.001, start + duration);
    voice.connect(envelope);
    envelope.connect(bus);
    voice.onended = () => { voice.disconnect(); envelope.disconnect(); };
    voice.start(start);
    voice.stop(start + duration);
  }

  function tick() {
    if (!active || ctx?.state !== 'running') return;
    const { root, beat: duration } = stages[stage];
    const now = ctx.currentTime;
    if (nextNote < now) nextNote = now + .01;
    while (nextNote < now + .085) {
      const note = melody[beat % melody.length];
      if (note !== null) tone(music, 'square', nextNote, duration * .72, .070, hz(root + 12 + note));
      if (beat % 2 === 0) tone(music, 'triangle', nextNote, duration * 1.55, .16, hz(root - 12 + bass[Math.floor(beat / 4) % bass.length]));
      if (beat % 4 === 0) tone(music, 'sine', nextNote, .07, .10, 115, 45);
      else if (beat % 4 === 2) tone(music, 'square', nextNote, .026, .035, 540, 167);
      nextNote += duration;
      beat++;
    }
  }

  function shoot(weapon) {
    if (!active || ctx?.state !== 'running') return;
    const [from, to] = gunRange[weapon] ?? gunRange.basic;
    tone(effects, 'square', ctx.currentTime, weapon === 'heavy' ? .14 : .071, .15, from, to);
  }

  return { unlock, setPlaying, tick, shoot };
}
