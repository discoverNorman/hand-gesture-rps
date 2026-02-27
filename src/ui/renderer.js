import { GAME_STATES } from '../utils/constants.js';
import { WelcomeScreen } from './screens/welcomeScreen.js';
import { GameScreen } from './screens/gameScreen.js';
import { ResultScreen } from './screens/resultScreen.js';
import { CalibrationScreen } from './screens/calibrationScreen.js';

export class Renderer {
  constructor(container, callbacks) {
    this._container = container;
    this._callbacks = callbacks;
    this._currentScreen = null;
    this._screenName = null;
  }

  renderState(state, data = {}) {
    if (this._currentScreen) {
      this._currentScreen.unmount();
      this._currentScreen = null;
    }
    this._container.innerHTML = '';
    this._screenName = state;

    switch (state) {
      case GAME_STATES.WELCOME:
        this._currentScreen = new WelcomeScreen((action, payload) => {
          this._callbacks.onWelcomeAction(action, payload);
        });
        this._currentScreen.mount(this._container);
        break;

      case GAME_STATES.CALIBRATION:
        this._currentScreen = new CalibrationScreen((action) => {
          this._callbacks.onCalibrationAction(action);
        });
        this._currentScreen.mount(this._container);
        break;

      case GAME_STATES.IDLE:
      case GAME_STATES.COUNTDOWN:
      case GAME_STATES.CAPTURE:
      case GAME_STATES.RESULT:
        if (!this._currentScreen || !(this._currentScreen instanceof GameScreen)) {
          this._currentScreen = new GameScreen((action) => {
            this._callbacks.onGameAction(action);
          });
          this._currentScreen.mount(this._container);
        }
        break;

      case GAME_STATES.MATCH_END:
        this._currentScreen = new ResultScreen((action) => {
          this._callbacks.onResultAction(action);
        });
        this._currentScreen.mount(this._container, data);
        break;
    }
  }

  getScreen() {
    return this._currentScreen;
  }

  getScreenName() {
    return this._screenName;
  }
}
