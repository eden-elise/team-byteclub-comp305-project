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
 * Mock attack used for handleActionClick tests
 */
class MockAttack {
  constructor() {
    this.name = 'Heavy Strike'; // contains "heavy" and "strike"
  }

  async execute(attacker, target, controller) {
    target.currentHP -= 10;
    controller.addLogEntry('Enemy took damage!');
  }
}

/**
 * Factory to create a controller instance under test.
 * Uses a subclass that suppresses auto-start and tracks next-turn calls.
 */
function createController(player, enemy, inventory = [], onBattleEnd = () => {}) {
  const ctrl = new TestBattleSceneController(player, enemy, inventory, onBattleEnd);
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

  dom = undefined;
  controller = undefined;
});

// --- UNIT TESTS ---

describe('BattleSceneController (unit)', () => {
  // ───────────────────────────────────────────────
  // Initialization & Turn Order
  // ───────────────────────────────────────────────

  it('initializes UI and HP text correctly', () => {
    const ctrl = createController(mockPlayer, mockEnemy);

    // Names & sprites
    assert.equal(getById('player-name').textContent, mockPlayer.name.toUpperCase());
    assert.equal(getById('enemy-name').textContent, mockEnemy.name.toUpperCase());

    // Update stats and verify
    ctrl.updateEntityStats();
    assert.equal(getById('player-hp-text').textContent, String(mockPlayer.currentHP));
    assert.equal(getById('enemy-hp-text').textContent, String(mockEnemy.currentHP));

    // UI state defaults
    assert.equal(ctrl.uiState, 'actions');
  });

  it('sets turn order based on SPEED (player faster)', async () => {
    const ctrl = createController(mockPlayer, mockEnemy);

    await ctrl.startBattleReal();

    assert.strictEqual(ctrl.turnOrderQueue[0], mockPlayer);
    assert.strictEqual(ctrl.turnOrderQueue[1], mockEnemy);
  });

  // ───────────────────────────────────────────────
  // Action Buttons & State
  // ───────────────────────────────────────────────

  it('creates action buttons for the player turn', () => {
    const ctrl = createController(mockPlayer, mockEnemy);
    ctrl.currentTurnEntity = ctrl.player;

    ctrl.showActionButtons();

    assert.ok(getById('btn-attack-1'), 'Attack button 1 should exist');
    assert.ok(getById('btn-attack-2'), 'Attack button 2 should exist');
    assert.ok(getById('btn-inventory'), 'Inventory button should exist');
    assert.ok(
      audioPlayCalls.includes('button-click'),
      'Click audio should be played when showing action buttons'
    );
  });

  it('enables primary buttons after disableActionButtons', () => {
    const ctrl = createController(mockPlayer, mockEnemy);
    ctrl.currentTurnEntity = ctrl.player;

    ctrl.showActionButtons();

    const attackBtn = getById('btn-attack-1');
    const invBtn = getById('btn-inventory');

    assert.ok(attackBtn, 'Attack button should exist');
    assert.ok(invBtn, 'Inventory button should exist');

    // Disable first
    ctrl.disableActionButtons();
    assert.equal(attackBtn.disabled, true, 'Pre-condition: attack button must be disabled');
    assert.equal(invBtn.disabled, true, 'Pre-condition: inventory button must be disabled');

    // Enable again — this will keep failing until you fix enableActionButtons() in source
    ctrl.enableActionButtons();
    assert.equal(attackBtn.disabled, false, 'Attack button must be re-enabled');
    assert.equal(invBtn.disabled, false, 'Inventory button must be re-enabled');
  });

  // ───────────────────────────────────────────────
  // Inventory Rendering
  // ───────────────────────────────────────────────

  it('showInventory switches UI to inventory and renders back button', () => {
    const inventory = [{ name: 'Health Potion', quantity: 1 }];
    const ctrl = createController(mockPlayer, mockEnemy, inventory);

    ctrl.showInventory();

    assert.equal(ctrl.uiState, 'inventory', 'UI state should be "inventory"');
    const backBtn = getById('btn-inventory-back');
    assert.ok(backBtn, 'Back button must be present in inventory view');

    const actionContainerText = getById('action-container').textContent;
    assert.ok(
      actionContainerText.length > 0,
      'Inventory content should not be empty'
    );
    assert.ok(
      audioPlayCalls.includes('inventory'),
      'Inventory audio should be played'
    );
  });

  // ───────────────────────────────────────────────
  // executeItem flow (non-variable item)
  // ───────────────────────────────────────────────

  it('executeItem consumes item, plays audio, updates stats, and schedules next turn', async () => {
    const inventory = [{ name: 'Health Potion', quantity: 1 }];

    const ctrl = createController(mockPlayer, mockEnemy, inventory);

    // Stub out processTurn to avoid relying on real item implementations
    ctrl.processTurn = async (_entity, _itemInstance, target) => {
      target.currentHP += 10; // simple heal
      ctrl.addLogEntry('Player healed!');
    };

    // Avoid rebuilding complex UI in this test; just set state
    ctrl.showActionButtons = () => {
      ctrl.uiState = 'actions';
    };

    // Simulate a selected item as if selectInventoryItem had already run
    ctrl.selectedItem = {
      data: { name: 'Health Potion' },
    };
    ctrl.pendingItem = 0;

    mockPlayer.currentHP = 50;

    await ctrl.executeItem(mockPlayer);

    // HP should increase
    assert.equal(mockPlayer.currentHP, 60, 'Player HP should increase by 10');

    // Inventory item should be consumed
    assert.equal(ctrl.inventory.length, 0, 'Inventory slot should be removed after use');

    // UI should go back to actions
    assert.equal(ctrl.uiState, 'actions', 'UI state should return to "actions"');

    // Audio mapping should have played "health-potion"
    assert.ok(
      audioPlayCalls.includes('health-potion'),
      'Item audio "health-potion" should be played'
    );

    // A next turn should have been scheduled via setTimeout -> processNextTurn()
    // Controller uses 500ms delay, so wait >500 here
    await new Promise((resolve) => setTimeout(resolve, 600));
    assert.ok(ctrl._nextTurnCalls > 0, 'Next turn should be scheduled after item use');
  });

  // ───────────────────────────────────────────────
  // handleActionClick flow (attacks)
  // ───────────────────────────────────────────────

  it('handleActionClick executes attack, updates stats, plays audio, and queues next turn', async () => {
    const ctrl = createController(mockPlayer, mockEnemy);

    ctrl.currentTurnEntity = ctrl.player;
    ctrl.turnOrderQueue = [ctrl.player, ctrl.enemy];

    const startingEnemyHP = ctrl.enemy.currentHP;

    // Stub processTurn; we don't need full engine behavior here
    ctrl.processTurn = async (_entity, _action, target) => {
      target.currentHP -= 10;
      ctrl.addLogEntry('Enemy took damage!');
    };

    const attack = new MockAttack();

    const audioCountBefore = audioPlayCalls.length;

    await ctrl.handleActionClick(attack);

    // Enemy HP reduced
    assert.equal(
      ctrl.enemy.currentHP,
      startingEnemyHP - 10,
      'Enemy HP should be reduced by 10'
    );

    // Some attack-related audio should be played (exact key is AudioManager concern)
    assert.ok(
      audioPlayCalls.length > audioCountBefore,
      'Attack audio should be played'
    );

    // isProcessingTurn must be reset
    assert.equal(
      ctrl.isProcessingTurn,
      false,
      'isProcessingTurn must be false after action'
    );

    // Player should still be in the turnOrderQueue
    assert.ok(
      ctrl.turnOrderQueue.includes(ctrl.player),
      'Player should be re-queued for future turns'
    );

    // A next turn should have been scheduled (500ms delay)
    await new Promise((resolve) => setTimeout(resolve, 600));
    assert.ok(ctrl._nextTurnCalls > 0, 'Next turn should be scheduled after attack');
  });
});
