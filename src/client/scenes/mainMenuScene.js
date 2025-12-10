/**
 * @fileoverview MainMenuSceneController - Manages the main menu UI and interactions
 * This class handles menu animations, button events, save file management, and scene transitions
 * @module scenes/mainMenuScene
 */
import { gameState } from '../../gameplay/state/GameState.js';
import { audioManager } from '../utils/AudioManager.js';

/**
 * Controller class for managing the main menu scene.
 * Handles title screen animations, menu navigation, save file detection,
 * and user input for starting or continuing the game.
 * @class
 */
export class MainMenuSceneController {
    /**
     * Creates a new MainMenuSceneController instance.
     * @constructor
     * @param {Object} callbacks - Callback functions for menu actions
     * @param {Function} [callbacks.onContinue] - Called when the player continues a saved game
     * @param {Function} [callbacks.onNewGame] - Called when the player starts a new game
     * @param {Function} [callbacks.onLoadFile] - Called when the player loads a save file from disk
     */
    constructor(callbacks) {
        /**
         * Callback functions for menu actions
         * @type {Object}
         */
        this.callbacks = callbacks;

        /**
         * Flag indicating if the intro animation sequence has completed
         * @type {boolean}
         */
        this.animationComplete = false;

        /**
         * Flag indicating if the user interrupted the intro animation
         * @type {boolean}
         */
        this.userInterrupted = false;

        this.init();
    }

    /**
     * Initializes the main menu scene.
     * Checks for existing save files, sets up event listeners, and starts animations.
     * @returns {void}
     */
    init() {
        this.checkSaveFile();
        this.setupListeners();
        this.startAnimationSequence();
    }

    /**
     * Checks for an existing save file and updates the continue button visibility.
     * Displays save information if a save file exists.
     * @returns {void}
     */
    checkSaveFile() {
        const saveData = gameState.getFullSaveData();
        const continueContainer = document.getElementById('continue-container');
        const saveInfo = document.getElementById('save-info');

        if (saveData) {
            continueContainer.style.display = 'flex';
            const date = new Date(saveData.metadata.timestamp).toLocaleString();
            saveInfo.innerHTML = `
                <div style="color: var(--color-text-gold); font-weight: bold;">${saveData.hero.name}</div>
                <div>Level ${saveData.hero.level} ${saveData.hero.classId.toUpperCase()}</div>
                <div style="font-size: 0.8rem; margin-top: 5px;">Last played: ${date}</div>
            `;
        } else {
            continueContainer.style.display = 'none';
        }
    }

    /**
     * Sets up all event listeners for menu buttons and user interactions.
     * Configures click handlers for play, exit, continue, new game, load file, and back buttons.
     * @returns {void}
     */
    setupListeners() {
        // Play button → show secondary menu
        const btnPlay = document.getElementById('btn-play');
        btnPlay.addEventListener('click', () => {
            this.showSecondaryMenu();
            audioManager.play('button-click');
        });

        // Exit button → show exit confirmation
        const btnExit = document.getElementById('btn-exit');
        btnExit.addEventListener('click', () => {
            this.showExitConfirmation();
            audioManager.play('button-click');
        });

        // Exit confirmation buttons
        const btnExitYes = document.getElementById('btn-exit-yes');
        btnExitYes.addEventListener('click', () => {
            window.close();
            audioManager.play('button-click');
        });

        const btnExitNo = document.getElementById('btn-exit-no');
        btnExitNo.addEventListener('click', () => {
            this.hideExitConfirmation();
            audioManager.play('button-click');
        });

        // Continue / New Game / Load File buttons
        const btnContinue = document.getElementById('btn-continue');
        if (btnContinue) {
            btnContinue.addEventListener('click', () => {
                audioManager.stop('loading-screen');
                if (this.callbacks.onContinue) this.callbacks.onContinue();
                audioManager.play('button-click');
            });
        }

        document.getElementById('btn-new-game').addEventListener('click', () => {
            audioManager.stop('loading-screen');
            if (this.callbacks.onNewGame) this.callbacks.onNewGame();
            audioManager.play('button-click');
        });

        document.getElementById('btn-load-file').addEventListener('click', () => {
            audioManager.play('button-click');
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const json = JSON.parse(event.target.result);
                        audioManager.stop('loading-screen');
                        if (this.callbacks.onLoadFile) this.callbacks.onLoadFile(json);
                    } catch (err) {
                        console.error('Error parsing save file:', err);
                        alert('Invalid save file!');
                    }
                };
                reader.readAsText(file);
            };

