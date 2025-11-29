/**
 * All definitions - loaded when this module is imported
 * 
 * Usage:
 * import { items, heroes, enemies } from './definitions/index.js';
 * const hero = heroes.createHero();
 * const items = items.ITEMS;
 */

// Direct exports - all loaded at once when module is imported
export * as items from './items/itemRegistry.js';
export * as weapons from './items/weapons.js';
export * as heroes from './characters/heroes.js';
export * as enemies from './characters/enemies.js';

