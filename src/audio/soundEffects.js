export function playCountdownBeep(audioCtx, gainNode, beatIndex) {
  // beatIndex 0='Rock', 1='Paper', 2='Scissors', 3='SHOOT!'
  // Ascending pitch: 440, 523, 659, 880 Hz
  // Short beep: 100ms duration
  // SHOOT! is louder and longer (200ms)
  const frequencies = [440, 523, 659, 880];
  const freq = frequencies[beatIndex] || 880;
  const duration = beatIndex === 3 ? 0.2 : 0.1;
  
  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  env.gain.setValueAtTime(beatIndex === 3 ? 0.4 : 0.25, audioCtx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(env);
  env.connect(gainNode);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playWinSound(audioCtx, gainNode) {
  // Cheerful ascending arpeggio: C5, E5, G5, C6
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const startTime = audioCtx.currentTime + i * 0.12;
    env.gain.setValueAtTime(0.3, startTime);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
    osc.connect(env);
    env.connect(gainNode);
    osc.start(startTime);
    osc.stop(startTime + 0.25);
  });
}

export function playLoseSound(audioCtx, gainNode) {
  // Descending minor: Eb4, C4, Ab3
  const notes = [311, 262, 208];
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    const startTime = audioCtx.currentTime + i * 0.2;
    env.gain.setValueAtTime(0.2, startTime);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
    osc.connect(env);
    env.connect(gainNode);
    osc.start(startTime);
    osc.stop(startTime + 0.35);
  });
}

export function playDrawSound(audioCtx, gainNode) {
  // Two neutral beeps same pitch
  [0, 0.15].forEach((delay) => {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 440;
    const startTime = audioCtx.currentTime + delay;
    env.gain.setValueAtTime(0.25, startTime);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
    osc.connect(env);
    env.connect(gainNode);
    osc.start(startTime);
    osc.stop(startTime + 0.1);
  });
}

export function playMatchWinSound(audioCtx, gainNode) {
  // Triumphant fanfare: C5 E5 G5 C6 with longer sustain
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = i < 4 ? 'sine' : 'square';
    osc.frequency.value = freq;
    const startTime = audioCtx.currentTime + i * 0.15;
    env.gain.setValueAtTime(0.3, startTime);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
    osc.connect(env);
    env.connect(gainNode);
    osc.start(startTime);
    osc.stop(startTime + 0.4);
  });
}

export function playMatchLoseSound(audioCtx, gainNode) {
  // Sad trombone: Bb3 A3 Ab3 G3 with slow descend
  const notes = [233, 220, 208, 196];
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    const startTime = audioCtx.currentTime + i * 0.3;
    env.gain.setValueAtTime(0.2, startTime);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
    osc.connect(env);
    env.connect(gainNode);
    osc.start(startTime);
    osc.stop(startTime + 0.5);
  });
}

export function playClickSound(audioCtx, gainNode) {
  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 1000;
  env.gain.setValueAtTime(0.15, audioCtx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
  osc.connect(env);
  env.connect(gainNode);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

export function playDetectedBeep(audioCtx, gainNode) {
  const osc = audioCtx.createOscillator();
  const env = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 1200;
  env.gain.setValueAtTime(0.1, audioCtx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
  osc.connect(env);
  env.connect(gainNode);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.08);
}
