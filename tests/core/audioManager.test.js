/**
 * @fileoverview Unit tests for AudioManager, covering sound loading, playback,
 * volume management, and integration scenarios. These tests use a mock Audio API
 * to verify sound lifecycle and volume scaling behavior.
 * @module tests/core/audioManager.test
 */

import { strict as assert } from 'assert';
import { describe, it, beforeEach, afterEach } from 'node:test';

import { AudioManager, audioManager } from '../../src/client/utils/AudioManager.js';

/**
 * Compares two numbers for approximate equality, accounting for floating-point
 * precision errors. Fails the assertion if the absolute difference exceeds epsilon.
 *
 * @param {number} actual - The actual computed value.
 * @param {number} expected - The expected target value.
 * @param {string} message - The assertion error message.
 * @param {number} [epsilon=1e-10] - Maximum acceptable difference; defaults to 1e-10.
 */
function assertApproxEqual(actual, expected, message, epsilon = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) < epsilon,
    `${message} (expected ~${expected}, got ${actual})`,
  );
}

describe('AudioManager (unit)', () => {
  /** @type {AudioManager} */
  let manager;
  /** @type {any[]} */
  let mockAudioInstances;

  beforeEach(() => {
    mockAudioInstances = [];

    /**
     * Minimal mock for the browser Audio API. Simulates essential Audio behavior:
     * src assignment, volume control, playback state, and promise-based play method.
     * This avoids actual audio file loading in tests.
     */
    globalThis.Audio = class MockAudio {
      constructor(src) {
        this.src = src;
        this.volume = 1.0;
        this.loop = false;
        this.currentTime = 0;
        this.playing = false;

        mockAudioInstances.push(this);
      }

      play() {
        this.playing = true;
        return Promise.resolve();
      }

      pause() {
        this.playing = false;
      }
    };

    manager = new AudioManager();
  });

  afterEach(() => {
    delete globalThis.Audio;
    mockAudioInstances = [];
  });

  describe('load()', () => {
    it('creates an Audio instance and stores it under the given name', () => {
      manager.load('test-sound', 'sounds/test.mp3');

      assert.ok(manager.sounds['test-sound'], 'sound should be stored by name');
      assert.strictEqual(mockAudioInstances.length, 1, 'one Audio instance should be created');
      assert.strictEqual(
        mockAudioInstances[0].src,
        'sounds/test.mp3',
        'Audio src should match the provided path',
      );
    });

    it('stores baseVolume and applies it to the underlying Audio volume', () => {
      manager.load('test-sound', 'sounds/test.mp3', 0.5);

      const { audio, baseVolume } = manager.sounds['test-sound'];
      assert.strictEqual(baseVolume, 0.5, 'baseVolume should be stored');
      assert.strictEqual(audio.volume, 0.5, 'Audio volume should equal baseVolume when masterVolume=1');
    });

    it('applies master volume when loading a sound', () => {
      manager.setMasterVolume(50); // 0.5
      manager.load('test-sound', 'sounds/test.mp3', 0.8);

      const { audio } = manager.sounds['test-sound'];
      assertApproxEqual(
        audio.volume,
        0.4,
        'Audio volume should be baseVolume * masterVolume',
      );
    });

    it('defaults baseVolume to 1 when not specified', () => {
      manager.load('test-sound', 'sounds/test.mp3');

      const { audio, baseVolume } = manager.sounds['test-sound'];
      assert.strictEqual(baseVolume, 1, 'baseVolume should default to 1');
      assert.strictEqual(audio.volume, 1, 'Audio volume should default to 1 when masterVolume=1');
    });

    it('overwrites existing sound with the same name', () => {
      manager.load('test-sound', 'sounds/old.mp3', 0.2);
      const firstAudio = manager.sounds['test-sound'].audio;

      manager.load('test-sound', 'sounds/new.mp3', 0.7);
      const { audio: secondAudio, baseVolume } = manager.sounds['test-sound'];

      assert.notStrictEqual(firstAudio, secondAudio, 'second load should create a new Audio instance');
      assert.strictEqual(
        secondAudio.src,
        'sounds/new.mp3',
        'second load should overwrite src for the same name',
      );
      assert.strictEqual(baseVolume, 0.7, 'baseVolume should be updated on overwrite');
    });
  });

  describe('play()', () => {
    beforeEach(() => {
      manager.load('test-sound', 'sounds/test.mp3', 1.0);
    });

    it('plays a loaded sound and sets playing flag', () => {
      const audio = manager.sounds['test-sound'].audio;

      manager.play('test-sound');

      assert.strictEqual(audio.playing, true, 'Audio should be playing');
    });

    it('resets currentTime to 0 before playing', () => {
      const audio = manager.sounds['test-sound'].audio;
      audio.currentTime = 5;

      manager.play('test-sound');

      assert.strictEqual(audio.currentTime, 0, 'currentTime should reset to 0 before play');
    });

    it('sets loop property based on argument', () => {
      const audio = manager.sounds['test-sound'].audio;

      manager.play('test-sound', true);
      assert.strictEqual(audio.loop, true, 'loop should be true when play is called with true');

      manager.play('test-sound', false);
      assert.strictEqual(audio.loop, false, 'loop should be false when play is called with false');
    });

    it('does nothing and does not throw if sound is not loaded', () => {
      assert.doesNotThrow(
        () => manager.play('nonexistent-sound'),
        'play() should not throw for unknown sound names',
      );
    });

    it('swallows play() rejections from the underlying Audio API without noisy console output', async () => {
      const audio = manager.sounds['test-sound'].audio;
      audio.play = () => Promise.reject(new Error('blocked'));

      // NEW: silence only this test → prevents noise from logged Errors
      const originalLog = console.log;
      let loggedArgs = null;
      console.log = (...args) => {
        loggedArgs = args; // capture the log, but suppress printing
      };

      try {
        assert.doesNotThrow(
          () => manager.play('test-sound'),
          'play() should catch underlying Audio.play() rejections',
        );

        await Promise.resolve(); // allow catch() to run

        // Ensure logging still occurred (testing correctness)
        assert.ok(loggedArgs, 'play() should log when Audio.play() rejects');
        assert.strictEqual(loggedArgs[0], 'Audio blocked:', 'first console.log arg should match');
        assert.ok(loggedArgs[1] instanceof Error, 'second console.log arg should be the Error');
      } finally {
        console.log = originalLog; // restore
      }
    });
  });

  describe('stop()', () => {
    beforeEach(() => {
      manager.load('test-sound', 'sounds/test.mp3', 1.0);
    });

    it('stops a playing sound and clears playing flag', () => {
      const audio = manager.sounds['test-sound'].audio;
      manager.play('test-sound');
      assert.strictEqual(audio.playing, true, 'Audio should start playing');

      manager.stop('test-sound');
      assert.strictEqual(audio.playing, false, 'Audio should be stopped');
    });

    it('resets currentTime to 0 when stopping', () => {
      const audio = manager.sounds['test-sound'].audio;
      audio.currentTime = 3.5;

      manager.stop('test-sound');

      assert.strictEqual(audio.currentTime, 0, 'currentTime should reset to 0 when stopping');
    });

    it('does nothing and does not throw if sound is not loaded', () => {
      assert.doesNotThrow(
        () => manager.stop('nonexistent-sound'),
        'stop() should not throw for unknown sound names',
      );
    });
  });

  describe('setMasterVolume()', () => {
    it('converts 0–100 scale to 0–1', () => {
      manager.setMasterVolume(50);
      assert.strictEqual(manager.masterVolume, 0.5, '50 should map to 0.5');

      manager.setMasterVolume(100);
      assert.strictEqual(manager.masterVolume, 1.0, '100 should map to 1.0');

      manager.setMasterVolume(0);
      assert.strictEqual(manager.masterVolume, 0, '0 should map to 0');
    });

    it('updates volume of all loaded sounds based on baseVolume', () => {
      manager.load('sound-1', 'sounds/1.mp3', 0.5);
      manager.load('sound-2', 'sounds/2.mp3', 0.8);

      manager.setMasterVolume(50); // 0.5

      assertApproxEqual(
        manager.sounds['sound-1'].audio.volume,
        0.25,
        'sound-1 volume should be baseVolume * masterVolume',
      );
      assertApproxEqual(
        manager.sounds['sound-2'].audio.volume,
        0.4,
        'sound-2 volume should be baseVolume * masterVolume',
      );
    });

    it('applies current master volume to sounds loaded after the change', () => {
      manager.setMasterVolume(50); // 0.5
      manager.load('new-sound', 'sounds/new.mp3', 0.6);

      assertApproxEqual(
        manager.sounds['new-sound'].audio.volume,
        0.3, // 0.6 * 0.5
        'newly loaded sound should honor current masterVolume',
      );
    });

    it('handles edge cases where masterVolume is 0 or 100', () => {
      manager.load('test-sound', 'sounds/test.mp3', 0.5);

      manager.setMasterVolume(0);
      assertApproxEqual(
        manager.sounds['test-sound'].audio.volume,
        0,
        'volume should be 0 when masterVolume is 0',
      );

      manager.setMasterVolume(100);
      assertApproxEqual(
        manager.sounds['test-sound'].audio.volume,
        0.5,
        'volume should restore to baseVolume when masterVolume is 1',
      );
    });
  });

  describe('singleton audioManager export', () => {
    it('exports a singleton instance of AudioManager', () => {
      assert.ok(audioManager, 'audioManager should be exported');
      assert.ok(
        audioManager instanceof AudioManager,
        'audioManager should be an instance of AudioManager',
      );
    });

    /* //Should be removed or rewritten for isolation as Singleton pattern is global
    //and breaks test isolation
    it('singleton holds state between calls', () => {
      audioManager.load('singleton-test', 'sounds/test.mp3');

      assert.ok(
        audioManager.sounds['singleton-test'],
        'loaded sound should remain on the singleton instance',
      );
    });
    */
  });

  describe('integration scenarios', () => {
    it('handles multiple sounds playing simultaneously', () => {
      manager.load('music', 'sounds/music.mp3', 0.6);
      manager.load('sfx', 'sounds/sfx.mp3', 1.0);

      manager.play('music', true);
      manager.play('sfx', false);

      assert.strictEqual(
        manager.sounds['music'].audio.playing,
        true,
        'music should be playing',
      );
      assert.strictEqual(
        manager.sounds['sfx'].audio.playing,
        true,
        'sfx should be playing',
      );

      manager.stop('music');
      assert.strictEqual(
        manager.sounds['music'].audio.playing,
        false,
        'music should be stopped',
      );
      assert.strictEqual(
        manager.sounds['sfx'].audio.playing,
        true,
        'sfx should still be playing',
      );
    });

    it('adjusts volumes of all sounds proportionally when master volume changes', () => {
      manager.load('sound-1', 'sounds/1.mp3', 0.4);
      manager.load('sound-2', 'sounds/2.mp3', 0.8);

      manager.setMasterVolume(75); // 0.75

      assertApproxEqual(
        manager.sounds['sound-1'].audio.volume,
        0.3, // 0.4 * 0.75
        'sound-1 volume should be scaled by masterVolume',
      );
      assertApproxEqual(
        manager.sounds['sound-2'].audio.volume,
        0.6, // 0.8 * 0.75
        'sound-2 volume should be scaled by masterVolume',
      );

      manager.setMasterVolume(25); // 0.25

      assertApproxEqual(
        manager.sounds['sound-1'].audio.volume,
        0.1, // 0.4 * 0.25
        'sound-1 volume should be updated after masterVolume changes again',
      );
      assertApproxEqual(
        manager.sounds['sound-2'].audio.volume,
        0.2, // 0.8 * 0.25
        'sound-2 volume should be updated after masterVolume changes again',
      );
    });
  });
});