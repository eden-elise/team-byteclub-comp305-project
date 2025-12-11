/**
 * @fileoverview Unit tests for MainMenuSceneController, covering initialization,
 * button interactions, save file checking, user input detection, and cleanup.
 * Tests use JSDOM to simulate a browser environment and spies for audio and
 * animation control.
 * @module tests/core/MainMenuScene.test
 */

// ===========================================================================================
// IMPORTS & CONFIGURATION
// ===========================================================================================

import { strict as assert } from 'assert';
import { JSDOM } from 'jsdom';
import { describe, it, beforeEach, afterEach } from 'node:test';

import { MainMenuSceneController } from '../../src/client/scenes/mainMenuScene.js';
import { gameState } from '../../src/gameplay/state/GameState.js';
import { audioManager } from '../../src/client/utils/AudioManager.js';

const MAIN_MENU_HTML = `<!doctype html>
<html>
  <body>
    <div id="background"></div>
    <div id="birds-container"></div>
    <div id="lightning-flash"></div>

    <!-- Add this wrapper that your real code expects -->
    <div class="ui-container">
      <div id="title-text"><h1>Dravic's Castle</h1></div>

      <div id="menu-buttons">
        <div id="initial-buttons">
          <button id="btn-play">Play</button>
          <button id="btn-exit">Exit</button>
        </div>

        <div id="secondary-buttons" style="display: none">
          <div id="continue-container">
            <button id="btn-continue">Continue</button>
            <div id="save-info"></div>
          </div>
          <button id="btn-load-file">Load File</button>
          <button id="btn-new-game">New Game</button>
          <button id="btn-back">Back</button>
        </div>
      </div>
    </div>

    <div id="exit-confirmation" style="display: none">
      <button id="btn-exit-yes">Yes</button>
      <button id="btn-exit-no">No</button>
    </div>
  </body>
</html>`;

// ===========================================================================================
// TEST STATE & HELPERS
// ===========================================================================================

let dom;
/**
 * Shared controller instance across tests. Held for proper cleanup in afterEach.
 */
let controller;

let origGetFullSaveData;
let origAudioPlay;
let origAudioStop;
let origWindowClose;
/**
 * Prevents animation sequence timers from running in tests.
 * Tests run too fast for animation to meaningfully complete.
 */
let origStartAnimationSequence;

let audioPlayCalls;
let audioStopCalls;

/**
 * Default callback stubs passed to controller constructor.
 * Individual tests override these as needed.
 */
const defaultCallbacks = {
  onNewGame: () => {},
  onContinue: () => {},
  onLoadFile: () => {},
};

/**
 * Set up the JSDOM environment with the main menu HTML template.
 */
