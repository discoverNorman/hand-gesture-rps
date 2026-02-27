# Hand Gesture Rock-Paper-Scissors

Browser-based Rock, Paper, Scissors game using real-time hand gesture detection via webcam. All processing runs locally in the browser with MediaPipe Hands, Vanilla JS, and Web Audio API. Designed for offline, privacy-first play with audio cues and comprehensive tests.

## Features

- Real-time hand gesture recognition (Rock, Paper, Scissors)
- AI opponent with random choices
- Best-of-N and Free Play modes
- Audio feedback via Web Audio API
- Calibration mode, stats tracking, responsive UI
- Full test suite with Vitest and Playwright (unit, integration, E2E)

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
npm run test:coverage
```

## Learning

Prompt used during development (copied verbatim):

> Hey buddy please create me the full requirements and store them in a MD file for. Hand gesture. Paper, rock, scissors through my webcam. Can you do that for me? I want it to run in my web browser, everything local, everything driven by hand gestures and with audio. When you're done with that requirements doc, can you then do a deep analysis of that requirements doc and then put it into an implementation plan store that also in an MD file? And then when we're done with that, can you use a mass amount of agents to go ahead and build that full game out with me, go ahead and add a set of tests like Martin Fowler would like? <-- this is a learning.

## License

MIT
