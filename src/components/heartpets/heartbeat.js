// Heartbeat + effect audio engine using Web Audio API. Works offline.

let audioCtx = null;
let timer = null;
let volume = 0.3;
let enabled = false;

function ensureCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function thump(freq, dur, gain) {
  const ctx = ensureCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq * 0.5), now + dur);
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + 0.03);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur);
}

function beat() {
  const v = volume * 0.6;
  thump(55, 0.18, v);
  setTimeout(() => thump(40, 0.22, v * 0.7), 200);
}

function intervalForMood(mood) {
  if (mood === 'sleepy') return 1300;
  if (mood === 'playful' || mood === 'happy') return 900;
  if (mood === 'sick') return 1200;
  return 1034;
}

const EFFECT_FREQS = {
  feed: [440, 660], water: [523, 698], clean: [587, 784],
  sleep: [330, 262], play: [523, 659, 784], pet: [494, 587],
};

// Each creature's signature "voice" — a short tonal phrase.
const VOICES = {
  dragon: { freqs: [196, 220, 175, 233], type: 'sawtooth', dur: 0.22, gain: 0.5 }, // growl
  fox:    { freqs: [880, 740, 880, 698], type: 'square',   dur: 0.12, gain: 0.35 }, // yip
  owl:    { freqs: [392, 330, 392, 294], type: 'sine',     dur: 0.3,  gain: 0.45 }, // hoot
  cat:    { freqs: [523, 698, 587, 659], type: 'triangle', dur: 0.18, gain: 0.4 },  // meow
  bunny:  { freqs: [784, 988, 784, 1175], type: 'sine',   dur: 0.1,  gain: 0.35 }, // squeak
};

export const heartbeat = {
  start(mood = 'relaxed') {
    if (enabled) return;
    if (!ensureCtx()) return;
    enabled = true;
    beat();
    timer = setInterval(beat, intervalForMood(mood));
  },
  stop() {
    enabled = false;
    if (timer) { clearInterval(timer); timer = null; }
  },
  setVolume(v) { volume = v; },
  setMood(mood) {
    if (!enabled) return;
    if (timer) clearInterval(timer);
    beat();
    timer = setInterval(beat, intervalForMood(mood));
  },
  playEffect(type) {
    const ctx = ensureCtx();
    if (!ctx) return;
    const freqs = EFFECT_FREQS[type] || [523];
    freqs.forEach((fr, i) => {
      setTimeout(() => {
        const c = ensureCtx();
        if (!c) return;
        const now = c.currentTime;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'triangle';
        o.frequency.value = fr;
        g.gain.setValueAtTime(volume * 0.4, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        o.connect(g).connect(c.destination);
        o.start(now);
        o.stop(now + 0.15);
      }, i * 80);
    });
  },
  playVoice(creatureId) {
    const ctx = ensureCtx();
    if (!ctx) return;
    const v = VOICES[creatureId] || VOICES.cat;
    v.freqs.forEach((fr, i) => {
      setTimeout(() => {
        const c = ensureCtx();
        if (!c) return;
        const now = c.currentTime;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = v.type;
        o.frequency.setValueAtTime(fr, now);
        o.frequency.linearRampToValueAtTime(fr * 0.92, now + v.dur);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(volume * v.gain, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + v.dur);
        o.connect(g).connect(c.destination);
        o.start(now);
        o.stop(now + v.dur);
      }, i * (v.dur * 1000 + 40));
    });
  },
  unlock() { ensureCtx(); },
};