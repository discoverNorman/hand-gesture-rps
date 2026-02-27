import { describe, it, expect } from 'vitest';
import { GESTURES } from '../../src/utils/constants.js';
import { classifyGesture } from '../../src/gesture/gestureClassifier.js';

describe('classifyGesture', () => {
  describe('rock detection', () => {
    it('classifies closed fist [false,false,false,false,false] as rock', () => {
      const result = classifyGesture([false, false, false, false, false]);
      expect(result.gesture).toBe(GESTURES.ROCK);
    });

    it('classifies thumb-out fist [true,false,false,false,false] as rock', () => {
      const result = classifyGesture([true, false, false, false, false]);
      expect(result.gesture).toBe(GESTURES.ROCK);
    });

    it('returns confidence close to 1.0 for perfect fist', () => {
      const result = classifyGesture([false, false, false, false, false]);
      expect(result.confidence).toBeCloseTo(1.0);
    });
  });

  describe('paper detection', () => {
    it('classifies all extended [true,true,true,true,true] as paper', () => {
      const result = classifyGesture([true, true, true, true, true]);
      expect(result.gesture).toBe(GESTURES.PAPER);
    });

    it('classifies 4 extended [false,true,true,true,true] as paper', () => {
      const result = classifyGesture([false, true, true, true, true]);
      expect(result.gesture).toBe(GESTURES.PAPER);
    });

    it('returns confidence of 1.0 for 5 extended fingers', () => {
      const result = classifyGesture([true, true, true, true, true]);
      expect(result.confidence).toBe(1.0);
    });

    it('returns confidence of 0.8 for 4 extended fingers', () => {
      const result = classifyGesture([false, true, true, true, true]);
      expect(result.confidence).toBe(0.8);
    });
  });

  describe('scissors detection', () => {
    it('classifies [false,true,true,false,false] as scissors', () => {
      const result = classifyGesture([false, true, true, false, false]);
      expect(result.gesture).toBe(GESTURES.SCISSORS);
    });

    it('classifies [true,true,true,false,false] as scissors', () => {
      const result = classifyGesture([true, true, true, false, false]);
      expect(result.gesture).toBe(GESTURES.SCISSORS);
    });

    it('returns confidence of 0.9 for scissors', () => {
      const result = classifyGesture([false, true, true, false, false]);
      expect(result.confidence).toBe(0.9);
    });
  });

  describe('no gesture', () => {
    it('returns NONE when exactly 3 fingers extended [false,true,true,true,false]', () => {
      const result = classifyGesture([false, true, true, true, false]);
      expect(result.gesture).toBe(GESTURES.NONE);
    });

    it('returns NONE with confidence 0', () => {
      const result = classifyGesture([false, true, true, true, false]);
      expect(result.confidence).toBe(0);
    });
  });

  describe('priority', () => {
    it('checks scissors before rock for [false,true,true,false,false]', () => {
      const result = classifyGesture([false, true, true, false, false]);
      expect(result.gesture).toBe(GESTURES.SCISSORS);
    });
  });
});
