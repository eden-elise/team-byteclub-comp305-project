import { createThrowAnimationCallback } from '../../animations/ItemAnimations.js';
import { Item } from '../../core/Item.js';
import { StatusEffect } from '../../core/StatusEffect.js';

function createHealthPotionInstance(animationCallback) {
    class HealthPotion extends Item {}
    
    return new HealthPotion(
        'Health Potion',
        ITEMS.HEALTH_POTION.data,
        animationCallback
    );
}

function createPoisonPotionInstance(animationCallback) {
    class PoisonPotion extends Item {
        async execute(source, target, battle) {
            if (!target.isAlive()) return Promise.resolve();

            battle.logEvent(`${source.name} uses ${this.name}!`);

            const duration = Math.floor(Math.random() * 4) + 2;
            const poisonEffect = new StatusEffect(
                'Poison',
                duration,
                '',
                {},
                null,
                (entity, battleEngine) => {
                    entity.takeDamage(4);
                    battleEngine.logEvent(`${entity.name} takes 4 damage from poison!`);
                }
            );

            target.addStatusEffect(poisonEffect, battle);
            battle.logEvent(`${target.name} is poisoned for ${duration} turns!`);

            this.removeIfConsumable(source);
            await this.playAnimation(source, target, battle);
        }
    }

    return new PoisonPotion(
        'Poison Potion',
        ITEMS.POISON_POTION.data,
        animationCallback
    );
}

function createFirePotionInstance(animationCallback) {
    class FirePotion extends Item {
        async execute(source, target, battle) {
            if (!target.isAlive()) return Promise.resolve();

            battle.logEvent(`${source.name} uses ${this.name}!`);

            target.takeDamage(5);
            battle.logEvent(`${target.name} takes 5 damage from the fire potion!`);

            const burnEffect = new StatusEffect(
                'Burn',
                3,
                '',
                {},
                null,
                (entity, battleEngine) => {
                    entity.takeDamage(5);
                    battleEngine.logEvent(`${entity.name} takes 5 damage from burn!`);
                }
            );

            target.addStatusEffect(burnEffect, battle);
            battle.logEvent(`${target.name} is burned for 3 turns!`);

            this.removeIfConsumable(source);
            await this.playAnimation(source, target, battle);
        }
    }

    return new FirePotion(
        'Fire Potion',
        ITEMS.FIRE_POTION.data,
        animationCallback
    );
}

function createMysteryPotionInstance(animationCallback) {
    class MysteryPotion extends Item {
        async execute(source, target, battle) {
            if (!target.isAlive()) return Promise.resolve();

            battle.logEvent(`${source.name} uses ${this.name}!`);

            const randomEffect = Math.random() < 0.5;
            if (randomEffect) {
                const oldHP = target.currentHP;
                target.heal(150);
                const actualHeal = target.currentHP - oldHP;
                if (actualHeal > 0) {
                    battle.logEvent(`${target.name} recovers ${actualHeal} HP from the mystery potion!`);
                }
            } else {
                if (target.stats.ATK !== undefined) {
                    target.stats.ATK += 10;
                    battle.logEvent(`${target.name}'s ATK increased by 10 from the mystery potion!`);
                }
            }

            this.removeIfConsumable(source);
            await this.playAnimation(source, target, battle);
        }
    }

    return new MysteryPotion(
        'Mystery Potion',
        ITEMS.MYSTERY_POTION.data,
        animationCallback
    );
}

