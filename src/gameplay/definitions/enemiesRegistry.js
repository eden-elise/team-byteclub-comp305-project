import { Entity } from '../core/Entity.js';
import { BaseDeathAnimation } from '../animations/DeathAnimations.js';
import { BaseDamageAnimation } from '../animations/DamageAnimations.js';

/**
 * Lord Dravik - The Final Boss
 *
 * DESIGN PHILOSOPHY:
 * - HP (220): High enough to require multiple turns, low enough to be beatable
 * - ATK (22): Threatens both heroes but doesn't one-shot anyone
 * - DEF (28): Reduces incoming damage but doesn't make fights too long
 * - SPEED (11): Between Knight (8) and Archer (14) - Archer goes first, Knight goes second
 * - LUCK (18): High luck reduces Mystery Potion effectiveness against him
 *
 * BALANCE ANALYSIS:
 * vs Knight (DEF 25): Dravik deals ~13 damage per turn
 *   - Knight can survive ~27 hits with potions (350 effective HP / 13)
 *   - Knight deals ~22 damage with Heavy Swing (36 - 14)
 *   - Knight needs ~10 Heavy Swings to win
 *   - Result: Challenging but very winnable with good potion timing
 *
 * vs Archer (DEF 13): Dravik deals ~19 damage per turn
 *   - Archer can survive ~17 hits with potions (320 effective HP / 19)
 *   - Archer deals ~38 damage with Heavy Swing (48 - 14)
 *   - Archer needs ~6 Heavy Swings to win
 *   - Result: Fast-paced fight, rewards aggressive play with healing support
 */
export class LordDravik extends Entity {
  constructor() {
    const stats = {
      ATTACK: 22,
      DEFEND: 28,
      SPEED: 11,
      LUCK: 18,
    };

    const moves = ['Memory Wipe', 'Sigil Surge', 'Alchemist Strike'];

    const items = [];

    super(
      'Lord Dravik',
      220, // HP - balanced for 8-12 turn fight
      stats,
      moves,
      items,
      '../../src/assets/art/characters/dravik.png',
      () => BaseDeathAnimation(false),
      false,
      () => BaseDamageAnimation(false)
    );
  }
}

/**
 * Factory function to create a fresh Dravik instance
 */
export const createLordDravik = () => {
  return new LordDravik();
};

export class CursedScholar extends Entity {
  constructor() {
    const stats = {
      ATTACK: 18,
      DEFEND: 18,
      SPEED: 12,
      LUCK: 14,
    };
    const moves = ['Mind Leech', 'Runic Snare'];
    const items = [];

    super(
      'Cursed Scholar',
      120, // tougher than Warden, softer than Dravik
      stats,
      moves,
      items,
      '../../src/assets/art/characters/Cursed Scholar.png',
      () => BaseDeathAnimation(false),
      false,
      () => BaseDamageAnimation(false)
    );
  }
}

export const createCursedScholar = () => {
  return new CursedScholar();
};

export class MemoryWraith extends Entity {
  constructor() {
    const stats = {
      ATTACK: 20,
      DEFEND: 22,
      SPEED: 13,
      LUCK: 20,
    };
    const moves = ['Echo Rend', 'Haunting Pulse'];
    const items = [];

    super(
      'Memory Wraith',
      170, // Floor 4 boss: tougher than Scholar, below Dravik
      stats,
      moves,
      items,
      '../../src/assets/art/characters/Memory Wraith.png',
      () => BaseDeathAnimation(false),
      false,
      () => BaseDamageAnimation(false)
    );
  }
}

export const createMemoryWraith = () => {
  return new MemoryWraith();
};

export class Warden extends Entity {
  constructor() {
    const stats = {
      ATTACK: 18, // same as Knight clone
      DEFEND: 31,
      SPEED: 9,
      LUCK: 10,
    };
    const moves = ['Shackles Rattle'];
    const items = [];

    super(
      'Warden',
      50, // keep the same HP you set in floor-1 helper
      stats,
      moves,
      items,
      '../../src/assets/art/characters/Warden.png',
      () => BaseDeathAnimation(false),
      false,
      () => BaseDamageAnimation(false)
    );
  }
}

export const createWarden = () => {
  return new Warden();
};
