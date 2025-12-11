/**
 * @fileoverview Death Screen Scene Controller
 * Manages the display and functionality of the "Game Over" or "Lost" screen.
 * Provides a callback to return the player to the main menu.
 * @module DeathScreenSceneController
 */

import { audioManager } from '../utils/AudioManager.js';

/**
 * DeathScreenSceneController - Manages the transition and interaction 
 * on the game's "loss" screen.
 * * @class
 * @example
 * new DeathScreenSceneController({
 * onWakeUp: () => { console.log('Player restarting game'); }
 * });
 */
export class DeathScreenSceneController {
    /**
     * Creates an instance of DeathScreenSceneController.
     * @param {Object} callbacks - Functions to call on interaction.
     * @param {Function} callbacks.onWakeUp - Called when the "Wake Up" button is pressed.
     */
    constructor({ onWakeUp }) {
        /** @type {Function} */
        this.onWakeUp = onWakeUp;
        /** @type {HTMLElement} */
        this.container = document.getElementById('death-scene');
        /** @type {HTMLElement} */
        this.wakeUpButton = document.getElementById('btn-wake-up');

        this.init();
    }

    /**
     * Initializes the scene: fading in and setting up listeners.
     * @returns {void}
     */
    init() {
        // Fade in the scene to replicate the blackout effect
        // The CSS has a 2s transition, so this makes it visible immediately
        // and the transition takes care of the fade.
        requestAnimationFrame(() => {
            this.container.classList.add('active');
        });

        this.wakeUpButton.addEventListener('click', this.handleWakeUpClick);
        
        // Ensure initial button visibility if needed, though CSS handles it
        this.wakeUpButton.style.display = 'block';
    }

    /**
     * Handles the "Wake Up" button click.
     * @returns {void}
     */
    handleWakeUpClick = () => {
        // Prevent multiple clicks
        this.wakeUpButton.disabled = true;
        
        // Remove event listener to prevent memory leak/double execution
        this.wakeUpButton.removeEventListener('click', this.handleWakeUpClick);

        // Execute the callback provided by main.js to transition scenes
        if (this.onWakeUp) {
            this.onWakeUp();
        }
    }

    /**
     * Cleans up the scene elements (optional for a full SPA cleanup).
     * @returns {void}
     */
    destroy() {
        this.wakeUpButton.removeEventListener('click', this.handleWakeUpClick);
        // The sceneLoader should handle removing the HTML, but this is good practice.
    }
}