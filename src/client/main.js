// in the future the whole app flow will go here, but for now just a demo battle scene

// Import battle system classes
import { loadScene } from './sceneLoader.js';
import { CharacterSelectSceneController } from './scenes/characterSelectScene.js';
import { MainMenuSceneController } from './scenes/mainMenuScene.js';
import { BattleSceneController } from './scenes/battleScene.js';
import { ExplorationSceneController } from './scenes/explorationScene.js';
import { Knight, Archer } from '../gameplay/definitions/characters/heroes.js';
import { gameState } from '../gameplay/state/GameState.js';
import { OptionsModalController } from './components/optionsModal.js';
import { IntroScrollSceneController } from './scenes/introScrollScene.js';
import { TEST_ROOM } from '../gameplay/exploration/roomRegistry.js';


async function initApp() {
    // Initialize global options
    new OptionsModalController();

    // FOR TESTING: Load exploration scene directly
    //await startExploration();

/*    const mainMenuController = new MainMenuSceneController({
        onContinue: async () => {
            console.log("Continuing game...");
            const saveData = gameState.loadGame();
            if (saveData) {
                const sceneToLoad = saveData.world.currentScene || 'battleScene';
                if (sceneToLoad === 'battleScene') {
                    await startBattle();
                } else {
                    // Future scenes can be handled here
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
*/
}

async function loadCharacterSelect() {
    await loadScene('characterSelectScene', 'battleScene');
    
    const selectController = new CharacterSelectSceneController(async (characterData) => {
        // Initialize new game state
        gameState.startNewGame(characterData.id);
        await loadIntroScroll();
        await startBattle();
    });
    window.characterSelectController = selectController;
}

async function loadIntroScroll() {
    await loadScene('introScrollScene');

    return new Promise((resolve) => {
        new IntroScrollSceneController({
            onComplete: resolve
        });
    });
}

async function startBattle() {
    console.log("Starting battle...");
    let player = gameState.characterEntity;

    if (!player) {
        // Create a temporary player for testing
        player = new Knight(true);
    }
    
    const enemy = new (player.name === 'Knight' ? Archer : Knight)(false);

    await loadScene('battleScene');
    const battleController = new BattleSceneController(player, enemy, player.items, 
        async (winner) => {
            if (winner === player) {
                await startExploration();
            } else {
                // make this some sort of death scene
                await startBattle();
            }
        }
    );

    window.battleController = battleController;
}

async function startExploration() {
    // For testing, use a default player if none exists
    let player = gameState.characterEntity;
    
    if (!player) {
        // Create a temporary player for testing
        player = new Knight(true);
    }

    // Load the exploration scene
    await loadScene('explorationScene');
    
    // Initialize the exploration controller with the test room
    const explorationController = new ExplorationSceneController(TEST_ROOM, player);
    
    window.explorationController = explorationController;
}

// debug -- reset if you press r
document.addEventListener('keydown', async e => {
    if (e.key === 'r' || e.key === 'R') {
        await startExploration();
    } else if (e.key === 'e' || e.key === 'E') {
        await startBattle();
    } else if (e.key === 'c' || e.key === 'C') {
        gameState.clearSave();
        localStorage.clear();
        sessionStorage.clear();
        location.reload();

    }
});

async function init() {
    await initApp().catch(console.error);
}

init();
