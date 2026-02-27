import { GAME_STATES, GESTURES, RESULTS, GAME_MODES, DETECTION_FPS } from './utils/constants.js';
import { loadPreferences, savePreferences } from './utils/storage.js';
import { GameStateMachine } from './game/stateMachine.js';
import { ScoreManager } from './game/scoreManager.js';
import { Countdown } from './game/countdown.js';
import { determineWinner } from './game/rules.js';
import { getAIChoice } from './game/aiOpponent.js';
import { HandDetector } from './gesture/handDetector.js';
import { AudioManager } from './audio/audioManager.js';
import { Renderer } from './ui/renderer.js';

class App {
  constructor() {
    this._fsm = new GameStateMachine();
    this._scoreManager = new ScoreManager();
    this._countdown = new Countdown();
    this._handDetector = new HandDetector();
    this._audioManager = new AudioManager();
    this._renderer = null;
    this._detectionLoop = null;
    this._currentMode = GAME_MODES.BEST_OF_3;
    this._handDetectorReady = false;
    this._lastDetectedGesture = GESTURES.NONE;
  }

  async start() {
    const container = document.getElementById('app');

    this._renderer = new Renderer(container, {
      onWelcomeAction: (action, payload) => this._handleWelcome(action, payload),
      onCalibrationAction: (action) => this._handleCalibration(action),
      onGameAction: (action) => this._handleGameAction(action),
      onResultAction: (action) => this._handleResultAction(action),
    });

    this._createAudioControls();
    this._renderer.renderState(GAME_STATES.WELCOME);

    // Load preferences
    const prefs = loadPreferences();
    this._currentMode = prefs.lastMode || GAME_MODES.BEST_OF_3;
  }

  _createAudioControls() {
    const controls = document.createElement('div');
    controls.className = 'audio-controls';

    const muteBtn = document.createElement('button');
    muteBtn.className = 'mute-btn';
    muteBtn.textContent = this._audioManager.isMuted() ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', 'Toggle mute');
    muteBtn.addEventListener('click', () => {
      this._audioManager.init(); // ensure context on user gesture
      this._audioManager.toggleMute();
      muteBtn.textContent = this._audioManager.isMuted() ? '🔇' : '🔊';
    });

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'volume-slider';
    slider.min = '0';
    slider.max = '100';
    slider.value = String(this._audioManager.getVolume() * 100);
    slider.setAttribute('aria-label', 'Volume');
    slider.addEventListener('input', () => {
      this._audioManager.init();
      this._audioManager.setVolume(parseInt(slider.value) / 100);
    });

    controls.appendChild(muteBtn);
    controls.appendChild(slider);
    document.body.appendChild(controls);
  }

  async _initHandDetector() {
    if (this._handDetectorReady) return;
    try {
      await this._handDetector.init();
      this._handDetectorReady = true;
    } catch (err) {
      console.error('Failed to init hand detector:', err);
    }
  }

  _startDetectionLoop() {
    if (this._detectionLoop) return;

    const screen = this._renderer.getScreen();
    const video = screen?.getVideoElement?.();
    if (!video) return;

    const intervalMs = 1000 / DETECTION_FPS;

    const detect = async () => {
      if (!this._detectionLoop) return;

      const screen = this._renderer.getScreen();
      const video = screen?.getVideoElement?.();
      if (!video || video.readyState < 2) {
        this._detectionLoop = setTimeout(detect, intervalMs);
        return;
      }

      try {
        const result = await this._handDetector.detect(video);
        if (result) {
          screen.drawLandmarks?.(result.landmarks);
          if (result.gesture !== GESTURES.NONE) {
            const emoji = { rock: '✊', paper: '✋', scissors: '✌️' }[result.gesture] || '';
            screen.setGestureLabel?.(`${emoji} ${result.gesture.toUpperCase()} (${Math.round(result.confidence * 100)}%)`);
            this._lastDetectedGesture = result.gesture;

            // Mark calibration detection
            if (screen.markDetected) {
              screen.markDetected(result.gesture);
            }
          } else {
            screen.setGestureLabel?.('Show your hand...');
            this._lastDetectedGesture = GESTURES.NONE;
          }
        } else {
          screen.clearCanvas?.();
          screen.setGestureLabel?.('No hand detected');
          this._lastDetectedGesture = GESTURES.NONE;
        }
      } catch (err) {
        // Detection error — continue loop
      }

      this._detectionLoop = setTimeout(detect, intervalMs);
    };

    this._detectionLoop = setTimeout(detect, intervalMs);
  }

