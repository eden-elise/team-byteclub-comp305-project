import { TypewriterTextbox } from '../../client/components/TypewriterTextbox.js';
import { Action } from './Action.js';

/**
 * A non-combat utility or consumable item
 * Item data can contain properties like: { heal: 200, damage: 50, isConsumable: true, isVariableTarget: false, defaultTarget: 0, etc. }
 */
export class Item extends Action {
    /**
     * @param {string} name - Display name of the item
     * @param {Object} data 
     * -spritePath
     * -description
     * -isConsumable
     * -isVariableTarget
     * -defaultTarget
     * @param {Function} animationCallback - Optional animation callback (source, target, textbox) => Promise
     */
    constructor(name, data, animationCallback = null) {
        const defaults = {
            isConsumable: true,
            isVariableTarget: true,
            defaultTarget: 0
        };
        const finalData = { ...defaults, ...data };

        super(name, finalData, animationCallback);
        this.data = finalData;
    }

    /**
     * Apply the item's effects to the target
     * This is separated so animations can call it at the right moment
     * @param {Entity} source - The entity using the item
     * @param {Entity} target - The target entity
     * @param {TypewriterTextbox} textbox - Reference to the textbox engine
     * @returns {Promise} Promise that resolves when effects are applied
     */
    async applyEffects(source, target, textbox) {
        if (!target.isAlive()) return Promise.resolve();

        // Apply heal if present
        if (this.data.heal !== undefined) {
            const oldHP = target.currentHP;
            target.heal(this.data.heal);
            const actualHeal = target.currentHP - oldHP;
            if (actualHeal > 0) {
                textbox.addLogEntry(`${target.name} recovers ${actualHeal} HP!`);
            }
        }

        // Apply damage if present
        if (this.data.damage !== undefined) {
            await target.takeDamage(this.data.damage);
            textbox.addLogEntry(`${target.name} takes ${this.data.damage} damage!`);
            if (!target.isAlive()) {
                textbox.addLogEntry(`${target.name} is defeated!`);
            }
        }

        // Apply stat modifications if present
        if (this.data.stats) {
            for (const [statName, value] of Object.entries(this.data.stats)) {
                if (target.stats[statName] !== undefined) {
                    target.stats[statName] += value;
                    textbox.addLogEntry(`${target.name}'s ${statName} ${value >= 0 ? 'increased' : 'decreased'} by ${Math.abs(value)}!`);
                }
            }
        }
    }

    /**
     * Execute the item by applying its data properties
     * Returns a Promise that resolves when the item use and animation are complete
     * @param {Entity} source - The entity using the item
     * @param {Entity} target - The target entity
     * @param {TypewriterTextbox} textbox - Reference to the textbox engine
     * @returns {Promise} Promise that resolves when item use and animation complete
     */
    async execute(source, target, textbox) {
        if (!target.isAlive()) return Promise.resolve();

        textbox.addLogEntry(`${source.name} uses ${this.name}!`);

        // Track if effects were applied during animation
        let effectsApplied = false;
        
        // Create a callback for the animation to call at the appropriate moment
        const applyEffectsCallback = async () => {
            if (!effectsApplied) {
                effectsApplied = true;
                await this.applyEffects(source, target, textbox);
            }
        };

        // Play animation and wait for it to complete
        // The animation can call applyEffectsCallback at the appropriate moment
        if (this.animationCallback) {
            await this.animationCallback(source, target, applyEffectsCallback);
        }

        // If the animation didn't call the effects, apply them now
        // (This maintains backward compatibility with animations that don't use the callback)
        if (!effectsApplied) {
            await applyEffectsCallback();
        }

        // Remove consumable items from available actions after use
        this.removeIfConsumable(source);
    }

    removeIfConsumable(source) {
        if (this.data.isConsumable !== false) {
            const index = source.items.indexOf(this);
            if (index > -1) {
                source.items.splice(index, 1);
            }
        }
    }
}

