import { StatusEffect } from '../core/StatusEffect.js';

export class RegenerationStatusEffect extends StatusEffect {
  constructor() {
    super('Regeneration', 'Restores health over time', 3, 'regeneration-icon.png');
  }
}

export class AdrenalineStatusEffect extends StatusEffect {
  constructor() {
    super('Adrenaline', 'Boosts speed and action priority', 3, 'adrenaline-icon.png');
  }
}

export class PoisonStatusEffect extends StatusEffect {
  constructor() {
    super('Poison', 'Inflicts 4 damage per turn', 2, 'poison-icon.png');
    this.onTurnStart = async (entity, textbox) => {
      await entity.takeDamage(4);
      textbox.addLogEntry(`${entity.name} takes 4 damage from poison!`);
    };
  }
}
export class BurnStatusEffect extends StatusEffect {
  constructor() {
    super('Burn', 'Deals 5 damage per turn', 4, 'flame-icon.png');
    this.onTurnStart = async (entity, textbox) => {
      await entity.takeDamage(5);
      textbox.addLogEntry(`${entity.name} takes 5 damage from burn!`);
    };
  }
}

export class FreezeStatusEffect extends StatusEffect {
  constructor() {
    super('Freeze', 'Prevents action for a turn', 2, 'freeze-icon.png');
  }
}

/**
 * Memory Drain - Reduces target's ATTACK stat
 * Applied by Dravik's Memory Wipe ability
 */
export class MemoryDrainStatusEffect extends StatusEffect {
  constructor() {
    super(
      'Memory Drain',
      'Reduces attack power as memories fade',
      3,
      'memory-drain-icon.png',
      { ATTACK: -3 } // Stat modifier: -3 ATK
    );
  }
}

/**
 * Dark Resonance - Deals damage over time from the sigil's corruption
 * Applied by Dravik's Sigil Surge ability
 */
export class DarkResonanceStatusEffect extends StatusEffect {
  constructor() {
    super(
      'Dark Resonance',
      'The sigil burns with dark energy, dealing 6 damage per turn',
      3,
      'dark-resonance-icon.png'
    );
    this.onTurnStart = async (entity, textbox) => {
      await entity.takeDamage(4);
      textbox.addLogEntry(`${entity.name} takes 6 damage from Dark Resonance!`);
    };
  }
}

/**
 * Alchemical Shield - Reduces incoming damage
 * Dravik can buff himself with this
 */
export class AlchemicalShieldStatusEffect extends StatusEffect {
  constructor() {
    super(
      'Alchemical Shield',
      'A protective barrier that increases defense',
      2,
      'alchemical-shield-icon.png',
      { DEFEND: 5 } // Stat modifier: +5 DEF
    );
  }
}

export class FracturedGuardStatusEffect extends StatusEffect {
  constructor() {
    super(
      'Fractured Guard',
      'Shattered memories erode defenses',
      3,
      'fractured-guard-icon.png',
      { DEFEND: -4 }
    );
  }
}

export class ShacklesRattleStatusEffect extends StatusEffect {
  constructor() {
    super(
      'Shackles Rattle',
      'Adrenaline surges, raising attack briefly',
      2,
      'adrenaline-icon.png',
      { ATTACK: 2 } // +2 ATK for 2 turns; reapplying will refresh/stack per your StatusEffect rules
    );
  }
}
