import { strict as assert } from 'assert';
import { JSDOM } from 'jsdom';
import { describe, it, beforeEach, afterEach } from 'node:test';

import { MainMenuSceneController } from '../../src/client/scenes/mainMenuScene.js';
import { gameState } from '../../src/gameplay/state/GameState.js';
import { audioManager } from '../../src/client/utils/AudioManager.js';

describe('MainMenuSceneController (integration)', () => {
  let dom;
  let origAudioPlay;
  let origAudioStop;
  let audioPlayCalls;
  let audioStopCalls;

  // animation-related methods we will stub in tests
  let origStartAnimationSequence;
  let origShowSecondaryMenu;
  let origHideSecondaryMenu;
  let origShowExitConfirmation;
  let origHideExitConfirmation;

  // keep track of controllers created in each test (for cleanup if needed)
  let controllers;

  const setupDom = () => {
    const html = `<!doctype html>
      <html>
      <head></head>
      <body>
        <div id="background" class="background-image"></div>
        <div id="birds-container" class="birds-container"></div>
        <div id="lightning-flash" class="lightning-flash"></div>
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

  function createController(callbacks) {
    const c = new MainMenuSceneController(callbacks);
    controllers.push(c);
    return c;
  }

  beforeEach(() => {
    setupDom();

    controllers = [];

    // Fresh storage / game state
    localStorage.clear();
    if (typeof gameState.clearSave === 'function') {
      gameState.clearSave();
    }

    // Spy audioManager
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

    // ---- critical: disable animation timers in integration tests ----
    origStartAnimationSequence =
      MainMenuSceneController.prototype.startAnimationSequence;
    origShowSecondaryMenu =
      MainMenuSceneController.prototype.showSecondaryMenu;
    origHideSecondaryMenu =
      MainMenuSceneController.prototype.hideSecondaryMenu;
    origShowExitConfirmation =
      MainMenuSceneController.prototype.showExitConfirmation;
    origHideExitConfirmation =
      MainMenuSceneController.prototype.hideExitConfirmation;

    MainMenuSceneController.prototype.startAnimationSequence = function () {};
    MainMenuSceneController.prototype.showSecondaryMenu = function () {};
    MainMenuSceneController.prototype.hideSecondaryMenu = function () {};
    MainMenuSceneController.prototype.showExitConfirmation = function () {};
    MainMenuSceneController.prototype.hideExitConfirmation = function () {};
  });

  afterEach(() => {
    // best-effort cleanup of any intervals on controllers
    for (const c of controllers) {
      if (c && typeof c.cleanup === 'function') {
        c.cleanup();
      }
    }
    controllers = [];

    // restore animation methods
    MainMenuSceneController.prototype.startAnimationSequence =
      origStartAnimationSequence;
    MainMenuSceneController.prototype.showSecondaryMenu =
      origShowSecondaryMenu;
    MainMenuSceneController.prototype.hideSecondaryMenu =
      origHideSecondaryMenu;
    MainMenuSceneController.prototype.showExitConfirmation =
      origShowExitConfirmation;
    MainMenuSceneController.prototype.hideExitConfirmation =
      origHideExitConfirmation;

    // restore audio
    audioManager.play = origAudioPlay;
    audioManager.stop = origAudioStop;
    audioPlayCalls = [];
    audioStopCalls = [];

    // tear down DOM
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.localStorage;
    dom = undefined;
  });

  it('integrates with gameState to show continue info when a save exists', () => {
    // Create a real save using gameState
    gameState.startNewGame('knight');

    const controller = createController({});
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
    const controller = createController({
      onNewGame: () => callbackCalls.push('newGame'),
    });

    audioPlayCalls = [];
    audioStopCalls = [];

    const btnPlay = document.getElementById('btn-play');
    const btnNewGame = document.getElementById('btn-new-game');

    btnPlay.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
    btnNewGame.dispatchEvent(new dom.window.Event('click', { bubbles: true }));

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
    const controller = createController({
      onContinue: () => callbackCalls.push('continue'),
    });

    audioPlayCalls = [];
    audioStopCalls = [];

    const btnPlay = document.getElementById('btn-play');
    const btnContinue = document.getElementById('btn-continue');

    btnPlay.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
    btnContinue.dispatchEvent(
      new dom.window.Event('click', { bubbles: true }),
    );

    assert.ok(
      audioStopCalls.some((c) => c.name === 'loading-screen'),
      'loading-screen should be stopped on continue from real save',
    );
    assert.ok(
      callbackCalls.includes('continue'),
      'onContinue should be called in continue flow',
    );
  });

  it('user input triggers music and skipToButtons only once end-to-end', () => {
    const controller = createController({});

    audioPlayCalls = [];

    document.dispatchEvent(
      new dom.window.Event('keydown', { bubbles: true }),
    );

    assert.ok(
      audioPlayCalls.some(
        (c) => c.name === 'loading-screen' && c.loop === true,
      ),
      'loading-screen music should start on first user input',
    );

    const firstCallCount = audioPlayCalls.length;

    document.dispatchEvent(
      new dom.window.Event('keydown', { bubbles: true }),
    );

    const secondCallCount = audioPlayCalls.length;

    assert.strictEqual(
      firstCallCount,
      secondCallCount,
      'no additional loading-screen play calls after first input',
    );
  });

  it('does not crash when callbacks are missing in full flow', () => {
    const controller = createController({});

    assert.doesNotThrow(() => {
      const btnPlay = document.getElementById('btn-play');
      btnPlay.dispatchEvent(
        new dom.window.Event('click', { bubbles: true }),
      );

      const btnNewGame = document.getElementById('btn-new-game');
      btnNewGame.dispatchEvent(
        new dom.window.Event('click', { bubbles: true }),
      );
    });
  });
});
