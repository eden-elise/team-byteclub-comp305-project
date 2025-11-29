import { Entity } from '../../core/Entity.js';

import { BaseDeathAnimation } from '../../animations/DeathAnimations.js';
export class Knight extends Entity {
    constructor(isPlayer) {
        const stats = {
            ATK: 180, // High attack
            DEF: 25, // Very high defense
            SPD: 8   // Low speed (due to heavy armor)
        };
        const moves = [
            'Basic Strike',
            'Heavy Swing'
        ];

        const items = [
            { name: 'Health Potion', quantity: 5 },
            { name: 'Poison Potion', quantity: 2 },
            { name: 'Fire Potion', quantity: 3 },
            { name: 'Mystery Potion', quantity: 1 }
        ];

        super(
            'Knight',
            150,
            stats,
            moves,
            items,
            '../../../assets/art/characters/hero-1.png',
            () => BaseDeathAnimation(isPlayer),
            isPlayer
        );    
    }
}


export class Archer extends Entity {
    constructor(isPlayer) {
        const stats = {
            ATK: 24,
            DEF: 13,
            SPD: 14 
        };
        const moves = [
            'Basic Strike',
            'Heavy Swing'
        ];

        const items = [
            { name: 'Health Potion', quantity: 5 },
            { name: 'Poison Potion', quantity: 2 },
            { name: 'Fire Potion', quantity: 3 },
            { name: 'Mystery Potion', quantity: 1 }
        ];

        super(
            'Archer',
            120,
            stats,
            moves,
            items,
            '../../assets/art/characters/hero-2.png',
            () => BaseDeathAnimation(isPlayer),
            isPlayer
        );
    }
}
