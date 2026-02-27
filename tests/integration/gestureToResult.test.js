import { describe, it, expect } from 'vitest';
import { GESTURES, RESULTS, LANDMARKS } from '../../src/utils/constants.js';
import { getFingerStates } from '../../src/gesture/fingerState.js';
import { classifyGesture } from '../../src/gesture/gestureClassifier.js';
import { determineWinner } from '../../src/game/rules.js';

function createLandmarks() {
  return Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
}

function makeRockLandmarks() {
  const lm = createLandmarks();
  // All tips below pips (curled)
  lm[LANDMARKS.THUMB_TIP] = { x: 0.55, y: 0.5, z: 0 }; // not extended for Right hand (tip.x > ip.x)
  lm[LANDMARKS.THUMB_IP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.INDEX_TIP] = { x: 0.5, y: 0.7, z: 0 };
  lm[LANDMARKS.INDEX_PIP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.MIDDLE_TIP] = { x: 0.5, y: 0.7, z: 0 };
  lm[LANDMARKS.MIDDLE_PIP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.RING_TIP] = { x: 0.5, y: 0.7, z: 0 };
  lm[LANDMARKS.RING_PIP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.PINKY_TIP] = { x: 0.5, y: 0.7, z: 0 };
  lm[LANDMARKS.PINKY_PIP] = { x: 0.5, y: 0.5, z: 0 };
  return lm;
}

function makePaperLandmarks() {
  const lm = createLandmarks();
  // All tips above pips (extended)
  lm[LANDMARKS.THUMB_TIP] = { x: 0.3, y: 0.5, z: 0 }; // extended for Right hand
  lm[LANDMARKS.THUMB_IP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.INDEX_TIP] = { x: 0.5, y: 0.3, z: 0 };
  lm[LANDMARKS.INDEX_PIP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.MIDDLE_TIP] = { x: 0.5, y: 0.3, z: 0 };
  lm[LANDMARKS.MIDDLE_PIP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.RING_TIP] = { x: 0.5, y: 0.3, z: 0 };
  lm[LANDMARKS.RING_PIP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.PINKY_TIP] = { x: 0.5, y: 0.3, z: 0 };
  lm[LANDMARKS.PINKY_PIP] = { x: 0.5, y: 0.5, z: 0 };
  return lm;
}

function makeScissorsLandmarks() {
  const lm = createLandmarks();
  // Index + middle extended, others curled
  lm[LANDMARKS.THUMB_TIP] = { x: 0.55, y: 0.5, z: 0 }; // not extended
  lm[LANDMARKS.THUMB_IP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.INDEX_TIP] = { x: 0.5, y: 0.3, z: 0 };  // extended
  lm[LANDMARKS.INDEX_PIP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.MIDDLE_TIP] = { x: 0.5, y: 0.3, z: 0 };  // extended
  lm[LANDMARKS.MIDDLE_PIP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.RING_TIP] = { x: 0.5, y: 0.7, z: 0 };    // curled
  lm[LANDMARKS.RING_PIP] = { x: 0.5, y: 0.5, z: 0 };
  lm[LANDMARKS.PINKY_TIP] = { x: 0.5, y: 0.7, z: 0 };   // curled
  lm[LANDMARKS.PINKY_PIP] = { x: 0.5, y: 0.5, z: 0 };
  return lm;
}

describe('Gesture to Result Pipeline', () => {
  describe('landmark → finger state → gesture classification', () => {
    it('classifies rock landmarks as ROCK', () => {
      const lm = makeRockLandmarks();
      const fingers = getFingerStates(lm, 'Right');
      const { gesture } = classifyGesture(fingers);
      expect(gesture).toBe(GESTURES.ROCK);
    });

    it('classifies paper landmarks as PAPER', () => {
      const lm = makePaperLandmarks();
      const fingers = getFingerStates(lm, 'Right');
      const { gesture } = classifyGesture(fingers);
      expect(gesture).toBe(GESTURES.PAPER);
    });

    it('classifies scissors landmarks as SCISSORS', () => {
      const lm = makeScissorsLandmarks();
      const fingers = getFingerStates(lm, 'Right');
      const { gesture } = classifyGesture(fingers);
      expect(gesture).toBe(GESTURES.SCISSORS);
    });
  });

  describe('full pipeline: landmarks → gesture → result', () => {
    it('rock beats scissors through the full pipeline', () => {
      const rockLm = makeRockLandmarks();
      const fingers = getFingerStates(rockLm, 'Right');
      const { gesture: playerGesture } = classifyGesture(fingers);
      const result = determineWinner(playerGesture, GESTURES.SCISSORS);
      expect(result).toBe(RESULTS.WIN);
    });

    it('paper beats rock through the full pipeline', () => {
      const paperLm = makePaperLandmarks();
      const fingers = getFingerStates(paperLm, 'Right');
      const { gesture: playerGesture } = classifyGesture(fingers);
      const result = determineWinner(playerGesture, GESTURES.ROCK);
      expect(result).toBe(RESULTS.WIN);
    });

    it('scissors beats paper through the full pipeline', () => {
      const scissorsLm = makeScissorsLandmarks();
      const fingers = getFingerStates(scissorsLm, 'Right');
      const { gesture: playerGesture } = classifyGesture(fingers);
      const result = determineWinner(playerGesture, GESTURES.PAPER);
      expect(result).toBe(RESULTS.WIN);
    });

    it('same gesture results in draw through the full pipeline', () => {
      const rockLm = makeRockLandmarks();
      const fingers = getFingerStates(rockLm, 'Right');
      const { gesture: playerGesture } = classifyGesture(fingers);
      const result = determineWinner(playerGesture, GESTURES.ROCK);
      expect(result).toBe(RESULTS.DRAW);
    });
  });

  describe('left hand support', () => {
    it('correctly detects gestures from left hand landmarks', () => {
      const lm = makePaperLandmarks();
      // Adjust thumb for left hand (tip.x > ip.x means extended)
      lm[LANDMARKS.THUMB_TIP] = { x: 0.7, y: 0.5, z: 0 };
      lm[LANDMARKS.THUMB_IP] = { x: 0.5, y: 0.5, z: 0 };
      const fingers = getFingerStates(lm, 'Left');
      const { gesture } = classifyGesture(fingers);
      expect(gesture).toBe(GESTURES.PAPER);
    });
  });
});
