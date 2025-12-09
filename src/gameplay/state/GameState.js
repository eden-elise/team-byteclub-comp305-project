import { Knight, Archer } from '../definitions/heroesRegistry.js';
import { createNewSave } from './SaveSchema.js';

const CHARACTER_CLASSES = {
    'knight': Knight,
    'archer': Archer
};

export class GameState {
    constructor() {
        this.currentSaveData = null; // The raw JSON data
        this.characterEntity = null; // The active Entity instance
        this.saveKey = 'byteclub_rpg_save';
    }

    /**
     * Initializes a new game state from a chosen character class
     * @param {string} characterId - 'knight' or 'archer'
     */
    startNewGame(characterId) {
        const CharacterClass = CHARACTER_CLASSES[characterId];
        if (!CharacterClass) {
            console.error(`Unknown character class: ${characterId}`);
            return;
        }

        // Create a temporary instance to get initial stats
        // In a real app, we might have static data for this to avoid instantiation
        const tempInstance = new CharacterClass(true);

        // Create the JSON structure
        this.currentSaveData = createNewSave(
            characterId,
            tempInstance.stats,
            tempInstance.maxHP,
            tempInstance.items
        );

        // Hydrate the entity for use in game
        this.hydrateCharacter();
        this.saveGame();
    }

    /**
     * Saves the current state of the entity back into the JSON structure and persists to localStorage
     */
    saveGame() {
        if (!this.characterEntity || !this.currentSaveData) return;

        // Sync Entity state back to JSON
        this.currentSaveData.hero.currentHP = this.characterEntity.currentHP;
        this.currentSaveData.hero.stats = this.characterEntity.stats;
        this.currentSaveData.hero.items = this.characterEntity.items;
        this.currentSaveData.metadata.timestamp = Date.now();

        // Persist
        localStorage.setItem(this.saveKey, JSON.stringify(this.currentSaveData));
        console.log('Game saved to local storage');
    }

    /**
     * Loads the save data from localStorage
     * @returns {object|null} The loaded save data or null if none exists
     */
    loadGame() {
        const json = localStorage.getItem(this.saveKey);
        if (!json) return null;

        try {
            this.currentSaveData = JSON.parse(json);
            this.hydrateCharacter();
            console.log('Game loaded from local storage');
            return this.currentSaveData;
        } catch (e) {
            console.error('Failed to load save file', e);
            return null;
        }
    }

    /**
     * Updates the current scene in the save data and persists it.
     * @param {string} sceneName 
     */
    setCurrentScene(sceneName) {
        if (!this.currentSaveData) return;
        this.currentSaveData.world.currentScene = sceneName;
        this.saveGame();
    }

    /**
     * Creates the Entity instance from the current JSON data
     */
    hydrateCharacter() {
        if (!this.currentSaveData) return;

        const { classId, currentHP, maxHP, stats, items } = this.currentSaveData.hero;
        const CharacterClass = CHARACTER_CLASSES[classId];

        if (!CharacterClass) {
            console.error(`Cannot hydrate unknown class: ${classId}`);
            return;
        }

        // Instantiate the class
        this.characterEntity = new CharacterClass(true);

        // Override properties with saved data
        this.characterEntity.currentHP = currentHP;
        this.characterEntity.maxHP = maxHP;
        this.characterEntity.stats = stats;
        this.characterEntity.items = items;
    }

    getSaveMetadata() {
        const json = localStorage.getItem(this.saveKey);
        if (!json) return null;
        try {
            const data = JSON.parse(json);
            return data.metadata;
        } catch {
            return null;
        }
    }
    
    getFullSaveData() {
        const json = localStorage.getItem(this.saveKey);
        if (!json) return null;
        try {
            return JSON.parse(json);
        } catch {
            return null;
        }
    }

    /**
     * Loads game data directly from a JSON object (e.g. from file upload)
     * @param {object} jsonData 
     * @returns {boolean} Success status
     */
    loadFromFile(jsonData) {
        try {
            // Basic validation
            if (!jsonData.hero || !jsonData.metadata) {
                console.error('Invalid save file format');
                return false;
            }

            this.currentSaveData = jsonData;
            this.hydrateCharacter();
            this.saveGame(); // Persist to local storage as the current active game
            console.log('Game loaded from file');
            return true;
        } catch (e) {
            console.error('Failed to load save file', e);
            return false;
        }
    }

    clearSave() {
        localStorage.removeItem(this.saveKey);
        this.currentSaveData = null;
        this.characterEntity = null;
    }
}

export const gameState = new GameState();
