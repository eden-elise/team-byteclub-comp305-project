import { StatusEffect } from '../../core/StatusEffect.js';

export class PoisonStatusEffect extends StatusEffect {
    constructor() {
        super('Poison', 2);
        this.icon = '../../../src/assets/effects/status-icons/poison-icon.png';
        this.onTurnStart = async (entity, battleEngine) => {
            await entity.takeDamage(4);
            battleEngine.logEvent(`${entity.name} takes 4 damage from poison!`);
        };
    }
}

export class RegenerationStatusEffect extends StatusEffect {
    constructor() {
        super('Regeneration', 3);
        this.icon = '../../../src/assets/effects/status-icons/regeneration-icon.png';
    }
}

export class BurnStatusEffect extends StatusEffect {
    constructor() {
        // Duration set to 4 turns (example)
        super('Burn', 4);
        this.icon = '../../../src/assets/effects/status-icons/flame-icon.png';
        this.onTurnStart = async (entity, battleEngine) => {
            await entity.takeDamage(5);
            battleEngine.logEvent(`${entity.name} takes 5 damage from burn!`);
        };
    }
}

export class FreezeStatusEffect extends StatusEffect {
    constructor() {
        // Duration set to 2 turns (example)
        super('Freeze', 2);
        this.icon = '../../../src/assets/effects/status-icons/freeze-icon.png';
    }
}

export class AdrenalineStatusEffect extends StatusEffect {
    constructor() {
        // Duration set to 3 turns (example)
        super('Adrenaline', 3);
        this.icon = '../../../src/assets/effects/status-icons/adrenaline-icon.png';
    }
}
