import { describe, it, expect, vi } from 'vitest';
import { GESTURES } from '../../src/utils/constants.js';
import { getAIChoice } from '../../src/game/aiOpponent.js';

describe('getAIChoice', () => {
  it('returns a valid gesture (rock, paper, or scissors)', () => {
    const result = getAIChoice();
    expect([GESTURES.ROCK, GESTURES.PAPER, GESTURES.SCISSORS]).toContain(result);
  });

  it('never returns NONE', () => {
    for (let i = 0; i < 50; i++) {
      expect(getAIChoice()).not.toBe(GESTURES.NONE);
    }
  });

  it('produces all three gestures over many trials', () => {
    const seen = new Set();
    for (let i = 0; i < 100; i++) {
      seen.add(getAIChoice());
    }
    expect(seen).toContain(GESTURES.ROCK);
    expect(seen).toContain(GESTURES.PAPER);
    expect(seen).toContain(GESTURES.SCISSORS);
  });

  it('uses crypto.getRandomValues for randomness', () => {
    const spy = vi.spyOn(crypto, 'getRandomValues');
    getAIChoice();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
