/**
 * @fileoverview Unit tests for CharacterSelectSceneController, covering character
 * card rendering, selection tracking, audio management, and game start callbacks.
 * Tests use JSDOM and spy on the audio manager to verify sound interactions.
 * @module tests/core/CharacterSelectSceneController.test
 */

import { strict as assert } from 'assert';
import { JSDOM } from 'jsdom';
import { describe, it, beforeEach, afterEach } from 'node:test';

import { CharacterSelectSceneController } from '../../src/client/scenes/characterSelectScene.js';
import { audioManager } from '../../src/client/utils/AudioManager.js';

describe('CharacterSelectSceneController (node:test + jsdom)', () => {
  let dom;
  let calls;
  let origPlay;
  let origStop;

  beforeEach(() => {
    /**
     * Set up a fresh DOM environment with required elements for the character
     * select scene. This includes character list container and info panel elements.
     */
    dom = new JSDOM(
      `<!doctype html><html><head></head><body>
        <div id="character-list"></div>
        <div id="character-info">
          <div id="info-name"></div>
          <div id="info-description"></div>
          <img id="info-sprite" />
          <div id="info-stats"></div>
        </div>
        <button id="btn-start-game"></button>
      </body></html>`,
      { url: 'http://localhost/' },
    );

    /**
     * Bind globals required by the controller. These include window, document,
     * and localStorage for persisting user selections.
     */
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.localStorage = dom.window.localStorage;

    /**
     * Install audio spies to track play and stop calls without triggering actual
     * audio playback. We record each call for assertion in test specs.
     */
    calls = [];

    // Save original methods before replacing
    origPlay = audioManager.play;
    origStop = audioManager.stop;

    audioManager.play = (name, loop) => {
      calls.push({ method: 'play', name, loop });
    };
    audioManager.stop = (name) => {
      calls.push({ method: 'stop', name });
    };
  });

  afterEach(() => {
    /**
     * Restore the original audio manager methods to avoid pollution
     * of subsequent tests. Only restore if the spy was installed.
     */
    if (origPlay) audioManager.play = origPlay;
    if (origStop) audioManager.stop = origStop;

    /**
     * Clean up all injected globals to ensure test isolation.
     * Each test should start with a fresh global state.
     */
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.localStorage;
  });

  it('initializes and plays character-choice audio and stops loading-screen', () => {
    /**
     * The controller constructor triggers initialization, which includes
     * stopping the loading screen music and starting character selection music.
     */
    // eslint-disable-next-line no-new
    new CharacterSelectSceneController(() => {});

    // Verify loading-screen was stopped during init
    assert.ok(
      calls.find((c) => c.method === 'stop' && c.name === 'loading-screen'),
      'loading-screen should be stopped on init',
    );

    /**
     * Character choice music should be played in a loop to provide
     * continuous background audio during character selection.
     */
    const playChoice = calls.find(
      (c) => c.method === 'play' && c.name === 'character-choice',
    );
    assert.ok(playChoice, 'character-choice should be played on init');
    assert.equal(
      playChoice.loop,
      true,
      'character-choice should be played in loop',
    );
  });

  it('renders character cards into #character-list', () => {
    const controller = new CharacterSelectSceneController(() => {});
    const container = document.getElementById('character-list');

    const cards = container.querySelectorAll('.character-card');
    assert.equal(
      cards.length,
      controller.characters.length,
      'number of cards should equal number of characters',
    );
  });

  it('selecting a character updates info panel, selectedCharacter, and plays button-click', () => {
    const controller = new CharacterSelectSceneController(() => {});
    const container = document.getElementById('character-list');
    const firstCard = container.querySelector('.character-card');
    assert.ok(firstCard, 'first card exists');

    /**
     * Clear the initialization audio calls so we only inspect what happens
     * when a card is clicked. This isolates the click behavior from setup noise.
     */
    calls = [];

    // Simulate user click on character card
    firstCard.dispatchEvent(new dom.window.Event('click', { bubbles: true }));

    /**
     * After selecting a character, the controller should update internal state
     * and populate the info panel with character details and stats.
     */
    assert.ok(controller.selectedCharacter, 'selectedCharacter should be set');
    assert.equal(
      controller.selectedCharacter.id,
      controller.characters[0].id,
      'selectedCharacter should match first character',
    );

    // Verify info panel elements were populated
    const name = document.getElementById('info-name').textContent;
    const desc = document.getElementById('info-description').textContent;
    const sprite = document.getElementById('info-sprite').src;
    const stats = document.getElementById('info-stats').innerHTML;

    assert.ok(
      name && name.trim().length > 0,
      'character name should be populated',
    );
    assert.ok(
      desc && desc.trim().length > 0,
      'character description should be populated',
    );
    assert.ok(sprite && sprite.length > 0, 'sprite src should be set');
    assert.ok(
      stats.includes('Attack'),
      'stats panel should contain Attack label',
    );

    /**
     * A button-click sound should play when the user selects a character
     * to provide immediate audio feedback.
     */
    const buttonClick = calls.find(
      (c) => c.method === 'play' && c.name === 'button-click',
    );
    assert.ok(
      buttonClick,
      'button-click sound should be played when selecting a character',
    );
  });

  it('handleStartGame does nothing when no selection, and calls callback after selection', () => {
    const picked = [];
    const controller = new CharacterSelectSceneController((c) =>
      picked.push(c),
    );

    /**
     * Before a character is selected, clicking the start button should
     * have no effect. The callback should not fire.
     */
    controller.handleStartGame();
    assert.equal(
      picked.length,
      0,
      'callback should not be called if no character selected',
    );

    // Select first character
    const container = document.getElementById('character-list');
    const firstCard = container.querySelector('.character-card');
    assert.ok(firstCard, 'first card exists');

    firstCard.dispatchEvent(new dom.window.Event('click', { bubbles: true }));

    /**
     * Reset call tracking so we only see the behavior triggered by the
     * start button click, not the previous selection click.
     */
    calls = [];

    // Click start button to trigger selection confirmation
    const startBtn = document.getElementById('btn-start-game');
    startBtn.click();

    /**
     * When the start button is clicked, the character choice music should
     * stop and the selection callback should be invoked with the chosen character.
     */
    const stopChoice = calls.find(
      (c) => c.method === 'stop' && c.name === 'character-choice',
    );
    assert.ok(stopChoice, 'stop character-choice should be called');

    // Audio feedback should play for the button press
    const buttonClick = calls.find(
      (c) => c.method === 'play' && c.name === 'button-click',
    );
    assert.ok(
      buttonClick,
      'button-click sound should be played when clicking start button',
    );

    /**
     * The selection callback should be invoked exactly once with the
     * character data that was selected.
     */
    assert.equal(picked.length, 1, 'selection callback should be called once');
    assert.equal(
      picked[0].id,
      controller.selectedCharacter.id,
      'callback should receive the selected character',
    );
  });
});
