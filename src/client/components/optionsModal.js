import { gameState } from '../../gameplay/state/GameState.js';
import { audioManager } from '../utils/AudioManager.js';

/**
 * Controls the in-game Options modal, including loading HTML/CSS,
 * syncing settings, saving/loading game files, and handling UI interactions.
 */
export class OptionsModalController {
    constructor() {
        /**
         * @type {HTMLElement|null} Overlay DOM element for the modal
         */
        this.overlay = null;

        /**
         * @type {boolean} Whether the modal is currently open
         */
        this.isOpen = false;

        this.init();
    }

    /**
     * Initializes the Options Modal by:
     * - Injecting CSS
     * - Fetching HTML
     * - Adding to DOM
     * - Setting up listeners
     * - Loading settings
     *
     * @returns {Promise<void>}
     */
    async init() {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './css/optionsModal.css';
        document.head.appendChild(link);

        // Load HTML
        const html = await fetch('./components/optionsModal.html').then((r) => r.text());

        // Create container outside of #app
        const container = document.createElement('div');
        container.id = 'options-layer';
        container.innerHTML = html;
        document.body.appendChild(container);

        this.overlay = document.getElementById('options-modal-overlay');
        this.setupListeners();
        this.loadCurrentSettings();
    }

    /**
     * Sets up all event listeners for:
     * - Opening/closing modal
     * - Clicking outside modal
     * - Setting volume, text speed, language, battle speed
     * - Saving and loading game files
     */
    setupListeners() {
        // Toggle button
        document.getElementById('options-btn').addEventListener('click', () => {
            audioManager.play('button-click');
            this.open();
        });

        // Close button
        document.getElementById('options-close').addEventListener('click', () => {
            audioManager.play('button-click');
            this.close();
        });

        // Close on click outside modal
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // Volume setting
        document.getElementById('opt-volume').addEventListener('change', (e) => {
            /** @type {number} */
            const volume = parseInt(e.target.value);
            this.updateSetting('volume', volume);
            audioManager.setMasterVolume(volume);
        });

        // Text speed
        document.getElementById('opt-text-speed').addEventListener('change', (e) => {
            this.updateSetting('textSpeed', e.target.value);
        });

        // Language
        document.getElementById('opt-language').addEventListener('change', (e) => {
            this.updateSetting('language', e.target.value);
        });

        // Battle speed
        document.getElementById('opt-battle-speed').addEventListener('change', (e) => {
            this.updateSetting('battleSpeed', parseFloat(e.target.value));
        });

        // Manual save
        document.getElementById('opt-save').addEventListener('click', () => {
            gameState.saveGame();

            // Trigger download
            const dataStr =
                'data:text/json;charset=utf-8,' +
                encodeURIComponent(JSON.stringify(gameState.currentSaveData));

            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute('href', dataStr);
            downloadAnchorNode.setAttribute('download', 'byteclub_save.json');
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            alert('Game Saved & Downloaded!');
            this.close();
        });

        // Manual load
        document.getElementById('opt-load').addEventListener('click', () => {
            if (gameState.loadGame()) {
                alert('Game Loaded!');
                location.reload();
            } else {
                alert('No save file found.');
            }
        });
    }

    /**
     * Loads the player's settings from:
     * - Existing save file, OR
     * - Default values
     *
     * Applies to DOM inputs and audioManager.
     */
    loadCurrentSettings() {
        /**
         * @typedef Settings
         * @property {number} volume
         * @property {string} textSpeed
         * @property {string} language
         * @property {number} battleSpeed
         */

        /** @type {Settings} */
        const settings = gameState.currentSaveData?.settings || {
            volume: 100,
            textSpeed: 'medium',
            language: 'en',
            battleSpeed: 1.0,
        };

        document.getElementById('opt-volume').value = settings.volume;
        document.getElementById('opt-text-speed').value = settings.textSpeed;
        document.getElementById('opt-language').value = settings.language;
        document.getElementById('opt-battle-speed').value = settings.battleSpeed;

        audioManager.setMasterVolume(settings.volume);
    }

    /**
     * Updates a single setting both locally and inside the game save file.
     *
     * @param {string} key - The setting key to update
     * @param {any} value - The new value to assign
     */
    updateSetting(key, value) {
        console.log(`Setting ${key} to ${value}`);

        if (gameState.currentSaveData) {
            gameState.currentSaveData.settings[key] = value;
            gameState.saveGame();
        }
    }

    /**
     * Opens the options modal with animation and refreshes settings.
     */
    open() {
        this.loadCurrentSettings();
        this.overlay.style.display = 'flex';
        this.overlay.offsetHeight; // Force reflow
        this.overlay.classList.add('visible');
        this.isOpen = true;
    }

    /**
     * Closes the options modal with animation delay.
     */
    close() {
        this.overlay.classList.remove('visible');
        setTimeout(() => {
            this.overlay.style.display = 'none';
            this.isOpen = false;
        }, 300);
    }
}
