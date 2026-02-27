export class ResultScreen {
  constructor(onAction) {
    this._onAction = onAction;
    this._el = null;
  }

  mount(container, { winner, scores, lifetimeStats }) {
    this._el = document.createElement('div');
    this._el.className = 'screen active';

    const isWin = winner === 'player';
    this._el.innerHTML = `
      <h1 class="screen-title">${isWin ? '🏆 Victory!' : '💀 Defeat'}</h1>
      <p class="screen-subtitle">${isWin ? 'You crushed the AI!' : 'The AI got you this time.'}</p>
      
      <div class="scoreboard" style="font-size: 1.2rem;">
        <div class="score-item">
          <div class="score-value">${scores.playerScore}</div>
          <div class="score-label">You</div>
        </div>
        <div class="score-item">
          <div class="score-value">${scores.draws}</div>
          <div class="score-label">Draws</div>
        </div>
        <div class="score-item">
          <div class="score-value">${scores.aiScore}</div>
          <div class="score-label">AI</div>
        </div>
      </div>

      <h2 style="margin-top: 1.5rem; font-size: 1.2rem;">Lifetime Stats</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${lifetimeStats.totalRounds || 0}</div>
          <div class="stat-label">Total Rounds</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${lifetimeStats.totalWins || 0}</div>
          <div class="stat-label">Wins</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${lifetimeStats.totalLosses || 0}</div>
          <div class="stat-label">Losses</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${lifetimeStats.totalDraws || 0}</div>
          <div class="stat-label">Draws</div>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button class="btn" data-action="play-again">Play Again</button>
        <button class="btn btn--secondary" data-action="go-home">Home</button>
      </div>
    `;

    this._el.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action === 'play-again') this._onAction('play_again');
      else if (action === 'go-home') this._onAction('go_home');
    });

    container.appendChild(this._el);
  }

  unmount() {
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
  }
}
