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

    // Track resources for cleanup
    this.timeouts = [];
    this.intervals = [];
    this.boundHandleUserInput = null;

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
    audioManager.play('loading-screen', true);
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
   * Helper to safely add timeout
   */
  addTimeout(callback, delay) {
    const id = setTimeout(callback, delay);
    this.timeouts.push(id);
    return id;
  }

  /**
   * Helper to safely add interval
   */
  addInterval(callback, delay) {
    const id = setInterval(callback, delay);
    this.intervals.push(id);
    return id;
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
      audioManager.play('loading-screen', true);
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
    this.boundHandleUserInput = () => {
      if (!this.animationComplete && !this.userInterrupted) {
        this.userInterrupted = true;
        this.skipToButtons();
      }
    };

    document.addEventListener('keydown', this.boundHandleUserInput, { once: true });
    document.addEventListener('click', this.boundHandleUserInput, { once: true });
    document.addEventListener('touchstart', this.boundHandleUserInput, { once: true });
  }

  /**
   * Starts the intro animation sequence with timed events.
   * Triggers bird animations, lightning effects, and shows menu buttons.
   * @returns {void}
   */
  startAnimationSequence() {
    this.addTimeout(() => this.startBirdAnimations(), 3000);
    this.addTimeout(() => this.triggerLightning(), 4500);
    this.addTimeout(() => {
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
    if (!birdsContainer) return; // Guard against scene change

    const createBird = (delay) => {
      this.addTimeout(() => {
        // Double check if container still exists (user might have navigated away)
        if (!document.getElementById('birds-container')) return;

        const bird = document.createElement('div');
        bird.className = 'bird';

        // Animation parameters
        const startY = Math.random() * 55 + 30;
        const flyDistanceX = Math.random() * 300 + 600;
        const flyDistanceY = (Math.random() - 0.5) * 150;
        const duration = Math.random() * 5 + 8;
        const flapSpeed = Math.random() * 0.4 + 0.2;

        bird.style.top = `${startY}%`;
        bird.style.left = '-60px';
        bird.style.setProperty('--fly-distance-x', `${flyDistanceX}px`);
        bird.style.setProperty('--fly-distance-y', `${flyDistanceY}px`);
        bird.style.setProperty('--duration', `${duration}s`);
        bird.style.setProperty('--flap-speed', `${flapSpeed}s`);

        birdsContainer.appendChild(bird);
        this.addTimeout(() => bird.remove(), duration * 1000);
      }, delay);
    };

    this.addTimeout(() => {
      for (let i = 0; i < 32; i++) createBird(i * 600);
    }, 4000);
  }

  /**
   * Triggers the lightning flash animation effect.
   * @returns {void}
   */
  triggerLightning() {
    const lightningFlash = document.getElementById('lightning-flash');
    if (!lightningFlash) return;

    lightningFlash.style.animation = 'lightningFlash 0.8s ease-out forwards';
    audioManager.play('lightning');
    setTimeout(() => {
      lightningFlash.style.animation = '';
      this.addTimeout(() => {
        if (lightningFlash) lightningFlash.style.animation = '';
      }, 800);
    });
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
    const uiContainer = document.querySelector('.ui-container');

    background.style.animation = 'none';
    background.style.opacity = '1';
    background.style.scale = '1';

    uiContainer.style.animation = 'none';
    uiContainer.style.opacity = '1';

    // Title should be visible and start hovering immediately (or after short delay if preferred, but user said "appear at same time")
    // preventing the flight-in animation
    titleText.style.animation = 'hoverTitle 20s ease-in-out infinite alternate';
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

    this.addTimeout(() => {
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

    this.addTimeout(() => {
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

    this.addTimeout(() => {
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

    this.addTimeout(() => {
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
    // Clear all timeouts
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];

    // Clear all intervals
    this.intervals.forEach(clearInterval);
    this.intervals = [];

    // Remove document level listeners
    if (this.boundHandleUserInput) {
      document.removeEventListener('keydown', this.boundHandleUserInput);
      document.removeEventListener('click', this.boundHandleUserInput);
      document.removeEventListener('touchstart', this.boundHandleUserInput);
      this.boundHandleUserInput = null;
    }
  }
}
