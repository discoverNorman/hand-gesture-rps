import { GESTURES } from '../utils/constants.js';

const CHOICES = [GESTURES.ROCK, GESTURES.PAPER, GESTURES.SCISSORS];

export function getAIChoice() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return CHOICES[array[0] % 3];
}
