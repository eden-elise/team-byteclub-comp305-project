import { Action } from './Action.js';

/**
 * A combat move focused on dealing damage
 */
export class Attack extends Action {
    /**
     * @param {string} name - Display name of the attack
     * @param {object} data - attack data: 
     * basePower - base power of attack
     * statusEffect - optional status effect applied to target
     * statusEffectChance - percent chance that status effect will be applied
     * @param {Function} animationCallback - Optional animation callback (source, target, battle) => Promise
     */
    constructor(name, data, animationCallback = null) {
        super(name, data, animationCallback);
        this.basePower = data.basePower;
        this.statusEffect = data.statusEffect ?? null;
        this.statusEffectChance = data.statusEffectChance ?? 0;
    }

    /**
     * Execute the attack
     * Returns a Promise that resolves when the attack and animation are complete
     * @param {Entity} source - The entity performing the attack
     * @param {Entity} target - The target entity
     * @param {BattleEngine} battle - Reference to the battle engine
     * @returns {Promise} Promise that resolves when attack and animation complete
     */
    async execute(source, target, battle) {
        if (!target.isAlive()) return Promise.resolve();

        battle.logEvent(`${source.name} uses ${this.name}!`);

        // Calculate damage: (source ATTACK * basePower) - (target DEFEND / 2)
        const baseDamage = source.stats.ATTACK * this.basePower;
        const defenseReduction = target.stats.DEFEND / 2;
        const damage = Math.max(1, Math.floor(baseDamage - defenseReduction));

        // Play animation and wait for it to complete
        await this.playAnimation(source, target, battle);

        await target.takeDamage(damage);
        battle.logEvent(`${target.name} takes ${damage} damage!`);

        if (!target.isAlive()) {
            battle.logEvent(`${target.name} is defeated!`);
        }
        
        // Apply status effect if applicable
        if (this.statusEffect && Math.random() < this.statusEffectChance) {
            target.addStatusEffect(this.statusEffect, battle);
            battle.logEvent(`${target.name} now has ${this.statusEffect.name.toLowerCase()}!`);
        }
    }
}