            input.click();
        });

        // Back button in secondary menu
        const btnBack = document.getElementById('btn-back');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.hideSecondaryMenu();
                audioManager.play('button-click');
            });
        }

        this.setupUserInputDetection();
    }

    /**
     * Sets up detection for user input to skip the intro animation.
     * Listens for keyboard, mouse, and touch events.
     * Also starts background music on first user interaction.
     * @returns {void}
     */
    setupUserInputDetection() {
        /**
         * Handles user input for skipping animation and starting music.
         * @private
         */
        const handleUserInput = () => {
            if (!this.animationComplete && !this.userInterrupted) {
                this.userInterrupted = true;
                this.skipToButtons();
            }

            if (!this.musicStarted) {
                this.musicStarted = true;
                audioManager.play('loading-screen', true);
            }
        };
        document.addEventListener('keydown', handleUserInput, { once: true });
        document.addEventListener('click', handleUserInput, { once: true });
        document.addEventListener('touchstart', handleUserInput, { once: true });
    }

    /**
     * Starts the intro animation sequence with timed events.
     * Triggers bird animations, lightning effects, and shows menu buttons.
     * @returns {void}
     */
    startAnimationSequence() {
        setTimeout(() => this.startBirdAnimations(), 3000);
        setTimeout(() => this.triggerLightning(), 4500);
        setTimeout(() => {
            if (!this.userInterrupted) this.showButtons();
        }, 6000);
    }

    /**
     * Starts the bird flying animations across the screen.
     * Creates animated bird elements that fly from left to right.
     * @returns {void}
     */
    startBirdAnimations() {
        const birdsContainer = document.getElementById('birds-container');
        const birdImages = [
            '../../src/assets/art/title-screen/crow/crow-1.png',
            '../../src/assets/art/title-screen/crow/crow-2.png',
            '../../src/assets/art/title-screen/crow/crow-3.png',
        ];

        /**
         * Creates a single bird element with randomized animation properties.
         * @param {number} delay - Delay in milliseconds before creating the bird
         * @private
         */
        const createBird = (delay) => {
            setTimeout(() => {
                const bird = document.createElement('div');
                bird.className = 'bird';
                const randomImage = birdImages[Math.floor(Math.random() * birdImages.length)];
                bird.style.backgroundImage = `url('${randomImage}')`;
                const startY = Math.random() * 40 + 10;
                bird.style.top = `${startY}%`;
                bird.style.left = '-50px';
                const flyDistanceX = Math.random() * 600 + 800;
                const flyDistanceY = (Math.random() - 0.5) * 200;
                const duration = Math.random() * 5 + 8;
                bird.style.setProperty('--fly-distance-x', `${flyDistanceX}px`);
                bird.style.setProperty('--fly-distance-y', `${flyDistanceY}px`);
                bird.style.animation = `flyBird ${duration}s linear forwards`;
                birdsContainer.appendChild(bird);
                setTimeout(() => bird.remove(), duration * 1000);
            }, delay);
        };

        for (let i = 0; i < 8; i++) createBird(i * 2000);

        /**
         * Interval ID for continuous bird spawning
         * @type {number}
         */
        this.birdInterval = setInterval(() => createBird(0), 4000);
    }

    /**
     * Triggers the lightning flash animation effect.
     * @returns {void}
     */
    triggerLightning() {
        const lightningFlash = document.getElementById('lightning-flash');
        lightningFlash.style.animation = 'lightningStrike 0.8s ease-out forwards';
        setTimeout(() => {
            lightningFlash.style.animation = '';
        }, 800);
    }

    /**
     * Shows the menu buttons with fade-in animation.
     * Called after the intro animation sequence completes.
     * @returns {void}
     */
    showButtons() {
        this.animationComplete = true;
        const menuButtons = document.getElementById('menu-buttons');
        menuButtons.classList.add('visible');
    }

    /**
     * Skips the intro animation and immediately shows the menu buttons.
     * Called when the user interrupts the intro sequence.
     * @returns {void}
     */
    skipToButtons() {
        const background = document.getElementById('background');
        const titleText = document.getElementById('title-text');
        const menuButtons = document.getElementById('menu-buttons');

        background.style.animation = 'none';
        background.style.opacity = '1';

        titleText.style.animation = 'none';
        titleText.style.opacity = '1';
        titleText.style.transform = 'scale(1)';

        menuButtons.classList.add('instant');
        this.animationComplete = true;
    }

    /**
     * Shows the secondary menu with continue/new game/load options.
     * Fades out the title and initial buttons, then fades in the secondary menu.
     * @returns {void}
     */
    showSecondaryMenu() {
        const titleText = document.getElementById('title-text');
        const initialButtons = document.getElementById('initial-buttons');
        const secondary = document.getElementById('secondary-buttons');

        // Fade out title & initial buttons
        titleText.style.transition = 'opacity 0.5s ease';
        initialButtons.style.transition = 'opacity 0.5s ease';
        titleText.style.opacity = 0;
        initialButtons.style.opacity = 0;

        setTimeout(() => {
            titleText.style.display = 'none';
            initialButtons.style.display = 'none';

            // Show secondary menu centered
            secondary.style.display = 'flex';
            secondary.style.opacity = 0;
            secondary.style.transition = 'opacity 0.5s ease-in';
            requestAnimationFrame(() => (secondary.style.opacity = 1));
        }, 500);
    }

    /**
     * Hides the secondary menu and returns to the initial menu.
     * Fades out the secondary menu, then fades in the title and initial buttons.
     * @returns {void}
     */
    hideSecondaryMenu() {
        const secondary = document.getElementById('secondary-buttons');
        secondary.style.opacity = 0;
        secondary.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            secondary.style.display = 'none';
            const titleText = document.getElementById('title-text');
            const initialButtons = document.getElementById('initial-buttons');

            titleText.style.display = 'block';
            initialButtons.style.display = 'flex';
            titleText.style.opacity = 0;
            initialButtons.style.opacity = 0;

            requestAnimationFrame(() => {
                titleText.style.transition = 'opacity 0.5s ease';
                initialButtons.style.transition = 'opacity 0.5s ease';
                titleText.style.opacity = 1;
                initialButtons.style.opacity = 1;
            });
        }, 500);
    }

    /**
     * Shows the exit confirmation dialog.
     * Fades out the title and initial buttons, then fades in the confirmation panel.
     * @returns {void}
     */
    showExitConfirmation() {
        const title = document.getElementById('title-text');
        const initialButtons = document.getElementById('initial-buttons');

        title.style.transition = 'opacity 0.5s ease';
        initialButtons.style.transition = 'opacity 0.5s ease';
        title.style.opacity = 0;
        initialButtons.style.opacity = 0;

        setTimeout(() => {
            title.style.display = 'none';
            initialButtons.style.display = 'none';

            const panel = document.getElementById('exit-confirmation');
            panel.style.display = 'flex';
            panel.style.opacity = 0;
            panel.style.transition = 'opacity 0.5s ease-in';
            requestAnimationFrame(() => (panel.style.opacity = 1));
        }, 500);
    }

    /**
     * Hides the exit confirmation dialog and returns to the initial menu.
     * Fades out the confirmation panel, then fades in the title and initial buttons.
     * @returns {void}
     */
    hideExitConfirmation() {
        const panel = document.getElementById('exit-confirmation');
        panel.style.opacity = 0;
        panel.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            panel.style.display = 'none';

            const title = document.getElementById('title-text');
            const initialButtons = document.getElementById('initial-buttons');

            title.style.display = 'block';
            initialButtons.style.display = 'flex';
            title.style.opacity = 0;
            initialButtons.style.opacity = 0;

            requestAnimationFrame(() => {
                title.style.transition = 'opacity 0.5s ease';
                initialButtons.style.transition = 'opacity 0.5s ease';
                title.style.opacity = 1;
                initialButtons.style.opacity = 1;
            });
        }, 500);
    }

    /**
     * Cleans up resources used by the main menu scene.
     * Clears the bird animation interval to prevent memory leaks.
     * @returns {void}
     */
    cleanup() {
        if (this.birdInterval) clearInterval(this.birdInterval);
    }
}
