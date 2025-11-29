# Item Animation System

A modular, reusable animation system for items in the combat system.

## Overview

The animation system provides:
- **Base utilities** for DOM manipulation and animation coordination
- **Pre-built animations** like the "throw" animation
- **Easy extensibility** for adding new animation types

## Usage

### Using the Throw Animation

The throw animation makes an item sprite start large at the bottom of the screen, shrink, move toward the target, rotate rapidly, and disappear on impact with an optional sound.

```javascript
import { Item } from '../../core/Item.js';
import { createThrowAnimationCallback } from '../../animations/ItemAnimations.js';

export function createMyItem() {
    return new Item(
        'My Item',
        { heal: 100 },
        true, // consumable
        false, // variableTarget
        createThrowAnimationCallback({
            itemImage: 'path/to/item-sprite.png',
            startScale: 2.0,        // Initial size (2x normal)
            endScale: 0.3,          // Final size (0.3x normal)
            duration: 1000,         // Animation duration in ms
            rotationSpeed: 5,       // Rotation multiplier
            soundPath: 'path/to/impact-sound.mp3',
            soundVolume: 0.5,
            startPosition: 'bottom' // 'bottom' | 'source' | 'custom'
        })
    );
}
```

### Configuration Options

- **itemImage** (string): Path to the item sprite/image. If not provided, falls back to target's image.
- **startScale** (number): Initial scale of the item (default: 2.0)
- **endScale** (number): Final scale of the item (default: 0.3)
- **duration** (number): Animation duration in milliseconds (default: 1000)
- **soundPath** (string): Path to sound file to play on impact (optional)
- **soundVolume** (number): Volume for impact sound, 0.0 to 1.0 (default: 0.5)
- **rotationSpeed** (number): Rotation speed multiplier (default: 5)
- **startPosition** (string): Starting position - 'bottom' (default), 'source', or 'custom'
- **onComplete** (Function): Optional callback when animation completes

### Creating Custom Animations

You can create custom animations by using the base utilities:

```javascript
import {
    createAnimatedElement,
    removeAnimatedElement,
    getElementPosition,
    animateWithFrame,
    playSound
} from './AnimationUtils.js';

export async function createCustomAnimation(source, target, battle, config) {
    // Create animated element
    const element = createAnimatedElement({
        imageSrc: config.itemImage,
        className: 'custom-animation',
        initialStyle: { /* initial styles */ }
    });
    
    // Animate using requestAnimationFrame
    await animateWithFrame(element, (el, progress) => {
        // Update element styles based on progress (0 to 1)
        el.style.transform = `translateX(${progress * 100}px)`;
    }, config.duration);
    
    // Play sound if needed
    if (config.soundPath) {
        await playSound(config.soundPath, config.soundVolume);
    }
    
    // Clean up
    removeAnimatedElement(element);
}
```

## Architecture

### AnimationUtils.js
Base utilities for:
- Getting entity sprite elements from the DOM
- Creating and removing animated elements
- Playing sounds
- Animating elements with CSS transitions or requestAnimationFrame

### ItemAnimations.js
Pre-built item animations:
- `createThrowAnimation()` - The throw animation implementation
- `createThrowAnimationCallback()` - Factory function for easy use in Item constructors

### Extensibility

To add a new animation type:
1. Create a new function in `ItemAnimations.js` (or a new file)
2. Use the utilities from `AnimationUtils.js`
3. Create a factory function that returns an animation callback
4. Export it from `index.js`

Example structure:
```javascript
export async function createNewAnimation(source, target, battle, config) {
    // Animation implementation
}

export function createNewAnimationCallback(config = {}) {
    return async (source, target, battle) => {
        return createNewAnimation(source, target, battle, config);
    };
}
```

