import { GESTURES, RESULTS } from '../utils/constants.js';

const WINS_AGAINST = {
  [GESTURES.ROCK]: GESTURES.SCISSORS,
  [GESTURES.SCISSORS]: GESTURES.PAPER,
  [GESTURES.PAPER]: GESTURES.ROCK,
};

export function determineWinner(playerGesture, aiGesture) {
  if (playerGesture === aiGesture) return RESULTS.DRAW;
  if (WINS_AGAINST[playerGesture] === aiGesture) return RESULTS.WIN;
  return RESULTS.LOSE;
}
