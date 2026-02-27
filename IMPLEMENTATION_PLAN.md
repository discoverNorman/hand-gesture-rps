# Implementation Plan — Hand Gesture Rock, Paper, Scissors

## Deep Analysis of Requirements

### Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| MediaPipe model loading time (~5MB) | Medium | Lazy load with progress indicator; cache via Service Worker |
| Gesture misclassification in poor lighting | High | Confidence threshold + calibration mode + visual feedback loop |
| Web Audio API browser inconsistencies | Low | Use AudioContext with fallback; user-initiated audio unlock |
| Webcam permission denied | Medium | Clear UX guidance; graceful fallback screen |
| Performance on low-end hardware | Medium | Throttle detection FPS; use `lite` model variant |

### Architecture Decision Records

**ADR-1: MediaPipe Hands over TensorFlow.js HandPose**
- MediaPipe Hands is faster, more accurate, and has native WASM/WebGL backends.
- Provides 21 hand landmarks directly, sufficient for finger-counting classification.
- Smaller bundle, better FPS on commodity hardware.

**ADR-2: Vanilla JS + Vite over React/Vue**
- Minimal dependencies = smaller bundle, faster load.
- Game is single-page with limited UI complexity — no framework needed.
- Vite provides HMR for development and efficient production builds.

**ADR-3: Finite State Machine for Game State**
- Clear, testable state transitions prevent impossible states.
- Each state maps to a UI view and audio context — easy to reason about.
- States: `WELCOME → CALIBRATION → IDLE → COUNTDOWN → CAPTURE → RESULT → MATCH_END`

**ADR-4: Synthesized Audio over Audio Files**
- Zero external assets — fully self-contained.
- Web Audio API oscillators + gain envelopes for tones.
- Speech synthesis API for countdown words ("Rock", "Paper", "Scissors", "SHOOT!").

**ADR-5: Gesture Classification via Finger Counting**
- Use MediaPipe's 21 landmarks to compute finger extension states.
- Compare fingertip Y position vs PIP joint Y position (for index/middle/ring/pinky).
- Thumb: compare tip X vs IP joint X (adjusting for handedness).
- Rock = 0 fingers, Paper = 5 fingers, Scissors = 2 fingers (index + middle).

---

## Project Structure

```
big/
├── index.html                  # Entry point
├── package.json                # Dependencies & scripts
├── vite.config.js              # Vite configuration
├── vitest.config.js            # Test configuration
├── src/
│   ├── main.js                 # App entry — bootstraps modules
│   ├── style.css               # Global styles
│   ├── gesture/
│   │   ├── handDetector.js     # MediaPipe Hands initialization & frame processing
│   │   ├── gestureClassifier.js # Landmark → gesture classification logic
│   │   └── fingerState.js      # Finger extension detection utilities
│   ├── game/
│   │   ├── stateMachine.js     # FSM: states, transitions, event dispatch
│   │   ├── rules.js            # Win/lose/draw determination
│   │   ├── aiOpponent.js       # Random AI choice generator
│   │   ├── scoreManager.js     # Score tracking & persistence
│   │   └── countdown.js        # Countdown timer logic
│   ├── audio/
│   │   ├── audioManager.js     # Central audio controller (mute, volume)
│   │   ├── soundEffects.js     # Synthesized sound effect generators
│   │   └── speechSynth.js      # Countdown speech ("Rock", "Paper"...)
│   ├── ui/
│   │   ├── renderer.js         # Main UI orchestrator
│   │   ├── screens/
│   │   │   ├── welcomeScreen.js
│   │   │   ├── gameScreen.js
│   │   │   ├── resultScreen.js
│   │   │   └── calibrationScreen.js
│   │   ├── components/
│   │   │   ├── webcamView.js    # Video element + canvas overlay
│   │   │   ├── scoreboard.js    # Score display component
│   │   │   ├── countdown.js     # Countdown visual display
│   │   │   ├── aiHand.js        # Animated AI hand display
│   │   │   ├── resultBanner.js  # Win/lose/draw announcement
│   │   │   └── howToPlay.js     # Instructions modal
│   │   └── animations.js       # CSS animation triggers
│   └── utils/
│       ├── storage.js           # localStorage wrapper
│       └── constants.js         # Shared constants & enums
├── tests/
│   ├── unit/
│   │   ├── gestureClassifier.test.js
│   │   ├── fingerState.test.js
│   │   ├── stateMachine.test.js
│   │   ├── rules.test.js
│   │   ├── aiOpponent.test.js
│   │   ├── scoreManager.test.js
│   │   ├── countdown.test.js
│   │   ├── audioManager.test.js
│   │   └── storage.test.js
│   ├── integration/
│   │   ├── gameFlow.test.js      # Full round lifecycle
│   │   ├── gestureToResult.test.js # Gesture detection → result pipeline
│   │   └── audioIntegration.test.js
│   └── e2e/
│       └── gameplay.spec.js      # Playwright E2E tests
└── public/
    └── (empty — all assets synthesized)
```

