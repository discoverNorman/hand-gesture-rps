export class HowToPlay {
  constructor() {
    this._overlay = null;
  }

  show() {
    if (this._overlay) return;
    this._overlay = document.createElement('div');
    this._overlay.className = 'modal-overlay';
    this._overlay.innerHTML = `
      <div class="modal">
        <h2>How to Play</h2>
        <p><strong>✊ Rock</strong> — Make a fist (close all fingers)</p>
        <p><strong>✋ Paper</strong> — Open hand (spread all fingers)</p>
        <p><strong>✌️ Scissors</strong> — Extend index and middle fingers, close the rest</p>
        <hr style="border-color: var(--border); margin: 1rem 0;">
        <p>1. Position your hand clearly in front of the webcam</p>
        <p>2. Press "Play Round" or show a thumbs-up to start</p>
        <p>3. During the countdown, prepare your gesture</p>
        <p>4. On "SHOOT!", show your gesture — the system will capture it</p>
        <p>5. The AI reveals its choice and the winner is displayed</p>
        <hr style="border-color: var(--border); margin: 1rem 0;">
        <p><strong>Tips:</strong> Good lighting helps! Use the Calibration mode to practice.</p>
        <button class="btn" data-action="close-modal">Got it!</button>
      </div>
    `;
    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay || e.target.dataset.action === 'close-modal') {
        this.hide();
      }
    });
    document.body.appendChild(this._overlay);
  }

  hide() {
    if (this._overlay) {
      document.body.removeChild(this._overlay);
      this._overlay = null;
    }
  }
}
