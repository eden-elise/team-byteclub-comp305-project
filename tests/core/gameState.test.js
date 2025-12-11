import { strict as assert } from 'assert';
import { describe, it, beforeEach, afterEach } from 'node:test';

import { GameState, gameState } from '../../src/gameplay/state/GameState.js';
import { createNewSave } from '../../src/gameplay/state/SaveSchema.js';

// Simple in-memory localStorage mock
function createMockLocalStorage() {
  let store = {};
  return {
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
      store = {};
    },
  };
}

describe('GameState (unit)', () => {
  let gs; // local GameState instance for isolation
  let originalLocalStorage;

  beforeEach(() => {
    // Save any existing localStorage and replace with mock
    originalLocalStorage = globalThis.localStorage;
    globalThis.localStorage = createMockLocalStorage();

    // fresh GameState for each test to avoid singleton pollution
    gs = new GameState();
  });

  afterEach(() => {
    // cleanup mock localStorage
    if (originalLocalStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = originalLocalStorage;
    }
  });

  describe('startNewGame()', () => {
    it('initializes a new save for a valid character and persists it', () => {
      gs.startNewGame('knight');

      assert.ok(
        gs.currentSaveData,
        'currentSaveData should be created after startNewGame',
      );
      assert.ok(
        gs.characterEntity,
        'characterEntity should be hydrated after startNewGame',
      );

      const raw = localStorage.getItem(gs.saveKey);
      assert.ok(
        raw,
        'save should be persisted to localStorage after startNewGame',
      );

      const parsed = JSON.parse(raw);
      assert.strictEqual(
        parsed.hero.classId,
        'knight',
        'persisted save should contain the chosen classId',
      );
    });

    it('logs error and does not throw for unknown character class', () => {
      const errorCalls = [];
      const origError = console.error;
      console.error = (...args) => {
        errorCalls.push(args.join(' '));
      };

      try {
        gs.startNewGame('not-a-class');

        assert.ok(
          errorCalls.length > 0,
          'console.error should be called for unknown class',
        );
        assert.strictEqual(
          gs.currentSaveData,
          null,
          'currentSaveData should remain null for invalid class',
        );
        assert.strictEqual(
          gs.characterEntity,
          null,
          'characterEntity should remain null for invalid class',
        );
      } finally {
        console.error = origError;
      }
    });
  });

  describe('saveGame() and loadGame()', () => {
    it('saveGame persists current entity state into localStorage and loadGame restores it', () => {
      // Start fresh game to populate structures
      gs.startNewGame('archer');

      // mutate entity state
      gs.characterEntity.currentHP = 5;
      gs.characterEntity.items = [{ name: 'TestItem', quantity: 1 }];

      // save and verify persisted JSON updated
      gs.saveGame();
      const persisted = JSON.parse(localStorage.getItem(gs.saveKey));
      assert.strictEqual(
        persisted.hero.currentHP,
        5,
        'persisted currentHP should match entity after saveGame',
      );
      assert.deepStrictEqual(
        persisted.hero.items,
        gs.characterEntity.items,
        'persisted items should match entity items',
      );

      // Create a new GameState and load from storage
      const gs2 = new GameState();
      const loaded = gs2.loadGame();
      assert.ok(
        loaded,
        'loadGame should return the parsed save data when present',
      );
      assert.ok(
        gs2.characterEntity,
        'hydrateCharacter should have created characterEntity on load',
      );
      assert.strictEqual(
        gs2.currentSaveData.hero.currentHP,
        5,
        'loaded save currentHP should match persisted value',
      );
    });

    it('saveGame does nothing when there is no save or character entity', () => {
      // Both currentSaveData and characterEntity are null by default
      assert.doesNotThrow(
        () => gs.saveGame(),
        'saveGame should not throw when there is no save/character',
      );
      assert.strictEqual(
        localStorage.getItem(gs.saveKey),
        null,
        'saveGame should not write to localStorage when nothing to save',
      );
    });

    it('loadGame returns null when no save exists', () => {
      const result = gs.loadGame();
      assert.strictEqual(
        result,
        null,
        'loadGame should return null when no save in localStorage',
      );
    });

    it('loadGame handles corrupted JSON gracefully', () => {
      const errorCalls = [];
      const origError = console.error;
      console.error = (...args) => {
        errorCalls.push(args.join(' '));
      };

      try {
        localStorage.setItem(gs.saveKey, '{ not valid json');
        const result = gs.loadGame();

        assert.strictEqual(
          result,
          null,
          'loadGame should return null for corrupted JSON',
        );
        assert.ok(
          errorCalls.length > 0,
          'console.error should be called when JSON parse fails',
        );
      } finally {
        console.error = origError;
      }
    });
  });

  describe('setCurrentScene()', () => {
    it('updates world.currentScene in save and persists it', () => {
      gs.startNewGame('knight');
      gs.setCurrentScene('introScene');

      const persisted = JSON.parse(localStorage.getItem(gs.saveKey));
      assert.strictEqual(
        persisted.world.currentScene,
        'introScene',
        'setCurrentScene should update persisted save',
      );
    });

    it('does nothing when no save exists', () => {
      assert.doesNotThrow(
        () => gs.setCurrentScene('sceneX'),
        'setCurrentScene should not throw without save',
      );
      assert.strictEqual(
        localStorage.getItem(gs.saveKey),
        null,
        'no save should be persisted when none existed',
      );
    });
  });

  describe('getSaveMetadata() and getFullSaveData()', () => {
    it('returns metadata and full data when save present', () => {
      gs.startNewGame('archer');
      const meta = gs.getSaveMetadata();
      const full = gs.getFullSaveData();

      assert.ok(
        meta && typeof meta === 'object',
        'getSaveMetadata should return metadata object when save exists',
      );
      assert.ok(
        full && typeof full === 'object',
        'getFullSaveData should return full save object when save exists',
      );
      assert.strictEqual(
        full.hero.classId,
        'archer',
        'full save should contain the correct classId',
      );
    });

    it('returns null when no valid save exists', () => {
      assert.strictEqual(
        gs.getSaveMetadata(),
        null,
        'getSaveMetadata should return null with no save',
      );
      assert.strictEqual(
        gs.getFullSaveData(),
        null,
        'getFullSaveData should return null with no save',
      );
    });

    it('returns null for corrupted JSON in metadata and full data', () => {
      localStorage.setItem(gs.saveKey, '{ not valid json');

      const meta = gs.getSaveMetadata();
      const full = gs.getFullSaveData();

      assert.strictEqual(
        meta,
        null,
        'getSaveMetadata should return null when JSON is corrupted',
      );
      assert.strictEqual(
        full,
        null,
        'getFullSaveData should return null when JSON is corrupted',
      );
    });
  });

  describe('loadFromFile()', () => {
    it('loads valid save JSON object and persists it', () => {
      const save = createNewSave('knight', { ATTACK: 1 }, 10, []);
      const ok = gs.loadFromFile(save);

      assert.strictEqual(
        ok,
        true,
        'loadFromFile should return true for valid save object',
      );
      assert.ok(
        gs.currentSaveData,
        'currentSaveData should be set after loadFromFile',
      );
      assert.ok(
        localStorage.getItem(gs.saveKey),
        'loaded save should be persisted to localStorage',
      );
    });

    it('returns false for invalid save object and logs error', () => {
      const errorCalls = [];
      const origError = console.error;
      console.error = (...args) => {
        errorCalls.push(args.join(' '));
      };

      try {
        const bad = { foo: 'bar' };
        const ok = gs.loadFromFile(bad);

        assert.strictEqual(
          ok,
          false,
          'loadFromFile should return false for invalid save structure',
        );
        assert.ok(
          errorCalls.length > 0,
          'console.error should be called for invalid save structure',
        );
      } finally {
        console.error = origError;
      }
    });

    it('handles hydration failure when classId is unknown', () => {
      const errorCalls = [];
      const origError = console.error;
      console.error = (...args) => {
        errorCalls.push(args.join(' '));
      };

      try {
        // craft a save with unknown classId
        const save = createNewSave('knight', { ATTACK: 1 }, 10, []);
        save.hero.classId = 'unknown_class_xyz';

        const ok = gs.loadFromFile(save);

        // As per current implementation, loadFromFile:
        // - validates shape
        // - sets currentSaveData
        // - calls hydrateCharacter (which logs error on unknown class)
        // - calls saveGame
        // - returns true
        assert.strictEqual(
          ok,
          true,
          'loadFromFile should return true even if hydrate logs an error (per implementation)',
        );
        assert.ok(
          gs.currentSaveData,
          'currentSaveData should be set even if hydrate failed',
        );
        assert.ok(
          errorCalls.length > 0,
          'console.error should be called when hydrate fails for unknown class',
        );
      } finally {
        console.error = origError;
      }
    });
  });

  describe('clearSave()', () => {
    it('removes save from localStorage and resets state', () => {
      gs.startNewGame('knight');
      assert.ok(
        localStorage.getItem(gs.saveKey),
        'precondition: save should exist',
      );

      gs.clearSave();
      assert.strictEqual(
        localStorage.getItem(gs.saveKey),
        null,
        'clearSave should remove persisted save',
      );
      assert.strictEqual(
        gs.currentSaveData,
        null,
        'currentSaveData should be null after clearSave',
      );
      assert.strictEqual(
        gs.characterEntity,
        null,
        'characterEntity should be null after clearSave',
      );
    });
  });

  describe('singleton export `gameState`', () => {
    it('is an instance of GameState and independent from new instances', () => {
      assert.ok(
        gameState instanceof GameState,
        'exported gameState should be an instance of GameState',
      );

      // Mutate singleton and verify new instance not polluted
      gameState.startNewGame('knight');
      const fresh = new GameState();
      assert.strictEqual(
        fresh.currentSaveData,
        null,
        'new GameState should start with null save even if singleton has one',
      );
    });
  });
});