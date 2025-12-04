import { Attack } from '../../core/Attack.js';
import { createBaseAttackAnimationCallback } from '../../animations/AttackAnimations.js';

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

export const AttackMap = {
    'Basic Strike': BasicStrike,
    'Heavy Swing': HeavySwing
};

export function getAttackByName(name) {
    return AttackMap[name];
}
