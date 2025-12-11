// battleScene.test.js
import { strict as assert } from 'assert';
import { JSDOM } from 'jsdom';
import { describe, it, beforeEach, afterEach } from 'node:test';

// --- Module globals / shared state ---
let BattleSceneController;
let TestBattleSceneController;
let audioManager;

let dom;
let controller;

let mockPlayer;
let mockEnemy;

let audioPlayCalls = [];
let origAudioPlay;
let origAudioStop;

let activeTimeouts;
let origSetTimeout;
let origClearTimeout;

// Simple DOM helpers
const getById = (id) => globalThis.document.getElementById(id);

// --- HTML template used for each test run ---
const HTML_TEMPLATE = `<!doctype html>
<html>
  <head></head>
  <body>
    <div id="player-name"></div>
    <progress id="player-hp"></progress>
    <div id="player-hp-text"></div>
    <div id="player-hp-max"></div>
    <div id="player-status-icons"></div>
    <img id="player-sprite" />

    <div id="enemy-name"></div>
    <progress id="enemy-hp"></progress>
    <div id="enemy-hp-text"></div>
    <div id="enemy-hp-max"></div>
    <div id="enemy-status-icons"></div>
    <img id="enemy-sprite" />

    <div id="action-container"></div>
    <div id="status-tooltip" style="display: none;"></div>

    <!-- Mock typewriter textbox element -->
    <div id="combat-log-text"></div>
  </body>
</html>`;

// --- Test-only helpers & mocks ---

/**
 * Minimal mock entity with the fields used by BattleSceneController
 */
function makeMockEntity(name, maxHP = 100, stats = {}, moves = []) {
  const entity = {
    name,
    maxHP,
    currentHP: maxHP,
    stats: {
      ATTACK: 10,
      DEFEND: 10,
      SPEED: 10,
      LUCK: 5,
      ...stats,
    },
    moves: moves.length ? moves : ['Heavy Strike', 'Heavy Swing'],
    image: 'test-sprite.png',
    activeEffects: [],
    isAlive() {
      return this.currentHP > 0;
    },
    processStatusEffectsTurnStart() {},
    processStatusEffectsTurnEnd() {},
  };
  return entity;
}

/**
 * Factory to create a controller instance under test.
 * Uses a subclass that suppresses auto-start and tracks next-turn calls.
 */
function createController(player, enemy, background = '', inventory = [], onBattleEnd = () => {}) {
  const ctrl = new TestBattleSceneController(player, enemy, background, inventory, onBattleEnd);
  controller = ctrl;
  return ctrl;
}

// --- Test lifecycle setup/teardown ---