  _stopDetectionLoop() {
    if (this._detectionLoop) {
      clearTimeout(this._detectionLoop);
      this._detectionLoop = null;
    }
  }

  async _handleWelcome(action, payload) {
    if (action === 'start_game') {
      this._currentMode = payload.mode;
      const prefs = loadPreferences();
      prefs.lastMode = payload.mode;
      savePreferences(prefs);

      this._audioManager.init();
      this._audioManager.playClick();

      this._scoreManager.newMatch(this._currentMode);
      this._fsm = new GameStateMachine();
      this._fsm.transition('START_GAME');

      this._renderer.renderState(GAME_STATES.IDLE);
      const screen = this._renderer.getScreen();

      await this._initHandDetector();
      await screen.startCamera();
      screen.setIdleState();
      screen.updateScores(this._scoreManager.getScores());
      this._startDetectionLoop();

    } else if (action === 'calibrate') {
      this._audioManager.init();
      this._audioManager.playClick();

      this._fsm = new GameStateMachine();
      this._fsm.transition('START_CALIBRATION');

      this._renderer.renderState(GAME_STATES.CALIBRATION);
      const screen = this._renderer.getScreen();

      await this._initHandDetector();
      await screen.startCamera();
      this._startDetectionLoop();
    }
  }

  _handleCalibration(action) {
    if (action === 'ready' || action === 'back') {
      this._stopDetectionLoop();
      this._audioManager.playClick();
      this._renderer.renderState(GAME_STATES.WELCOME);
    }
  }

  _handleGameAction(action) {
    const screen = this._renderer.getScreen();

    if (action === 'play') {
      this._audioManager.init();
      this._audioManager.playClick();

      // Start countdown
      this._countdown.start(
        (beat, index) => {
          screen.showCountdown(beat);
          this._audioManager.playCountdownBeep(index);
          this._audioManager.speak(beat);
        },
        () => {
          // SHOOT! — capture gesture
          this._captureAndResolve(screen);
        }
      );

    } else if (action === 'next_round') {
      this._audioManager.playClick();
      screen.setIdleState();

    } else if (action === 'go_home') {
      this._stopDetectionLoop();
      this._countdown.cancel();
      this._audioManager.playClick();
      this._renderer.renderState(GAME_STATES.WELCOME);
    }
  }

  _captureAndResolve(screen) {
    const playerGesture = this._lastDetectedGesture !== GESTURES.NONE
      ? this._lastDetectedGesture
      : GESTURES.ROCK; // default to rock if nothing detected

    const aiGesture = getAIChoice();
    const result = determineWinner(playerGesture, aiGesture);

    this._scoreManager.recordRound(result, playerGesture);
    const scores = this._scoreManager.getScores();

    // Show player gesture
    screen.showPlayerGesture(playerGesture);

    // Brief delay for dramatic effect
    setTimeout(() => {
      screen.hideCountdown();
      screen.showResult(result, aiGesture);
      screen.updateScores(scores);

      // Play result audio
      if (result === RESULTS.WIN) this._audioManager.playWin();
      else if (result === RESULTS.LOSE) this._audioManager.playLose();
      else this._audioManager.playDraw();

      // Check if match is over
      if (this._scoreManager.isMatchOver()) {
        const winner = this._scoreManager.getMatchWinner();
        setTimeout(() => {
          if (winner === 'player') this._audioManager.playMatchWin();
          else this._audioManager.playMatchLose();

          this._stopDetectionLoop();
          screen.showMatchEnd(winner);

          // Auto-transition to result screen after a delay
          setTimeout(() => {
            this._renderer.renderState(GAME_STATES.MATCH_END, {
              winner,
              scores,
              lifetimeStats: this._scoreManager.getLifetimeStats(),
            });
          }, 2000);
        }, 1500);
      }
    }, 500);
  }

  _handleResultAction(action) {
    if (action === 'play_again') {
      this._audioManager.playClick();
      this._scoreManager.newMatch(this._currentMode);
      this._renderer.renderState(GAME_STATES.IDLE);
      const screen = this._renderer.getScreen();
      screen.startCamera().then(() => {
        screen.setIdleState();
        screen.updateScores(this._scoreManager.getScores());
        this._startDetectionLoop();
      });
    } else if (action === 'go_home') {
      this._audioManager.playClick();
      this._renderer.renderState(GAME_STATES.WELCOME);
    }
  }
}

// Boot
const app = new App();
app.start().catch(console.error);
