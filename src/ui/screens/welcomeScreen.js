import { GAME_MODES } from '../../utils/constants.js';
import { HowToPlay } from '../components/howToPlay.js';

export class WelcomeScreen {
  constructor(onAction) {
    this._onAction = onAction;
    this._el = null;
    this._howToPlay = new HowToPlay();
  }

  mount(container) {
    this._el = document.createElement('div');
    this._el.className = 'screen active';
    this._el.innerHTML = `
      <h1 class="screen-title">Rock Paper Scissors</h1>
      <p class="screen-subtitle">Show your hand to the webcam and compete against AI!</p>
      <div style="font-size: 4rem; margin: 1rem 0;">✊ ✋ ✌️</div>
      <div class="mode-select">
        <button class="btn" data-mode="${GAME_MODES.BEST_OF_3}">Best of 3</button>
        <button class="btn" data-mode="${GAME_MODES.BEST_OF_5}">Best of 5</button>
        <button class="btn" data-mode="${GAME_MODES.BEST_OF_7}">Best of 7</button>
        <button class="btn btn--secondary" data-mode="${GAME_MODES.FREE_PLAY}">Free Play</button>
      </div>
      <div style="display: flex; gap: 1rem; margin-top: 1rem;">
        <button class="btn btn--secondary" data-action="calibrate">🎯 Calibrate</button>
        <button class="btn btn--secondary" data-action="how-to-play">❓ How to Play</button>
      </div>
    `;

    this._el.addEventListener('click', (e) => {
      const mode = e.target.dataset.mode;
      if (mode) {
        this._onAction('start_game', { mode });
        return;
      }
      const action = e.target.dataset.action;
      if (action === 'calibrate') {
        this._onAction('calibrate');
      } else if (action === 'how-to-play') {
        this._howToPlay.show();
      }
    });

    container.appendChild(this._el);
  }

  unmount() {
    this._howToPlay.hide();
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
  }
}
