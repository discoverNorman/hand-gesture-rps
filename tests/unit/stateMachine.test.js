import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GAME_STATES } from '../../src/utils/constants.js';
import { GameStateMachine } from '../../src/game/stateMachine.js';

describe('GameStateMachine', () => {
  let sm;

  beforeEach(() => {
    sm = new GameStateMachine();
  });

  it('starts in WELCOME state', () => {
    expect(sm.getState()).toBe(GAME_STATES.WELCOME);
  });

  describe('valid transitions', () => {
    it('transitions from WELCOME to CALIBRATION on START_CALIBRATION', () => {
      sm.transition('START_CALIBRATION');
      expect(sm.getState()).toBe(GAME_STATES.CALIBRATION);
    });

    it('transitions from WELCOME to IDLE on START_GAME', () => {
      sm.transition('START_GAME');
      expect(sm.getState()).toBe(GAME_STATES.IDLE);
    });

    it('transitions from CALIBRATION to IDLE on START_GAME', () => {
      sm.transition('START_CALIBRATION');
      sm.transition('START_GAME');
      expect(sm.getState()).toBe(GAME_STATES.IDLE);
    });

    it('transitions from IDLE to COUNTDOWN on PLAY', () => {
      sm.transition('START_GAME');
      sm.transition('PLAY');
      expect(sm.getState()).toBe(GAME_STATES.COUNTDOWN);
    });

    it('transitions from COUNTDOWN to CAPTURE on SHOOT', () => {
      sm.transition('START_GAME');
      sm.transition('PLAY');
      sm.transition('SHOOT');
      expect(sm.getState()).toBe(GAME_STATES.CAPTURE);
    });

    it('transitions from CAPTURE to RESULT on GESTURE_CAPTURED', () => {
      sm.transition('START_GAME');
      sm.transition('PLAY');
      sm.transition('SHOOT');
      sm.transition('GESTURE_CAPTURED');
      expect(sm.getState()).toBe(GAME_STATES.RESULT);
    });

    it('transitions from RESULT to IDLE on NEXT_ROUND', () => {
      sm.transition('START_GAME');
      sm.transition('PLAY');
      sm.transition('SHOOT');
      sm.transition('GESTURE_CAPTURED');
      sm.transition('NEXT_ROUND');
      expect(sm.getState()).toBe(GAME_STATES.IDLE);
    });

    it('transitions from RESULT to MATCH_END on MATCH_OVER', () => {
      sm.transition('START_GAME');
      sm.transition('PLAY');
      sm.transition('SHOOT');
      sm.transition('GESTURE_CAPTURED');
      sm.transition('MATCH_OVER');
      expect(sm.getState()).toBe(GAME_STATES.MATCH_END);
    });

    it('transitions from MATCH_END to IDLE on PLAY_AGAIN', () => {
      sm.transition('START_GAME');
      sm.transition('PLAY');
      sm.transition('SHOOT');
      sm.transition('GESTURE_CAPTURED');
      sm.transition('MATCH_OVER');
      sm.transition('PLAY_AGAIN');
      expect(sm.getState()).toBe(GAME_STATES.IDLE);
    });

    it('transitions from MATCH_END to WELCOME on GO_HOME', () => {
      sm.transition('START_GAME');
      sm.transition('PLAY');
      sm.transition('SHOOT');
      sm.transition('GESTURE_CAPTURED');
      sm.transition('MATCH_OVER');
      sm.transition('GO_HOME');
      expect(sm.getState()).toBe(GAME_STATES.WELCOME);
    });

    it('transitions from IDLE to WELCOME on GO_HOME', () => {
      sm.transition('START_GAME');
      sm.transition('GO_HOME');
      expect(sm.getState()).toBe(GAME_STATES.WELCOME);
    });
  });

  describe('invalid transitions', () => {
    it('throws on invalid event name', () => {
      expect(() => sm.transition('BOGUS_EVENT')).toThrow('Invalid event');
    });

    it('throws when PLAY is called from WELCOME', () => {
      expect(() => sm.transition('PLAY')).toThrow('Invalid transition');
    });

    it('throws when SHOOT is called from IDLE', () => {
      sm.transition('START_GAME');
      expect(() => sm.transition('SHOOT')).toThrow('Invalid transition');
    });
  });

  describe('subscribers', () => {
    it('notifies subscribers on transition', () => {
      const subscriber = vi.fn();
      sm.subscribe(subscriber);

      sm.transition('START_GAME');

      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it('passes new state and event to subscribers', () => {
      const subscriber = vi.fn();
      sm.subscribe(subscriber);

      sm.transition('START_CALIBRATION');

      expect(subscriber).toHaveBeenCalledWith(GAME_STATES.CALIBRATION, 'START_CALIBRATION');
    });

    it('supports unsubscribe', () => {
      const subscriber = vi.fn();
      const unsubscribe = sm.subscribe(subscriber);

      expect(typeof unsubscribe).toBe('function');
    });

    it('does not notify after unsubscribe', () => {
      const subscriber = vi.fn();
      const unsubscribe = sm.subscribe(subscriber);

      unsubscribe();
      sm.transition('START_GAME');

      expect(subscriber).not.toHaveBeenCalled();
    });
  });
});
