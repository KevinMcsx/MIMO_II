// Sound effects manager using Web Audio API
let audioContext = null;
let soundEnabled = true;

const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
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
  buttonPress: () => playTone(800, 0.1, 0.2, 'square'),
  
  correctHit: () => {
    playTone(523.25, 0.1, 0.3); // C5
    setTimeout(() => playTone(659.25, 0.15, 0.3), 50); // E5
  },
  
  wrongHit: () => {
    playTone(200, 0.2, 0.3, 'sawtooth');
    setTimeout(() => playTone(150, 0.2, 0.3, 'sawtooth'), 100);
  },
  
  countdown: () => playTone(600, 0.15, 0.25),
  
  gameStart: () => {
    playTone(523.25, 0.1, 0.3); // C5
    setTimeout(() => playTone(659.25, 0.1, 0.3), 100); // E5
    setTimeout(() => playTone(783.99, 0.2, 0.3), 200); // G5
  },
  
  gameEnd: () => {
    playChord([523.25, 659.25, 783.99], 0.5, 0.2); // C major chord
  },
  
  cardFlip: () => playTone(700, 0.08, 0.15),
  
  pairMatch: () => {
    playTone(659.25, 0.1, 0.25); // E5
    setTimeout(() => playTone(783.99, 0.1, 0.25), 80); // G5
    setTimeout(() => playTone(1046.50, 0.2, 0.25), 160); // C6
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