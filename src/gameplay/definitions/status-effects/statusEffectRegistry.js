import { StatusEffect } from '../../core/StatusEffect.js';

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

