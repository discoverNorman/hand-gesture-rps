import { GESTURES, GESTURE_CONFIDENCE_THRESHOLD } from '../utils/constants.js';

/**
 * Classifies a gesture from finger states.
 * @param {boolean[]} fingerStates - [thumb, index, middle, ring, pinky]
 * @returns {{ gesture: string, confidence: number }}
 */
export function classifyGesture(fingerStates) {
  const [thumb, index, middle, ring, pinky] = fingerStates;
  const extendedCount = fingerStates.filter(Boolean).length;

  // Scissors: index and middle extended, ring and pinky closed
  if (index && middle && !ring && !pinky) {
    const confidence = 0.9;
    if (confidence >= GESTURE_CONFIDENCE_THRESHOLD) {
      return { gesture: GESTURES.SCISSORS, confidence };
    }
  }

  // Rock: fist (0 extended) or only thumb out
  if (extendedCount === 0 || (extendedCount === 1 && thumb)) {
    const confidence = 1 - (extendedCount * 0.15);
    if (confidence >= GESTURE_CONFIDENCE_THRESHOLD) {
      return { gesture: GESTURES.ROCK, confidence };
    }
  }

  // Paper: 4 or 5 fingers extended
  if (extendedCount >= 4) {
    const confidence = extendedCount / 5;
    if (confidence >= GESTURE_CONFIDENCE_THRESHOLD) {
      return { gesture: GESTURES.PAPER, confidence };
    }
  }

  return { gesture: GESTURES.NONE, confidence: 0 };
}
