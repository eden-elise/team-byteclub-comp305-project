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
    // fresh DOM with required elements
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

    // bind globals used by the controller
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.localStorage = dom.window.localStorage;

    // spy audioManager methods
    calls = [];

    // save originals
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
    // restore audioManager
    if (origPlay) audioManager.play = origPlay;
    if (origStop) audioManager.stop = origStop;

    // cleanup globals
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.localStorage;
  });

  it('initializes and plays character-choice audio and stops loading-screen', () => {
    // init runs in constructor
    // eslint-disable-next-line no-new
    new CharacterSelectSceneController(() => {});

    // loading-screen should be stopped
    assert.ok(
      calls.find((c) => c.method === 'stop' && c.name === 'loading-screen'),
      'loading-screen should be stopped on init',
    );

    // character-choice should be played (looped)
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

    // clear initial audio calls (loading-screen + character-choice)
    calls = [];

    // simulate click
    firstCard.dispatchEvent(new dom.window.Event('click', { bubbles: true }));

    // selectedCharacter should be set to first character
    assert.ok(controller.selectedCharacter, 'selectedCharacter should be set');
    assert.equal(
      controller.selectedCharacter.id,
      controller.characters[0].id,
      'selectedCharacter should match first character',
    );

    // info elements updated
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

    // button-click should have been played when selecting character
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

    // no selection yet
    controller.handleStartGame();
    assert.equal(
      picked.length,
      0,
      'callback should not be called if no character selected',
    );

    // select first character
    const container = document.getElementById('character-list');
    const firstCard = container.querySelector('.character-card');
    assert.ok(firstCard, 'first card exists');

    firstCard.dispatchEvent(new dom.window.Event('click', { bubbles: true }));

    // clear calls so we only inspect start-game behavior
    calls = [];

    // click start button to trigger selection confirmation
    const startBtn = document.getElementById('btn-start-game');
    startBtn.click();

    // audio stop should have been called for character-choice when starting
    const stopChoice = calls.find(
      (c) => c.method === 'stop' && c.name === 'character-choice',
    );
    assert.ok(stopChoice, 'stop character-choice should be called');

    // button-click should be played when pressing start
    const buttonClick = calls.find(
      (c) => c.method === 'play' && c.name === 'button-click',
    );
    assert.ok(
      buttonClick,
      'button-click sound should be played when clicking start button',
    );

    // callback invoked with character data
    assert.equal(picked.length, 1, 'selection callback should be called once');
    assert.equal(
      picked[0].id,
      controller.selectedCharacter.id,
      'callback should receive the selected character',
    );
  });
});
