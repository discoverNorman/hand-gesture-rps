import { RESULTS } from '../../utils/constants.js';

const RESULT_TEXT = {
  [RESULTS.WIN]: 'YOU WIN! 🎉',
  [RESULTS.LOSE]: 'YOU LOSE 😢',
  [RESULTS.DRAW]: 'DRAW 🤝',
};

const RESULT_CLASS = {
  [RESULTS.WIN]: 'result-banner--win',
  [RESULTS.LOSE]: 'result-banner--lose',
  [RESULTS.DRAW]: 'result-banner--draw',
};

export class ResultBanner {
  constructor(container) {
    this._container = container;
    this._el = null;
  }

  mount() {
    this._el = document.createElement('div');
    this._el.className = 'result-banner';
    this._el.style.display = 'none';
    this._container.appendChild(this._el);
  }

  show(result) {
    if (!this._el) return;
    this._el.textContent = RESULT_TEXT[result] || '';
    this._el.className = 'result-banner ' + (RESULT_CLASS[result] || '');
    this._el.style.display = 'block';
    this._el.style.animation = 'none';
    this._el.offsetHeight;
    this._el.style.animation = '';
  }

  showMatchResult(winner) {
    if (!this._el) return;
    if (winner === 'player') {
      this._el.textContent = '🏆 MATCH WON! 🏆';
      this._el.className = 'result-banner result-banner--win';
    } else {
      this._el.textContent = '💀 MATCH LOST 💀';
      this._el.className = 'result-banner result-banner--lose';
    }
    this._el.style.display = 'block';
    this._el.style.animation = 'none';
    this._el.offsetHeight;
    this._el.style.animation = '';
  }

  hide() {
    if (this._el) this._el.style.display = 'none';
  }

  unmount() {
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
  }
}
