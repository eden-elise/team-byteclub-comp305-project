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
import { audioManager } from "./utils/AudioManager.js";


import { getRoomById } from '../gameplay/exploration/roomRegistry.js';

async function initApp() {
    // Initialize global options
    new OptionsModalController();

    // Expose game functions globally
    window.gameApp = {
        startBattle,
        startExploration
    };

    // FOR TESTING: Load exploration scene directly
    // await startExploration();
}

async function startBattle(enemyEntity, onWinCallback) {
    console.log("Starting battle...");
    let player = gameState.characterEntity;

    if (!player) {
        // Create a temporary player for testing
        player = new Knight(true);
    }
    
    // Use provided enemy or default for testing
    const enemy = enemyEntity || new (player.name === 'Knight' ? Archer : Knight)(false);

    await loadScene('battleScene');
    const battleController = new BattleSceneController(player, enemy, player.items, 
        async (winner) => {
            if (winner === player) {
                if (onWinCallback) {
                    await onWinCallback();
                } else {
                    await startExploration();
                }
            } else {
                // make this some sort of death scene
                // For now, reload battle
                console.log("Player lost. Restarting battle...");
                await startBattle(enemy, onWinCallback);
            }
        }
    );

    window.battleController = battleController;
}

async function startExploration(roomId = null) {
    // For testing, use a default player if none exists
    let player = gameState.characterEntity;
    
    if (!player) {
        // Create a temporary player for testing
        player = new Knight(true);
    }

    // Determine which room to load
    let roomToLoad = TEST_ROOM;
    let startEventIndex = 0;

    // 1. If roomId is passed, use it
    if (roomId) {
        const room = getRoomById(roomId);
        if (room) {
            roomToLoad = room;
        }
    } 
    // 2. Check saved state
    else {
        const savedState = gameState.getExplorationState();
        if (savedState) {
            const room = getRoomById(savedState.roomId);
            if (room) {
                roomToLoad = room;
                startEventIndex = savedState.eventIndex || 0;
            }
        }
    }

    // Load the exploration scene
    await loadScene('explorationScene');
    
    // Initialize the exploration controller
    const explorationController = new ExplorationSceneController(roomToLoad, player, startEventIndex);
    
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

const AUDIO_PATH = "/team-byteclub-comp305-project/src/assets/media/";

audioManager.load("loading-screen", AUDIO_PATH + "Loading-Screen.mp3");
audioManager.load("button-click", AUDIO_PATH + "Button-Click.mp3");
audioManager.load("battle-background", AUDIO_PATH + "Battle-Background.mp3");
audioManager.load("enemy-hit", AUDIO_PATH + "Enemy-Hit.mp3");
audioManager.load("mp-strike", AUDIO_PATH + "MP-Strike.mp3");
audioManager.load("mp-heavy", AUDIO_PATH + "MP-Heavy.mp3");
audioManager.load("inventory", AUDIO_PATH + "Inventory.mp3");
audioManager.load("health-potion", AUDIO_PATH + "Health-Potion.mp3");
audioManager.load("poison-potion", AUDIO_PATH + "Poison-Potion.mp3");
audioManager.load("fire-potion", AUDIO_PATH + "Fire-Potion.mp3");
audioManager.load("mystery-potion", AUDIO_PATH + "Mystery-Potion.mp3");
audioManager.load("victory", AUDIO_PATH + "Victory.mp3");
audioManager.load("death", AUDIO_PATH + "Death.mp3");
audioManager.load("character-choice", AUDIO_PATH + "Character-Choice.mp3");
audioManager.load("scroll-background", AUDIO_PATH + "Scroll-Background.mp3");

init();
