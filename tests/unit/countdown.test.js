import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { COUNTDOWN_BEATS, COUNTDOWN_INTERVAL_MS } from '../../src/utils/constants.js';
import { Countdown } from '../../src/game/countdown.js';

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires onTick with first beat immediately on start', () => {
    const countdown = new Countdown();
    const onTick = vi.fn();
    const onComplete = vi.fn();

    countdown.start(onTick, onComplete);

    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTick).toHaveBeenCalledWith(COUNTDOWN_BEATS[0], 0);
  });

  it('fires all four beats in order', () => {
    const countdown = new Countdown();
    const onTick = vi.fn();
    const onComplete = vi.fn();

    countdown.start(onTick, onComplete);

    for (let i = 1; i < COUNTDOWN_BEATS.length; i++) {
      vi.advanceTimersByTime(COUNTDOWN_INTERVAL_MS);
    }

    expect(onTick).toHaveBeenCalledTimes(COUNTDOWN_BEATS.length);
    COUNTDOWN_BEATS.forEach((beat, index) => {
      expect(onTick).toHaveBeenNthCalledWith(index + 1, beat, index);
    });
  });

  it('calls onComplete after last beat', () => {
    const countdown = new Countdown();
    const onTick = vi.fn();
    const onComplete = vi.fn();

    countdown.start(onTick, onComplete);

    for (let i = 1; i < COUNTDOWN_BEATS.length; i++) {
      vi.advanceTimersByTime(COUNTDOWN_INTERVAL_MS);
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('can be cancelled mid-countdown', () => {
    const countdown = new Countdown();
    const onTick = vi.fn();
    const onComplete = vi.fn();

    countdown.start(onTick, onComplete);
    vi.advanceTimersByTime(COUNTDOWN_INTERVAL_MS);

    expect(onTick).toHaveBeenCalledTimes(2);

    countdown.cancel();
    vi.advanceTimersByTime(COUNTDOWN_INTERVAL_MS * 5);

    expect(onTick).toHaveBeenCalledTimes(2);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('fires ticks at COUNTDOWN_INTERVAL_MS intervals', () => {
    const countdown = new Countdown();
    const onTick = vi.fn();
    const onComplete = vi.fn();

    countdown.start(onTick, onComplete);

    vi.advanceTimersByTime(COUNTDOWN_INTERVAL_MS - 1);
    expect(onTick).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(onTick).toHaveBeenCalledTimes(2);
  });
});
