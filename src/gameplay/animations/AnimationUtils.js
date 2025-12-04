/**
 * Animation Utilities - Base utilities for creating item animations
 * Provides helper functions for DOM manipulation and animation coordination
 */

/**
 * Get the position of an element relative to the viewport
 * @param {HTMLElement} element - The DOM element
 * @returns {{x: number, y: number, width: number, height: number}} Position and dimensions
 */
export function getElementPosition(element) {
    if (!element) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
    };
}

/**
 * Create a temporary animated element in the DOM
 * @param {Object} config - Configuration object
 * @param {string} config.imageSrc - Path to the image/sprite
 * @param {string} config.className - CSS class name for styling
 * @param {Object} config.initialStyle - Initial CSS styles
 * @returns {HTMLElement} The created element
 */
export function createAnimatedElement({ imageSrc, className = 'item-animation', initialStyle = {} }) {
    const element = document.createElement('img');
    element.src = imageSrc;
    element.className = className;
    element.style.position = 'fixed';
    element.style.pointerEvents = 'none';
    element.style.zIndex = '1000';

    // Apply initial styles
    Object.assign(element.style, initialStyle);

    // Add to body
    document.body.appendChild(element);

    return element;
}

/**
 * Remove an animated element from the DOM
 * @param {HTMLElement} element - The element to remove
 */
export function removeAnimatedElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

/**
 * Play a sound effect
 * @param {string} soundPath - Path to the sound file
 * @param {number} volume - Volume level (0.0 to 1.0)
 * @returns {Promise} Promise that resolves when sound finishes playing
 */
export function playSound(soundPath, volume = 0.5) {
    return new Promise((resolve) => {
        if (!soundPath) {
            resolve();
            return;
        }

        const audio = new Audio(soundPath);
        audio.volume = volume;

        audio.addEventListener('ended', () => resolve());
        audio.addEventListener('error', () => resolve()); // Resolve even on error to not block animation

        audio.play().catch(() => resolve()); // Resolve on play error
    });
}

/**
 * Animate an element using CSS transitions
 * @param {HTMLElement} element - The element to animate
 * @param {Object} targetStyle - Target CSS styles
 * @param {number} duration - Duration in milliseconds
 * @returns {Promise} Promise that resolves when animation completes
 */
export function animateElement(element, targetStyle, duration = 1000) {
    return new Promise((resolve) => {
        if (!element) {
            resolve();
            return;
        }

        // Set transition
        element.style.transition = `all ${duration}ms ease-out`;

        // Apply target styles
        Object.assign(element.style, targetStyle);

        // Wait for transition to complete
        setTimeout(() => {
            resolve();
        }, duration);
    });
}

/**
 * Animate an element using requestAnimationFrame for more control
 * @param {HTMLElement} element - The element to animate
 * @param {Function} updateFunction - Function(frame, progress) that updates element styles
 * @param {number} duration - Duration in milliseconds
 * @returns {Promise} Promise that resolves when animation completes
 */
export function animateWithFrame(element, updateFunction, duration = 1000) {
    return new Promise((resolve) => {
        if (!element) {
            resolve();
            return;
        }

        const startTime = performance.now();

        function frame(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            updateFunction(element, progress);

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(frame);
    });
}

