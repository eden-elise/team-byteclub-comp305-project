/**
 * Item Animations - Pre-built animations for items
 * Modular system for creating reusable item animations
 */

import {
  getElementPosition,
  createAnimatedElement,
  removeAnimatedElement,
  playSound,
  animateWithFrame,
} from './AnimationUtils.js';

/**
 * Configuration object for throw animation
 * @typedef {Object} ThrowAnimationConfig
 * @property {string} itemImage - Path to the item sprite/image
 * @property {number} startScale - Initial scale of the item (default: 2.0)
 * @property {number} endScale - Final scale of the item (default: 0.3)
 * @property {number} duration - Animation duration in milliseconds (default: 1000)
 * @property {string} soundPath - Path to sound file to play on impact (optional)
 * @property {number} soundVolume - Volume for impact sound (0.0 to 1.0, default: 0.5)
 * @property {number} rotationSpeed - Rotation speed multiplier (default: 5)
 * @property {string} startPosition - Starting position: 'bottom' | 'source' | 'custom' (default: 'bottom')
 * @property {Function} onComplete - Optional callback when animation completes
 */

/**
 * Default configuration for throw animation
 */
const DEFAULT_THROW_CONFIG = {
  startScale: 2.0,
  endScale: 0.3,
  duration: 1000,
  soundPath: null,
  soundVolume: 0.5,
  rotationSpeed: 5,
  startPosition: 'bottom',
  onComplete: null,
};

/**
 * Create a throw animation for an item
 * The item starts large at the bottom of the screen, shrinks, moves toward the target,
 * rotates rapidly, and disappears on impact with a sound
 *
 * @param {Entity} source - The entity using the item
 * @param {Entity} target - The target entity
 * @param {Function} applyEffects - Optional callback to apply effects at impact moment
 * @param {ThrowAnimationConfig} config - Animation configuration
 * @returns {Promise} Promise that resolves when animation completes
 */
export async function createThrowAnimation(source, target, applyEffects = null, config = {}) {
  const finalConfig = { ...DEFAULT_THROW_CONFIG, ...config };

  const targetPos = getElementPosition(
    document.getElementById(target.isPlayer ? 'player-sprite' : 'enemy-sprite')
  );

  // Determine starting position
  let startX, startY;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (finalConfig.startPosition === 'source') {
    let sourceSprite = findSpriteElement(source);

    const sourcePos = getElementPosition(sourceSprite);
    startX = sourcePos.x;
    startY = sourcePos.y;
  } else if (finalConfig.startPosition === 'custom' && config.customStartPos) {
    startX = config.customStartPos.x;
    startY = config.customStartPos.y;
  } else {
    // Default: bottom center of screen
    startX = viewportWidth / 2;
    startY = viewportHeight - 50;
  }
  // Create animated element
  const itemElement = createAnimatedElement({
    imageSrc: finalConfig.itemImage,
    className: 'item-throw-animation',
    initialStyle: {
      left: `${startX}px`,
      top: `${startY}px`,
      width: `${100 * finalConfig.startScale}px`,
      height: `${100 * finalConfig.startScale}px`,
      transform: `translate(-50%, -50%) scale(${finalConfig.startScale}) rotate(0deg)`,
      opacity: '1',
      transformOrigin: 'center center',
    },
  });

  // Calculate animation values
  const endX = targetPos.x;
  const endY = targetPos.y;
  const scaleDiff = finalConfig.endScale - finalConfig.startScale;
  const totalRotation = 360 * finalConfig.rotationSpeed; // Total rotation in degrees

  // Animate using requestAnimationFrame for smooth rotation
  await animateWithFrame(
    itemElement,
    (element, progress) => {
      // Easing function for smooth motion (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate position
      const currentX = startX + (endX - startX) * eased;
      const currentY = startY + (endY - startY) * eased;

      // Interpolate scale
      const currentScale = finalConfig.startScale + scaleDiff * eased;

      // Rotate continuously
      const currentRotation = totalRotation * progress;

      // Apply transforms
      element.style.left = `${currentX}px`;
      element.style.top = `${currentY}px`;
      element.style.transform = `translate(-50%, -50%) scale(${currentScale}) rotate(${currentRotation}deg)`;
    },
    finalConfig.duration
  );

  // Apply effects at the moment of impact (if callback provided)
  if (applyEffects) {
    await applyEffects();
  }

  // Play impact sound
  if (finalConfig.soundPath) {
    await playSound(finalConfig.soundPath, finalConfig.soundVolume);
  }

  // Fade out quickly before removing
  itemElement.style.transition = 'opacity 0.1s ease-out';
  itemElement.style.opacity = '0';

  await new Promise((resolve) => setTimeout(resolve, 100));

  // Remove element
  removeAnimatedElement(itemElement);

  // Call completion callback if provided
  if (finalConfig.onComplete) {
    finalConfig.onComplete();
  }
}

export const createThrowAnimationCallback =
  (config = {}) =>
  (source, target, applyEffects) =>
    createThrowAnimation(source, target, applyEffects, config);
