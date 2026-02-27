import { GESTURES } from '../../utils/constants.js';

const GESTURE_EMOJI = {
  [GESTURES.ROCK]: '✊',
  [GESTURES.PAPER]: '✋',
  [GESTURES.SCISSORS]: '✌️',
};

export class AIHand {
  constructor(container) {
    this._container = container;
    this._el = null;
  }

  mount() {
    this._el = document.createElement('div');
    this._el.className = 'ai-hand';
    this._el.textContent = '❓';
    this._container.appendChild(this._el);
  }

  showThinking() {
    if (!this._el) return;
    this._el.textContent = '🤔';
    this._el.classList.remove('ai-hand--reveal');
  }

  reveal(gesture) {
    if (!this._el) return;
    this._el.textContent = GESTURE_EMOJI[gesture] || '❓';
    this._el.classList.remove('ai-hand--reveal');
    this._el.offsetHeight; // force reflow
    this._el.classList.add('ai-hand--reveal');
  }

  reset() {
    if (!this._el) return;
    this._el.textContent = '❓';
    this._el.classList.remove('ai-hand--reveal');
  }

  unmount() {
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
  }
}
