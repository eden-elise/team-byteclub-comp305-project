/**
 * @fileoverview AttackAnimations - Provides attack animation utilities for battle scenes
 * This module handles lunge attack animations with hit marker effects
 * @module gameplay/animations/AttackAnimations
 */
import { playSound, animateWithFrame } from './AnimationUtils.js';

/**
 * Default configuration for attack animations
 * @constant {Object}
 * @property {number} lungeDistance - Distance in pixels the attacker lunges forward
 * @property {number} duration - Total animation duration in milliseconds
 * @property {string|null} soundPath - Path to the sound effect file, or null for no sound
 * @property {number} soundVolume - Volume level for the sound effect (0.0 to 1.0)
 * @property {Function|null} onComplete - Callback function to execute when animation completes
 */
const DEFAULT_ATTACK_CONFIG = {
  lungeDistance: 30,
  duration: 300,
  soundPath: null,
  soundVolume: 0.5,
  onComplete: null,
};

/**
 * Creates and executes a base attack animation with lunge and hit marker effects.
 * The attacker lunges toward the target, a hit marker appears at the peak,
 * then the attacker returns to their original position.
 * @async
 * @param {Object} source - The attacking entity
 * @param {boolean} source.isPlayer - Whether the source is the player character
 * @param {Object} target - The target entity being attacked
 * @param {boolean} target.isPlayer - Whether the target is the player character
 * @param {Object} battle - The battle instance context
 * @param {Object} [config={}] - Optional configuration overrides
 * @param {number} [config.lungeDistance] - Distance in pixels to lunge forward
 * @param {number} [config.duration] - Animation duration in milliseconds
 * @param {string|null} [config.soundPath] - Path to sound effect file
 * @param {number} [config.soundVolume] - Sound volume (0.0 to 1.0)
 * @param {Function|null} [config.onComplete] - Callback when animation completes
 * @returns {Promise<void>} Resolves when the animation completes
 */
export async function createBaseAttackAnimation(source, target, battle, config = {}) {
  const finalConfig = { ...DEFAULT_ATTACK_CONFIG, ...config };

  const sprite = document.getElementById(source.isPlayer ? 'player-sprite' : 'enemy-sprite');
  if (!sprite) return;

  const targetSprite = document.getElementById(target.isPlayer ? 'player-sprite' : 'enemy-sprite');
  if (!targetSprite) return;

  const style = window.getComputedStyle(sprite);
  const matrix = new DOMMatrix(style.transform);
  const startX = matrix.e;
  const startY = matrix.f;
  const distance = source.isPlayer ? finalConfig.lungeDistance : -finalConfig.lungeDistance;

  let hitMarkerSpawned = false;

  await animateWithFrame(
    sprite,
    /**
     * Animation frame callback that handles the lunge motion and hit marker spawn.
     * @param {HTMLElement} element - The sprite element being animated
     * @param {number} progress - Animation progress from 0 to 1
     * @private
     */
    (element, progress) => {
      const eased = 1 - Math.pow(1 - progress, 3);

      let currentOffset;
      if (eased <= 0.5) {
        currentOffset = distance * (eased / 0.5);
      } else {
        currentOffset = distance * (1 - (eased - 0.5) / 0.5);

        // Spawn hit marker right after peak
        if (!hitMarkerSpawned) {
          hitMarkerSpawned = true;

          const rect = targetSprite.getBoundingClientRect();
          const marker = document.createElement('img');
          marker.src = '../../src/assets/effects/hit-markers/hit-1.png';
          marker.style.position = 'absolute';
          marker.style.width = '70px';
          marker.style.height = '70px';
          marker.style.left = `${rect.left + rect.width / 2 + (source.isPlayer ? -60 : 60)}px`;
          marker.style.top = `${rect.top + rect.height / 2}px`;
          marker.style.transform = 'translate(-50%, -50%)';
          document.body.appendChild(marker);

          setTimeout(() => {
            marker.style.transition = 'opacity 0.2s ease-out';
            marker.style.opacity = '0';
            setTimeout(() => marker.remove(), 200);
          }, 50);
        }
      }

      element.style.transform = `matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${startX + currentOffset},${startY})`;
    },
    finalConfig.duration
  );

  if (finalConfig.soundPath) await playSound(finalConfig.soundPath, finalConfig.soundVolume);
  if (finalConfig.onComplete) finalConfig.onComplete();
}

/**
 * Creates a curried callback function for base attack animations with preset configuration.
 * Useful for defining reusable attack animation callbacks with specific settings.
 * @param {Object} [config={}] - Configuration options to preset for the animation
 * @param {number} [config.lungeDistance] - Distance in pixels to lunge forward
 * @param {number} [config.duration] - Animation duration in milliseconds
 * @param {string|null} [config.soundPath] - Path to sound effect file
 * @param {number} [config.soundVolume] - Sound volume (0.0 to 1.0)
 * @param {Function|null} [config.onComplete] - Callback when animation completes
 * @returns {Function} A callback function that accepts (source, target, battle) parameters
 * @example
 * // Create a custom attack animation with longer lunge
 * const heavyAttackAnimation = createBaseAttackAnimationCallback({
 *   lungeDistance: 50,
 *   duration: 500,
 *   soundPath: '/sounds/heavy-hit.mp3'
 * });
 *
 * // Use in an ability definition
 * ability.animationCallback = heavyAttackAnimation;
 */
export const createBaseAttackAnimationCallback =
  (config = {}) =>
  /**
   * Attack animation callback function.
   * @param {Object} source - The attacking entity
   * @param {Object} target - The target entity being attacked
   * @param {Object} battle - The battle instance context
   * @returns {Promise<void>} Resolves when the animation completes
   */
  (source, target, battle) =>
    createBaseAttackAnimation(source, target, battle, config);
