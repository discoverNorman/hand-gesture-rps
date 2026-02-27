import { RESULTS } from '../../utils/constants.js';

export class Scoreboard {
  constructor(container) {
    this._container = container;
    this._el = null;
  }

  mount() {
    this._el = document.createElement('div');
    this._el.className = 'scoreboard';
    this._el.innerHTML = `
      <div class="score-item">
        <div class="score-value" data-score="player">0</div>
        <div class="score-label">You</div>
      </div>
      <div class="score-item">
        <div class="score-value" data-score="draws">0</div>
        <div class="score-label">Draws</div>
      </div>
      <div class="score-item">
        <div class="score-value" data-score="ai">0</div>
        <div class="score-label">AI</div>
      </div>
    `;
    this._container.appendChild(this._el);
  }

  update(scores) {
    if (!this._el) return;
    this._el.querySelector('[data-score="player"]').textContent = scores.playerScore;
    this._el.querySelector('[data-score="ai"]').textContent = scores.aiScore;
    this._el.querySelector('[data-score="draws"]').textContent = scores.draws;
  }

  unmount() {
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
  }
}
