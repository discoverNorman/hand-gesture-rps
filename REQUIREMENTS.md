# Rock, Paper, Scissors — Hand Gesture Game

## Project Overview

A browser-based Rock, Paper, Scissors game that uses real-time hand gesture recognition via the user's webcam. The entire application runs locally in the browser — no server, no cloud APIs, no external services. The game is driven entirely by hand gestures and enhanced with audio feedback.

---

## 1. Core Concept

The player competes against an AI opponent by showing one of three hand gestures (Rock, Paper, Scissors) to their webcam. The system recognizes the gesture in real-time, the AI makes its choice, and the result is displayed with visual and audio feedback.

---

## 2. Functional Requirements

### 2.1 Webcam Integration
- **FR-001**: The application SHALL request webcam access from the user's browser.
- **FR-002**: The application SHALL display the live webcam feed on screen at all times during gameplay.
- **FR-003**: The application SHALL handle webcam permission denial gracefully with a user-friendly error message.
- **FR-004**: The application SHALL support common webcam resolutions (minimum 640×480).

### 2.2 Hand Gesture Recognition
- **FR-010**: The system SHALL detect the user's hand in the webcam feed in real-time.
- **FR-011**: The system SHALL recognize three distinct gestures:
  - **Rock** — closed fist (0 fingers extended)
  - **Paper** — open hand (5 fingers extended)
  - **Scissors** — two fingers extended (index + middle), others closed
- **FR-012**: The system SHALL use MediaPipe Hands (or TensorFlow.js HandPose) for hand landmark detection, running entirely in the browser via WebAssembly/WebGL.
- **FR-013**: The system SHALL provide a visual overlay on the webcam feed showing detected hand landmarks / bounding box.
- **FR-014**: The system SHALL require a confidence threshold ≥ 70% before accepting a gesture.
- **FR-015**: The system SHALL display the currently detected gesture label in real-time (e.g., "Rock detected").

### 2.3 Game Flow
- **FR-020**: The game SHALL follow a countdown-based round structure:
  1. Player presses "Play" or shows a "thumbs up" gesture to start a round.
  2. A 3-second countdown begins ("Rock... Paper... Scissors... SHOOT!") with audio.
  3. On "SHOOT!", the system captures the player's current gesture.
  4. The AI simultaneously reveals its choice.
  5. The result (Win / Lose / Draw) is displayed.
  6. Player can start the next round.
- **FR-021**: The AI opponent SHALL make a random choice (uniformly distributed) for each round.
- **FR-022**: The game SHALL support a "Best of N" mode (Best of 3, Best of 5, Best of 7) selectable before starting.
- **FR-023**: The game SHALL support a "Free Play" (endless) mode with a running score.
- **FR-024**: The game SHALL track and display:
  - Current round number
  - Player score
  - AI score
  - Draws
  - Round result history (last 10 rounds)
- **FR-025**: The game SHALL declare a match winner when applicable (Best of N mode).

### 2.4 Audio System
- **FR-030**: The application SHALL play audio cues for:
  - Countdown beats ("Rock", "Paper", "Scissors", "SHOOT!")
  - Win sound effect
  - Lose sound effect
  - Draw sound effect
  - Match won celebration
  - Match lost sound
  - UI button clicks
  - Gesture detected confirmation beep
- **FR-031**: Audio SHALL be generated via the Web Audio API (synthesized tones/sounds) so no external audio files are needed.
- **FR-032**: The application SHALL include a mute/unmute toggle.
- **FR-033**: The application SHALL include a volume slider.
- **FR-034**: Audio preferences SHALL persist across sessions via localStorage.

### 2.5 User Interface
- **FR-040**: The UI SHALL have a clean, modern, responsive design.
- **FR-041**: The UI SHALL include the following screens/views:
  - **Welcome Screen**: Title, instructions, camera permission prompt, mode selection.
  - **Game Screen**: Webcam feed, gesture overlay, countdown, scores, AI choice display, round result.
  - **Results Screen**: Final match results, play again option, stats summary.
- **FR-042**: The AI's choice SHALL be displayed as an animated hand icon/emoji.
- **FR-043**: The game SHALL show visual effects for round results (e.g., green flash for win, red for lose).
- **FR-044**: The game SHALL be playable on desktop browsers (Chrome, Firefox, Edge).
- **FR-045**: The UI SHALL include a "How to Play" overlay/modal accessible at any time.

### 2.6 Gesture Calibration
- **FR-050**: The application SHALL include an optional calibration/practice mode where the user can test their gestures and see what the system detects.
- **FR-051**: The calibration screen SHALL show all three gestures with visual guides.

---

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-001**: Hand gesture detection SHALL run at ≥ 15 FPS on modern hardware.
- **NFR-002**: Gesture recognition latency SHALL be < 200ms from pose to classification.
- **NFR-003**: The application SHALL load in < 5 seconds on a broadband connection (first load with model caching).