export const ITEMS = {
    HEALTH_POTION: {
        id: 'health_potion',
        name: 'Health Potion',
        spritePath: '../../assets/art/items/potions/health-potion.png',
        description: 'Restores 40 HP',
        data: {
            heal: 40,
            isConsumable: true,
            variableTarget: false,
            defaultTarget: 0
        },
        factory: createHealthPotionInstance,
        animationCallback: createThrowAnimationCallback({
            itemImage: '../../assets/art/items/potions/health-potion.png',
            startScale: 2.0,
            endScale: 0.3,
            duration: 1000,
            rotationSpeed: 5,
            soundPath: null,
            soundVolume: 0.5
        })
    },
    POISON_POTION: {
        id: 'poison_potion',
        name: 'Poison Potion',
        spritePath: '../../assets/art/items/potions/poison-potion.png',
        description: 'Inflicts poison (4 damage per turn for 2-5 turns)',
        data: {
            damage: 0,
            isConsumable: true,
            variableTarget: false,
            defaultTarget: 1
        },
        factory: createPoisonPotionInstance,
        animationCallback: createThrowAnimationCallback({
            itemImage: '../../assets/art/items/potions/poison-potion.png',
            startScale: 2.0,
            endScale: 0.3,
            duration: 1000,
            rotationSpeed: 6,
            soundPath: null,
            soundVolume: 0.6
        })
    },
    FIRE_POTION: {
        id: 'fire_potion',
        name: 'Fire Potion',
        spritePath: '../../assets/art/items/potions/fire-potion.png',
        description: 'Deals 5 damage + 5 per turn for 3 turns',
        data: {
            damage: 5,
            isConsumable: true,
            variableTarget: true,
            defaultTarget: 1
        },
        factory: createFirePotionInstance,
        animationCallback: createThrowAnimationCallback({
            itemImage: '../../assets/art/items/potions/fire-potion.png',
            startScale: 2.0,
            endScale: 0.3,
            duration: 1000,
            rotationSpeed: 7,
            soundPath: null,
            soundVolume: 0.7
        })
    },
    MYSTERY_POTION: {
        id: 'mystery_potion',
        name: 'Mystery Potion',
        spritePath: '../../assets/art/items/potions/mystery-potion.png',
        description: 'Random effect: Heal 150 HP or gain +10 ATK',
        data: {
            isConsumable: true,
            variableTarget: true,
            defaultTarget: 1
        },
        factory: createMysteryPotionInstance,
        animationCallback: createThrowAnimationCallback({
            itemImage: '../../assets/art/items/potions/mystery-potion.png',
            startScale: 2.0,
            endScale: 0.3,
            duration: 1000,
            rotationSpeed: 5,
            soundPath: null,
            soundVolume: 0.5
        })
    },
    MANA_POTION: {
        id: 'mana_potion',
        name: 'Mana Potion',
        spritePath: '../../assets/art/items/potions/health-potion.png',
        description: 'Restores 100 MP',
        data: {
            heal: 100,
            isConsumable: true,
            variableTarget: false,
            defaultTarget: 0
        },
        factory: createHealthPotionInstance,
        animationCallback: createThrowAnimationCallback({
            itemImage: '../../assets/art/items/potions/health-potion.png',
            startScale: 2.0,
            endScale: 0.3,
            duration: 1000,
            rotationSpeed: 5,
            soundPath: null,
            soundVolume: 0.5
        })
    },
    DAMAGE_ELIXIR: {
        id: 'damage_elixir',
        name: 'Damage Elixir',
        spritePath: '../../assets/art/items/potions/health-potion.png',
        description: 'Gain +20 ATK',
        data: {
            stats: { ATK: 20 },
            isConsumable: true,
            variableTarget: false,
            defaultTarget: 0
        },
        factory: createHealthPotionInstance,
        animationCallback: createThrowAnimationCallback({
            itemImage: '../../assets/art/items/potions/health-potion.png',
            startScale: 2.0,
            endScale: 0.3,
            duration: 1000,
            rotationSpeed: 5,
            soundPath: null,
            soundVolume: 0.5
        })
    },
    DEFENSE_TONIC: {
        id: 'defense_tonic',
        name: 'Defense Tonic',
        spritePath: '../../assets/art/items/potions/health-potion.png',
        description: 'Gain +15 DEF',
        data: {
            stats: { DEF: 15 },
            isConsumable: true,
            variableTarget: false,
            defaultTarget: 0
        },
        factory: createHealthPotionInstance,
        animationCallback: createThrowAnimationCallback({
            itemImage: '../../assets/art/items/potions/health-potion.png',
            startScale: 2.0,
            endScale: 0.3,
            duration: 1000,
            rotationSpeed: 5,
            soundPath: null,
            soundVolume: 0.5
        })
    },
    SPEED_SCROLL: {
        id: 'speed_scroll',
        name: 'Speed Scroll',
        spritePath: '../../assets/art/items/potions/health-potion.png',
        description: 'Gain +10 SPD',
        data: {
            stats: { SPD: 10 },
            isConsumable: true,
            variableTarget: false,
            defaultTarget: 0
        },
        factory: createHealthPotionInstance,
        animationCallback: createThrowAnimationCallback({
            itemImage: '../../assets/art/items/potions/health-potion.png',
            startScale: 2.0,
            endScale: 0.3,
            duration: 1000,
            rotationSpeed: 5,
            soundPath: null,
            soundVolume: 0.5
        })
    }
};

export function getItemByName(itemName) {
    for (const item of Object.values(ITEMS)) {
        if (item.name === itemName) {
            return item;
        }
    }
    return null;
}
