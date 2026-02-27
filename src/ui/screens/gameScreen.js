import { GESTURES, RESULTS } from '../../utils/constants.js';
import { WebcamView } from '../components/webcamView.js';
import { Scoreboard } from '../components/scoreboard.js';
import { CountdownDisplay } from '../components/countdownDisplay.js';
import { AIHand } from '../components/aiHand.js';
import { ResultBanner } from '../components/resultBanner.js';

const GESTURE_EMOJI = {
  [GESTURES.ROCK]: '✊',
  [GESTURES.PAPER]: '✋',
  [GESTURES.SCISSORS]: '✌️',
  [GESTURES.NONE]: '❓',
};

export class GameScreen {
  constructor(onAction) {
    this._onAction = onAction;
    this._el = null;
    this._webcam = null;
    this._scoreboard = null;
    this._countdown = null;
    this._aiHand = null;
    this._resultBanner = null;
    this._playBtn = null;
    this._nextBtn = null;
    this._homeBtn = null;
    this._roundInfo = null;
    this._playerGestureDisplay = null;
  }

  mount(container) {
    this._el = document.createElement('div');
    this._el.className = 'screen active';

    // Scoreboard area
    const scoreArea = document.createElement('div');
    scoreArea.style.width = '100%';
    this._scoreboard = new Scoreboard(scoreArea);
    this._scoreboard.mount();

    // Round info
    this._roundInfo = document.createElement('div');
    this._roundInfo.className = 'score-label';
    this._roundInfo.style.textAlign = 'center';
    this._roundInfo.style.marginBottom = '0.5rem';
    this._roundInfo.textContent = 'Round 0';

    // Round history dots
    this._historyEl = document.createElement('div');
    this._historyEl.className = 'round-history';

    // Game area (player | vs | ai)
    const gameArea = document.createElement('div');
    gameArea.className = 'game-area';

    // Player side
    const playerSide = document.createElement('div');
    playerSide.className = 'player-side';
    const playerLabel = document.createElement('div');
    playerLabel.className = 'score-label';
    playerLabel.textContent = 'YOU';
    this._webcam = new WebcamView(playerSide);
    this._webcam.mount();
    this._playerGestureDisplay = document.createElement('div');
    this._playerGestureDisplay.style.fontSize = '3rem';
    this._playerGestureDisplay.textContent = '';
    playerSide.insertBefore(playerLabel, playerSide.firstChild);
    playerSide.appendChild(this._playerGestureDisplay);

    // VS / countdown area
    const vsArea = document.createElement('div');
    vsArea.className = 'vs-area';
    this._countdown = new CountdownDisplay(vsArea);
    this._countdown.mount();
    this._resultBanner = new ResultBanner(vsArea);
    this._resultBanner.mount();

    // AI side
    const aiSide = document.createElement('div');
    aiSide.className = 'ai-side';
    const aiLabel = document.createElement('div');
    aiLabel.className = 'score-label';
    aiLabel.textContent = 'AI';
    aiSide.appendChild(aiLabel);
    this._aiHand = new AIHand(aiSide);
    this._aiHand.mount();

    gameArea.appendChild(playerSide);
    gameArea.appendChild(vsArea);
    gameArea.appendChild(aiSide);

    // Buttons
    const btnArea = document.createElement('div');
    btnArea.style.display = 'flex';
    btnArea.style.gap = '1rem';
    btnArea.style.marginTop = '1rem';

    this._playBtn = document.createElement('button');
    this._playBtn.className = 'btn';
    this._playBtn.textContent = '▶ Play Round';
    this._playBtn.addEventListener('click', () => this._onAction('play'));

    this._nextBtn = document.createElement('button');
    this._nextBtn.className = 'btn';
    this._nextBtn.textContent = 'Next Round →';
    this._nextBtn.style.display = 'none';
    this._nextBtn.addEventListener('click', () => this._onAction('next_round'));

    this._homeBtn = document.createElement('button');
    this._homeBtn.className = 'btn btn--secondary';
    this._homeBtn.textContent = '🏠 Home';
    this._homeBtn.addEventListener('click', () => this._onAction('go_home'));

    btnArea.appendChild(this._playBtn);
    btnArea.appendChild(this._nextBtn);
    btnArea.appendChild(this._homeBtn);

    this._el.appendChild(this._roundInfo);
    this._el.appendChild(this._historyEl);
    this._el.appendChild(scoreArea);
    this._el.appendChild(gameArea);
    this._el.appendChild(btnArea);

    container.appendChild(this._el);
  }

  async startCamera() {
    if (this._webcam) await this._webcam.startCamera();
  }

  getVideoElement() {
    return this._webcam ? this._webcam.getVideoElement() : null;
  }

  drawLandmarks(landmarks) {
    if (this._webcam) this._webcam.drawLandmarks(landmarks);
  }

  clearCanvas() {
    if (this._webcam) this._webcam.clearCanvas();
  }

  setGestureLabel(text) {
    if (this._webcam) this._webcam.setGestureLabel(text);
  }

  showPlayerGesture(gesture) {
    if (this._playerGestureDisplay) {
      this._playerGestureDisplay.textContent = GESTURE_EMOJI[gesture] || '';
    }
  }

  updateScores(scores) {
    if (this._scoreboard) this._scoreboard.update(scores);
    if (this._roundInfo) this._roundInfo.textContent = `Round ${scores.round}`;
    if (this._historyEl) {
      this._historyEl.innerHTML = scores.roundHistory
        .map((r) => `<div class="round-dot round-dot--${r.result}"></div>`)
        .join('');
    }
  }

  showCountdown(text) {
    this._resultBanner.hide();
    this._countdown.show(text);
    this._playBtn.style.display = 'none';
    this._nextBtn.style.display = 'none';
    this._aiHand.showThinking();
    this._playerGestureDisplay.textContent = '';
  }

  hideCountdown() {
    this._countdown.hide();
  }

  showResult(result, aiGesture) {
    this._countdown.hide();
    this._aiHand.reveal(aiGesture);
    this._resultBanner.show(result);
    this._playBtn.style.display = 'none';
    this._nextBtn.style.display = 'inline-block';

    // Flash overlay
    const flash = document.createElement('div');
    flash.className = `flash-overlay flash-overlay--${result === RESULTS.DRAW ? 'win' : result}`;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }

  showMatchEnd(winner) {
    this._countdown.hide();
    this._resultBanner.showMatchResult(winner);
    this._playBtn.style.display = 'none';
    this._nextBtn.style.display = 'none';
  }

  setIdleState() {
    this._resultBanner.hide();
    this._countdown.hide();
    this._aiHand.reset();
    this._playBtn.style.display = 'inline-block';
    this._nextBtn.style.display = 'none';
    this._playerGestureDisplay.textContent = '';
  }

  unmount() {
    if (this._webcam) this._webcam.unmount();
    if (this._scoreboard) this._scoreboard.unmount();
    if (this._countdown) this._countdown.unmount();
    if (this._aiHand) this._aiHand.unmount();
    if (this._resultBanner) this._resultBanner.unmount();
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
  }
}
