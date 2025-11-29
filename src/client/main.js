// in the future the whole app flow will go here, but for now just a demo battle scene

// Import battle system classes
import { loadScene } from './sceneLoader.js';
import { CharacterSelectSceneController } from './scenes/characterSelectScene.js';
import { MainMenuSceneController } from './scenes/mainMenuScene.js';
import { BattleSequence } from '../gameplay/engine/BattleSequence.js';
import { BattleSceneController } from './scenes/battleScene.js';
import { Knight, Archer } from '../gameplay/definitions/characters/heroes.js';
import { gameState } from '../gameplay/state/GameState.js';
import { OptionsModalController } from './components/optionsModal.js';


async function initApp() {
    // Initialize global options
    new OptionsModalController();

    // Load Main Menu first
    await loadScene('mainMenuScene', 'battleScene');

    const mainMenuController = new MainMenuSceneController({
        onContinue: async () => {
            console.log("Continuing game...");
            const saveData = gameState.loadGame();
            if (saveData) {
                const sceneToLoad = saveData.world.currentScene || 'battleScene';
                if (sceneToLoad === 'battleScene') {
                    await startBattle();
                } else {
                    // If we have other scenes in the future, handle them here
                    // For now, we only really have battleScene as a gameplay scene
                    await startBattle();
                }
            }
        },
        onNewGame: async () => {
            console.log("Starting new game...");
            await loadCharacterSelect();
        },
        onLoadFile: async (jsonData) => {
            console.log("Loading from file...");
            if (gameState.loadFromFile(jsonData)) {
                await startBattle();
            } else {
                alert("Failed to load save file.");
            }
        }
    });
}

async function loadCharacterSelect() {
    await loadScene('characterSelectScene', 'battleScene');
    
    const selectController = new CharacterSelectSceneController(async (characterData) => {
        // Initialize new game state
        gameState.startNewGame(characterData.id);
        await startBattle();
    });
    window.characterSelectController = selectController;
}

async function startBattle() {
    const player = gameState.characterEntity;
    
    // Create a default enemy (simple logic for now)
    const enemy = new (player.name === 'Knight' ? Archer : Knight)(false);

    // Create battle sequence
    const battleSequence = new BattleSequence(player, enemy);

    // Load the battle scene
    await loadScene('battleScene');
    
    // Initialize the battle scene controller
    const battleController = new BattleSceneController(battleSequence, player.items);
    
    // Hook into battle end to update stats
    const originalHandleBattleEnd = battleController.handleBattleEnd.bind(battleController);
    battleController.handleBattleEnd = (result) => {
        originalHandleBattleEnd(result);
        // Update stats in the JSON structure
        if (gameState.currentSaveData) {
            gameState.currentSaveData.world.battlesFought++;
            if (result.winner === player) {
                gameState.currentSaveData.world.battlesWon++;
            }
        }
        gameState.saveGame(); // Save after battle
    };

    window.battleController = battleController;
}

// debug -- reset if you press r
document.addEventListener('keydown', e => {
    if (e.key === 'r' || e.key === 'R') {
        gameState.clearSave();
        localStorage.clear();
        sessionStorage.clear();
        location.reload(); // Reload to restart fresh
    }
});

async function init() {
    // Start the app when page loads
    await initApp().catch(console.error);
}

init();