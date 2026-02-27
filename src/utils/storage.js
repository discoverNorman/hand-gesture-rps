const PREFS_KEY = 'rps_preferences';
const STATS_KEY = 'rps_statistics';

const DEFAULT_PREFS = {
  volume: 0.7,
  muted: false,
  lastMode: 'best_of_3',
};

const DEFAULT_STATS = {
  totalGames: 0,
  totalRounds: 0,
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  matchesWon: 0,
  matchesLost: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  gestureUsage: { rock: 0, paper: 0, scissors: 0 },
};

function safeJsonParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadPreferences() {
  return { ...DEFAULT_PREFS, ...safeJsonParse(localStorage.getItem(PREFS_KEY), {}) };
}

export function savePreferences(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function loadStats() {
  const stored = safeJsonParse(localStorage.getItem(STATS_KEY), {});
  return {
    ...DEFAULT_STATS,
    ...stored,
    gestureUsage: { ...DEFAULT_STATS.gestureUsage, ...(stored.gestureUsage || {}) },
  };
}

export function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function clearStats() {
  localStorage.removeItem(STATS_KEY);
}