---

## Implementation Phases

### Phase 1: Project Scaffolding & Core Utilities (Steps 1–3)

**Step 1: Project Setup**
- Initialize `package.json` with Vite, Vitest, @mediapipe/hands dependencies.
- Create `vite.config.js` and `vitest.config.js`.
- Create `index.html` shell with root container.
- Create `src/style.css` with CSS reset and CSS custom properties for theming.
- Create `src/main.js` entry point.

**Step 2: Constants & Utilities**
- Implement `src/utils/constants.js`:
  - `GESTURES` enum: `{ ROCK: 'rock', PAPER: 'paper', SCISSORS: 'scissors', NONE: 'none' }`
  - `GAME_STATES` enum: `{ WELCOME, CALIBRATION, IDLE, COUNTDOWN, CAPTURE, RESULT, MATCH_END }`
  - `RESULTS` enum: `{ WIN, LOSE, DRAW }`
  - `GAME_MODES`: `{ FREE_PLAY, BEST_OF_3, BEST_OF_5, BEST_OF_7 }`
  - Countdown duration, confidence threshold, etc.
- Implement `src/utils/storage.js`:
  - `loadPreferences()`, `savePreferences(prefs)`
  - `loadStats()`, `saveStats(stats)`
  - Defensive JSON parsing with defaults.

**Step 3: Game Rules Engine**
- Implement `src/game/rules.js`:
  - `determineWinner(playerGesture, aiGesture) → RESULTS`
  - Pure function, fully testable.
- Implement `src/game/aiOpponent.js`:
  - `getAIChoice() → GESTURES` (crypto.getRandomValues for true randomness)
- Write unit tests for rules and AI opponent.

---

### Phase 2: Gesture Recognition Pipeline (Steps 4–6)

**Step 4: Finger State Detection**
- Implement `src/gesture/fingerState.js`:
  - `getFingerStates(landmarks, handedness) → [thumb, index, middle, ring, pinky]`
  - Each finger: `true` (extended) or `false` (curled).
  - Thumb logic accounts for handedness (left vs right hand mirroring).
- Write unit tests with mock landmark data for all gesture shapes.

**Step 5: Gesture Classifier**
- Implement `src/gesture/gestureClassifier.js`:
  - `classifyGesture(fingerStates) → { gesture: GESTURES, confidence: number }`
  - Rock: 0 fingers extended → confidence based on how curled all fingers are.
  - Paper: 5 fingers extended → confidence based on all-extended score.
  - Scissors: exactly index + middle extended → confidence based on pattern match.
  - Returns `NONE` if no pattern matches above threshold.
- Write comprehensive unit tests with edge cases.

