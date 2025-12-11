import { Attack } from '../core/Attack.js';
import { createBaseAttackAnimationCallback } from '../animations/AttackAnimations.js';
import {
  MemoryDrainStatusEffect,
  DarkResonanceStatusEffect,
  FracturedGuardStatusEffect,
  ShacklesRattleStatusEffect,
  PoisonStatusEffect,
  BurnStatusEffect,
} from './statusEffectRegistry.js';

export class BasicStrike extends Attack {
  static data = {
    basePower: 1,
  };
  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 40,
    duration: 300,
  });
  constructor() {
    super('Basic Strike', BasicStrike.data, BasicStrike.animationCallback);
  }
}

export class HeavySwing extends Attack {
  static data = {
    basePower: 2,
  };
  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 60,
    duration: 400,
  });
  constructor() {
    super('Heavy Swing', HeavySwing.data, HeavySwing.animationCallback);
  }
}

/**
 * Piercing Shot - Archer's basic attack
 * High damage arrow
 */
export class PiercingShot extends Attack {
  static data = {
    basePower: 1.8,
    description: 'A powerful arrow that pierces through armor.',
  };

  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 30,
    duration: 350,
  });

  constructor() {
    super('Piercing Shot', PiercingShot.data, PiercingShot.animationCallback);
  }
}

/**
 * Poison arrow - Archer's specialty attack
 * med damage arrow that inflicts possible poison
 */
export class PoisonArrow extends Attack {
  static data = {
    basePower: 1.2,
    statusEffect: new PoisonStatusEffect(),
    statusEffectChance: 0.5,
    description: 'A venomous arrow that may poison the target.',
  };

  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 30,
    duration: 300,
  });

  constructor() {
    super('Poison Arrow', PoisonArrow.data, PoisonArrow.animationCallback);
  }
}

/**
 * Fireball - Mage's basic attack
 * med damage fireball that likely will inflict burn
 */
export class Fireball extends Attack {
  static data = {
    basePower: 1.4,
    statusEffect: new BurnStatusEffect(),
    statusEffectChance: 0.75,
    description: 'A blazing sphere of fire that may ignite the target.',
  };

  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 25,
    duration: 300,
  });

  constructor() {
    super('Fireball', Fireball.data, Fireball.animationCallback);
  }
}

/**
 * ArcaneBlast - Mage's specialty attack
 * high damage blast
 */
export class ArcaneBlast extends Attack {
  static data = {
    basePower: 1.9,
    description: 'A concentrated burst of pure magical energy.',
  };

  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 20,
    duration: 350,
  });

  constructor() {
    super('Arcane Blast', ArcaneBlast.data, ArcaneBlast.animationCallback);
  }
}

/**
 * Memory Wipe - Dravik's signature attack
 * Moderate damage with a chance to apply Memory Drain (reduces ATK)
 */
export class MemoryWipe extends Attack {
  static data = {
    basePower: 1.5,
    statusEffect: new MemoryDrainStatusEffect(),
    statusEffectChance: 0.35, // 35% chance to reduce player's ATK
    description: 'Dravik tears at your memories, weakening your resolve',
  };
  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 50,
    duration: 400,
  });
  constructor() {
    super('Memory Wipe', MemoryWipe.data, MemoryWipe.animationCallback);
  }
}

/**
 * Sigil Surge - High damage attack with DoT
 * Higher base damage with chance to apply Dark Resonance
 */
export class SigilSurge extends Attack {
  static data = {
    basePower: 2,
    statusEffect: new DarkResonanceStatusEffect(),
    statusEffectChance: 0.4, // 40% chance to apply DoT
    description: 'The ouroboros sigil flares with corrupted energy',
  };
  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 70,
    duration: 500,
  });
  constructor() {
    super('Sigil Surge', SigilSurge.data, SigilSurge.animationCallback);
  }
}

/**
 * Alchemist's Strike - Basic but reliable attack
 * Lower damage but no status effect - used for consistency
 */
export class AlchemistStrike extends Attack {
  static data = {
    basePower: 1.2,
    description: 'A calculated strike honed by years of dark experimentation',
  };
  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 45,
    duration: 350,
  });
  constructor() {
    super('Alchemist Strike', AlchemistStrike.data, AlchemistStrike.animationCallback);
  }
}

/**
 * Mind Leech - Cursed Scholar's attack
 * Deals damage and heals the Cursed Scholar for a portion of the damage dealt
 */
