import { loadPreferences, savePreferences } from '../utils/storage.js';
import * as sfx from './soundEffects.js';
import { speakCountdown, cancelSpeech } from './speechSynth.js';

export class AudioManager {
  constructor() {
    this._ctx = null;
    this._gainNode = null;
    this._muted = false;
    this._volume = 0.7;
    this._initialized = false;
  }

  init() {
    if (this._initialized) return;
    const prefs = loadPreferences();
    this._volume = prefs.volume ?? 0.7;
    this._muted = prefs.muted ?? false;

    this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    this._gainNode = this._ctx.createGain();
    this._gainNode.connect(this._ctx.destination);
    this._gainNode.gain.value = this._muted ? 0 : this._volume;
    this._initialized = true;
  }

  _ensureContext() {
    if (!this._initialized) this.init();
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }

  setVolume(value) {
    this._volume = Math.max(0, Math.min(1, value));
    if (this._gainNode && !this._muted) {
      this._gainNode.gain.value = this._volume;
    }
    this._persistPrefs();
  }

  getVolume() {
    return this._volume;
  }

  mute() {
    this._muted = true;
    if (this._gainNode) this._gainNode.gain.value = 0;
    this._persistPrefs();
  }

  unmute() {
    this._muted = false;
    if (this._gainNode) this._gainNode.gain.value = this._volume;
    this._persistPrefs();
  }

  toggleMute() {
    if (this._muted) this.unmute();
    else this.mute();
  }

  isMuted() {
    return this._muted;
  }

  playCountdownBeep(beatIndex) {
    this._ensureContext();
    sfx.playCountdownBeep(this._ctx, this._gainNode, beatIndex);
  }

  playWin() {
    this._ensureContext();
    sfx.playWinSound(this._ctx, this._gainNode);
  }

  playLose() {
    this._ensureContext();
    sfx.playLoseSound(this._ctx, this._gainNode);
  }

  playDraw() {
    this._ensureContext();
    sfx.playDrawSound(this._ctx, this._gainNode);
  }

  playMatchWin() {
    this._ensureContext();
    sfx.playMatchWinSound(this._ctx, this._gainNode);
  }

  playMatchLose() {
    this._ensureContext();
    sfx.playMatchLoseSound(this._ctx, this._gainNode);
  }

  playClick() {
    this._ensureContext();
    sfx.playClickSound(this._ctx, this._gainNode);
  }

  playDetected() {
    this._ensureContext();
    sfx.playDetectedBeep(this._ctx, this._gainNode);
  }

  speak(word) {
    if (!this._muted) {
      speakCountdown(word);
    }
  }

  cancelSpeech() {
    cancelSpeech();
  }

  _persistPrefs() {
    const prefs = loadPreferences();
    prefs.volume = this._volume;
    prefs.muted = this._muted;
    savePreferences(prefs);
  }

  destroy() {
    if (this._ctx) {
      this._ctx.close();
      this._ctx = null;
    }
    this._initialized = false;
  }
}
