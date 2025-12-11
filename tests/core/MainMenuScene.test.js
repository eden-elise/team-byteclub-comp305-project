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

    <div id="exit-confirmation" style="display: none">
      <button id="btn-exit-yes">Yes</button>
      <button id="btn-exit-no">No</button>
    </div>
  </body>
</html>`;

let dom;
let controller; // shared instance for cleanup

let origGetFullSaveData;
let origAudioPlay;
let origAudioStop;
let origWindowClose;
let origStartAnimationSequence; // <--- stubbed in tests

let audioPlayCalls;
let audioStopCalls;

const defaultCallbacks = {
  onNewGame: () => {},
  onContinue: () => {},
  onLoadFile: () => {},
};

function setupDom() {
  dom = new JSDOM(MAIN_MENU_HTML, { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.localStorage = dom.window.localStorage;
}

function teardownDom() {
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.localStorage;
  dom = undefined;
}

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

function restoreAudio() {
  audioManager.play = origAudioPlay;
  audioManager.stop = origAudioStop;
}

function audioPlayed(name, predicate = () => true) {
  return audioPlayCalls.some((c) => c.name === name && predicate(c));
}

function audioStopped(name) {
  return audioStopCalls.some((c) => c.name === name);
}

function createController(overrides = {}) {
  controller = new MainMenuSceneController({ ...defaultCallbacks, ...overrides });
  return controller;
}

function click(id, type = 'click') {
  const el = document.getElementById(id);
  assert.ok(el, `Expected element #${id} to exist`);
  el.dispatchEvent(new dom.window.Event(type, { bubbles: true }));
}

describe('MainMenuSceneController (unit)', () => {
  beforeEach(() => {
    setupDom();
    localStorage.clear();

    origGetFullSaveData = gameState.getFullSaveData;

    installAudioSpies();

    origWindowClose = window.close;
    window.close = () => {
      window.close.called = true;
    };
    window.close.called = false;

    // *** Prevent animation timers from running in tests ***
    origStartAnimationSequence =
      MainMenuSceneController.prototype.startAnimationSequence;
    MainMenuSceneController.prototype.startAnimationSequence = function () {
      // no-op in tests
    };

    controller = undefined;
  });

  afterEach(() => {
    // Best-effort cleanup for any interval the test might set on the instance
    if (controller && typeof controller.cleanup === 'function') {
      controller.cleanup();
    }
    controller = undefined;

    MainMenuSceneController.prototype.startAnimationSequence =
      origStartAnimationSequence;

    gameState.getFullSaveData = origGetFullSaveData;
    restoreAudio();
    window.close = origWindowClose;
    teardownDom();
  });

  // ---------------------------------------------------------------------------
  // constructor / init
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // checkSaveFile
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Buttons
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // User input detection
  // ---------------------------------------------------------------------------

  describe('setupUserInputDetection()', () => {
    it('first user input sets userInterrupted, calls skipToButtons, and starts loading-screen music once', () => {
      const original = MainMenuSceneController.prototype.skipToButtons;
      let skipCalled = false;

      try {
        MainMenuSceneController.prototype.skipToButtons = function () {
          skipCalled = true;
        };

        const ctrl = createController();

        audioPlayCalls = [];

        // first input
        document.dispatchEvent(
          new dom.window.Event('keydown', { bubbles: true }),
        );

        assert.strictEqual(ctrl.userInterrupted, true);
        assert.ok(skipCalled, 'skipToButtons should be called once');
        const loadingCalls = audioPlayCalls.filter(
          (c) => c.name === 'loading-screen',
        );
        assert.strictEqual(loadingCalls.length, 1);
        assert.strictEqual(loadingCalls[0].loop, true);

        // second input should not trigger again
        const before = audioPlayCalls.length;
        document.dispatchEvent(
          new dom.window.Event('keydown', { bubbles: true }),
        );
        assert.strictEqual(audioPlayCalls.length, before);
      } finally {
        MainMenuSceneController.prototype.skipToButtons = original;
      }
    });
  });

  // ---------------------------------------------------------------------------
  // cleanup
  // ---------------------------------------------------------------------------

  describe('cleanup()', () => {
    it('clears birdInterval when set', () => {
      const ctrl = createController();
      let clearedWith = null;

      const origClearInterval = globalThis.clearInterval;
      globalThis.clearInterval = (id) => {
        clearedWith = id;
      };

      try {
        ctrl.birdInterval = 123;
        ctrl.cleanup();

        assert.strictEqual(clearedWith, 123);
      } finally {
        globalThis.clearInterval = origClearInterval;
      }
    });

    it('does not call clearInterval when birdInterval is undefined', () => {
      const ctrl = createController();
      let called = false;

      const origClearInterval = globalThis.clearInterval;
      globalThis.clearInterval = () => {
        called = true;
      };

      try {
        ctrl.birdInterval = undefined;
        ctrl.cleanup();

        assert.strictEqual(called, false);
      } finally {
        globalThis.clearInterval = origClearInterval;
      }
    });
  });
});