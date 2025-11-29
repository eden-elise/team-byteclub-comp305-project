import { Attack } from '../../core/Attack.js';
import { createBaseAttackAnimationCallback } from '../../animations/AttackAnimations.js';

function createBasicStrikeInstance(animationCallback) {
    class BasicStrike extends Attack {}
    return new BasicStrike(
        ATTACKS.BASIC_STRIKE.name,
        ATTACKS.BASIC_STRIKE.data,
        animationCallback
    );
}

function createHeavySwingInstance(animationCallback) {
    class HeavySwing extends Attack {}
    return new HeavySwing(
        ATTACKS.HEAVY_SWING.name,
        ATTACKS.HEAVY_SWING.data,
        animationCallback
    );
}

export const ATTACKS = {
    BASIC_STRIKE: {
        id: 'basic_strike',
        name: 'Basic Strike',
        description: 'A simple melee attack.',
        data: {
            basePower: 1,
        },
        factory: createBasicStrikeInstance,
        animationCallback: createBaseAttackAnimationCallback({
            lungeDistance: 40,
            duration: 300
        })
    },
    HEAVY_SWING: {
        id: 'heavy_swing',
        name: 'Heavy Swing',
        description: 'A hard melee attack.',
        data: {
            basePower: 2,
        },
        factory: createHeavySwingInstance,
        animationCallback: createBaseAttackAnimationCallback({
            lungeDistance: 60,
            duration: 400
        })
    }
};

export function getAttackByName(attackName) {
    for (const attack of Object.values(ATTACKS)) {
        if (attack.name === attackName) {
            return attack;
        }
    }
    return null;
}
