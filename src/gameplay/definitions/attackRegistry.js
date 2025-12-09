import { Attack } from '../core/Attack.js';
import { createBaseAttackAnimationCallback } from '../animations/AttackAnimations.js';
import { MemoryDrainStatusEffect, DarkResonanceStatusEffect } from './statusEffectRegistry.js';


export class BasicStrike extends Attack {
    static data = {
        basePower: 1,
    };
    static animationCallback = createBaseAttackAnimationCallback({
        lungeDistance: 40,
        duration: 300
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
        duration: 400
    });
    constructor() {
        super('Heavy Swing', HeavySwing.data, HeavySwing.animationCallback);
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
        statusEffectChance: 0.35,  // 35% chance to reduce player's ATK
        description: 'Dravik tears at your memories, weakening your resolve'
    };
    static animationCallback = createBaseAttackAnimationCallback({
        lungeDistance: 50,
        duration: 400
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
        statusEffectChance: 0.40,  // 40% chance to apply DoT
        description: 'The ouroboros sigil flares with corrupted energy'
    };
    static animationCallback = createBaseAttackAnimationCallback({
        lungeDistance: 70,
        duration: 500
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
        description: 'A calculated strike honed by years of dark experimentation'
    };
    static animationCallback = createBaseAttackAnimationCallback({
        lungeDistance: 45,
        duration: 350
    });
    constructor() {
        super('Alchemist Strike', AlchemistStrike.data, AlchemistStrike.animationCallback);
    }
}

export const AttackMap = {
    'Basic Strike': BasicStrike,
    'Heavy Swing': HeavySwing,
    'Memory Wipe': MemoryWipe,
    'Sigil Surge': SigilSurge,
    'Alchemist Strike': AlchemistStrike
};

export function getAttackByName(name) {
    return AttackMap[name];
}
