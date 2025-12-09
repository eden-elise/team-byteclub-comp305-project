import { Attack } from '../core/Attack.js';
import { createBaseAttackAnimationCallback } from '../animations/AttackAnimations.js';
import { FreezeStatusEffect } from './status-effects/statusEffectRegistry.js';

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

export class SiphonSigil extends Attack {
    static data = {
        basePower: 1.25
    };
    static animationCallback = createBaseAttackAnimationCallback({
        lungeDistance: 45,
        duration: 350
    });
    constructor() {
        super('Siphon Sigil', SiphonSigil.data, SiphonSigil.animationCallback);
    }

    // Deal damage then heal caster for a portion of damage dealt
    async execute(source, target, battle) {
        if (!target.isAlive()) return Promise.resolve();

        battle.logEvent(`${source.name} uses ${this.name}!`);

        const baseDamage = source.stats.ATTACK * this.basePower;
        const defenseReduction = target.stats.DEFEND / 2;
        const damage = Math.max(1, Math.floor(baseDamage - defenseReduction));

        await this.playAnimation(source, target, battle);

        await target.takeDamage(damage);
        battle.logEvent(`${target.name} takes ${damage} damage!`);

        if (!target.isAlive()) {
            battle.logEvent(`${target.name} is defeated!`);
        }

        const lifesteal = Math.floor(damage * 0.25);
        if (lifesteal > 0) {
            source.heal(lifesteal);
            battle.logEvent(`${source.name} siphons ${lifesteal} HP!`);
        }
    }
}

export class BindingGlyph extends Attack {
    static data = {
        basePower: 1.0,
        statusEffect: new FreezeStatusEffect(),
        statusEffectChance: 1
    };
    static animationCallback = createBaseAttackAnimationCallback({
        lungeDistance: 40,
        duration: 350
    });
    constructor() {
        super('Binding Glyph', BindingGlyph.data, BindingGlyph.animationCallback);
    }
}

export const AttackMap = {
    'Basic Strike': BasicStrike,
    'Heavy Swing': HeavySwing,
    'Siphon Sigil': SiphonSigil,
    'Binding Glyph': BindingGlyph
};

export function getAttackByName(name) {
    return AttackMap[name];
}
