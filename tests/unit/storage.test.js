import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadPreferences, savePreferences, loadStats, saveStats, clearStats } from '../../src/utils/storage.js';

describe('storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      store: {},
      getItem(key) { return this.store[key] || null; },
      setItem(key, val) { this.store[key] = val; },
      removeItem(key) { delete this.store[key]; },
    });
  });

  describe('preferences', () => {
    it('returns defaults when nothing stored', () => {
      const prefs = loadPreferences();
      expect(prefs).toEqual({ volume: 0.7, muted: false, lastMode: 'best_of_3' });
    });

    it('returns stored preferences', () => {
      localStorage.setItem('rps_preferences', JSON.stringify({ volume: 0.3, muted: true, lastMode: 'best_of_5' }));
      const prefs = loadPreferences();
      expect(prefs.volume).toBe(0.3);
      expect(prefs.muted).toBe(true);
      expect(prefs.lastMode).toBe('best_of_5');
    });

    it('merges stored with defaults for partial data', () => {
      localStorage.setItem('rps_preferences', JSON.stringify({ volume: 0.5 }));
      const prefs = loadPreferences();
      expect(prefs.volume).toBe(0.5);
      expect(prefs.muted).toBe(false);
      expect(prefs.lastMode).toBe('best_of_3');
    });

    it('handles corrupted JSON gracefully', () => {
      localStorage.setItem('rps_preferences', '{bad json!!!');
      const prefs = loadPreferences();
      expect(prefs).toEqual({ volume: 0.7, muted: false, lastMode: 'best_of_3' });
    });

    it('saves preferences to localStorage', () => {
      savePreferences({ volume: 0.9, muted: true, lastMode: 'best_of_7' });
      const raw = localStorage.getItem('rps_preferences');
      expect(JSON.parse(raw)).toEqual({ volume: 0.9, muted: true, lastMode: 'best_of_7' });
    });
  });

  describe('stats', () => {
    it('returns defaults when nothing stored', () => {
      const stats = loadStats();
      expect(stats.totalGames).toBe(0);
      expect(stats.totalWins).toBe(0);
      expect(stats.gestureUsage).toEqual({ rock: 0, paper: 0, scissors: 0 });
    });

    it('returns stored stats', () => {
      localStorage.setItem('rps_statistics', JSON.stringify({ totalWins: 5, totalLosses: 3 }));
      const stats = loadStats();
      expect(stats.totalWins).toBe(5);
      expect(stats.totalLosses).toBe(3);
    });

    it('merges gestureUsage with defaults', () => {
      localStorage.setItem('rps_statistics', JSON.stringify({ gestureUsage: { rock: 10 } }));
      const stats = loadStats();
      expect(stats.gestureUsage).toEqual({ rock: 10, paper: 0, scissors: 0 });
    });

    it('handles corrupted JSON gracefully', () => {
      localStorage.setItem('rps_statistics', '!!!not-json');
      const stats = loadStats();
      expect(stats.totalGames).toBe(0);
      expect(stats.gestureUsage).toEqual({ rock: 0, paper: 0, scissors: 0 });
    });

    it('saves stats to localStorage', () => {
      const data = { totalWins: 7, totalLosses: 2 };
      saveStats(data);
      const raw = localStorage.getItem('rps_statistics');
      expect(JSON.parse(raw)).toEqual(data);
    });

    it('clearStats removes from localStorage', () => {
      saveStats({ totalWins: 1 });
      clearStats();
      expect(localStorage.getItem('rps_statistics')).toBeNull();
    });
  });
});