**Step 6: Hand Detector (MediaPipe Integration)**
- Implement `src/gesture/handDetector.js`:
  - `class HandDetector`:
    - `async init()` — load MediaPipe Hands model.
    - `async detect(videoElement) → { landmarks, gesture, confidence }`
    - `destroy()` — cleanup resources.
  - Wraps MediaPipe, calls fingerState + gestureClassifier internally.
  - Emits events: `onGestureDetected`, `onHandLost`.
- Test with mock MediaPipe results (integration-level).

---

### Phase 3: Game State Machine (Steps 7–9)

**Step 7: State Machine**
- Implement `src/game/stateMachine.js`:
  - `class GameStateMachine`:
    - Constructor takes initial state (`WELCOME`).
    - `transition(event) → newState` with guard conditions.
    - Event-driven: `subscribe(callback)` for state change notifications.
    - Valid transitions enforced (throws on invalid).
  - Transition table:
    ```
    WELCOME     + START_CALIBRATION → CALIBRATION
    WELCOME     + START_GAME        → IDLE
    CALIBRATION + DONE              → IDLE
    IDLE        + PLAY              → COUNTDOWN
    COUNTDOWN   + TICK              → COUNTDOWN (with count tracking)
    COUNTDOWN   + SHOOT             → CAPTURE
    CAPTURE     + GESTURE_CAPTURED  → RESULT
    RESULT      + NEXT_ROUND        → IDLE
    RESULT      + MATCH_OVER        → MATCH_END
    MATCH_END   + PLAY_AGAIN        → IDLE
    MATCH_END   + HOME              → WELCOME
    ```
- Write thorough state machine tests (all paths, invalid transitions).

**Step 8: Score Manager**
- Implement `src/game/scoreManager.js`:
  - `class ScoreManager`:
    - `newMatch(mode)` — reset for new match.
    - `recordRound(result) → { playerScore, aiScore, draws, roundHistory }`
    - `isMatchOver() → boolean` (checks best-of-N conditions).
    - `getMatchWinner() → 'player' | 'ai' | null`
    - `getStats()` — lifetime statistics.
    - Persists to localStorage via storage utility.
- Write unit tests for all modes and edge cases.

**Step 9: Countdown Timer**
- Implement `src/game/countdown.js`:
  - `class Countdown`:
    - `start(onTick, onComplete)` — 4 beats: "Rock"(3), "Paper"(2), "Scissors"(1), "SHOOT!"(0).
    - Each beat ~800ms apart.
    - Cancellable.
  - Emits tick events with current beat label.
- Write unit tests with fake timers.

---

### Phase 4: Audio System (Steps 10–11)

**Step 10: Sound Effects Synthesis**
- Implement `src/audio/soundEffects.js`:
  - Factory functions that return AudioBuffer or play directly:
    - `playCountdownBeep(beat)` — ascending pitch per beat, sharp on SHOOT.
    - `playWinSound()` — cheerful ascending arpeggio.
    - `playLoseSound()` — descending minor tones.
    - `playDrawSound()` — neutral double beep.
    - `playMatchWin()` — triumphant fanfare.
    - `playMatchLose()` — sad trombone.
    - `playClickSound()` — soft UI click.
    - `playDetectedBeep()` — subtle confirmation ping.
  - All generated with OscillatorNode + GainNode envelopes.

- Implement `src/audio/speechSynth.js`:
  - `speakCountdown(word)` — uses SpeechSynthesis API for "Rock", "Paper", "Scissors", "SHOOT!".
  - Fallback to beeps if speech synthesis unavailable.

**Step 11: Audio Manager**
- Implement `src/audio/audioManager.js`:
  - `class AudioManager`:
    - Singleton/shared instance pattern.
    - `init()` — create AudioContext (must be after user gesture for autoplay policy).
    - `setVolume(0-1)`, `getVolume()`.
    - `mute()`, `unmute()`, `isMuted()`.
    - `playEffect(effectName)` — dispatches to soundEffects.
    - `speak(word)` — dispatches to speechSynth.
    - Persists volume/mute to localStorage.
