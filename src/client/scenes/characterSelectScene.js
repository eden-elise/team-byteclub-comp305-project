/**
 * @fileoverview Character Selection Scene Controller - Manages the character
 * selection UI where players choose their hero before starting the game.
 * Displays available characters with their sprites, stats, and descriptions.
 * @module CharacterSelectSceneController
 */

import { Knight, Archer } from '../../gameplay/definitions/heroesRegistry.js';
import { audioManager } from '../utils/AudioManager.js';

/**
 * @typedef {Object} CharacterData
 * @property {string} id - Unique identifier for the character (e.g., 'knight', 'archer')
 * @property {Function} Class - The character class constructor from heroesRegistry
 * @property {string} description - Flavor text describing the character's background and playstyle
 */

/**
 * @typedef {Object} CharacterInstance
 * @property {string} name - Display name of the character
 * @property {string} image - Path to the character's sprite image
 * @property {Object} stats - Character statistics
 * @property {number} stats.ATTACK - Attack power stat
 * @property {number} stats.DEFEND - Defense stat
 * @property {number} stats.SPEED - Speed stat (affects turn order)
 * @property {number} stats.LUCK - Luck stat (affects critical hits)
 */

/**
 * @callback OnCharacterSelectedCallback
 * @param {CharacterData} characterData - The selected character's data object
 * @returns {void}
 */

/**
 * CharacterSelectSceneController - Manages the character selection screen UI.
 *
 * This controller handles:
 * - Rendering available character options as clickable cards
 * - Displaying detailed character information when selected
 * - Managing visual selection state (highlighting selected character)
 * - Triggering game start with the chosen character
 * - Playing appropriate audio feedback
 *
 * @class
 *
 * @example
 * const characterSelect = new CharacterSelectSceneController((selectedChar) => {
 *   console.log(`Player selected: ${selectedChar.id}`);
 *   const hero = new selectedChar.Class();
 *   startGame(hero);
 * });
 */
export class CharacterSelectSceneController {
    /**
     * Create a new character selection scene controller.
     *
     * @param {OnCharacterSelectedCallback} onCharacterSelected - Callback function called when a character
     *                                                            is selected and confirmed. Receives the
     *                                                            character data object containing id, Class,
     *                                                            and description.
     */
    constructor(onCharacterSelected) {
        /**
         * Callback invoked when player confirms character selection and starts game
         * @type {OnCharacterSelectedCallback}
         */
        this.onCharacterSelected = onCharacterSelected;

        /**
         * Array of available characters for selection.
         * Each entry contains the character's id, class constructor, and description.
         * @type {CharacterData[]}
         */
        this.characters = [
            {
                id: 'knight',
                Class: Knight,
                description:
                    'A stalwart defender of the realm, clad in heavy armor. The Knight excels in defense and possesses balanced offensive capabilities, making them a reliable choice for any encounter.',
            },
            {
                id: 'archer',
                Class: Archer,
                description:
                    'A swift and precise marksman from the elven forests. The Archer relies on high speed and luck to outmaneuver foes, dealing critical strikes from a distance while avoiding counterattacks.',
            },
        ];

        /**
         * Currently selected character data, or null if none selected
         * @type {CharacterData|null}
         */
        this.selectedCharacter = null;

        this.init();
    }

    /**
     * Initialize the character selection scene.
     * Stops loading screen music, starts character selection music,
     * renders character options, and sets up the start button listener.
     *
     * @returns {void}
     */
    init() {
        audioManager.stop('loading-screen');
        audioManager.play('character-choice', true);
        this.renderCharacterOptions();

        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                audioManager.play('button-click');
                this.handleStartGame();
            });
        }
    }

    /**
     * Render the character selection cards in the character list container.
     * Creates a clickable card for each available character showing their
     * sprite and name. Cards are styled with hover/selection effects.
     *
     * @returns {void}
     */
    renderCharacterOptions() {
        const container = document.getElementById('character-list');
        if (!container) return;

        container.innerHTML = '';

        this.characters.forEach((charData, index) => {
            // Instantiate a temporary version to get stats/sprite
            const tempInstance = new charData.Class(true);

            const card = document.createElement('div');
            card.className = 'combatant character-card';
            card.style.cursor = 'pointer';
            card.style.width = 'clamp(120px, 18vw, 250px)';
            card.style.minWidth = '120px';
            card.style.padding = 'clamp(0.8rem, 1.5vh, 1.5rem)';
            card.style.background = 'var(--color-stone-darker)';
            card.style.border = '2px solid var(--color-stone-dark)';
            card.style.borderRadius = 'var(--size-border-radius)';
            card.style.transition = 'all var(--transition-medium)';
            card.style.boxSizing = 'border-box';

            card.innerHTML = `
                <div class="combatant__avatar" style="width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; margin-bottom: 1vh;">
                    <img src="${tempInstance.image}" class="combatant__sprite" alt="${tempInstance.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div class="combatant__name" style="margin-bottom: 0; font-size: clamp(0.9rem, 1.5vw, 1.2rem); text-align: center;">${tempInstance.name}</div>
            `;

            card.addEventListener('click', () => {
                audioManager.play('button-click');
                this.selectCharacter(index);

                // Update visual selection state
                document.querySelectorAll('.character-card').forEach((el) => {
                    el.style.borderColor = 'var(--color-stone-dark)';
                    el.style.transform = 'scale(1)';
                    el.style.boxShadow = 'none';
                });
                card.style.borderColor = 'var(--color-text-gold)';
                card.style.transform = 'scale(1.05)';
                card.style.boxShadow = 'var(--shadow-glow-gold)';
            });

            container.appendChild(card);
        });
    }

    /**
     * Handle character selection by index.
     * Updates the selected character, shows the info panel with the character's
     * sprite, name, description, and detailed stats (Attack, Defense, Speed, Luck).
     *
     * @param {number} index - The index of the selected character in the characters array
     * @returns {void}
     */
    selectCharacter(index) {
        this.selectedCharacter = this.characters[index];
        const tempInstance = new this.selectedCharacter.Class(true);

        const infoPanel = document.getElementById('character-info');
        if (infoPanel) {
            infoPanel.classList.add('visible');

            document.getElementById('info-name').textContent = tempInstance.name;
            document.getElementById('info-description').textContent = this.selectedCharacter.description;
            document.getElementById('info-sprite').src = tempInstance.image;

            const statsContainer = document.getElementById('info-stats');
            statsContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-stone-dark); padding: 5px;">
                    <span style="color: var(--color-text-gold);">Attack</span>
                    <span>${tempInstance.stats.ATTACK}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-stone-dark); padding: 5px;">
                    <span style="color: var(--color-text-gold);">Defense</span>
                    <span>${tempInstance.stats.DEFEND}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-stone-dark); padding: 5px;">
                    <span style="color: var(--color-text-gold);">Speed</span>
                    <span>${tempInstance.stats.SPEED}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--color-stone-dark); padding: 5px;">
                    <span style="color: var(--color-text-gold);">Luck</span>
                    <span>${tempInstance.stats.LUCK}</span>
                </div>
            `;
        }
    }

    /**
     * Handle the start game button click.
     * Validates that a character has been selected, stops the character selection
     * music, and invokes the onCharacterSelected callback with the selected character data.
     *
     * @returns {void}
     */
    handleStartGame() {
        if (!this.selectedCharacter) return;

        audioManager.stop('character-choice');

        if (this.onCharacterSelected) {
            this.onCharacterSelected(this.selectedCharacter);
        }
    }
}
