
import { createFloatingDamageNumber } from '../animations/TextAnimations.js'; 

/**
 * Represents any entity that can participate in combat
 */
export class Entity {
    /**
     * @param {string} name - The entity's name
     * @param {number} maxHP - Maximum Health
     * @param {Object} stats - Dictionary of core stats (e.g., ATTACK, DEFEND, SPEED)
     * @param {Array} moves - Array of moves
     * @param {Array} items - Array of item - quantity pairs
     * @param {string} image - Path to the entity's image/sprite
     * @param {Promise} onDeathPromise - Promise resolved when the entity dies
     * @param {Boolean} isPlayer - Whether the entity is controlled by the player or AI
     * @param {Promise} onDamageTakenPromise - Promise resolved when the entity takes damage
     */
    constructor(
        name, maxHP, stats = {}, moves = [], items = [], image = '', 
        onDeathPromise = null, isPlayer = false, onDamageTakenPromise = null
    ) {
        this.name = name;
        this.maxHP = maxHP;
        this.currentHP = maxHP;
        this.stats = {
            ...stats
        };
        this.activeEffects = []; // List<StatusEffect>
        this.moves = moves;
        this.items = items;
        this.image = image; // Path to image/sprite
        this.onDeathPromise = onDeathPromise;
        this.isPlayer = isPlayer;
        this.onDamageTakenPromise = onDamageTakenPromise;
    }

    /**
     * Check if the entity is alive
     * @returns {boolean}
     */
    isAlive() {
        return this.currentHP > 0;
    }

    /**
     * Take damage (can be overridden for special behavior)
     * @param {number} damage - Amount of damage to take
     */
    async takeDamage(damage) {
        this.currentHP = Math.max(0, this.currentHP - damage);

        createFloatingDamageNumber(-damage, this.isPlayer);

        await this.onDamageTakenPromise();

        if (!this.isAlive()) {
            await this.onDeathPromise();
        }
    }

    /**
     * Heal the entity
     * @param {number} amount - Amount to heal
     */
    heal(amount) {
        createFloatingDamageNumber(amount, this.isPlayer);

        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    }

    /**
     * Add a status effect to this entity
     * @param {StatusEffect} statusEffect - The status effect to add
     * @param {textbox} textbox - The textbox (optional, for callbacks)
     */
    addStatusEffect(statusEffect, textbox = null) {
        statusEffect.apply(this, textbox);
        this.activeEffects.push(statusEffect);
    }

    /**
     * Remove a status effect from this entity
     * @param {StatusEffect} statusEffect - The status effect to remove
     */
    removeStatusEffect(statusEffect) {
        const index = this.activeEffects.indexOf(statusEffect);
        if (index > -1) {
            this.activeEffects.splice(index, 1);
        }
    }

    /**
     * Get all active status effects
     * @returns {Array<StatusEffect>}
     */
    getStatusEffects() {
        return this.activeEffects;
    }

    /**
     * Get a stat value with all status effect modifications applied
     * @param {string} statName - Name of the stat (e.g., 'ATTACK', 'DEFEND')
     * @returns {number} The modified stat value
     */
    getModifiedStat(statName) {
        let value = this.stats[statName] || 0;
        for (const effect of this.activeEffects) {
            value = effect.getModifiedStat(statName, value);
        }
        return value;
    }

    /**
     * Process turn start for all active status effects
     * @param {textbox} textbox - The textbox
     */
    processStatusEffectsTurnStart(textbox) {
        // Create a copy to avoid issues if effects are removed during iteration
        const effects = [...this.activeEffects];
        for (const effect of effects) {
            effect.processTurnStart(this, textbox);
        }
    }

    /**
     * Process turn end for all active status effects
     * @param {textbox} textbox - The textbox
     */
    processStatusEffectsTurnEnd(textbox) {
        // Create a copy to avoid issues if effects are removed during iteration
        const effects = [...this.activeEffects];
        for (const effect of effects) {
            effect.processTurnEnd(this, textbox);
        }
    }
}

