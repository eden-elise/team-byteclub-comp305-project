/**
 * @fileoverview Controller for the gothic-themed intro scroll scene.
 * Manages the animated parchment scroll with typewriter text effects,
 * atmospheric elements, and user skip functionality.
 * @module IntroScrollSceneController
 */

/**
 * @typedef {Object} IntroScrollCallbacks
 * @property {Function} [onComplete] - Callback fired when the scroll animation completes or is skipped
 */

/**
 * Controller class for managing the intro scroll scene animation.
 * Handles CSS loading, animation timing, skip interactions, and writing effects.
 *
 * @class IntroScrollSceneController
 * @example
 * const controller = new IntroScrollSceneController({
 *     onComplete: () => {
 *         console.log('Intro finished, transitioning to next scene...');
 *     }
 * });
 */
export class IntroScrollSceneController {
    /**
     * Creates a new IntroScrollSceneController instance.
     * Automatically initializes the scene upon construction.
     *
     * @constructor
     * @param {IntroScrollCallbacks} callbacks - Object containing callback functions
     * @param {Function} [callbacks.onComplete] - Called when scroll completes or user skips
     */
    constructor(callbacks) {
        /**
         * Callback functions for scene events
         * @type {IntroScrollCallbacks}
         * @private
         */
        this.callbacks = callbacks;

        /**
         * Flag indicating if the scroll animation has completed
         * @type {boolean}
         * @private
         */
        this.scrollComplete = false;

        /**
         * Flag indicating if the user has skipped the intro
         * @type {boolean}
         * @private
         */
        this.skipped = false;

        /**
         * Reference to the keydown event handler for cleanup
         * @type {Function|null}
         * @private
         */
        this.keyHandler = null;

        /**
         * Reference to the click event handler for cleanup
         * @type {Function|null}
         * @private
         */
        this.clickHandler = null;

        this.init();
    }

    /**
     * Initializes the intro scroll scene.
     * Loads required CSS, sets up animation end detection,
     * configures skip handlers, and initializes the writing effect.
     *
     * @private
     * @returns {void}
     */
    init() {
        this.loadCSS();
        this.setupAnimationEnd();
        this.setupSkipHandlers();
        this.initWritingEffect();
    }

    /**
     * Dynamically loads the intro scroll scene CSS stylesheet.
     * Checks if the stylesheet is already loaded to prevent duplicates.
     *
     * @private
     * @returns {void}
     */
    loadCSS() {
        if (!document.querySelector('link[href*="introScrollScene.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = './css/introScrollScene.css';
            document.head.appendChild(link);
        }
    }

    /**
     * Initializes the staggered "writing" effect for scroll content paragraphs.
     * Each paragraph fades in sequentially to simulate text being written.
     * Also triggers the typewriter cursor effect on the last paragraph.
     *
     * @private
     * @returns {void}
     */
    initWritingEffect() {
        /** @type {NodeListOf<HTMLParagraphElement>} */
        const paragraphs = document.querySelectorAll('.scroll-content');

        paragraphs.forEach((p, index) => {
            // Reduced delay: starts at 0s, each subsequent paragraph 0.8s later
            p.style.animationDelay = `${index * 0.8}s`;
        });

        this.addTypewriterToLastParagraph();
    }

    /**
     * Adds a typewriter cursor effect to the last paragraph.
     * The cursor blinks while text is "being written" and then fades out
     * after all paragraphs have completed their fade-in animations.
     *
     * @private
     * @returns {void}
     */
    addTypewriterToLastParagraph() {
        /** @type {HTMLSpanElement|null} */
        const cursor = document.querySelector('.writing-cursor');
        if (!cursor) return;

        /** @type {number} */
        const totalParagraphs = document.querySelectorAll('.scroll-content').length;

        const hideDelay = ((totalParagraphs * 0.8) + 2) * 1000;

        setTimeout(() => {
            if (cursor) {
                cursor.style.animation = 'none';
                cursor.style.opacity = '0';
            }
        }, hideDelay);
    }



    /**
     * Sets up a timeout to detect when the scroll animation naturally completes.
     * The scroll animation duration is 50 seconds, with a 1 second buffer added.
     * If the user hasn't skipped, triggers the completion handler.
     *
     * @private
     * @returns {void}
     */
    setupAnimationEnd() {
        /**
         * Animation duration + buffer (50s animation + 1s buffer = 51000ms)
         * @constant {number}
         */
        const ANIMATION_DURATION_MS = 51000;

        setTimeout(() => {
            if (!this.skipped) {
                this.complete();
            }
        }, ANIMATION_DURATION_MS);
    }

    /**
     * Sets up event listeners to allow the user to skip the intro.
     * Listens for any keyboard press or mouse click.
     * Event listeners are configured to fire only once.
     *
     * @private
     * @returns {void}
     */
    setupSkipHandlers() {
        /**
         * Handles keydown events to skip the intro
         * @param {KeyboardEvent} e - The keyboard event
         */
        const handleKeyPress = (e) => {
            this.skip();
        };

        /**
         * Handles click events to skip the intro
         * @param {MouseEvent} e - The mouse event
         */
        const handleClick = (e) => {
            this.skip();
        };

        document.addEventListener('keydown', handleKeyPress, { once: true });
        document.addEventListener('click', handleClick, { once: true });

        this.keyHandler = handleKeyPress;
        this.clickHandler = handleClick;
    }

    /**
     * Handles user-initiated skip action.
     * Sets the skipped flag and triggers scene completion.
     * Does nothing if the scroll has already completed.
     *
     * @public
     * @returns {void}
     */
    skip() {
        if (this.scrollComplete) return;

        this.skipped = true;
        this.complete();
    }

    /**
     * Completes the intro scroll scene.
     * Fades out the scene element and triggers the onComplete callback.
     * Ensures completion only happens once even if called multiple times.
     *
     * @public
     * @returns {void}
     */
    complete() {
        if (this.scrollComplete) return;

        this.scrollComplete = true;

        /** @type {HTMLElement|null} */
        const scene = document.getElementById('intro-scroll-scene');

        if (scene) {
            scene.style.transition = 'opacity 0.8s ease-out';
            scene.style.opacity = '0';
        }

        /**
         * Fade out duration before triggering callback
         * @constant {number}
         */
        const FADE_OUT_DURATION_MS = 800;

        setTimeout(() => {
            if (this.callbacks && this.callbacks.onComplete) {
                this.callbacks.onComplete();
            }
        }, FADE_OUT_DURATION_MS);
    }
}
