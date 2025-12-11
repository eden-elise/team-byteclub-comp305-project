/**
 * @fileoverview DeathAnimations - Provides death animation utilities for battle scenes
 * This module handles visual feedback animations when entities are defeated
 * @module gameplay/animations/DeathAnimations
 */

/**
 * Executes a base death animation with fade-out and downward translation effects.
 * The animation uses CSS transitions with a custom cubic-bezier easing for smooth motion.
 * After a 1 second delay, the sprite fades to transparent while moving downward.
 * @async
 * @param {boolean} isPlayer - Whether the dying entity is the player character.
 *                             Determines which sprite element to animate.
 * @returns {Promise<void>} Resolves when the death animation completes.
 *                          Returns immediately if the sprite element is not found.
 * @example
 * // Animate player death
 * await BaseDeathAnimation(true);
 *
 * // Animate enemy death
 * await BaseDeathAnimation(false);
 */
export async function BaseDeathAnimation(isPlayer) {
  const spriteElement = document.getElementById(isPlayer ? 'player-sprite' : 'enemy-sprite');

  if (!spriteElement) {
    console.error('Sprite element not found for death animation.');
    return Promise.resolve();
  }

  spriteElement.style.transition =
    'transform 4s cubic-bezier(0.2, 0.6, 0.2, 1), opacity 4s cubic-bezier(0.2, 0.6, 0.2, 1)';
  const existing = window.getComputedStyle(spriteElement).transform;

  /**
   * The base transform to preserve any existing transformations
   * @type {string}
   */
  const baseTransform = existing === 'none' ? '' : existing;

  await new Promise((r) => setTimeout(r, 1000));

  return new Promise((resolve) => {
    /**
     * Handles the transition end event to clean up and resolve the promise.
     * Removes the event listener and clears the transition style when complete.
     * @param {TransitionEvent} event - The transition end event
     * @private
     */
    const onTransitionEnd = (event) => {
      if (event.propertyName === 'opacity' || event.propertyName === 'transform') {
        spriteElement.removeEventListener('transitionend', onTransitionEnd);
        spriteElement.style.transition = '';
        resolve();
      }
    };

    spriteElement.addEventListener('transitionend', onTransitionEnd);

    spriteElement.style.opacity = '0';
    spriteElement.style.transform = `${baseTransform} translateY(60px)`;
  });
}
