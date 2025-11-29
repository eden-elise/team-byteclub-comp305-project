import { Item } from '../../core/Item.js';

import { createThrowAnimationCallback } from '../../animations/ItemAnimations.js';
import * as StatusEffects from '../status-effects/statusEffectRegistry.js';


export class HealthPotion extends Item {
    constructor() {
        super('Health Potion', HealthPotion.data, createThrowAnimationCallback({ itemImage: HealthPotion.data.spritePath }));
    }
}
HealthPotion.data = {
    heal: 40,
    spritePath: '../../src/assets/art/items/potions/health-potion.png',
    description: 'Restores 40 HP'
};

export class RegenerationPotion extends Item {
    constructor() {
        super('Regeneration Potion', RegenerationPotion.data, createThrowAnimationCallback({ itemImage: RegenerationPotion.data.spritePath }));
    }
    async execute(source, target, battle) {
        super.execute(source, target, battle);
        const regenerationEffect = new StatusEffects.RegenerationStatusEffect();
        regenerationEffect.duration = Math.floor(Math.random() * 3) + 3;
        target.addStatusEffect(regenerationEffect, battle);
        battle.logEvent(`${target.name} has regeneration for ${regenerationEffect.duration} turns!`);
    }
}
RegenerationPotion.data = {
    isVariableTarget: true,
    spritePath: '../../src/assets/art/items/potions/regeneration-potion.png',
    description: 'Gives target regeneration for between 3 and 5 turns!'
};

export class AdrenalinePotion extends Item {
    constructor() {
        super('Adrenaline Potion', AdrenalinePotion.data, createThrowAnimationCallback({ itemImage: AdrenalinePotion.data.spritePath }));
    }
    async execute(source, target, battle) {
        super.execute(source, target, battle);
        const duration = 2;
        const adrenalineEffect = new StatusEffects.AdrenalineStatusEffect();
        target.addStatusEffect(adrenalineEffect, battle);
        battle.logEvent(`${target.name} has adrenaline for ${duration} turns!`);
    }
}
AdrenalinePotion.data = {
    isVariableTarget: true,
    spritePath: '../../src/assets/art/items/potions/adrenaline-potion.png',
    description: 'Gives target adrenaline!'
};

export class PoisonPotion extends Item {
    constructor() {
        super('Poison Potion', PoisonPotion.data, createThrowAnimationCallback({ itemImage: PoisonPotion.data.spritePath }));
    }
    async execute(source, target, battle) {
        super.execute(source, target, battle);
        const poisonEffect = new StatusEffects.PoisonStatusEffect();
        poisonEffect.duration = Math.floor(Math.random() * 4) + 2;
        target.addStatusEffect(poisonEffect, battle);
        battle.logEvent(`${target.name} is poisoned for ${poisonEffect.duration} turns!`);
    }
}
PoisonPotion.data = {
    damage: 5,
    isVariableTarget: true,
    spritePath: '../../src/assets/art/items/potions/poison-potion.png',
    description: 'Inflicts poison (4 damage per turn for 2-5 turns)'
};

export class FirePotion extends Item {
    constructor() {
        super('Fire Potion', FirePotion.data, createThrowAnimationCallback({ itemImage: FirePotion.data.spritePath }));
    }
    async execute(source, target, battle) {
        super.execute(source, target, battle);
        const duration = 3;
        const burnEffect = new StatusEffects.BurnStatusEffect();
        burnEffect.duration = 3;
        target.addStatusEffect(burnEffect, battle);
        battle.logEvent(`${target.name} is burned for ${duration} turns!`);
    }
}
FirePotion.data = {
    damage: 5,
    isVariableTarget: true,
    spritePath: '../../src/assets/art/items/potions/fire-potion.png',
    description: 'Deals 5 damage + 5 per turn for 3 turns'
};

export class FreezePotion extends Item {
    constructor() {
        super('Freeze Potion', FreezePotion.data, createThrowAnimationCallback({ itemImage: FreezePotion.data.spritePath }));
    }
    async execute(source, target, battle) {
        super.execute(source, target, battle);
        const freezeEffect = new StatusEffects.FreezeStatusEffect();
        freezeEffect.duration = 1;
        target.addStatusEffect(freezeEffect, battle);
        battle.logEvent(`${target.name} is burned for 1 turn!`);
    }
}
FreezePotion.data = {
    damage: 15,
    isVariableTarget: true,
    spritePath: '../../src/assets/art/items/potions/freeze-potion.png',
    description: 'Deals 15 damage and freezes target for a turn!'
};

export class MysteryPotion extends Item {
    constructor() {
        super('Mystery Potion', MysteryPotion.data, createThrowAnimationCallback({ itemImage: MysteryPotion.data.spritePath }));
    }
    async execute(source, target, battle) {
        const num = Math.random();
        if (Math.random() < 0.5 + 0.25 * (source.stats.LUCK - target.stats.LUCK) / (source.stats.LUCK + target.stats.LUCK)) {
            if (num <= 0.33) {
                target.heal(40);
                battle.logEvent(`${target.name} has healed 40 health!`);
            } else if (num < 0.67) {
                const duration = 2;
                const adrenalineEffect = new StatusEffects.AdrenalineStatusEffect();
                target.addStatusEffect(adrenalineEffect, battle);
                battle.logEvent(`${target.name} has adrenaline for ${duration} turns!`);
            } else {
                const regenerationEffect = new StatusEffects.RegenerationStatusEffect();
                regenerationEffect.duration = Math.floor(Math.random() * 3) + 3;
                target.addStatusEffect(regenerationEffect, battle);
                battle.logEvent(`${target.name} has regeneration for ${regenerationEffect.duration} turns!`);
            }
        } else {
            if (num <= 0.33) {
                const freezeEffect = new StatusEffects.FreezeStatusEffect();
                freezeEffect.duration = 1;
                target.addStatusEffect(freezeEffect, battle);
                battle.logEvent(`${target.name} is burned for 1 turn!`);
            } else if (num < 0.67) {
                const poisonEffect = new StatusEffects.PoisonStatusEffect();
                poisonEffect.duration = Math.floor(Math.random() * 4) + 2;
                target.addStatusEffect(poisonEffect, battle);
                battle.logEvent(`${target.name} is poisoned for ${poisonEffect.duration} turns!`);
            } else {
                const duration = 3;
                const burnEffect = new StatusEffects.BurnStatusEffect();
                burnEffect.duration = 3;
                target.addStatusEffect(burnEffect, battle);
                battle.logEvent(`${target.name} is burned for ${duration} turns!`);
            }
        }
        super.execute(source, target, battle);
    }
}
MysteryPotion.data = {
    isVariableTarget: true,
    spritePath: '../../src/assets/art/items/potions/mystery-potion.png',
    description: 'Random effect - Do you feel lucky???'
};


const itemMap = {
    'Health Potion': HealthPotion,
    'Regeneration Potion': RegenerationPotion,
    'Adrenaline Potion': AdrenalinePotion,
    'Poison Potion': PoisonPotion,
    'Fire Potion': FirePotion,
    'Freeze Potion': FreezePotion,
    'Mystery Potion': MysteryPotion
};

export function getItemByName(name) {
    return itemMap[name] || null;
}