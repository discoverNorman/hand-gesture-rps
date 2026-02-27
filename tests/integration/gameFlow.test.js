import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GAME_STATES, GAME_MODES, GESTURES, RESULTS } from '../../src/utils/constants.js';
import { GameStateMachine } from '../../src/game/stateMachine.js';
import { ScoreManager } from '../../src/game/scoreManager.js';
import { Countdown } from '../../src/game/countdown.js';
import { determineWinner } from '../../src/game/rules.js';
import { getAIChoice } from '../../src/game/aiOpponent.js';

describe('Game Flow Integration', () => {
  let fsm;
  let scoreManager;
  let countdown;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('localStorage', {
      store: {},
      getItem(key) { return this.store[key] || null; },
      setItem(key, val) { this.store[key] = val; },
      removeItem(key) { delete this.store[key]; },
    });

    fsm = new GameStateMachine();
    scoreManager = new ScoreManager();
    countdown = new Countdown();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('completes a full round lifecycle: IDLE → COUNTDOWN → CAPTURE → RESULT → IDLE', () => {
    fsm.transition('START_GAME');
    expect(fsm.getState()).toBe(GAME_STATES.IDLE);

    fsm.transition('PLAY');
    expect(fsm.getState()).toBe(GAME_STATES.COUNTDOWN);

    // Run countdown
    const ticks = [];
    countdown.start(
      (beat, index) => ticks.push(beat),
      () => {
        fsm.transition('SHOOT');
      }
    );
    vi.advanceTimersByTime(800 * 3); // 3 more intervals after immediate first
    expect(fsm.getState()).toBe(GAME_STATES.CAPTURE);

    // Capture gesture and determine result
    const playerGesture = GESTURES.ROCK;
    const aiGesture = getAIChoice();
    const result = determineWinner(playerGesture, aiGesture);
    scoreManager.newMatch(GAME_MODES.BEST_OF_3);
    scoreManager.recordRound(result, playerGesture);

    fsm.transition('GESTURE_CAPTURED');
    expect(fsm.getState()).toBe(GAME_STATES.RESULT);

    // Next round
    fsm.transition('NEXT_ROUND');
    expect(fsm.getState()).toBe(GAME_STATES.IDLE);
  });

  it('completes a best-of-3 match to MATCH_END', () => {
    fsm.transition('START_GAME');
    scoreManager.newMatch(GAME_MODES.BEST_OF_3);

    // Simulate 2 player wins
    for (let i = 0; i < 2; i++) {
      fsm.transition('PLAY');
      fsm.transition('SHOOT');
      scoreManager.recordRound(RESULTS.WIN, GESTURES.ROCK);
      fsm.transition('GESTURE_CAPTURED');

      if (scoreManager.isMatchOver()) {
        fsm.transition('MATCH_OVER');
        break;
      }
      fsm.transition('NEXT_ROUND');
    }

    expect(fsm.getState()).toBe(GAME_STATES.MATCH_END);
    expect(scoreManager.getMatchWinner()).toBe('player');
    expect(scoreManager.getScores().playerScore).toBe(2);
  });

  it('tracks scores correctly across multiple rounds', () => {
    scoreManager.newMatch(GAME_MODES.FREE_PLAY);

    scoreManager.recordRound(RESULTS.WIN, GESTURES.ROCK);
    scoreManager.recordRound(RESULTS.LOSE, GESTURES.PAPER);
    scoreManager.recordRound(RESULTS.DRAW, GESTURES.SCISSORS);
    scoreManager.recordRound(RESULTS.WIN, GESTURES.ROCK);

    const scores = scoreManager.getScores();
    expect(scores.playerScore).toBe(2);
    expect(scores.aiScore).toBe(1);
    expect(scores.draws).toBe(1);
    expect(scores.round).toBe(4);
    expect(scores.roundHistory).toHaveLength(4);
  });

  it('persists lifetime stats across simulated sessions', () => {
    scoreManager.newMatch(GAME_MODES.BEST_OF_3);
    scoreManager.recordRound(RESULTS.WIN, GESTURES.ROCK);
    scoreManager.recordRound(RESULTS.WIN, GESTURES.PAPER);

    // Create new manager (simulates new session)
    const newManager = new ScoreManager();
    const stats = newManager.getLifetimeStats();
    expect(stats.totalWins).toBe(2);
    expect(stats.totalRounds).toBe(2);
  });

  it('allows returning home from various states', () => {
    fsm.transition('START_GAME');
    expect(fsm.getState()).toBe(GAME_STATES.IDLE);

    fsm.transition('GO_HOME');
    expect(fsm.getState()).toBe(GAME_STATES.WELCOME);
  });

  it('supports calibration flow', () => {
    fsm.transition('START_CALIBRATION');
    expect(fsm.getState()).toBe(GAME_STATES.CALIBRATION);

    fsm.transition('START_GAME');
    expect(fsm.getState()).toBe(GAME_STATES.IDLE);
  });

  it('determines all game rule outcomes correctly through integration', () => {
    const combos = [
      [GESTURES.ROCK, GESTURES.SCISSORS, RESULTS.WIN],
      [GESTURES.ROCK, GESTURES.PAPER, RESULTS.LOSE],
      [GESTURES.ROCK, GESTURES.ROCK, RESULTS.DRAW],
      [GESTURES.PAPER, GESTURES.ROCK, RESULTS.WIN],
      [GESTURES.PAPER, GESTURES.SCISSORS, RESULTS.LOSE],
      [GESTURES.PAPER, GESTURES.PAPER, RESULTS.DRAW],
      [GESTURES.SCISSORS, GESTURES.PAPER, RESULTS.WIN],
      [GESTURES.SCISSORS, GESTURES.ROCK, RESULTS.LOSE],
      [GESTURES.SCISSORS, GESTURES.SCISSORS, RESULTS.DRAW],
    ];

    for (const [player, ai, expected] of combos) {
      expect(determineWinner(player, ai)).toBe(expected);
    }
  });
});
