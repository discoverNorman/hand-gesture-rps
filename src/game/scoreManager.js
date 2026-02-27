import { RESULTS, GAME_MODES, MODE_ROUNDS } from '../utils/constants.js';
import { loadStats, saveStats } from '../utils/storage.js';

export class ScoreManager {
  constructor() {
    this.playerScore = 0;
    this.aiScore = 0;
    this.draws = 0;
    this.round = 0;
    this.roundHistory = [];
    this.mode = GAME_MODES.FREE_PLAY;
    this.lifetimeStats = loadStats() || {
      totalRounds: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
      gestureUsage: {},
    };
  }

  newMatch(mode) {
    this.playerScore = 0;
    this.aiScore = 0;
    this.draws = 0;
    this.round = 0;
    this.roundHistory = [];
    this.mode = mode;
  }

  recordRound(result, playerGesture) {
    this.round++;

    if (result === RESULTS.WIN) this.playerScore++;
    else if (result === RESULTS.LOSE) this.aiScore++;
    else if (result === RESULTS.DRAW) this.draws++;

    this.roundHistory.push({ result, playerGesture, round: this.round });
    if (this.roundHistory.length > 10) {
      this.roundHistory.shift();
    }

    this.lifetimeStats.totalRounds++;
    if (result === RESULTS.WIN) this.lifetimeStats.totalWins++;
    else if (result === RESULTS.LOSE) this.lifetimeStats.totalLosses++;
    else if (result === RESULTS.DRAW) this.lifetimeStats.totalDraws++;

    this.lifetimeStats.gestureUsage[playerGesture] =
      (this.lifetimeStats.gestureUsage[playerGesture] || 0) + 1;

    saveStats(this.lifetimeStats);
  }

  isMatchOver() {
    if (this.mode === GAME_MODES.FREE_PLAY) return false;
    const totalRounds = MODE_ROUNDS[this.mode];
    const winsNeeded = Math.ceil(totalRounds / 2);
    return this.playerScore >= winsNeeded || this.aiScore >= winsNeeded;
  }

  getMatchWinner() {
    if (!this.isMatchOver()) return null;
    const totalRounds = MODE_ROUNDS[this.mode];
    const winsNeeded = Math.ceil(totalRounds / 2);
    if (this.playerScore >= winsNeeded) return 'player';
    if (this.aiScore >= winsNeeded) return 'ai';
    return null;
  }

  getScores() {
    return {
      playerScore: this.playerScore,
      aiScore: this.aiScore,
      draws: this.draws,
      round: this.round,
      roundHistory: [...this.roundHistory],
    };
  }

  getLifetimeStats() {
    return { ...this.lifetimeStats };
  }
}
