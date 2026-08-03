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

// Each creature's signature "voice" — a short, friendly, gentle phrase.
const VOICES = {
  dragon: { freqs: [165, 196, 147],     type: 'sine',     dur: 0.3,  gain: 0.42 }, // warm purr-rumble
  fox:    { freqs: [700, 900, 700, 850], type: 'triangle', dur: 0.13, gain: 0.3 },  // friendly yip
  owl:    { freqs: [294, 247, 294],      type: 'sine',     dur: 0.36, gain: 0.4 },  // soft hoo-hoo
  cat:    { freqs: [440, 523, 415],      type: 'sine',     dur: 0.24, gain: 0.36 }, // gentle mew
  bunny:  { freqs: [880, 988, 880],      type: 'sine',     dur: 0.11, gain: 0.28 }, // soft squeak
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
    const note = (fr) => {
      const c = ensureCtx();
      if (!c) return;
      const now = c.currentTime;
      // main gentle tone with smooth attack
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = v.type;
      o.frequency.setValueAtTime(fr, now);
      o.frequency.linearRampToValueAtTime(fr * 0.96, now + v.dur);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(volume * v.gain, now + 0.045);
      g.gain.exponentialRampToValueAtTime(0.001, now + v.dur);
      o.connect(g).connect(c.destination);
      o.start(now);
      o.stop(now + v.dur);
      // soft warmth harmonic (one octave below) for a friendly body
      const o2 = c.createOscillator();
      const g2 = c.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(fr * 0.5, now);
      g2.gain.setValueAtTime(0, now);
      g2.gain.linearRampToValueAtTime(volume * v.gain * 0.32, now + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.001, now + v.dur);
      o2.connect(g2).connect(c.destination);
      o2.start(now);
      o2.stop(now + v.dur);
    };
    v.freqs.forEach((fr, i) => {
      setTimeout(() => note(fr), i * (v.dur * 1000 + 50));
    });
  },
  unlock() { ensureCtx(); },
};