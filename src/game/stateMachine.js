import { GAME_STATES } from '../utils/constants.js';

const TRANSITIONS = {
  START_CALIBRATION: { [GAME_STATES.WELCOME]: GAME_STATES.CALIBRATION },
  START_GAME: {
    [GAME_STATES.WELCOME]: GAME_STATES.IDLE,
    [GAME_STATES.CALIBRATION]: GAME_STATES.IDLE,
  },
  PLAY: { [GAME_STATES.IDLE]: GAME_STATES.COUNTDOWN },
  SHOOT: { [GAME_STATES.COUNTDOWN]: GAME_STATES.CAPTURE },
  GESTURE_CAPTURED: { [GAME_STATES.CAPTURE]: GAME_STATES.RESULT },
  NEXT_ROUND: { [GAME_STATES.RESULT]: GAME_STATES.IDLE },
  MATCH_OVER: { [GAME_STATES.RESULT]: GAME_STATES.MATCH_END },
  PLAY_AGAIN: { [GAME_STATES.MATCH_END]: GAME_STATES.IDLE },
  GO_HOME: {
    [GAME_STATES.MATCH_END]: GAME_STATES.WELCOME,
    [GAME_STATES.IDLE]: GAME_STATES.WELCOME,
    [GAME_STATES.RESULT]: GAME_STATES.WELCOME,
  },
};

export class GameStateMachine {
  constructor() {
    this._state = GAME_STATES.WELCOME;
    this._subscribers = [];
  }

  getState() {
    return this._state;
  }

  transition(event) {
    const eventTransitions = TRANSITIONS[event];
    if (!eventTransitions) {
      throw new Error(`Invalid event: ${event}`);
    }

    const nextState = eventTransitions[this._state];
    if (!nextState) {
      throw new Error(
        `Invalid transition: event "${event}" from state "${this._state}"`
      );
    }

    this._state = nextState;
    this._notify(nextState, event);
  }

  subscribe(callback) {
    this._subscribers.push(callback);
    return () => {
      this._subscribers = this._subscribers.filter((cb) => cb !== callback);
    };
  }

  _notify(newState, event) {
    for (const cb of this._subscribers) {
      cb(newState, event);
    }
  }
}
