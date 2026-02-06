// Sound effects manager using Web Audio API
let audioContext = null;
let soundEnabled = true;

const SOUND_PACK_CONFIGS = {
  default: {
    sounds: {
      buttonPress: { frequency: 400, duration: 100 },
      correct: { frequencies: [523, 659, 784], duration: 200 },
      wrong: { frequency: 200, duration: 300 },
      gameStart: { frequencies: [262, 330, 392, 523], duration: 150 },
      gameEnd: { frequencies: [523, 392, 330, 262], duration: 200 },
    }
  },
  retro: {
    sounds: {
      buttonPress: { frequency: 800, duration: 50 },
      correct: { frequencies: [1047, 1319, 1568], duration: 100 },
      wrong: { frequency: 100, duration: 150 },
      gameStart: { frequencies: [523, 659, 784, 1047], duration: 100 },
      gameEnd: { frequencies: [1047, 784, 659, 523], duration: 150 },
    }
  },
  nature: {
    sounds: {
      buttonPress: { frequency: 600, duration: 120, type: 'sine' },
      correct: { frequencies: [440, 554, 659], duration: 250, type: 'sine' },
      wrong: { frequency: 180, duration: 400, type: 'sine' },
      gameStart: { frequencies: [294, 370, 440, 554], duration: 200, type: 'sine' },
      gameEnd: { frequencies: [554, 440, 370, 294], duration: 250, type: 'sine' },
    }
  },
  space: {
    sounds: {
      buttonPress: { frequency: 1200, duration: 80 },
      correct: { frequencies: [1568, 1976, 2349], duration: 150 },
      wrong: { frequency: 80, duration: 250 },
      gameStart: { frequencies: [784, 988, 1175, 1568], duration: 120 },
      gameEnd: { frequencies: [1568, 1175, 988, 784], duration: 180 },
    }
  },
  drums: {
    sounds: {
      buttonPress: { frequency: 150, duration: 50 },
      correct: { frequencies: [200, 250, 300], duration: 100 },
      wrong: { frequency: 80, duration: 200 },
      gameStart: { frequencies: [150, 200, 250, 300], duration: 80 },
      gameEnd: { frequencies: [300, 250, 200, 150], duration: 120 },
    }
  },
};

const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
};

const getCurrentSoundPack = () => {
  const packId = localStorage.getItem('loopybrainSoundPack') || 'default';
  return SOUND_PACK_CONFIGS[packId] || SOUND_PACK_CONFIGS.default;
};

const playTone = (frequency, duration, volume = 0.3, type = 'sine') => {
  if (!soundEnabled) return;
  
  initAudio();
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

const playChord = (frequencies, duration, volume = 0.2) => {
  if (!soundEnabled) return;
  
  initAudio();
  
  frequencies.forEach(freq => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  });
};

export const sounds = {
  buttonPress: () => {
    const pack = getCurrentSoundPack();
    const config = pack.sounds.buttonPress;
    playTone(config.frequency, config.duration / 1000, 0.2, config.type || 'square');
  },
  
  correctHit: () => {
    const pack = getCurrentSoundPack();
    const config = pack.sounds.correct;
    config.frequencies.forEach((freq, i) => {
      setTimeout(() => playTone(freq, config.duration / 1000, 0.3, config.type || 'sine'), i * 50);
    });
  },
  
  wrongHit: () => {
    const pack = getCurrentSoundPack();
    const config = pack.sounds.wrong;
    playTone(config.frequency, config.duration / 1000, 0.3, config.type || 'sawtooth');
    setTimeout(() => playTone(config.frequency * 0.75, config.duration / 1000, 0.3, config.type || 'sawtooth'), 100);
  },
  
  countdown: () => playTone(600, 0.15, 0.25),
  
  gameStart: () => {
    const pack = getCurrentSoundPack();
    const config = pack.sounds.gameStart;
    config.frequencies.forEach((freq, i) => {
      setTimeout(() => playTone(freq, config.duration / 1000, 0.3, config.type || 'sine'), i * 100);
    });
  },
  
  gameEnd: () => {
    const pack = getCurrentSoundPack();
    const config = pack.sounds.gameEnd;
    playChord(config.frequencies, config.duration / 1000, 0.2);
  },
  
  cardFlip: () => playTone(700, 0.08, 0.15),
  
  pairMatch: () => {
    playTone(659.25, 0.1, 0.25);
    setTimeout(() => playTone(783.99, 0.1, 0.25), 80);
    setTimeout(() => playTone(1046.50, 0.2, 0.25), 160);
  },
  
  itemSpawn: () => playTone(400, 0.05, 0.1),
  
  itemHit: () => playTone(880, 0.08, 0.25, 'triangle'),
  
  loseLife: () => {
    playTone(300, 0.15, 0.3, 'sawtooth');
    setTimeout(() => playTone(200, 0.2, 0.3, 'sawtooth'), 100);
  },
  
  setSoundEnabled: (enabled) => {
    soundEnabled = enabled;
    localStorage.setItem('mimoSoundEnabled', enabled ? 'true' : 'false');
  },
  
  isSoundEnabled: () => soundEnabled,
  
  loadSoundPreference: () => {
    const saved = localStorage.getItem('mimoSoundEnabled');
    soundEnabled = saved !== 'false';
    return soundEnabled;
  }
};