export const GESTURES = Object.freeze({
  ROCK: 'rock',
  PAPER: 'paper',
  SCISSORS: 'scissors',
  NONE: 'none',
});

export const GAME_STATES = Object.freeze({
  WELCOME: 'welcome',
  CALIBRATION: 'calibration',
  IDLE: 'idle',
  COUNTDOWN: 'countdown',
  CAPTURE: 'capture',
  RESULT: 'result',
  MATCH_END: 'match_end',
});

export const RESULTS = Object.freeze({
  WIN: 'win',
  LOSE: 'lose',
  DRAW: 'draw',
});

export const GAME_MODES = Object.freeze({
  FREE_PLAY: 'free_play',
  BEST_OF_3: 'best_of_3',
  BEST_OF_5: 'best_of_5',
  BEST_OF_7: 'best_of_7',
});

export const MODE_ROUNDS = Object.freeze({
  [GAME_MODES.FREE_PLAY]: Infinity,
  [GAME_MODES.BEST_OF_3]: 3,
  [GAME_MODES.BEST_OF_5]: 5,
  [GAME_MODES.BEST_OF_7]: 7,
});

export const COUNTDOWN_BEATS = Object.freeze(['Rock', 'Paper', 'Scissors', 'SHOOT!']);
export const COUNTDOWN_INTERVAL_MS = 800;
export const GESTURE_CONFIDENCE_THRESHOLD = 0.7;
export const DETECTION_FPS = 15;

// MediaPipe hand landmark indices
export const LANDMARKS = Object.freeze({
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
});
