export const DEFAULT_SAVE_DATA = {
    metadata: {
        version: '1.0',
        timestamp: 0,
        saveName: 'New Game'
    },
    hero: {
        classId: 'knight', // default, will be overwritten
        name: 'Hero',
        stats: {},
        currentHP: 100,
        maxHP: 100,
        items: [],
        experience: 0,
        level: 1
    },
    world: {
        stepsTaken: 0,
        battlesFought: 0,
        battlesWon: 0,
        currentLocation: 'town',
        currentScene: null,
        currentRoomId: null,
        eventIndex: 0
    },
    settings: {
        volume: 50,
        textSpeed: 'medium', // slow, medium, fast
        language: 'en',
        battleSpeed: 1.0
    }
};

/**
 * Creates a fresh save object structure
 * @param {string} classId - 'knight' or 'archer'
 * @param {object} baseStats - Initial stats from the class definition
 * @param {number} maxHP - Initial max HP
 * @param {Array} initialItems - Initial inventory
 * @returns {object} A complete save data object
 */
export function createNewSave(classId, baseStats, maxHP, initialItems) {
    const save = JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
    
    save.metadata.timestamp = Date.now();
    save.hero.classId = classId;
    save.hero.name = classId.charAt(0).toUpperCase() + classId.slice(1); 
    save.hero.stats = { ...baseStats };
    save.hero.maxHP = maxHP;
    save.hero.currentHP = maxHP;
    save.hero.items = JSON.parse(JSON.stringify(initialItems));
    
    return save;
}