### 3.2 Privacy & Security
- **NFR-010**: ALL processing SHALL occur client-side. No video, images, or data SHALL leave the browser.
- **NFR-011**: No external API calls SHALL be made during gameplay.
- **NFR-012**: The application SHALL not store or transmit any webcam data.

### 3.3 Compatibility
- **NFR-020**: The application SHALL work on Chrome 90+, Firefox 90+, Edge 90+.
- **NFR-021**: The application SHALL use standard Web APIs (MediaDevices, Canvas, Web Audio, WebGL).

### 3.4 Offline Capability
- **NFR-030**: After initial load and model caching, the application SHOULD work offline.

### 3.5 Accessibility
- **NFR-040**: The application SHALL include keyboard navigation for all non-gesture UI controls.
- **NFR-041**: The application SHALL include ARIA labels on interactive elements.
- **NFR-042**: The application SHALL support high-contrast mode.

---

## 4. Technical Requirements

### 4.1 Technology Stack
- **TR-001**: Frontend: HTML5, CSS3, Vanilla JavaScript (ES Modules) — no framework required.
- **TR-002**: Hand Tracking: MediaPipe Hands (@mediapipe/hands) via CDN or bundled.
- **TR-003**: Audio: Web Audio API (synthesized — no external audio files).
- **TR-004**: Build: Vanilla (single-page app) or lightweight bundler (Vite).
- **TR-005**: Testing: Vitest + Testing Library for unit/integration tests; Playwright for E2E.

### 4.2 Architecture
- **TR-010**: The application SHALL follow a modular architecture with clear separation:
  - `gesture/` — Hand detection, landmark analysis, gesture classification
  - `game/` — Game state machine, rules engine, AI opponent
  - `audio/` — Sound synthesis, audio manager
  - `ui/` — DOM rendering, animations, screen management
  - `utils/` — Shared helpers
- **TR-011**: The game state SHALL be managed via a finite state machine with states:
  - `IDLE` → `COUNTDOWN` → `CAPTURE` → `RESULT` → `MATCH_END` / `IDLE`
- **TR-012**: All modules SHALL be testable in isolation (dependency injection for webcam/audio).

### 4.3 Data Persistence
- **TR-020**: Game statistics and preferences SHALL be stored in localStorage.
- **TR-021**: Stored data: high scores, win/loss record, audio preferences, last selected mode.

---

## 5. Game Rules

| Player | AI     | Result     |
|--------|--------|------------|
| Rock   | Scissors | Player Wins |
| Rock   | Paper    | AI Wins     |
| Paper  | Rock     | Player Wins |
| Paper  | Scissors | AI Wins     |
| Scissors | Paper  | Player Wins |
| Scissors | Rock   | AI Wins     |
| Same   | Same     | Draw        |

---

## 6. User Stories

- **US-001**: As a player, I want to start a game by selecting a mode so I can play casually or competitively.
- **US-002**: As a player, I want to see a live preview of my webcam so I know I'm positioned correctly.
- **US-003**: As a player, I want a countdown so I know when to show my gesture.
- **US-004**: As a player, I want audio cues during the countdown so I can play without looking at the screen.
- **US-005**: As a player, I want to see my detected gesture in real-time so I can adjust before the round captures.
- **US-006**: As a player, I want to see animated results so the game feels exciting.
- **US-007**: As a player, I want to practice my gestures in a calibration mode before playing.
- **US-008**: As a player, I want my stats saved between sessions so I can track my record.
- **US-009**: As a player, I want to mute sounds if I'm in a quiet environment.
- **US-010**: As a player, I want the game to work without an internet connection after the first load.

---

## 7. Acceptance Criteria

- [ ] Webcam feed displays in browser after permission grant.
- [ ] Rock, Paper, Scissors gestures are each recognized with ≥ 80% accuracy in good lighting.
- [ ] Countdown audio and visuals play correctly.
- [ ] AI makes a choice and result is computed correctly per game rules.
- [ ] Scores update accurately after each round.
- [ ] Best-of-N mode correctly declares a match winner.
- [ ] Audio can be muted/unmuted and volume adjusted.
- [ ] Game state resets properly between matches.
- [ ] Calibration mode shows detected gestures with visual feedback.
- [ ] All data stays local — confirmed via network tab inspection.
- [ ] Application loads and runs without external network requests (after cache).
- [ ] Test suite passes with ≥ 90% code coverage on game logic modules.

---

## 8. Out of Scope (v1)

- Multiplayer / networked play
- Mobile device support (touch gestures)
- Custom gesture training
- Webcam recording or screenshots
- Leaderboards or social features
- Lizard, Spock extended rules (future enhancement)

---

*Document Version: 1.0*
*Created: 2026-02-26*
