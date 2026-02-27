import { COUNTDOWN_BEATS, COUNTDOWN_INTERVAL_MS } from '../utils/constants.js';

export class Countdown {
  constructor() {
    this._intervalId = null;
    this._currentIndex = 0;
  }

  start(onTick, onComplete) {
    this.cancel();
    this._currentIndex = 0;

    onTick(COUNTDOWN_BEATS[0], 0);
    this._currentIndex = 1;

    this._intervalId = setInterval(() => {
      const index = this._currentIndex;

      if (index < COUNTDOWN_BEATS.length) {
        onTick(COUNTDOWN_BEATS[index], index);
        this._currentIndex++;
      }

      if (this._currentIndex >= COUNTDOWN_BEATS.length) {
        this.cancel();
        onComplete();
      }
    }, COUNTDOWN_INTERVAL_MS);
  }

  cancel() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this._currentIndex = 0;
  }
}
