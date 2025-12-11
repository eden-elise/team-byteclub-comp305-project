import { jest } from '@jest/globals';

// We'll re-use this in mocks
function makeRegistry() {
  return {
    loadSceneCalls: [],
    createdControllers: {
      mainMenu: [],
      charSelect: [],
      introScroll: [],
      exploration: [],
      battle: [],
      optionsModal: [],
    },
    audioLoads: [],
  };
}

let registry = makeRegistry();

// ---------- Shared mock helpers ----------

function makeController(name) {
  return class {
    constructor(...args) {
      const inst = { args };
      const last = args[args.length - 1];
      if (typeof last === 'function') inst.callback = last;
      else if (last && typeof last === 'object') inst.options = last;
      registry.createdControllers[name].push(inst);
      return inst;
    }
  };
}

// ---------- Module mocks ----------

// sceneLoader.js
jest.unstable_mockModule('../../src/client/sceneLoader.js', () => ({
  loadScene: jest.fn(async (name, cssName) => {
    registry.loadSceneCalls.push({ name, cssName });
  }),
}));

// Controllers
jest.unstable_mockModule(
  '../../src/client/scenes/characterSelectScene.js',
  () => ({
    CharacterSelectSceneController: makeController('charSelect'),
  }),
);

jest.unstable_mockModule('../../src/client/scenes/mainMenuScene.js', () => ({
  MainMenuSceneController: makeController('mainMenu'),
}));

jest.unstable_mockModule('../../src/client/scenes/battleScene.js', () => ({
  BattleSceneController: makeController('battle'),
}));

jest.unstable_mockModule(
  '../../src/client/scenes/explorationScene.js',
  () => ({
    ExplorationSceneController: makeController('exploration'),
  }),
);

jest.unstable_mockModule(
  '../../src/client/components/optionsModal.js',
  () => ({
    OptionsModalController: makeController('optionsModal'),
  }),
);

jest.unstable_mockModule(
  '../../src/client/scenes/introScrollScene.js',
  () => ({
    IntroScrollSceneController: makeController('introScroll'),
  }),
);

// heroesRegistry.js (actual location: src/gameplay/definitions)
jest.unstable_mockModule('../../src/gameplay/definitions/heroesRegistry.js', () => {
  class MockHero {
    constructor() {
      this.name = this.constructor.name;
      this.currentHP = 10;
      this.maxHP = 10;
      this.items = [];
      this.stats = {};
    }
  }
  class Knight extends MockHero {}
  class Archer extends MockHero {}
  return { Knight, Archer };
});

// GameState.js (actual location: src/gameplay/state)
jest.unstable_mockModule('../../src/gameplay/state/GameState.js', () => {
  const gameState = {
    currentSaveData: null,
    characterEntity: null,
    getFullSaveData() {
      return this.currentSaveData;
    },
    saveGame() {
      this.__saved = true;
    },
    loadGame() {
      this.__loaded = true;
    },
    setCurrentScene(s) {
      this._scene = s;
    },
    clearSave() {
      this.currentSaveData = null;
      this.characterEntity = null;
    },
  };
  return { gameState };
});

// roomRegistry.js (actual location: src/gameplay/exploration)
jest.unstable_mockModule('../../src/gameplay/exploration/roomRegistry.js', () => ({
  getRoomById: (id) => ({ id }),
}));

// AudioManager.js
jest.unstable_mockModule('../../src/client/utils/AudioManager.js', () => ({
  audioManager: {
    load: (name, src) => {
      registry.audioLoads.push({ n: name, s: src });
    },
  },
}));

// ---------- Import main.js with mocks applied ----------

let initApp, startNewGame, continueGame, startFloorExploration, startBattle;

beforeEach(async () => {
  // fresh registry for each test
  registry = makeRegistry();

  // reset DOM per test (Jest's jsdom environment provides window/document)
  document.body.innerHTML = '<div id="app"></div>';
  // clear global handlers from previous runs if needed
  window.gameApp = undefined;
  window.explorationController = undefined;
  window.battleController = undefined;

  // Import the main module after mocks are registered so top-level code uses mocks
  const mainModule = await import('../../src/client/main.js');
  initApp = mainModule.initApp;
  startNewGame = mainModule.startNewGame;
  continueGame = mainModule.continueGame;
  startFloorExploration = mainModule.startFloorExploration;
  startBattle = mainModule.startBattle;
});

afterEach(() => {
  // Clear registry state
  registry = makeRegistry();
});

// ---------- Tests ----------

test('initApp constructs OptionsModalController, exposes gameApp and loads mainMenuScene', async () => {
  await initApp();

  expect(registry.createdControllers.optionsModal.length).toBe(1);
  expect(window.gameApp).toBeTruthy();
  expect(typeof window.gameApp.startNewGame).toBe('function');

  const mainMenuLoaded = registry.loadSceneCalls.find((c) => c.name === 'mainMenuScene');
  expect(mainMenuLoaded).toBeTruthy();
});

test('initApp constructs OptionsModalController, exposes gameApp and loads mainMenuScene', async () => {
  await initApp();

  expect(registry.createdControllers.optionsModal.length).toBe(1);
  expect(window.gameApp).toBeTruthy();
  expect(typeof window.gameApp.startNewGame).toBe('function');

  const mainMenuLoaded = registry.loadSceneCalls.find((c) => c.name === 'mainMenuScene');
  expect(mainMenuLoaded).toBeTruthy();
});
