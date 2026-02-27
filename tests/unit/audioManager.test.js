import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/utils/storage.js', () => ({
  loadPreferences: vi.fn(() => ({ volume: 0.7, muted: false, lastMode: 'best_of_3' })),
  savePreferences: vi.fn(),
}));
vi.mock('../../src/audio/soundEffects.js', () => ({}));
vi.mock('../../src/audio/speechSynth.js', () => ({
  speakCountdown: vi.fn(),
  cancelSpeech: vi.fn(),
}));

import { AudioManager } from '../../src/audio/audioManager.js';
import { loadPreferences, savePreferences } from '../../src/utils/storage.js';

class MockGainNode {
  constructor() {
    this.gain = { value: 1, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  }
  connect() {}
}

class MockOscillator {
  constructor() {
    this.frequency = { value: 0 };
    this.type = '';
  }
  connect() {}
  start() {}
  stop() {}
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
  }
  createGain() { return new MockGainNode(); }
  createOscillator() { return new MockOscillator(); }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
}

describe('AudioManager', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', MockAudioContext);
    vi.stubGlobal('localStorage', {
      store: {},
      getItem(key) { return this.store[key] || null; },
      setItem(key, val) { this.store[key] = val; },
      removeItem(key) { delete this.store[key]; },
    });
    loadPreferences.mockReturnValue({ volume: 0.7, muted: false, lastMode: 'best_of_3' });
    savePreferences.mockClear();
  });

  it('starts uninitialized', () => {
    const am = new AudioManager();
    expect(am._initialized).toBe(false);
  });

  it('initializes AudioContext on init()', () => {
    const am = new AudioManager();
    am.init();
    expect(am._initialized).toBe(true);
    expect(am._ctx).toBeInstanceOf(MockAudioContext);
  });

  it('loads volume from preferences', () => {
    loadPreferences.mockReturnValue({ volume: 0.5, muted: false });
    const am = new AudioManager();
    am.init();
    expect(am.getVolume()).toBe(0.5);
  });

  it('sets volume correctly', () => {
    const am = new AudioManager();
    am.init();
    am.setVolume(0.3);
    expect(am.getVolume()).toBe(0.3);
  });

  it('clamps volume between 0 and 1', () => {
    const am = new AudioManager();
    am.init();

    am.setVolume(1.5);
    expect(am.getVolume()).toBe(1);

    am.setVolume(-0.5);
    expect(am.getVolume()).toBe(0);
  });

  it('mute sets gain to 0', () => {
    const am = new AudioManager();
    am.init();
    am.mute();
    expect(am._gainNode.gain.value).toBe(0);
    expect(am.isMuted()).toBe(true);
  });

  it('unmute restores gain to volume', () => {
    const am = new AudioManager();
    am.init();
    am.setVolume(0.6);
    am.mute();
    am.unmute();
    expect(am._gainNode.gain.value).toBe(0.6);
    expect(am.isMuted()).toBe(false);
  });

  it('toggleMute switches mute state', () => {
    const am = new AudioManager();
    am.init();

    am.toggleMute();
    expect(am.isMuted()).toBe(true);

    am.toggleMute();
    expect(am.isMuted()).toBe(false);
  });

  it('persists preferences on volume change', () => {
    const am = new AudioManager();
    am.init();
    savePreferences.mockClear();

    am.setVolume(0.4);

    expect(savePreferences).toHaveBeenCalled();
  });

  it('persists preferences on mute toggle', () => {
    const am = new AudioManager();
    am.init();
    savePreferences.mockClear();

    am.toggleMute();

    expect(savePreferences).toHaveBeenCalled();
  });

  it('destroy closes AudioContext', async () => {
    const am = new AudioManager();
    am.init();
    const ctx = am._ctx;
    const closeSpy = vi.spyOn(ctx, 'close');

    am.destroy();

    expect(closeSpy).toHaveBeenCalled();
    expect(am._initialized).toBe(false);
    expect(am._ctx).toBeNull();
  });
});