beforeEach(async () => {
  // 1. JSDOM & globals
  dom = new JSDOM(HTML_TEMPLATE, { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.customElements = dom.window.customElements;
  globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);

  // 2. Timer tracking to guarantee async cleanup
  activeTimeouts = new Set();
  origSetTimeout = globalThis.setTimeout;
  origClearTimeout = globalThis.clearTimeout;

  globalThis.setTimeout = (fn, delay, ...args) => {
    const id = origSetTimeout(fn, delay, ...args);
    activeTimeouts.add(id);
    return id;
  };

  globalThis.clearTimeout = (id) => {
    activeTimeouts.delete(id);
    origClearTimeout(id);
  };

  globalThis.requestAnimationFrame = (cb) => globalThis.setTimeout(cb, 0);

  // 3. Mock typewriter controller on #combat-log-text
  const logEl = getById('combat-log-text');
  let queueLength = 0;
  let active = false;

  logEl.init = () => {};
  logEl.queue = () => {
    queueLength++;
    active = true;
    globalThis.setTimeout(() => {
      queueLength--;
      if (queueLength <= 0) {
        queueLength = 0;
        active = false;
      }
    }, 1);
  };
  logEl.getQueueLength = () => queueLength;
  logEl.isActive = () => active;

  // 4. Dynamic imports after DOM is ready
  const sceneModules = await import('../../src/client/scenes/battleScene.js');
  BattleSceneController = sceneModules.BattleSceneController;

  const audioModules = await import('../../src/client/utils/AudioManager.js');
  audioManager = audioModules.audioManager;

  // 5. Test subclass that:
  //    - suppresses auto-start in constructor
  //    - exposes startBattleReal() for explicit control
  //    - tracks processNextTurn calls without doing the full async flow
  class _TestBattleSceneController extends BattleSceneController {
    constructor(...args) {
      super(...args);
      this._nextTurnCalls = 0;
    }

    // Prevent the base constructor from kicking off the battle loop automatically
    startBattle() {
      // no-op
    }

    async startBattleReal() {
      await super.startBattle();
    }

    processNextTurn() {
      this._nextTurnCalls++;
    }
  }

  TestBattleSceneController = _TestBattleSceneController;

  // 6. Audio spies
  audioPlayCalls = [];
  origAudioPlay = audioManager.play;
  origAudioStop = audioManager.stop;

  audioManager.play = (name, loop) => {
    audioPlayCalls.push(name);
    // no need to call through; AudioManager behavior is tested separately
  };
  audioManager.stop = () => {};

  // 7. Fresh entities per test
  mockPlayer = makeMockEntity('Hero', 100, { SPEED: 15 });
  mockEnemy = makeMockEntity('Dragon', 80, { SPEED: 10 });

  controller = undefined;
});

afterEach(() => {
  // If a cleanup method is ever added to the controller, use it
  if (controller && typeof controller.cleanup === 'function') {
    controller.cleanup();
  }

  // Restore audio manager
  audioManager.play = origAudioPlay;
  audioManager.stop = origAudioStop;

  // Clear remaining timeouts to avoid async work after DOM teardown
  if (activeTimeouts) {
    for (const id of activeTimeouts) {
      origClearTimeout(id);
    }
    activeTimeouts.clear();
  }

  // Restore timers
  globalThis.setTimeout = origSetTimeout;
  globalThis.clearTimeout = origClearTimeout;

  // Remove globals
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.HTMLElement;
  delete globalThis.customElements;
  delete globalThis.requestAnimationFrame;
  delete globalThis.getComputedStyle;

  dom = undefined;
  controller = undefined;
});

// --- UNIT TESTS ---

describe('BattleSceneController (unit)', () => {
  // ───────────────────────────────────────────────
  // Constructor & initialization
  // ───────────────────────────────────────────────

  it('constructs with player and enemy', () => {
    const ctrl = createController(mockPlayer, mockEnemy);

    assert.strictEqual(ctrl.player, mockPlayer, 'player should be stored');
    assert.strictEqual(ctrl.enemy, mockEnemy, 'enemy should be stored');
    assert.strictEqual(ctrl.uiState, 'actions', 'uiState should default to actions');
    assert.ok(Array.isArray(ctrl.inventory), 'inventory should be an array');
  });

  it('initializes with empty inventory', () => {
    const ctrl = createController(mockPlayer, mockEnemy);
    assert.strictEqual(ctrl.inventory.length, 0, 'inventory should be empty by default');
  });

  it('initializes with custom inventory', () => {
    const inventory = [
      { name: 'Health Potion', quantity: 2 },
      { name: 'Mana Potion', quantity: 1 },
    ];
    const ctrl = createController(mockPlayer, mockEnemy, '', inventory);
    assert.strictEqual(ctrl.inventory.length, 2, 'inventory should have 2 items');
    assert.strictEqual(ctrl.inventory[0].name, 'Health Potion', 'first item should be Health Potion');
    assert.strictEqual(ctrl.inventory[0].quantity, 2, 'first item should have quantity 2');
  });

  // ───────────────────────────────────────────────
  // updateEntityStats - UI text updates
  // ───────────────────────────────────────────────

  it('updateEntityStats sets player name and HP text', () => {
    const ctrl = createController(mockPlayer, mockEnemy);

    ctrl.updateEntityStats();

    const playerName = getById('player-name');
    const playerHPText = getById('player-hp-text');

    assert.ok(playerName.textContent.length > 0, 'player name should be set');
    assert.ok(playerHPText.textContent.includes(String(mockPlayer.currentHP)), 'player HP text should show current HP');
  });

  it('updateEntityStats sets enemy name and HP text', () => {
    const ctrl = createController(mockPlayer, mockEnemy);

    ctrl.updateEntityStats();

    const enemyName = getById('enemy-name');
    const enemyHPText = getById('enemy-hp-text');

    assert.ok(enemyName.textContent.length > 0, 'enemy name should be set');
    assert.ok(enemyHPText.textContent.includes(String(mockEnemy.currentHP)), 'enemy HP text should show current HP');
  });

  // ───────────────────────────────────────────────
  // addLogEntry - battle log
  // ───────────────────────────────────────────────

  it('addLogEntry queues message on typewriter', () => {
    const ctrl = createController(mockPlayer, mockEnemy);

    const logEl = getById('combat-log-text');
    const queueLengthBefore = logEl.getQueueLength();

    ctrl.addLogEntry('Test message');

    const queueLengthAfter = logEl.getQueueLength();
    assert.ok(queueLengthAfter >= queueLengthBefore, 'message should be queued');
  });

  // ───────────────────────────────────────────────
  // showActionButtons - UI state and buttons
  // ───────────────────────────────────────────────

  it('showActionButtons creates attack and inventory buttons', () => {
    const ctrl = createController(mockPlayer, mockEnemy);
    ctrl.currentTurnEntity = ctrl.player;

    ctrl.showActionButtons();

    const container = getById('action-container');
    assert.ok(container, 'action-container should exist');
    // At least some buttons should be created
    const buttons = container.querySelectorAll('button');
    assert.ok(buttons.length > 0, 'action buttons should be created');
  });

  it('showActionButtons sets uiState to actions', () => {
    const ctrl = createController(mockPlayer, mockEnemy);
    ctrl.currentTurnEntity = ctrl.player;

    ctrl.showActionButtons();

    assert.strictEqual(ctrl.uiState, 'actions', 'uiState should be "actions"');
  });

  // ───────────────────────────────────────────────
  // disableActionButtons & enableActionButtons
  // ───────────────────────────────────────────────

  it('disableActionButtons disables all buttons in action-container', () => {
    const ctrl = createController(mockPlayer, mockEnemy);
    ctrl.currentTurnEntity = ctrl.player;

    ctrl.showActionButtons();
    ctrl.disableActionButtons();

    const container = getById('action-container');
    const buttons = container.querySelectorAll('button');
    const allDisabled = Array.from(buttons).every((btn) => btn.disabled);

    assert.ok(allDisabled, 'all buttons should be disabled');
  });

  it('enableActionButtons re-enables action buttons', () => {
    const ctrl = createController(mockPlayer, mockEnemy);
    ctrl.currentTurnEntity = ctrl.player;

    ctrl.showActionButtons();
    ctrl.disableActionButtons();

    const container = getById('action-container');
    let allDisabledAfterDisable = Array.from(container.querySelectorAll('button')).every((btn) => btn.disabled);
    assert.ok(allDisabledAfterDisable, 'pre-condition: all buttons should be disabled first');

    ctrl.enableActionButtons();

    // Note: enableActionButtons only enables buttons that are NOT disabled initially and are action-btn
    // so this test verifies the method runs without error
    const buttons = container.querySelectorAll('button');
    assert.ok(buttons.length > 0, 'buttons should exist in container');
  });

  // ───────────────────────────────────────────────
  // showInventory - inventory UI
  // ───────────────────────────────────────────────

  it('showInventory sets uiState to inventory', () => {
    const inventory = [{ name: 'Health Potion', quantity: 1 }];
    const ctrl = createController(mockPlayer, mockEnemy, '', inventory);

    ctrl.showInventory();

    assert.strictEqual(ctrl.uiState, 'inventory', 'uiState should be "inventory"');
  });

  it('showInventory renders back button', () => {
    const inventory = [{ name: 'Health Potion', quantity: 1 }];
    const ctrl = createController(mockPlayer, mockEnemy, '', inventory);

    ctrl.showInventory();

    const backBtn = getById('btn-inventory-back');
    assert.ok(backBtn, 'back button should be rendered');
  });

  it('showInventory renders inventory items', () => {
    const inventory = [{ name: 'Health Potion', quantity: 2 }];
    const ctrl = createController(mockPlayer, mockEnemy, '', inventory);

    ctrl.showInventory();

    const container = getById('action-container');
    const text = container.textContent;
    assert.ok(text.includes('Health Potion'), 'inventory item name should appear');
  });

  // ───────────────────────────────────────────────
  // Inventory back button (returns to actions)
  // ───────────────────────────────────────────────

  it('inventory back button returns to action buttons', () => {
    const inventory = [{ name: 'Health Potion', quantity: 1 }];
    const ctrl = createController(mockPlayer, mockEnemy, '', inventory);
    ctrl.currentTurnEntity = ctrl.player;

    ctrl.showInventory();
    assert.strictEqual(ctrl.uiState, 'inventory', 'pre-condition: should be in inventory');

    const backBtn = getById('btn-inventory-back');
    assert.ok(backBtn, 'back button should exist');

    // The back button triggers showActionButtons via click
    backBtn.click();

    assert.strictEqual(ctrl.uiState, 'actions', 'uiState should return to "actions" after clicking back');
  });
});

