import { describe, it, expect } from 'vitest';
import { GESTURES, RESULTS } from '../../src/utils/constants.js';
import { determineWinner } from '../../src/game/rules.js';

describe('determineWinner', () => {
  describe('player wins', () => {
    it('returns WIN when rock beats scissors', () => {
      expect(determineWinner(GESTURES.ROCK, GESTURES.SCISSORS)).toBe(RESULTS.WIN);
    });

    it('returns WIN when scissors beats paper', () => {
      expect(determineWinner(GESTURES.SCISSORS, GESTURES.PAPER)).toBe(RESULTS.WIN);
    });

    it('returns WIN when paper beats rock', () => {
      expect(determineWinner(GESTURES.PAPER, GESTURES.ROCK)).toBe(RESULTS.WIN);
    });
  });

  describe('player loses', () => {
    it('returns LOSE when scissors loses to rock', () => {
      expect(determineWinner(GESTURES.SCISSORS, GESTURES.ROCK)).toBe(RESULTS.LOSE);
    });

    it('returns LOSE when paper loses to scissors', () => {
      expect(determineWinner(GESTURES.PAPER, GESTURES.SCISSORS)).toBe(RESULTS.LOSE);
    });

    it('returns LOSE when rock loses to paper', () => {
      expect(determineWinner(GESTURES.ROCK, GESTURES.PAPER)).toBe(RESULTS.LOSE);
    });
  });

  describe('draws', () => {
    it('returns DRAW when both play rock', () => {
      expect(determineWinner(GESTURES.ROCK, GESTURES.ROCK)).toBe(RESULTS.DRAW);
    });

    it('returns DRAW when both play paper', () => {
      expect(determineWinner(GESTURES.PAPER, GESTURES.PAPER)).toBe(RESULTS.DRAW);
    });

    it('returns DRAW when both play scissors', () => {
      expect(determineWinner(GESTURES.SCISSORS, GESTURES.SCISSORS)).toBe(RESULTS.DRAW);
    });
  });

  it('covers all 9 combinations correctly', () => {
    const gestures = [GESTURES.ROCK, GESTURES.PAPER, GESTURES.SCISSORS];
    const expected = {
      [`${GESTURES.ROCK}-${GESTURES.ROCK}`]: RESULTS.DRAW,
      [`${GESTURES.ROCK}-${GESTURES.PAPER}`]: RESULTS.LOSE,
      [`${GESTURES.ROCK}-${GESTURES.SCISSORS}`]: RESULTS.WIN,
      [`${GESTURES.PAPER}-${GESTURES.ROCK}`]: RESULTS.WIN,
      [`${GESTURES.PAPER}-${GESTURES.PAPER}`]: RESULTS.DRAW,
      [`${GESTURES.PAPER}-${GESTURES.SCISSORS}`]: RESULTS.LOSE,
      [`${GESTURES.SCISSORS}-${GESTURES.ROCK}`]: RESULTS.LOSE,
      [`${GESTURES.SCISSORS}-${GESTURES.PAPER}`]: RESULTS.WIN,
      [`${GESTURES.SCISSORS}-${GESTURES.SCISSORS}`]: RESULTS.DRAW,
    };

    for (const player of gestures) {
      for (const ai of gestures) {
        const key = `${player}-${ai}`;
        expect(determineWinner(player, ai)).toBe(expected[key]);
      }
    }
  });
});
