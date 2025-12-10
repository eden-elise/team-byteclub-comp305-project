import { Entity } from '../core/Entity.js';

import { BaseDeathAnimation } from '../animations/DeathAnimations.js';
import { BaseDamageAnimation } from '../animations/DamageAnimations.js';

export class Knight extends Entity {
  constructor(isPlayer) {
    const stats = {
      ATTACK: 18,
      DEFEND: 31,
      SPEED: 9,
      LUCK: 10,
    };
    const moves = ['Basic Strike', 'Heavy Swing'];

    const items = [
      { name: 'Health Potion', quantity: 5 },
      { name: 'Poison Potion', quantity: 2 },
      { name: 'Fire Potion', quantity: 3 },
      { name: 'Mystery Potion', quantity: 1 },
    ];

    super(
      'Knight',
      150,
      stats,
      moves,
      items,
      '../../src/assets/art/characters/hero-1.png',
      () => BaseDeathAnimation(isPlayer),
      isPlayer,
      () => BaseDamageAnimation(isPlayer)
    );
  }
}

export class Archer extends Entity {
  constructor(isPlayer) {
    const stats = {
      ATTACK: 24,
      DEFEND: 13,
      SPEED: 14,
      LUCK: 15,
    };
    const moves = ['Piercing Shot', 'Poison Arrow'];

    const items = [
      { name: 'Health Potion', quantity: 5 },
      { name: 'Poison Potion', quantity: 2 },
      { name: 'Fire Potion', quantity: 3 },
      { name: 'Mystery Potion', quantity: 1 },
    ];

    super(
      'Archer',
      120,
      stats,
      moves,
      items,
      '../../src/assets/art/characters/hero-2.png',
      () => BaseDeathAnimation(isPlayer),
      isPlayer,
      () => BaseDamageAnimation(isPlayer)
    );
  }
}


export class Mage extends Entity {
  constructor(isPlayer) {
    const stats = {
      ATTACK: 19,
      DEFEND: 13,
      SPEED: 23,
      LUCK: 25,
    };
    const moves = ['Fireball', 'Arcane Blast'];

    const items = [
      { name: 'Health Potion', quantity: 5 },
      { name: 'Poison Potion', quantity: 2 },
      { name: 'Fire Potion', quantity: 3 },
      { name: 'Mystery Potion', quantity: 1 },
    ];

    super(
      'Mage',
      90,
      stats,
      moves,
      items,
      '../../src/assets/art/characters/hero-3.png',
      () => BaseDeathAnimation(isPlayer),
      isPlayer,
      () => BaseDamageAnimation(isPlayer)
    );
  }
}
