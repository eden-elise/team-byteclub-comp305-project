// explorationScene.test.js
import { strict as assert } from 'assert';
import { JSDOM } from 'jsdom';
import { describe, it, beforeEach, afterEach } from 'node:test';

let ExplorationSceneController;
let gameState;

let dom;
let origCreateElement;
let origStartRoom;

describe('ExplorationSceneController (unit)', () => {
  beforeEach(async () => {
    // 1. Set up a minimal DOM BEFORE importing controller / components
    const html = `<!doctype html><html><head></head><body>
      <div id="exploration-header" style="background-image: url('old.png')"></div>

      <section id="player-section" style="visibility: visible;">
        <div id="player-name"></div>
        <img id="player-sprite" />
      </section>

      <section id="npc-section" style="visibility: visible;">
        <div id="npc-name"></div>
        <img id="npc-sprite" />
      </section>

      <div id="choice-container"></div>
      <button id="skip-cutscene-btn"></button>

      <!-- placeholder; controller replaces with <typewriter-textbox> -->
      <div id="dialogue-text"></div>
    </body></html>`;

    dom = new JSDOM(html, { url: 'http://localhost/' });

    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.customElements = dom.window.customElements;
    globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
    globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);

    // 2. Polyfill localStorage for GameState (browser-only API)
    if (!globalThis.localStorage) {
      const store = {};
      globalThis.localStorage = {
        getItem(key) {
          return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
        },
        setItem(key, value) {
          store[key] = String(value);
        },
        removeItem(key) {
          delete store[key];
        },
        clear() {
          for (const k of Object.keys(store)) delete store[k];
        },
      };
    }

    // 3. Dynamically import modules AFTER DOM + localStorage exist
    const sceneModule = await import('../../src/client/scenes/explorationScene.js');
    ExplorationSceneController = sceneModule.ExplorationSceneController;

    const stateModule = await import('../../src/gameplay/state/GameState.js');
    gameState = stateModule.gameState;

    // 4. Prevent constructor from auto-running room events (we want unit tests, not full flows)
    origStartRoom = ExplorationSceneController.prototype.startRoom;
    ExplorationSceneController.prototype.startRoom = async function () {
      // no-op in tests; individual specs can call processNextEvent/startRoom if needed
    };

    // 5. Mock <typewriter-textbox> so we get a simple test double
    origCreateElement = document.createElement.bind(document);
    document.createElement = (tagName) => {
      const tag = String(tagName).toLowerCase();
      if (tag === 'typewriter-textbox') {
        const el = origCreateElement('div');
        el.id = 'dialogue-text';
        el.className = 'dialogue-panel__text';

        // Minimal API used by the controller
        el.init = () => {};
        el.queue = (_text, opts = {}) => {
          if (opts.onComplete) setTimeout(opts.onComplete, 0);
        };
        el.resize = async () => {};
        el.clear = () => { el._cleared = true; };
        el.getQueueLength = () => 0;
        el.isActive = () => false;

        return el;
      }
      return origCreateElement(tagName);
    };

    // 6. Keep GameState neutral across tests if supported
    if (gameState && typeof gameState.clearSave === 'function') {
      gameState.clearSave();
    }
  });

  afterEach(() => {
    // Restore patched methods
    if (ExplorationSceneController && origStartRoom) {
      ExplorationSceneController.prototype.startRoom = origStartRoom;
    }
    if (origCreateElement) {
      document.createElement = origCreateElement;
    }

    // Clean globals
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.HTMLElement;
    delete globalThis.customElements;
    delete globalThis.getComputedStyle;
    delete globalThis.requestAnimationFrame;
    // Keep localStorage around or delete it if you want total isolation:
    // delete globalThis.localStorage;

    dom = undefined;
    ExplorationSceneController = undefined;
    gameState = undefined;
    origCreateElement = undefined;
    origStartRoom = undefined;
  });

  // ───────────────────────────────────────────────
  // initializeUI
  // ───────────────────────────────────────────────

  describe('initializeUI()', () => {
    it('hides player & npc sections and creates a typewriter controller', () => {
      const room = { id: 'room1', events: [], connections: [] };
      const player = { name: 'Hero', image: 'hero.png' };

      const controller = new ExplorationSceneController(room, player);

      const playerSection = document.getElementById('player-section');
      const npcSection = document.getElementById('npc-section');

      assert.strictEqual(
        playerSection.style.visibility,
        'hidden',
        'player section should start hidden'
      );
      assert.strictEqual(
        npcSection.style.visibility,
        'hidden',
        'npc section should start hidden'
      );

      assert.ok(controller.typewriterController, 'typewriterController should be set');
      assert.strictEqual(
        controller.typewriterController.id,
        'dialogue-text',
        'typewriterController should have id "dialogue-text"'
      );
    });

    it('wires skip button to skipCutscene()', async () => {
      const room = { id: 'room1', events: [], connections: [] };
      const player = { name: 'Hero', image: 'hero.png' };

      const controller = new ExplorationSceneController(room, player);

      let called = false;
      controller.skipCutscene = () => { called = true; };

      const btn = document.getElementById('skip-cutscene-btn');
      btn.click();

      await new Promise((r) => setTimeout(r, 0));
      assert.ok(called, 'clicking skip button should call skipCutscene()');
    });
  });

  // ───────────────────────────────────────────────
  // showDialogue
  // ───────────────────────────────────────────────

  describe('showDialogue()', () => {
    it('queues text on the typewriter and resolves when complete', async () => {
      const room = { id: 'room1', events: [], connections: [] };
      const player = { name: 'Hero', image: 'hero.png' };
      const controller = new ExplorationSceneController(room, player);

      let queuedText = null;
      controller.typewriterController.queue = (text, opts = {}) => {
        queuedText = text;
        if (opts.onComplete) setTimeout(opts.onComplete, 0);
      };

      await controller.showDialogue({ text: 'Hello world', speed: 10, speaker: 'Narrator' });

      assert.strictEqual(
        queuedText,
        'Hello world',
        'showDialogue should queue the provided text on the typewriter'
      );
    });
  });

  // ───────────────────────────────────────────────
  // showChoices & handleChoiceClick
  // ───────────────────────────────────────────────

  describe('showChoices() & handleChoiceClick()', () => {
    it('renders choice buttons and runs callback + processNextEvent on click', async () => {
      const room = { id: 'room1', events: [], connections: [] };
      const player = { name: 'Hero', image: 'hero.png' };
      const controller = new ExplorationSceneController(room, player);

      // Simplify: no-op resize
      controller.typewriterController.resize = async () => {};

      let callbackCalled = false;
      let nextEventCalled = false;

      controller.processNextEvent = async () => { nextEventCalled = true; };

      const choices = [
        {
          text: 'Yes',
          callback: async () => { callbackCalled = true; },
        },
      ];

      await controller.showChoices({ choices });

      const btn = document.querySelector('.choice-btn');
      assert.ok(btn, 'choice button should be rendered');

      btn.click();
      await new Promise((r) => setTimeout(r, 0));

      assert.ok(callbackCalled, 'choice callback should be invoked on click');
      assert.ok(nextEventCalled, 'processNextEvent should be called after handling choice');
    });
  });

  // ───────────────────────────────────────────────
  // entityEnter
  // ───────────────────────────────────────────────

  describe('entityEnter()', () => {
    it('populates NPC name/sprite and runs animation on right side', async () => {
      const room = { id: 'room1', events: [], connections: [] };
      const player = { name: 'Hero', image: 'hero.png' };
      const controller = new ExplorationSceneController(room, player);

      const animCalls = [];
      const anim = async (section, target, dir) => {
        animCalls.push({ id: section.id, target, dir });
        section.style.transform = `translateX(${target})`;
      };

      await controller.entityEnter({
        entity: { name: 'Goblin', image: 'goblin.png' },
        position: 'right',
        animation: anim,
      });

      const npcName = document.getElementById('npc-name').textContent;
      const npcSprite = document.getElementById('npc-sprite').src;

      assert.strictEqual(npcName, 'GOBLIN', 'NPC name should be uppercased');
      assert.ok(npcSprite.includes('goblin.png'), 'NPC sprite src should include the image path');
      assert.strictEqual(animCalls.length, 1, 'animation should be invoked once');
    });
  });

  // ───────────────────────────────────────────────
  // skipCutscene
  // ───────────────────────────────────────────────

  describe('skipCutscene()', () => {
    it('advances to next battle, clears dialogue and choices, and calls processNextEvent', async () => {
      const events = [
        { type: 'dialogue', params: { text: 'a' } },
        { type: 'dialogue', params: { text: 'b' } },
        { type: 'battle', params: { enemy: { name: 'Boss' } } },
        { type: 'dialogue', params: { text: 'after' } },
      ];
      const room = { id: 'room-skip', events, connections: [] };
      const player = { name: 'Hero', image: 'hero.png' };
      const controller = new ExplorationSceneController(room, player);

      controller.currentEventIndex = 0;

      controller.typewriterController.clear = () => { controller.typewriterController._cleared = true; };

      const choiceContainer = document.getElementById('choice-container');
      choiceContainer.innerHTML = '<button>dummy</button>';

      let nextEventCalled = false;
      controller.processNextEvent = async () => { nextEventCalled = true; };

      controller.skipCutscene();
      await new Promise((r) => setTimeout(r, 0));

      assert.strictEqual(
        controller.currentEventIndex,
        2,
        'skipCutscene should jump to the next battle index (2)'
      );
      assert.ok(
        controller.typewriterController._cleared,
        'skipCutscene should clear dialogue via typewriterController.clear()'
      );
      assert.strictEqual(
        choiceContainer.innerHTML,
        '',
        'skipCutscene should clear choices'
      );
      assert.ok(
        nextEventCalled,
        'skipCutscene should call processNextEvent at the new index'
      );
    });
  });

  // ───────────────────────────────────────────────
  // addCustomChoices & clearChoices
  // ───────────────────────────────────────────────

  describe('addCustomChoices() & clearChoices()', () => {
    it('adds custom choice buttons and runs callbacks, then clearChoices empties container', async () => {
      const room = { id: 'roomX', events: [], connections: [] };
      const player = { name: 'Hero', image: 'hero.png' };
      const controller = new ExplorationSceneController(room, player);

      let callbackInvoked = false;
      controller.addCustomChoices([
        {
          text: 'Opt',
          callback: async () => { callbackInvoked = true; },
        },
      ]);

      const btn = document.querySelector('.choice-btn');
      assert.ok(btn, 'custom choice button should be rendered');

      btn.click();
      await new Promise((r) => setTimeout(r, 0));

      assert.ok(callbackInvoked, 'custom choice callback should be invoked');

      controller.clearChoices();
      assert.strictEqual(
        document.getElementById('choice-container').innerHTML,
        '',
        'clearChoices should empty the choice container'
      );
    });
  });
});
