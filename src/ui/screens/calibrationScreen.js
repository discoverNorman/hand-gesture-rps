import { GESTURES } from '../../utils/constants.js';
import { WebcamView } from '../components/webcamView.js';

const CALIBRATION_GESTURES = [
  { gesture: GESTURES.ROCK, emoji: '✊', name: 'Rock', description: 'Close your fist' },
  { gesture: GESTURES.PAPER, emoji: '✋', name: 'Paper', description: 'Open your hand wide' },
  { gesture: GESTURES.SCISSORS, emoji: '✌️', name: 'Scissors', description: 'Extend index + middle finger' },
];

export class CalibrationScreen {
  constructor(onAction) {
    this._onAction = onAction;
    this._el = null;
    this._webcam = null;
    this._detected = new Set();
    this._cards = {};
    this._readyBtn = null;
  }

  mount(container) {
    this._el = document.createElement('div');
    this._el.className = 'screen active';
    this._detected = new Set();

    const title = document.createElement('h1');
    title.className = 'screen-title';
    title.textContent = 'Calibration';

    const subtitle = document.createElement('p');
    subtitle.className = 'screen-subtitle';
    subtitle.textContent = 'Show each gesture to verify detection. All three must be recognized.';

    // Webcam
    const webcamArea = document.createElement('div');
    this._webcam = new WebcamView(webcamArea);
    this._webcam.mount();

    // Gesture cards
    const cardsArea = document.createElement('div');
    cardsArea.className = 'calibration-cards';

    for (const g of CALIBRATION_GESTURES) {
      const card = document.createElement('div');
      card.className = 'calibration-card';
      card.dataset.gesture = g.gesture;
      card.innerHTML = `
        <div class="gesture-emoji">${g.emoji}</div>
        <div class="gesture-name">${g.name}</div>
        <div class="score-label">${g.description}</div>
      `;
      cardsArea.appendChild(card);
      this._cards[g.gesture] = card;
    }

    // Buttons
    const btnArea = document.createElement('div');
    btnArea.style.display = 'flex';
    btnArea.style.gap = '1rem';

    this._readyBtn = document.createElement('button');
    this._readyBtn.className = 'btn';
    this._readyBtn.textContent = '✅ Ready to Play';
    this._readyBtn.disabled = true;
    this._readyBtn.style.opacity = '0.5';
    this._readyBtn.addEventListener('click', () => this._onAction('ready'));

    const backBtn = document.createElement('button');
    backBtn.className = 'btn btn--secondary';
    backBtn.textContent = '← Back';
    backBtn.addEventListener('click', () => this._onAction('back'));

    btnArea.appendChild(this._readyBtn);
    btnArea.appendChild(backBtn);

    this._el.appendChild(title);
    this._el.appendChild(subtitle);
    this._el.appendChild(webcamArea);
    this._el.appendChild(cardsArea);
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

  markDetected(gesture) {
    if (!this._cards[gesture]) return;
    this._detected.add(gesture);
    this._cards[gesture].classList.add('calibration-card--detected');
    
    if (this._detected.size >= 3 && this._readyBtn) {
      this._readyBtn.disabled = false;
      this._readyBtn.style.opacity = '1';
    }
  }

  unmount() {
    if (this._webcam) this._webcam.unmount();
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
  }
}
