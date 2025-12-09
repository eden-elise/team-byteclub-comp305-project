/*
This is the coreTesting document for our unit tests. 
It is intended to test key components and functions independent of 
their implementations.  

ADR notes: 
using Jest because it is a simple yet effective solution compared to other 
libraries. 

TODO: make each of these tests a separate file of coreTesting and this file 
should run a script to automate it. 
*/

//imports
import { jest } from '@jest/globals';

// -- Unit testing sceneLoader.js -- //
/**
 * Mock the gameState module so we can:
 *  - Observe calls to setCurrentScene
 *  - Avoid touching real game state
 */
jest.mock('../gameplay/state/GameState.js', () => ({
  gameState: {
    setCurrentScene: jest.fn(),
  },
}));

import { loadScene } from './sceneLoader.js';
import { gameState } from '../gameplay/state/GameState.js';

describe('loadScene', () => {
  /**
   * Runs before each individual test to ensure a clean 
   * DOM and fresh mocks so tests are isolated and repeatable.
   */
  beforeEach(() => {
    // Reset DOM to a known state: a single #app container.
    document.body.innerHTML = '<div id="app"></div>';
    document.head.innerHTML = '';

    // Reset all Jest mocks between tests.
    jest.clearAllMocks();

    // Mock global fetch to return deterministic HTML.
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue('<p>Mock scene HTML</p>'),
    });
  });

  /**
   * Optional cleanup after each test, removes the fetch
   * mock to avoid affecting other tests in the suite.
   */
  afterEach(() => {
    delete global.fetch;
  });

  it('fetches the correct HTML file for the given scene name', async () => {
    // Call loadScene with a specific scene name.
    await loadScene('introScene');

    // Ensure fetch was called exactly once with the expected URL.
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('./scenes/introScene.html');
  });

  it('injects fetched HTML into the #app container', async () => {
    // Ensure #app exists (set in beforeEach).
    const container = document.getElementById('app');
    expect(container).not.toBeNull();

    // Load the scene.
    await loadScene('introScene');

    // The container now holds the HTML returned by fetch.
    expect(container.innerHTML).toBe('<p>Mock scene HTML</p>');
  });

  it('creates the base stylesheet link when it does not already exist', async () => {
    // Verify there is no base-style link before the call.
    expect(document.getElementById('base-style')).toBeNull();

    // Load any scene; this should trigger base-style creation.
    await loadScene('introScene');

    // A single base-style link exists with expected attributes.
    const baseLink = document.getElementById('base-style');
    expect(baseLink).not.toBeNull();
    expect(baseLink.tagName).toBe('LINK');
    expect(baseLink.rel).toBe('stylesheet');
    //TODO: FIND stylesheet names
    // jsdom resolves relative URLs, so we just ensure the path ends with /css/base.css
    expect(baseLink.href).toContain('/css/base.css');
  });

  it('does not create a second base stylesheet link if one already exists', async () => {
    //  Manually insert a base-style link into the head.
    const existingBase = document.createElement('link');
    existingBase.id = 'base-style';
    existingBase.rel = 'stylesheet';
    existingBase.href = './css/base.css';
    document.head.appendChild(existingBase);

    // Load a scene; loadScene should NOT create a new base-style link.
    await loadScene('introScene');

    // There is still exactly one base-style element.
    const baseLinks = document.querySelectorAll('#base-style');
    expect(baseLinks.length).toBe(1);
    // And that one is the originally inserted element.
    expect(baseLinks[0]).toBe(existingBase);
  });

  it('removes the existing scene stylesheet before adding a new one', async () => {
    // Add a fake "old" scene-style link to simulate a previous scene.
    const oldSceneLink = document.createElement('link');
    oldSceneLink.id = 'scene-style';
    oldSceneLink.rel = 'stylesheet';
    oldSceneLink.href = './css/oldScene.css';
    document.head.appendChild(oldSceneLink);

    // Load a different scene; loadScene should remove oldScene.css and add newScene.css.
    await loadScene('newScene');

    // Only one scene-style link exists.
    const sceneLinks = document.querySelectorAll('#scene-style');
    expect(sceneLinks.length).toBe(1);

    const newSceneLink = sceneLinks[0];

    // Ensure the new link points to the new scene CSS.
    expect(newSceneLink.href).toContain('/css/newScene.css');

    // Ensure the old link element was actually removed, not just mutated.
    expect(newSceneLink).not.toBe(oldSceneLink);
  });

  it('uses sceneName as the default cssName when cssName is not provided', async () => {
    // Call loadScene without specifying cssName.
    await loadScene('introScene');

    // The scene-style link uses the sceneName ('introScene') in its href.
    const sceneLink = document.getElementById('scene-style');
    expect(sceneLink).not.toBeNull();
    expect(sceneLink.rel).toBe('stylesheet');
    expect(sceneLink.href).toContain('/css/introScene.css'); 
    //TODO: find default css stylesheet name
  });

  it('uses the provided cssName when one is explicitly passed', async () => {
    // Call loadScene with a custom cssName value.
    await loadScene('introScene', 'customTheme');

    //  The scene-style link uses the custom cssName in its href.
    const sceneLink = document.getElementById('scene-style');
    expect(sceneLink).not.toBeNull();
    expect(sceneLink.rel).toBe('stylesheet');
    expect(sceneLink.href).toContain('/css/customTheme.css');
  });

  it('updates the current scene in gameState with the provided sceneName', async () => {
    // Load a specific scene.
    await loadScene('introScene');

    // gameState.setCurrentScene is called once with that scene name.
    expect(gameState.setCurrentScene).toHaveBeenCalledTimes(1);
    expect(gameState.setCurrentScene).toHaveBeenCalledWith('introScene');
  });
});


// -- Unit testing for main.js -- //
//initApp

//loadCharacterSelect
//loadIntroScroll
//startBattle
//init

// -- Unit testng for index.html -- //
