import { describe, it, expect } from 'vitest';
import { LANDMARKS } from '../../src/utils/constants.js';
import { getFingerStates } from '../../src/gesture/fingerState.js';

function createMockLandmarks() {
  return Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
}

describe('getFingerStates', () => {
  describe('finger extension detection', () => {
    it('detects index finger as extended when tip is above pip', () => {
      const landmarks = createMockLandmarks();
      landmarks[LANDMARKS.INDEX_TIP].y = 0.3;
      landmarks[LANDMARKS.INDEX_PIP].y = 0.5;

      const states = getFingerStates(landmarks, 'Right');
      expect(states[1]).toBe(true);
    });

    it('detects index finger as curled when tip is below pip', () => {
      const landmarks = createMockLandmarks();
      landmarks[LANDMARKS.INDEX_TIP].y = 0.7;
      landmarks[LANDMARKS.INDEX_PIP].y = 0.5;

      const states = getFingerStates(landmarks, 'Right');
      expect(states[1]).toBe(false);
    });

    it('detects all fingers extended for open hand', () => {
      const landmarks = createMockLandmarks();
      // Thumb extended (right hand: tip.x < ip.x)
      landmarks[LANDMARKS.THUMB_TIP].x = 0.3;
      landmarks[LANDMARKS.THUMB_IP].x = 0.5;
      // All finger tips above their pips
      landmarks[LANDMARKS.INDEX_TIP].y = 0.3;
      landmarks[LANDMARKS.INDEX_PIP].y = 0.5;
      landmarks[LANDMARKS.MIDDLE_TIP].y = 0.3;
      landmarks[LANDMARKS.MIDDLE_PIP].y = 0.5;
      landmarks[LANDMARKS.RING_TIP].y = 0.3;
      landmarks[LANDMARKS.RING_PIP].y = 0.5;
      landmarks[LANDMARKS.PINKY_TIP].y = 0.3;
      landmarks[LANDMARKS.PINKY_PIP].y = 0.5;

      const states = getFingerStates(landmarks, 'Right');
      expect(states).toEqual([true, true, true, true, true]);
    });

    it('detects all fingers curled for closed fist', () => {
      const landmarks = createMockLandmarks();
      // Thumb curled (right hand: tip.x > ip.x)
      landmarks[LANDMARKS.THUMB_TIP].x = 0.7;
      landmarks[LANDMARKS.THUMB_IP].x = 0.5;
      // All finger tips below their pips
      landmarks[LANDMARKS.INDEX_TIP].y = 0.7;
      landmarks[LANDMARKS.INDEX_PIP].y = 0.5;
      landmarks[LANDMARKS.MIDDLE_TIP].y = 0.7;
      landmarks[LANDMARKS.MIDDLE_PIP].y = 0.5;
      landmarks[LANDMARKS.RING_TIP].y = 0.7;
      landmarks[LANDMARKS.RING_PIP].y = 0.5;
      landmarks[LANDMARKS.PINKY_TIP].y = 0.7;
      landmarks[LANDMARKS.PINKY_PIP].y = 0.5;

      const states = getFingerStates(landmarks, 'Right');
      expect(states).toEqual([false, false, false, false, false]);
    });
  });

  describe('thumb detection with handedness', () => {
    it('detects right hand thumb extended when tip.x < ip.x', () => {
      const landmarks = createMockLandmarks();
      landmarks[LANDMARKS.THUMB_TIP].x = 0.3;
      landmarks[LANDMARKS.THUMB_IP].x = 0.5;

      const states = getFingerStates(landmarks, 'Right');
      expect(states[0]).toBe(true);
    });

    it('detects left hand thumb extended when tip.x > ip.x', () => {
      const landmarks = createMockLandmarks();
      landmarks[LANDMARKS.THUMB_TIP].x = 0.7;
      landmarks[LANDMARKS.THUMB_IP].x = 0.5;

      const states = getFingerStates(landmarks, 'Left');
      expect(states[0]).toBe(true);
    });
  });

  describe('gesture shapes', () => {
    it('returns [false, false, false, false, false] for a closed fist', () => {
      const landmarks = createMockLandmarks();
      // Thumb curled (right hand)
      landmarks[LANDMARKS.THUMB_TIP].x = 0.7;
      landmarks[LANDMARKS.THUMB_IP].x = 0.5;
      // All tips below pips
      landmarks[LANDMARKS.INDEX_TIP].y = 0.7;
      landmarks[LANDMARKS.INDEX_PIP].y = 0.5;
      landmarks[LANDMARKS.MIDDLE_TIP].y = 0.7;
      landmarks[LANDMARKS.MIDDLE_PIP].y = 0.5;
      landmarks[LANDMARKS.RING_TIP].y = 0.7;
      landmarks[LANDMARKS.RING_PIP].y = 0.5;
      landmarks[LANDMARKS.PINKY_TIP].y = 0.7;
      landmarks[LANDMARKS.PINKY_PIP].y = 0.5;

      expect(getFingerStates(landmarks, 'Right')).toEqual([false, false, false, false, false]);
    });

    it('returns [true, true, true, true, true] for open hand', () => {
      const landmarks = createMockLandmarks();
      landmarks[LANDMARKS.THUMB_TIP].x = 0.3;
      landmarks[LANDMARKS.THUMB_IP].x = 0.5;
      landmarks[LANDMARKS.INDEX_TIP].y = 0.3;
      landmarks[LANDMARKS.INDEX_PIP].y = 0.5;
      landmarks[LANDMARKS.MIDDLE_TIP].y = 0.3;
      landmarks[LANDMARKS.MIDDLE_PIP].y = 0.5;
      landmarks[LANDMARKS.RING_TIP].y = 0.3;
      landmarks[LANDMARKS.RING_PIP].y = 0.5;
      landmarks[LANDMARKS.PINKY_TIP].y = 0.3;
      landmarks[LANDMARKS.PINKY_PIP].y = 0.5;

      expect(getFingerStates(landmarks, 'Right')).toEqual([true, true, true, true, true]);
    });

    it('returns [*, true, true, false, false] for scissors', () => {
      const landmarks = createMockLandmarks();
      // Only index and middle extended
      landmarks[LANDMARKS.INDEX_TIP].y = 0.3;
      landmarks[LANDMARKS.INDEX_PIP].y = 0.5;
      landmarks[LANDMARKS.MIDDLE_TIP].y = 0.3;
      landmarks[LANDMARKS.MIDDLE_PIP].y = 0.5;
      // Ring and pinky curled
      landmarks[LANDMARKS.RING_TIP].y = 0.7;
      landmarks[LANDMARKS.RING_PIP].y = 0.5;
      landmarks[LANDMARKS.PINKY_TIP].y = 0.7;
      landmarks[LANDMARKS.PINKY_PIP].y = 0.5;

      const states = getFingerStates(landmarks, 'Right');
      expect(states[1]).toBe(true);
      expect(states[2]).toBe(true);
      expect(states[3]).toBe(false);
      expect(states[4]).toBe(false);
    });
  });
});
