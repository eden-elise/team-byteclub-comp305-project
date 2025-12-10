/**
 * @fileoverview DamageAnimations - Provides damage reaction animation utilities for battle scenes
 * This module handles visual feedback animations when entities take damage
 * @module gameplay/animations/DamageAnimations
 */

/**
 * Executes a base damage reaction animation with knockback and shake effects.
 * The animation sequence consists of an initial knockback followed by a shake
 * pattern that settles back to the original position.
 * @async
 * @param {boolean} isPlayer - Whether the damaged entity is the player character.
 *                             Determines which sprite to animate and the knockback direction.
 * @returns {Promise<void>} Resolves when the animation sequence completes
 * @example
 * // Animate player taking damage
 * await BaseDamageAnimation(true);
 *
 * // Animate enemy taking damage
 * await BaseDamageAnimation(false);
 */
export async function BaseDamageAnimation(isPlayer) {
    const sprite = document.getElementById(isPlayer ? 'player-sprite' : 'enemy-sprite');
    if (!sprite) return;

    /**
     * Distance in pixels for the initial knockback
     * @constant {number}
     */
    const knockback = 20;

    /**
     * Distance in pixels for the shake oscillation
     * @constant {number}
     */
    const shake = 10;

    /**
     * Duration in milliseconds for each animation frame
     * @constant {number}
     */
    const duration = 50;

    const style = window.getComputedStyle(sprite);
    const matrix = new DOMMatrix(style.transform);

    /**
     * Array of CSS transform matrix strings representing each keyframe.
     * Sequence: knockback → shake left → shake right → shake left → return to origin
     * @type {string[]}
     */
    const keyframes = [knockback, knockback - shake, knockback + shake, knockback - shake, 0].map(
        (offset) => {
            const x = isPlayer ? -offset : offset;
            return `matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${matrix.e + x},${matrix.f})`;
        }
    );

    for (const frame of keyframes) {
        sprite.style.transform = frame;
        await new Promise((r) => setTimeout(r, duration));
    }
}
