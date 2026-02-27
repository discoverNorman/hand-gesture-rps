import { getFingerStates } from './fingerState.js';
import { classifyGesture } from './gestureClassifier.js';

export class HandDetector {
  constructor() {
    this._hands = null;
    this._latestResults = null;
    this._resolveDetect = null;
  }

  async init() {
    const { Hands } = await import('@mediapipe/hands');

    this._hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this._hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    this._hands.onResults((results) => this._onResults(results));
  }

  _onResults(results) {
    this._latestResults = results;
    if (this._resolveDetect) {
      this._resolveDetect(results);
      this._resolveDetect = null;
    }
  }

  async detect(videoElement) {
    if (!this._hands) return null;

    const resultsPromise = new Promise((resolve) => {
      this._resolveDetect = resolve;
    });

    await this._hands.send({ image: videoElement });

    const results = await resultsPromise;

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      return null;
    }

    const landmarks = results.multiHandLandmarks[0];
    const handedness = results.multiHandedness[0].label;
    const fingerStates = getFingerStates(landmarks, handedness);
    const { gesture, confidence } = classifyGesture(fingerStates);

    return { landmarks, gesture, confidence, handedness };
  }

  destroy() {
    if (this._hands) {
      this._hands.close();
      this._hands = null;
    }
  }
}
