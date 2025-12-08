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
import { IntroScrollSceneController } from './scenes/introScrollScene.js';
import { audioManager } from "./utils/AudioManager.js";


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
    const player = gameState.characterEntity;
    
    const enemy = new (player.name === 'Knight' ? Archer : Knight)(false);
    const battleSequence = new BattleSequence(player, enemy);

    await loadScene('battleScene');
    const battleController = new BattleSceneController(battleSequence, player.items);
    
    const originalHandleBattleEnd = battleController.handleBattleEnd.bind(battleController);
    battleController.handleBattleEnd = (result) => {
        originalHandleBattleEnd(result);
        if (gameState.currentSaveData) {
            gameState.currentSaveData.world.battlesFought++;
            if (result.winner === player) {
                gameState.currentSaveData.world.battlesWon++;
            }
        }
        gameState.saveGame();
    };

    window.battleController = battleController;
}

// debug -- reset if you press r
document.addEventListener('keydown', e => {
    if (e.key === 'r' || e.key === 'R') {
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
