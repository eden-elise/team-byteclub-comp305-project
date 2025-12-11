import { strict as assert } from 'assert';
import { JSDOM } from 'jsdom';
import { describe, it, beforeEach, afterEach } from 'node:test';

import { MainMenuSceneController } from '../../src/client/scenes/mainMenuScene.js';
import { gameState } from '../../src/gameplay/state/GameState.js';
import { audioManager } from '../../src/client/utils/AudioManager.js';

describe('MainMenuSceneController (integration)', () => {
  let dom;
  let controllers;

  // audio spy state + restorer
  let audioPlayCalls;
  let audioStopCalls;
  let restoreAudioManager;

  // animation stub restorer
  let restoreAnimations;

  const setupDom = () => {
    const html = `<!doctype html>
      <html>
      <head></head>
      <body>
        <div id="background" class="background-image"></div>
        <div id="birds-container" class="birds-container"></div>
        <div id="lightning-flash" class="lightning-flash"></div>

        <div class="ui-container">
          <div id="title-text" class="title-text"><h1>Dravic's Castle</h1></div>
          <div id="menu-buttons" class="menu-buttons">
            <div id="initial-buttons" class="button-row">
              <button id="btn-play" class="action-btn action-btn--primary">Play</button>
              <button id="btn-exit" class="action-btn">Exit</button>
            </div>
            <div id="secondary-buttons" style="display: none; flex-direction: column; gap: 2vh">
              <div id="continue-container" class="continue-container">
                <button id="btn-continue" class="action-btn action-btn--primary">Continue</button>
                <div id="save-info" class="save-info"></div>
              </div>
              <div class="button-row">
                <button id="btn-load-file" class="action-btn">Load File</button>
                <button id="btn-new-game" class="action-btn action-btn--primary">New Game</button>
              </div>
              <div style="margin-top: 2vh; text-align: center">
                <button id="btn-back" class="action-btn">Back</button>
              </div>
            </div>
          </div>
        </div>

        <div id="exit-confirmation" style="display: none">
          <div style="color: #d4af37; font-size: 1.5rem; text-align: center">
            Are you sure you want to exit?
          </div>
          <div class="button-row">
            <button id="btn-exit-yes" class="action-btn action-btn--primary">Yes</button>
            <button id="btn-exit-no" class="action-btn">No</button>
          </div>
        </div>
      </body>
      </html>`;

    dom = new JSDOM(html, { url: 'http://localhost/' });
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.localStorage = dom.window.localStorage;
  };

  // ---------- small helpers --------------------------------------------------

  function createController(callbacks) {
    const c = new MainMenuSceneController(callbacks);
    controllers.push(c);
    return c;
  }

  function click(id) {
    const el = document.getElementById(id);
    assert.ok(el, `Expected element #${id} to exist`);
    el.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  }

  function stubAudioManager() {
    const origPlay = audioManager.play;
    const origStop = audioManager.stop;

    audioPlayCalls = [];
    audioStopCalls = [];

    audioManager.play = (name, loop) => {
      audioPlayCalls.push({ name, loop });
    };
    audioManager.stop = (name) => {
      audioStopCalls.push({ name });
    };

    return () => {
      audioManager.play = origPlay;
      audioManager.stop = origStop;
      audioPlayCalls = [];
      audioStopCalls = [];
    };
  }

  function stubControllerAnimations() {
    const proto = MainMenuSceneController.prototype;

    const originals = {
      startAnimationSequence: proto.startAnimationSequence,
      showSecondaryMenu: proto.showSecondaryMenu,
      hideSecondaryMenu: proto.hideSecondaryMenu,
      showExitConfirmation: proto.showExitConfirmation,
      hideExitConfirmation: proto.hideExitConfirmation,
    };

    proto.startAnimationSequence = function () {};
    proto.showSecondaryMenu = function () {};
    proto.hideSecondaryMenu = function () {};
    proto.showExitConfirmation = function () {};
    proto.hideExitConfirmation = function () {};

    return () => {
      proto.startAnimationSequence = originals.startAnimationSequence;
      proto.showSecondaryMenu = originals.showSecondaryMenu;
      proto.hideSecondaryMenu = originals.hideSecondaryMenu;
      proto.showExitConfirmation = originals.showExitConfirmation;
      proto.hideExitConfirmation = originals.hideExitConfirmation;
    };
  }

  // ---------- lifecycle hooks ------------------------------------------------

  beforeEach(() => {
    setupDom();
    controllers = [];

    // Fresh storage / game state
    localStorage.clear();
    if (typeof gameState.clearSave === 'function') {
      gameState.clearSave();
    }

    // Spies / stubs
    restoreAudioManager = stubAudioManager();
    restoreAnimations = stubControllerAnimations();
  });

  afterEach(() => {
    // best-effort cleanup of any timers / listeners
    for (const c of controllers) {
      if (c && typeof c.cleanup === 'function') {
        c.cleanup();
      }
    }
    controllers = [];

    // restore stubs
    if (restoreAnimations) restoreAnimations();
    if (restoreAudioManager) restoreAudioManager();

    // tear down DOM
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.localStorage;
    dom = undefined;
  });

  // ======================= TESTS ============================================

  it('integrates with gameState to show continue info when a save exists', () => {
    gameState.startNewGame('knight');

    createController({});

    const continueContainer = document.getElementById('continue-container');
    const saveInfo = document.getElementById('save-info');

    assert.strictEqual(
      continueContainer.style.display,
      'flex',
      'continue container should be visible when save exists',
    );
    assert.ok(
      saveInfo.innerHTML.includes('Level'),
      'save info should show level from real gameState save',
    );
  });

  it('new game flow stops loading-screen and calls onNewGame callback', () => {
    const callbackCalls = [];

    createController({
      onNewGame: () => callbackCalls.push('newGame'),
    });

    audioPlayCalls = [];
    audioStopCalls = [];

    click('btn-play');
    click('btn-new-game');

    assert.ok(
      audioStopCalls.some((c) => c.name === 'loading-screen'),
      'loading-screen should be stopped when starting a new game',
    );
    assert.ok(
      callbackCalls.includes('newGame'),
      'onNewGame should be called in integration flow',
    );
  });

  it('continue flow with real save stops loading-screen and invokes onContinue', () => {
    gameState.startNewGame('archer');

    const callbackCalls = [];

    createController({
      onContinue: () => callbackCalls.push('continue'),
    });

    audioPlayCalls = [];
    audioStopCalls = [];

    click('btn-play');
    click('btn-continue');

    assert.ok(
      audioStopCalls.some((c) => c.name === 'loading-screen'),
      'loading-screen should be stopped on continue from real save',
    );
    assert.ok(
      callbackCalls.includes('continue'),
      'onContinue should be called in continue flow',
    );
  });

  it('user input interrupts intro once and does not replay loading music', () => {
    const origSkipToButtons = MainMenuSceneController.prototype.skipToButtons;
    let skipCalls = 0;

    try {
      MainMenuSceneController.prototype.skipToButtons = function () {
        skipCalls += 1;
      };

      createController({});

      const loadingCalls = audioPlayCalls.filter(
        (c) => c.name === 'loading-screen',
      );
      assert.strictEqual(
        loadingCalls.length,
        1,
        'loading-screen music should start once on init',
      );
      assert.strictEqual(
        loadingCalls[0].loop,
        true,
        'loading-screen music should loop on init',
      );

      const beforeCount = audioPlayCalls.length;

      // First user input
      document.dispatchEvent(
        new dom.window.Event('keydown', { bubbles: true }),
      );

      assert.strictEqual(
        skipCalls,
        1,
        'skipToButtons should be called exactly once on first user input',
      );
      assert.strictEqual(
        audioPlayCalls.length,
        beforeCount,
        'no new loading-screen play calls on first user input',
      );

      // Second user input should have no effect due to { once: true }
      document.dispatchEvent(
        new dom.window.Event('keydown', { bubbles: true }),
      );

      assert.strictEqual(
        skipCalls,
        1,
        'skipToButtons should not be called again on subsequent input',
      );
      assert.strictEqual(
        audioPlayCalls.length,
        beforeCount,
        'no additional loading-screen play calls after first input',
      );
    } finally {
      MainMenuSceneController.prototype.skipToButtons = origSkipToButtons;
    }
  });

  it('does not crash when callbacks are missing in full flow', () => {
    createController({});

    assert.doesNotThrow(() => {
      click('btn-play');
      click('btn-new-game');
    });
  });
});