function setupDom() {
  dom = new JSDOM(MAIN_MENU_HTML, { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
}

/**
 * Tear down the JSDOM environment and clean globals.
 */
function teardownDom() {
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.localStorage;
  dom = undefined;
}

/**
 * Install audio manager spies to track play and stop calls.
 * Calls are recorded without triggering actual audio playback.
 */
function installAudioSpies() {
  origAudioPlay = audioManager.play;
  origAudioStop = audioManager.stop;
  audioPlayCalls = [];
  audioStopCalls = [];

  audioManager.play = (name, loop) => {
    audioPlayCalls.push({ name, loop });
  };
  audioManager.stop = (name) => {
    audioStopCalls.push({ name });
  };
}

/**
 * Restore original audio manager methods after test completion.
 */
function restoreAudio() {
  audioManager.play = origAudioPlay;
  audioManager.stop = origAudioStop;
}

/**
 * Check if a specific audio track was played, optionally with a predicate.
 *
 * @param {string} name - The audio track name.
 * @param {Function} [predicate=()=>true] - Optional filter function.
 * @returns {boolean} True if the audio was played matching the predicate.
 */
function audioPlayed(name, predicate = () => true) {
  return audioPlayCalls.some((c) => c.name === name && predicate(c));
}

/**
 * Check if a specific audio track was stopped.
 *
 * @param {string} name - The audio track name.
 * @returns {boolean} True if the audio was stopped.
 */
function audioStopped(name) {
  return audioStopCalls.some((c) => c.name === name);
}

/**
 * Factory to create a controller instance with optional callback overrides.
 *
 * @param {Object} [overrides={}] - Optional callback overrides.
 * @returns {MainMenuSceneController} A controller instance ready for testing.
 */
function createController(overrides = {}) {
  controller = new MainMenuSceneController({ ...defaultCallbacks, ...overrides });
  return controller;
}

/**
 * Helper to dispatch a DOM click event on an element by ID.
 *
 * @param {string} id - The element ID to click.
 * @param {string} [type='click'] - The event type (click, change, etc.).
 */
function click(id, type = 'click') {
  const el = document.getElementById(id);
  assert.ok(el, `Expected element #${id} to exist`);
  el.dispatchEvent(new dom.window.Event(type, { bubbles: true }));
}

describe('MainMenuSceneController (unit)', () => {
  beforeEach(() => {
    setupDom();
    localStorage.clear();

    /**
     * Save original gameState.getFullSaveData method to spy on it during tests.
     */
    origGetFullSaveData = gameState.getFullSaveData;

    installAudioSpies();

    /**
     * Mock window.close to track exit attempts without actually closing the window.
     */
    origWindowClose = window.close;
    window.close = () => {
      window.close.called = true;
    };
    window.close.called = false;

    /**
     * Suppress animation timers during tests. Animations run asynchronously and
     * tests complete faster than animations can finish. We replace with a no-op
     * to prevent timeout-related test failures and unnecessary delays.
     */
    origStartAnimationSequence =
      MainMenuSceneController.prototype.startAnimationSequence;
    MainMenuSceneController.prototype.startAnimationSequence = function () {
      // Intentionally disabled for test speed and isolation
    };

    controller = undefined;
  });

  afterEach(() => {
    /**
     * Call cleanup on the controller if it exists. This clears timers and
     * intervals to prevent async work from running after test completion.
     */
    if (controller && typeof controller.cleanup === 'function') {
      controller.cleanup();
    }
    controller = undefined;

    /**
     * Restore all patched prototype methods and globals to their original state.
     */
    MainMenuSceneController.prototype.startAnimationSequence =
      origStartAnimationSequence;

    gameState.getFullSaveData = origGetFullSaveData;
    restoreAudio();
    window.close = origWindowClose;
    teardownDom();
  });

  // ------------------------------------------------------------------------------------
  // constructor / init
  // ------------------------------------------------------------------------------------

  describe('constructor', () => {
    it('stores callbacks and initializes flags', () => {
      // IMPORTANT: call constructor directly so callbacks reference is preserved
      const callbacks = {
        onNewGame: () => {},
        onContinue: () => {},
        onLoadFile: () => {},
      };

      const ctrl = new MainMenuSceneController(callbacks);

      assert.strictEqual(ctrl.callbacks, callbacks);
      assert.strictEqual(ctrl.animationComplete, false);
      assert.strictEqual(ctrl.userInterrupted, false);
    });
  });

  describe('init()', () => {
    it('plays loading-screen music in a loop on initialization', () => {
      audioPlayCalls = [];

      createController();

      const loadingCalls = audioPlayCalls.filter(
        (c) => c.name === 'loading-screen',
      );
      assert.strictEqual(loadingCalls.length, 1);
      assert.strictEqual(loadingCalls[0].loop, true);
    });
  });

  // ------------------------------------------------------------------------------------
  // checkSaveFile
  // ------------------------------------------------------------------------------------

  describe('checkSaveFile()', () => {
    it('hides continue container when no save exists', () => {
      gameState.getFullSaveData = () => null;

      createController();

      const container = document.getElementById('continue-container');
      assert.strictEqual(container.style.display, 'none');
    });

    it('shows continue container and writes basic save info when save exists', () => {
      gameState.getFullSaveData = () => ({
        hero: { name: 'Alice', level: 3, classId: 'mage' },
        metadata: { timestamp: Date.now() },
      });

      createController();

      const container = document.getElementById('continue-container');
      const saveInfo = document.getElementById('save-info');
      const html = saveInfo.innerHTML;

      assert.strictEqual(container.style.display, 'flex');
      assert.ok(html.includes('Alice'));
      assert.ok(html.includes('Level 3'));
      assert.ok(html.includes('MAGE'));
    });
  });

  // ------------------------------------------------------------------------------------
  // Buttons
  // ------------------------------------------------------------------------------------

  describe('button handlers', () => {
    it('Play button calls showSecondaryMenu and plays button-click audio', () => {
      const original = MainMenuSceneController.prototype.showSecondaryMenu;
      let called = false;

      try {
        MainMenuSceneController.prototype.showSecondaryMenu = function () {
          called = true;
        };

        createController();

        audioPlayCalls = [];
        click('btn-play');

        assert.ok(called, 'showSecondaryMenu should be called');
        assert.ok(
          audioPlayed('button-click'),
          'button-click should be played on Play',
        );
      } finally {
        MainMenuSceneController.prototype.showSecondaryMenu = original;
      }
    });

    it('Exit button calls showExitConfirmation and plays button-click audio', () => {
      const original = MainMenuSceneController.prototype.showExitConfirmation;
      let called = false;

      try {
        MainMenuSceneController.prototype.showExitConfirmation = function () {
          called = true;
        };

        createController();

        audioPlayCalls = [];
        click('btn-exit');

        assert.ok(called, 'showExitConfirmation should be called');
        assert.ok(
          audioPlayed('button-click'),
          'button-click should be played on Exit',
        );
      } finally {
        MainMenuSceneController.prototype.showExitConfirmation = original;
      }
    });

    it('Exit Yes button calls window.close and plays button-click', () => {
      createController();

      audioPlayCalls = [];
      window.close.called = false;

      click('btn-exit-yes');

      assert.strictEqual(window.close.called, true);
      assert.ok(audioPlayed('button-click'));
    });

    it('Exit No button calls hideExitConfirmation and plays button-click', () => {
      const original = MainMenuSceneController.prototype.hideExitConfirmation;
      let called = false;

      try {
        MainMenuSceneController.prototype.hideExitConfirmation = function () {
          called = true;
        };

        createController();

        audioPlayCalls = [];
        click('btn-exit-no');

        assert.ok(called, 'hideExitConfirmation should be called');
        assert.ok(audioPlayed('button-click'));
      } finally {
        MainMenuSceneController.prototype.hideExitConfirmation = original;
      }
    });

    it('New Game button stops loading-screen, invokes callback, and plays button-click', () => {
      let invoked = false;

      createController({
        onNewGame: () => {
          invoked = true;
        },
      });

      audioPlayCalls = [];
      audioStopCalls = [];

      click('btn-new-game');

      assert.ok(audioStopped('loading-screen'));
      assert.ok(invoked, 'onNewGame callback should be invoked');
      assert.ok(audioPlayed('button-click'));
    });

    it('Continue button stops loading-screen, invokes callback, and plays button-click', () => {
      gameState.getFullSaveData = () => ({
        hero: { name: 'Bob', level: 1, classId: 'knight' },
        metadata: { timestamp: Date.now() },
      });

      let invoked = false;

      createController({
        onContinue: () => {
          invoked = true;
        },
      });

      audioPlayCalls = [];
      audioStopCalls = [];

      click('btn-continue');

      assert.ok(audioStopped('loading-screen'));
      assert.ok(invoked, 'onContinue callback should be invoked');
      assert.ok(audioPlayed('button-click'));
    });

    it('Back button calls hideSecondaryMenu and plays button-click', () => {
      const original = MainMenuSceneController.prototype.hideSecondaryMenu;
      let called = false;

      try {
        MainMenuSceneController.prototype.hideSecondaryMenu = function () {
          called = true;
        };

        createController();

        audioPlayCalls = [];
        click('btn-back');

        assert.ok(called, 'hideSecondaryMenu should be called');
        assert.ok(audioPlayed('button-click'));
      } finally {
        MainMenuSceneController.prototype.hideSecondaryMenu = original;
      }
    });

    it('Load File button creates input and triggers click()', () => {
      createController();

      const createdInputs = [];
      const origCreateElement = document.createElement;

      try {
        document.createElement = (tagName) => {
          if (tagName === 'input') {
            const fakeInput = {
              type: '',
              accept: '',
              clicks: 0,
              onchange: null,
              click() {
                this.clicks += 1;
              },
            };
            createdInputs.push(fakeInput);
            return fakeInput;
          }
          return origCreateElement.call(document, tagName);
        };

        audioPlayCalls = [];
        click('btn-load-file');

        assert.ok(audioPlayed('button-click'));
        assert.strictEqual(createdInputs.length, 1);

        const input = createdInputs[0];
        assert.strictEqual(input.type, 'file');
        assert.strictEqual(input.accept, '.json');
        assert.strictEqual(input.clicks, 1);
      } finally {
        document.createElement = origCreateElement;
      }
    });
  });

  // ------------------------------------------------------------------------------------
  // User input detection
  // ------------------------------------------------------------------------------------

  describe('setupUserInputDetection()', () => {
    it('first user input sets userInterrupted and calls skipToButtons once', () => {
      const original = MainMenuSceneController.prototype.skipToButtons;
      let skipCalls = 0;

      try {
        MainMenuSceneController.prototype.skipToButtons = function () {
          skipCalls += 1;
        };

        const ctrl = createController();

        // We only care about the interruption / skip; music is handled by init()
        document.dispatchEvent(
          new dom.window.Event('keydown', { bubbles: true }),
        );

        assert.strictEqual(ctrl.userInterrupted, true);
        assert.strictEqual(
          skipCalls,
          1,
          'skipToButtons should be called exactly once on first input',
        );

        // Second input should not trigger again due to { once: true } listener
        document.dispatchEvent(
          new dom.window.Event('keydown', { bubbles: true }),
        );
        assert.strictEqual(
          skipCalls,
          1,
          'skipToButtons should not be called again on subsequent input',
        );
      } finally {
        MainMenuSceneController.prototype.skipToButtons = original;
      }
    });
  });

  // ------------------------------------------------------------------------------------
  // cleanup
  // ------------------------------------------------------------------------------------

  describe('cleanup()', () => {
    it('clears all stored timeouts and intervals', () => {
      const ctrl = createController();

      const clearedTimeouts = [];
      const clearedIntervals = [];

      const origClearTimeout = globalThis.clearTimeout;
      const origClearInterval = globalThis.clearInterval;

      try {
        globalThis.clearTimeout = (id) => {
          clearedTimeouts.push(id);
        };
        globalThis.clearInterval = (id) => {
          clearedIntervals.push(id);
        };

        // Simulate timers having been registered
        ctrl.timeouts = [1, 2, 3];
        ctrl.intervals = [10, 20];

        ctrl.cleanup();

        assert.deepEqual(clearedTimeouts, [1, 2, 3]);
        assert.deepEqual(clearedIntervals, [10, 20]);
        assert.deepEqual(ctrl.timeouts, []);
        assert.deepEqual(ctrl.intervals, []);
      } finally {
        globalThis.clearTimeout = origClearTimeout;
        globalThis.clearInterval = origClearInterval;
      }
    });

    it('does not call clearTimeout/clearInterval when there are no timers', () => {
      const ctrl = createController();
      ctrl.timeouts = [];
      ctrl.intervals = [];

      let timeoutCalled = false;
      let intervalCalled = false;

      const origClearTimeout = globalThis.clearTimeout;
      const origClearInterval = globalThis.clearInterval;

      try {
        globalThis.clearTimeout = () => {
          timeoutCalled = true;
        };
        globalThis.clearInterval = () => {
          intervalCalled = true;
        };

        ctrl.cleanup();

        assert.strictEqual(timeoutCalled, false);
        assert.strictEqual(intervalCalled, false);
      } finally {
        globalThis.clearTimeout = origClearTimeout;
        globalThis.clearInterval = origClearInterval;
      }
    });
  });
});