- Write unit tests with AudioContext mocks.

---

### Phase 5: UI Layer (Steps 12–16)

**Step 12: Webcam View Component**
- Implement `src/ui/components/webcamView.js`:
  - Creates `<video>` + `<canvas>` overlay.
  - `async startCamera()` — getUserMedia, attach to video.
  - `drawLandmarks(landmarks)` — render hand skeleton on canvas.
  - `showGestureLabel(gesture)` — overlay text.
  - `stopCamera()` — cleanup tracks.

**Step 13: UI Components**
- Implement remaining components:
  - `scoreboard.js` — renders player/AI scores, draws, round counter.
  - `countdown.js` (UI) — large countdown text overlay with pulse animation.
  - `aiHand.js` — shows AI choice as emoji (✊✋✌️) with reveal animation.
  - `resultBanner.js` — "YOU WIN!" / "YOU LOSE!" / "DRAW!" with color flash.
  - `howToPlay.js` — modal with gesture illustrations and rules.

**Step 14: Welcome Screen**
- Implement `src/ui/screens/welcomeScreen.js`:
  - Title, subtitle, animated hand emojis.
  - "Start Game" button → mode selection dropdown.
  - "Calibrate" button → calibration mode.
  - Camera permission request on first interaction.
  - How to Play link.

**Step 15: Game Screen**
- Implement `src/ui/screens/gameScreen.js`:
  - Left: webcam feed with landmark overlay and gesture label.
  - Right/Below: AI hand display area.
  - Center top: countdown overlay.
  - Bottom: scoreboard.
  - Volume control + mute button in corner.
  - "Play Round" button (or thumbs-up gesture detection).

**Step 16: Result & Calibration Screens**
- Implement `src/ui/screens/resultScreen.js`:
  - Match summary: total rounds, scores, MVP gesture.
  - "Play Again" and "Home" buttons.
  - Fun stats (win streak, most used gesture).
- Implement `src/ui/screens/calibrationScreen.js`:
  - Webcam feed with real-time gesture detection display.
  - Three target gesture cards — each lights up green when correctly detected.
  - "Ready to Play" button when all three gestures confirmed.

---

### Phase 6: Integration & Main App (Steps 17–18)

**Step 17: Renderer (UI Orchestrator)**
- Implement `src/ui/renderer.js`:
  - Subscribes to GameStateMachine.
  - On state change → swaps active screen.
  - Passes callbacks from UI events → state machine transitions.
  - Manages component lifecycle (mount/unmount/cleanup).

**Step 18: Main Entry Point**
- Implement `src/main.js`:
  - Wires all modules together:
    1. Create HandDetector, AudioManager, GameStateMachine, ScoreManager.
    2. Create Renderer, subscribe to state machine.
    3. On COUNTDOWN → start countdown timer + audio.
    4. On CAPTURE → capture gesture from HandDetector, get AI choice, determine winner.
    5. On RESULT → display result, play audio, record score.
    6. On MATCH_END → show result screen.
  - Handles global error boundary.
  - Unlocks AudioContext on first user interaction.

---

### Phase 7: Polish & Styling (Step 19)

**Step 19: CSS & Animations**
- Complete `src/style.css`:
  - CSS custom properties for color scheme (dark theme default).
  - Responsive layout (flexbox/grid).
  - Animations: countdown pulse, result flash (green/red/yellow), AI hand reveal, score increment.
  - Transitions between screens (fade/slide).
  - Webcam feed styling with rounded corners and subtle border.
  - Accessibility: focus outlines, reduced-motion media query.
  - High-contrast mode via `prefers-contrast`.

---

### Phase 8: Testing (Steps 20–22)