export class MindLeech extends Attack {
  static data = {
    basePower: 1.25, // modest hit
    description: 'A psychic lance that saps life',
  };
  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 45,
    duration: 350,
  });
  constructor() {
    super('Mind Leech', MindLeech.data, MindLeech.animationCallback);
  }

  async execute(source, target, battle) {
    if (!target.isAlive()) return Promise.resolve();
    battle.logEvent(`${source.name} uses ${this.name}!`);

    const baseDamage = source.stats.ATTACK * this.basePower;
    const defenseReduction = target.stats.DEFEND / 2;
    const damage = Math.max(1, Math.floor(baseDamage - defenseReduction));

    await this.playAnimation(source, target, battle);

    await target.takeDamage(damage);
    battle.logEvent(`${target.name} takes ${damage} damage!`);
    if (!target.isAlive()) battle.logEvent(`${target.name} is defeated!`);

    const lifesteal = Math.floor(damage * 0.5); // tweak this percent if needed
    if (lifesteal > 0) {
      source.heal(lifesteal);
      battle.logEvent(`${source.name} siphons ${lifesteal} HP!`);
    }
  }
}

/**
 * Runic Snare - Cursed Scholar's specialty attack
 * Deals damage and applies Poison status effect
 */
export class RunicSnare extends Attack {
  static data = {
    basePower: 1.1,
    description: 'A binding rune that injects venom into the target.',
  };
  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 40,
    duration: 350,
  });

  constructor() {
    super('Runic Snare', RunicSnare.data, RunicSnare.animationCallback);
  }

  async execute(source, target, battle) {
    if (!target.isAlive()) return Promise.resolve();
    battle.logEvent(`${source.name} uses ${this.name}!`);

    const baseDamage = source.stats.ATTACK * this.basePower;
    const defenseReduction = target.stats.DEFEND / 2;
    const damage = Math.max(1, Math.floor(baseDamage - defenseReduction));

    await this.playAnimation(source, target, battle);
    await target.takeDamage(damage);
    battle.logEvent(`${target.name} takes ${damage} damage!`);
    if (!target.isAlive()) battle.logEvent(`${target.name} is defeated!`);

    const poison = new PoisonStatusEffect();
    poison.duration = 3;
    poison.remainingTurns = 3;
    target.addStatusEffect(poison, battle.textbox);
    battle.logEvent(`${target.name} is poisoned!`);
  }
}

/**
 * Echo Rend - Memory Wraith's basic attack
 * Moderate damage with chance to apply Fractured Guard (reduces DEF)
 * Applied by Wraith's Echo Rend ability
 */
export class EchoRend extends Attack {
  static data = {
    basePower: 1.4,
    statusEffect: new FracturedGuardStatusEffect(),
    statusEffectChance: 0.45,
    description: 'A raking swipe that cracks armor with remembered pain.',
  };
  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 55,
    duration: 380,
  });
  constructor() {
    super('Echo Rend', EchoRend.data, EchoRend.animationCallback);
  }
}

/**
 * Haunting Pulse - Memory Wraith's specialty attack
 * High damage attack
 */
export class HauntingPulse extends Attack {
  static data = {
    basePower: 1.8,
    description: 'A burst of condensed memory-force that slams into the target.',
  };
  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 40,
    duration: 420,
  });
  constructor() {
    super('Haunting Pulse', HauntingPulse.data, HauntingPulse.animationCallback);
  }
}

/**
 * Shackles Rattle - Warden's attack
 * Deals damage and buffs Warden's ATTACK stat
 */
export class ShacklesRattle extends Attack {
  static data = {
    basePower: 1.3, // same as Basic Strike damage profile
    description: 'A heavy slam that hypes the Warden up.',
  };
  static animationCallback = createBaseAttackAnimationCallback({
    lungeDistance: 35,
    duration: 320,
  });

  constructor() {
    super('Shackles Rattle', ShacklesRattle.data, ShacklesRattle.animationCallback);
  }

  async execute(source, target, battle) {
    if (!target.isAlive()) return Promise.resolve();
    battle.logEvent(`${source.name} uses ${this.name}!`);

    // standard light hit (mirrors Basic Strike math)
    const baseDamage = source.stats.ATTACK * this.basePower;
    const defenseReduction = target.stats.DEFEND / 2;
    const damage = Math.max(1, Math.floor(baseDamage - defenseReduction));

    await this.playAnimation(source, target, battle);
    await target.takeDamage(damage);
    battle.logEvent(`${target.name} takes ${damage} damage!`);
    if (!target.isAlive()) battle.logEvent(`${target.name} is defeated!`);

    // self-buff
    source.addStatusEffect(new ShacklesRattleStatusEffect(), battle.textbox);
    battle.logEvent(`${source.name}'s attack rises!`);
  }
}

export const AttackMap = {
  'Basic Strike': BasicStrike,
  'Heavy Swing': HeavySwing,
  'Memory Wipe': MemoryWipe,
  'Sigil Surge': SigilSurge,
  'Alchemist Strike': AlchemistStrike,
  'Mind Leech': MindLeech,
  'Runic Snare': RunicSnare,
  'Piercing Shot': PiercingShot,
  'Poison Arrow': PoisonArrow,
  Fireball: Fireball,
  'Arcane Blast': ArcaneBlast,
  'Echo Rend': EchoRend,
  'Haunting Pulse': HauntingPulse,
  'Shackles Rattle': ShacklesRattle,
};

export function getAttackByName(name) {
  return AttackMap[name];
}
