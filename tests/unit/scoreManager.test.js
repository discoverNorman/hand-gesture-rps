import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RESULTS, GAME_MODES } from '../../src/utils/constants.js';
import { ScoreManager } from '../../src/game/scoreManager.js';

vi.mock('../../src/utils/storage.js', () => ({
  loadStats: vi.fn(() => null),
  saveStats: vi.fn(),
}));

import { loadStats, saveStats } from '../../src/utils/storage.js';

describe('ScoreManager', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      store: {},
      getItem(key) { return this.store[key] || null; },
      setItem(key, val) { this.store[key] = val; },
      removeItem(key) { delete this.store[key]; },
    });
    loadStats.mockReturnValue(null);
    saveStats.mockClear();
  });

  describe('newMatch', () => {
    it('resets scores to zero', () => {
      const sm = new ScoreManager();
      sm.recordRound(RESULTS.WIN, 'rock');
      sm.newMatch(GAME_MODES.BEST_OF_3);

      const scores = sm.getScores();
      expect(scores.playerScore).toBe(0);
      expect(scores.aiScore).toBe(0);
      expect(scores.draws).toBe(0);
      expect(scores.round).toBe(0);
    });

    it('sets the game mode', () => {
      const sm = new ScoreManager();
      sm.newMatch(GAME_MODES.BEST_OF_5);
      expect(sm.mode).toBe(GAME_MODES.BEST_OF_5);
    });
  });

  describe('recordRound', () => {
    it('increments player score on win', () => {
      const sm = new ScoreManager();
      sm.recordRound(RESULTS.WIN, 'rock');
      expect(sm.getScores().playerScore).toBe(1);
    });

    it('increments ai score on loss', () => {
      const sm = new ScoreManager();
      sm.recordRound(RESULTS.LOSE, 'rock');
      expect(sm.getScores().aiScore).toBe(1);
    });

    it('increments draws on draw', () => {
      const sm = new ScoreManager();
      sm.recordRound(RESULTS.DRAW, 'rock');
      expect(sm.getScores().draws).toBe(1);
    });

    it('tracks round number', () => {
      const sm = new ScoreManager();
      sm.recordRound(RESULTS.WIN, 'rock');
      sm.recordRound(RESULTS.LOSE, 'paper');
      sm.recordRound(RESULTS.DRAW, 'scissors');
      expect(sm.getScores().round).toBe(3);
    });

    it('adds to round history', () => {
      const sm = new ScoreManager();
      sm.recordRound(RESULTS.WIN, 'rock');

      const history = sm.getScores().roundHistory;
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual({ result: RESULTS.WIN, playerGesture: 'rock', round: 1 });
    });

    it('caps round history at 10 entries', () => {
      const sm = new ScoreManager();
      for (let i = 0; i < 12; i++) {
        sm.recordRound(RESULTS.WIN, 'rock');
      }
      expect(sm.getScores().roundHistory).toHaveLength(10);
    });

    it('updates lifetime stats', () => {
      const sm = new ScoreManager();
      sm.recordRound(RESULTS.WIN, 'rock');
      sm.recordRound(RESULTS.LOSE, 'paper');
      sm.recordRound(RESULTS.DRAW, 'scissors');

      const stats = sm.getLifetimeStats();
      expect(stats.totalWins).toBe(1);
      expect(stats.totalLosses).toBe(1);
      expect(stats.totalDraws).toBe(1);
      expect(stats.totalRounds).toBe(3);
    });

    it('persists lifetime stats to localStorage', () => {
      const sm = new ScoreManager();
      sm.recordRound(RESULTS.WIN, 'rock');
      expect(saveStats).toHaveBeenCalled();
    });
  });

  describe('isMatchOver', () => {
    it('returns false in free play mode', () => {
      const sm = new ScoreManager();
      sm.newMatch(GAME_MODES.FREE_PLAY);
      sm.recordRound(RESULTS.WIN, 'rock');
      expect(sm.isMatchOver()).toBe(false);
    });

    it('returns true when player reaches required wins in best of 3', () => {
      const sm = new ScoreManager();
      sm.newMatch(GAME_MODES.BEST_OF_3);
      sm.recordRound(RESULTS.WIN, 'rock');
      sm.recordRound(RESULTS.WIN, 'rock');
      expect(sm.isMatchOver()).toBe(true);
    });

    it('returns true when ai reaches required wins in best of 5', () => {
      const sm = new ScoreManager();
      sm.newMatch(GAME_MODES.BEST_OF_5);
      sm.recordRound(RESULTS.LOSE, 'rock');
      sm.recordRound(RESULTS.LOSE, 'rock');
      sm.recordRound(RESULTS.LOSE, 'rock');
      expect(sm.isMatchOver()).toBe(true);
    });

    it('returns false when neither has enough wins', () => {
      const sm = new ScoreManager();
      sm.newMatch(GAME_MODES.BEST_OF_3);
      sm.recordRound(RESULTS.WIN, 'rock');
      sm.recordRound(RESULTS.LOSE, 'paper');
      expect(sm.isMatchOver()).toBe(false);
    });
  });

  describe('getMatchWinner', () => {
    it('returns null when match is not over', () => {
      const sm = new ScoreManager();
      sm.newMatch(GAME_MODES.BEST_OF_3);
      sm.recordRound(RESULTS.WIN, 'rock');
      expect(sm.getMatchWinner()).toBeNull();
    });

    it('returns player when player has enough wins', () => {
      const sm = new ScoreManager();
      sm.newMatch(GAME_MODES.BEST_OF_3);
      sm.recordRound(RESULTS.WIN, 'rock');
      sm.recordRound(RESULTS.WIN, 'rock');
      expect(sm.getMatchWinner()).toBe('player');
    });

    it('returns ai when ai has enough wins', () => {
      const sm = new ScoreManager();
      sm.newMatch(GAME_MODES.BEST_OF_3);
      sm.recordRound(RESULTS.LOSE, 'rock');
      sm.recordRound(RESULTS.LOSE, 'rock');
      expect(sm.getMatchWinner()).toBe('ai');
    });
  });

  describe('getScores and getLifetimeStats', () => {
    it('returns current match scores', () => {
      const sm = new ScoreManager();
      sm.recordRound(RESULTS.WIN, 'rock');
      sm.recordRound(RESULTS.LOSE, 'paper');

      const scores = sm.getScores();
      expect(scores).toEqual({
        playerScore: 1,
        aiScore: 1,
        draws: 0,
        round: 2,
        roundHistory: expect.any(Array),
      });
    });

    it('returns lifetime stats with correct values', () => {
      const sm = new ScoreManager();
      sm.recordRound(RESULTS.WIN, 'rock');
      sm.recordRound(RESULTS.WIN, 'paper');

      const stats = sm.getLifetimeStats();
      expect(stats.totalWins).toBe(2);
      expect(stats.totalRounds).toBe(2);
      expect(stats.gestureUsage.rock).toBe(1);
      expect(stats.gestureUsage.paper).toBe(1);
    });
  });
});