**Step 20: Unit Tests**
Following Martin Fowler's testing principles:
- Tests are **first-class code** — readable, well-named, maintainable.
- **Test behavior, not implementation** — test public interfaces, not internal details.
- **Arrange-Act-Assert** pattern consistently.
- **Descriptive test names** that document the expected behavior.
- **No test interdependence** — each test is isolated and idempotent.

Unit test files:
- `tests/unit/fingerState.test.js` — All finger configurations for both hands.
- `tests/unit/gestureClassifier.test.js` — Each gesture, edge cases, below-threshold.
- `tests/unit/rules.test.js` — All 9 combinations (3×3).
- `tests/unit/aiOpponent.test.js` — Returns valid gestures, distribution over N runs.
- `tests/unit/stateMachine.test.js` — All valid transitions, invalid transition rejection, state subscriptions.
- `tests/unit/scoreManager.test.js` — Scoring, best-of-N, match completion, persistence.
- `tests/unit/countdown.test.js` — Tick sequence, cancellation, timing.
- `tests/unit/audioManager.test.js` — Volume, mute, context creation.
- `tests/unit/storage.test.js` — Save/load, corruption handling, defaults.

**Step 21: Integration Tests**
- `tests/integration/gameFlow.test.js`:
  - Full round lifecycle: IDLE → COUNTDOWN → CAPTURE → RESULT → IDLE.
  - Best-of-3 match to completion.
  - Score persistence across simulated rounds.
- `tests/integration/gestureToResult.test.js`:
  - Mock landmarks → gesture classification → winner determination.
- `tests/integration/audioIntegration.test.js`:
  - State transitions trigger correct audio calls.

**Step 22: E2E Tests (Playwright)**
- `tests/e2e/gameplay.spec.js`:
  - App loads, welcome screen visible.
  - Camera permission mock, webcam feed appears.
  - Start game flow, verify countdown UI.
  - Mock gesture input, verify result display.
  - Score updates correctly.
  - Mute/unmute toggle works.
  - Navigation between screens.

---

## Dependency Map

```
main.js
  ├── gesture/handDetector.js
  │     ├── gesture/fingerState.js
  │     └── gesture/gestureClassifier.js
  ├── game/stateMachine.js
  ├── game/rules.js
  ├── game/aiOpponent.js
  ├── game/scoreManager.js
  │     └── utils/storage.js
  ├── game/countdown.js
  ├── audio/audioManager.js
  │     ├── audio/soundEffects.js
  │     └── audio/speechSynth.js
  └── ui/renderer.js
        ├── ui/screens/welcomeScreen.js
        ├── ui/screens/gameScreen.js
        ├── ui/screens/resultScreen.js
        ├── ui/screens/calibrationScreen.js
        └── ui/components/*
              └── ui/animations.js
```

Zero circular dependencies. Leaf modules (rules, fingerState, constants) have no imports from the project.

---

## Agent Parallelization Strategy

The following module groups are **independent** and can be built in parallel by separate agents:

| Agent Group | Modules | Dependencies |
|-------------|---------|--------------|
| **Agent A: Gesture** | fingerState, gestureClassifier, handDetector | constants |
| **Agent B: Game Logic** | rules, aiOpponent, scoreManager, countdown, stateMachine | constants, storage |
| **Agent C: Audio** | soundEffects, speechSynth, audioManager | constants, storage |
| **Agent D: Utilities** | constants, storage | none |
| **Agent E: UI Components** | All ui/components/* | constants |
| **Agent F: UI Screens** | All ui/screens/* | components, constants |
| **Agent G: Integration** | renderer, main.js | all modules |
| **Agent H: Unit Tests** | All tests/unit/* | modules under test |
| **Agent I: Integration Tests** | All tests/integration/* | multiple modules |
| **Agent J: Styling** | style.css, index.html | none |

**Execution order**: D first → A, B, C, E, J in parallel → F after E → G after all → H alongside implementation → I after G.

---

*Document Version: 1.0*
*Created: 2026-02-26*
*Based on: REQUIREMENTS.md v1.0*
