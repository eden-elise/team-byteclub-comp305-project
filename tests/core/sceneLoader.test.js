import { strict as assert } from 'assert';
import { JSDOM } from 'jsdom';
import { describe, it, beforeEach, afterEach } from 'node:test';

import { loadScene } from '../../src/client/sceneLoader.js';
import { gameState } from '../../src/gameplay/state/GameState.js';

describe('loadScene (node:test + jsdom)', () => {
  let dom;
  let fetchCalls;
  let originalSetCurrentScene;

  beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><head></head><body><div id="app"></div></body></html>', {
      url: 'http://localhost/',
    });

    // Bind jsdom globals (avoid overwriting readonly globals like navigator)
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.Node = dom.window.Node;
    globalThis.localStorage = dom.window.localStorage;

    // Mock fetch
    fetchCalls = [];
    globalThis.fetch = async (url) => {
      fetchCalls.push(url);
      return { text: async () => '<p>Mock scene HTML</p>' };
    };

    // Spy on gameState.setCurrentScene
    originalSetCurrentScene = gameState.setCurrentScene;
    gameState.setCurrentScene = (sceneName) => {
      if (!gameState.__spyCalls) gameState.__spyCalls = [];
      gameState.__spyCalls.push(sceneName);
    };
  });

  afterEach(() => {
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.navigator;
    delete globalThis.HTMLElement;
    delete globalThis.Node;
    delete globalThis.localStorage;
    delete globalThis.fetch;

    gameState.setCurrentScene = originalSetCurrentScene;
    delete gameState.__spyCalls;
  });

  it('fetches the correct HTML file for the given scene name', async () => {
    await loadScene('introScene');
    assert.equal(fetchCalls.length, 1);
    assert.equal(fetchCalls[0], './scenes/introScene.html');
  });

  it('injects fetched HTML into the #app container', async () => {
    const container = document.getElementById('app');
    assert.ok(container);
    await loadScene('introScene');
    assert.equal(container.innerHTML, '<p>Mock scene HTML</p>');
  });

  it('creates the base stylesheet link when it does not already exist', async () => {
    assert.equal(document.getElementById('base-style'), null);
    await loadScene('introScene');
    const baseLink = document.getElementById('base-style');
    assert.ok(baseLink);
    assert.equal(baseLink.rel, 'stylesheet');
    assert.ok(baseLink.href.includes('/css/base.css'));
  });

  it('does not create a second base stylesheet link if one already exists', async () => {
    const existingBase = document.createElement('link');
    existingBase.id = 'base-style';
    existingBase.rel = 'stylesheet';
    existingBase.href = './css/base.css';
    document.head.appendChild(existingBase);

    await loadScene('introScene');

    const baseLinks = document.querySelectorAll('#base-style');
    assert.equal(baseLinks.length, 1);
    assert.strictEqual(baseLinks[0], existingBase);
  });

  it('removes the existing scene stylesheet before adding a new one', async () => {
    const oldSceneLink = document.createElement('link');
    oldSceneLink.id = 'scene-style';
    oldSceneLink.rel = 'stylesheet';
    oldSceneLink.href = './css/oldScene.css';
    document.head.appendChild(oldSceneLink);

    await loadScene('newScene');

    const sceneLinks = document.querySelectorAll('#scene-style');
    assert.equal(sceneLinks.length, 1);
    const newSceneLink = sceneLinks[0];
    assert.ok(newSceneLink.href.includes('/css/newScene.css'));
    assert.notStrictEqual(newSceneLink, oldSceneLink);
  });

  it('uses sceneName as the default cssName when cssName is not provided', async () => {
    await loadScene('introScene');
    const sceneLink = document.getElementById('scene-style');
    assert.ok(sceneLink);
    assert.equal(sceneLink.rel, 'stylesheet');
    assert.ok(sceneLink.href.includes('/css/introScene.css'));
  });

  it('uses the provided cssName when one is explicitly passed', async () => {
    await loadScene('introScene', 'customTheme');
    const sceneLink = document.getElementById('scene-style');
    assert.ok(sceneLink);
    assert.equal(sceneLink.rel, 'stylesheet');
    assert.ok(sceneLink.href.includes('/css/customTheme.css'));
  });

  it('updates the current scene in gameState with the provided sceneName', async () => {
    await loadScene('introScene');
    assert.ok(Array.isArray(gameState.__spyCalls));
    assert.equal(gameState.__spyCalls.length, 1);
    assert.equal(gameState.__spyCalls[0], 'introScene');
  });
});
