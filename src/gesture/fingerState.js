import { LANDMARKS } from '../utils/constants.js';

/**
 * Determines which fingers are extended based on landmark positions.
 * @param {Array<{x: number, y: number, z: number}>} landmarks - 21 hand landmarks
 * @param {string} handedness - 'Left' or 'Right'
 * @returns {boolean[]} [thumb, index, middle, ring, pinky] - true if extended
 */
export function getFingerStates(landmarks, handedness) {
  const thumb = handedness === 'Right'
    ? landmarks[LANDMARKS.THUMB_TIP].x < landmarks[LANDMARKS.THUMB_IP].x
    : landmarks[LANDMARKS.THUMB_TIP].x > landmarks[LANDMARKS.THUMB_IP].x;

  const index = landmarks[LANDMARKS.INDEX_TIP].y < landmarks[LANDMARKS.INDEX_PIP].y;
  const middle = landmarks[LANDMARKS.MIDDLE_TIP].y < landmarks[LANDMARKS.MIDDLE_PIP].y;
  const ring = landmarks[LANDMARKS.RING_TIP].y < landmarks[LANDMARKS.RING_PIP].y;
  const pinky = landmarks[LANDMARKS.PINKY_TIP].y < landmarks[LANDMARKS.PINKY_PIP].y;

  return [thumb, index, middle, ring, pinky];
}
