import { Entity } from '../../core/Entity.js';
import { createBasicStrike, createQuickSlash } from '../items/weapons.js';

/**
 * Hero/Player character definitions
 * Each function returns a new Entity instance
 */

/**
 * Default Hero character
 */
export function createHero() {
    return new Entity(
        'Hero',
        100,
        {
            ATK: 15,
            DEF: 12,
            SPD: 14
        },
        [
            createBasicStrike(),
            createQuickSlash()
        ],
        'assets/art/characters/hero-1.png'
    );
}

/**
 * Warrior - High HP and ATK, low SPD
 */
export function createWarrior() {
    return new Entity(
        'Warrior',
        150,
        {
            ATK: 20,
            DEF: 15,
            SPD: 8
        },
        [
            createBasicStrike()
        ],
        'assets/art/characters/hero-1.png'
    );
}

/**
 * Rogue - Low HP, high SPD and ATK
 */
export function createRogue() {
    return new Entity(
        'Rogue',
        70,
        {
            ATK: 18,
            DEF: 8,
            SPD: 20
        },
        [
            createQuickSlash()
        ],
        'assets/art/characters/hero-2.png'
    );
}

