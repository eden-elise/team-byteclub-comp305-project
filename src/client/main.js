import { loadScene } from './sceneLoader.js';
import { CharacterSelectSceneController } from './scenes/characterSelectScene.js';
import { MainMenuSceneController } from './scenes/mainMenuScene.js';
import { BattleSceneController } from './scenes/battleScene.js';
import { ExplorationSceneController } from './scenes/explorationScene.js';
import { Knight, Archer } from '../gameplay/definitions/heroesRegistry.js';
import { gameState } from '../gameplay/state/GameState.js';
import { OptionsModalController } from './components/optionsModal.js';
import { IntroScrollSceneController } from './scenes/introScrollScene.js';
import { getRoomById } from '../gameplay/exploration/roomRegistry.js';
import { audioManager } from './utils/AudioManager.js';

// Floor progression order - maps floor to starting room
// Only floor-1 has content currently; others will be added as they're implemented
const FLOOR_ROOMS = {
  'floor-1': 'F1_INTRO_WAKE',
  'floor-2': 'F2_INTRO',
  'floor-3': 'F3_INTRO',
  'floor-4': 'F4_TOWER_INTRO',
  // 'floor-5': 'F5_FLOOR_INTRO'
};

async function initApp() {
  try {
    // Initialize global options
    new OptionsModalController();
    console.log('OptionsModalController initialized');

    // Expose game functions globally
    window.gameApp = {
      startFloorExploration,
      startBattle,
      startNewGame,
      continueGame,
    };

    // Check if there's a saved game
    const saveData = gameState.getFullSaveData();
    console.log('Save data:', saveData);

    // Load the main menu
    console.log('Loading main menu scene...');
    await loadScene('mainMenuScene');
    console.log('Main menu scene loaded');

    // Initialize main menu with callbacks
    console.log('Initializing MainMenuSceneController...');
    new MainMenuSceneController({
      onNewGame: startNewGame,
      onContinue: continueGame,
    });
    console.log('MainMenuSceneController initialized');
  } catch (error) {
    console.error('Error in initApp:', error);
  }
}

/**
 * Start a new game - go through character selection and intro
 */
async function startNewGame() {
  // Load character select scene
  await loadScene('characterSelectScene');

  // Initialize character select controller with callback
  new CharacterSelectSceneController(async (characterData) => {
    // Create the character using the Class from character data
    const character = new characterData.Class(true);
    gameState.characterEntity = character;

    // Create a save using GameState.startNewGame if we stored the classId
    // For now, directly create the entity
    gameState.currentSaveData = {
      hero: {
        name: character.name,
        classId: characterData.id,
        currentHP: character.currentHP,
        maxHP: character.maxHP,
        stats: character.stats,
        items: character.items,
        level: 1,
      },
      world: {
        currentScene: 'introScrollScene',
        currentFloor: 'floor-1',
        currentRoom: null,
        currentEventIndex: 0,
      },
      metadata: {
        timestamp: Date.now(),
      },
    };
    gameState.saveGame();

    // Move to intro scroll scene
    await loadScene('introScrollScene');
    new IntroScrollSceneController({
      onComplete: async () => {
        // After intro, start exploring floor 1
        await startFloorExploration('floor-1');
      },
    });
  });
}

/**
 * Continue an existing game
 */
async function continueGame() {
  const saveData = gameState.getFullSaveData();

  if (!saveData) {
    console.log('No save data found, starting new game');
    await startNewGame();
    return;
  }

  // Load the save data and hydrate the character
  gameState.loadGame();

  // Determine which floor to load based on saved state
  const floorId = saveData.world?.currentFloor || 'floor-1';

  // Start exploring from the saved floor
  await startFloorExploration(floorId);
}

/**
 * Start exploring a specific floor
 * @param {string} floorId - The floor ID (e.g., 'floor-1', 'floor-2', etc.)
 */
async function startFloorExploration(floorId = 'floor-1') {
  try {
    let player = gameState.characterEntity;

    if (!player) {
      // Fallback: create a temporary player for testing
      player = new Knight(true);
    }

    // Check if we're resuming from a battle or other pause
    let roomId = gameState.currentSaveData?.world?.currentRoom;
    let startEventIndex = gameState.currentSaveData?.world?.currentEventIndex || 0;

    // If no saved room, use the floor's starting room
    if (!roomId) {
      const startingRoomId = FLOOR_ROOMS[floorId];
      if (!startingRoomId) {
        console.error(`Floor ${floorId} not configured in FLOOR_ROOMS`);
        return;
      }
      roomId = startingRoomId;
      startEventIndex = 0;
    }

    const room = getRoomById(roomId);

    if (!room) {
      console.error(`Room ${roomId} not found`);
      return;
    }

    console.log(`Loading floor ${floorId}, room ${roomId}, starting at event ${startEventIndex}`);

    // Save floor info to state
    if (gameState.currentSaveData && gameState.currentSaveData.world) {
      gameState.currentSaveData.world.currentFloor = floorId;
      gameState.currentSaveData.world.currentRoom = room.id;
      gameState.currentSaveData.world.currentEventIndex = startEventIndex;
      gameState.saveGame();
    }

    // Load exploration scene
    await loadScene('explorationScene');
    const explorationController = new ExplorationSceneController(
      room,
      player,
      startEventIndex,
      async () => {
        // When floor is complete, move to next floor or show completion screen
        const floorIndex = Object.keys(FLOOR_ROOMS).indexOf(floorId);
        const floorKeys = Object.keys(FLOOR_ROOMS);
        if (floorIndex < floorKeys.length - 1) {
          // More floors to explore
          const nextFloor = floorKeys[floorIndex + 1];
          await startFloorExploration(nextFloor);
        } else {
          // All floors completed - show completion screen or main menu
          console.log('Game completed!');
          await loadScene('mainMenuScene');
          new MainMenuSceneController({
            onNewGame: startNewGame,
            onContinue: continueGame,
          });
        }
      }
    );

    window.explorationController = explorationController;
  } catch (error) {
    console.error('Error in startFloorExploration:', error);
  }
}

/**
 * Start a battle (called from exploration scene)
 * @param {Entity} enemyEntity - The enemy to battle
 * @param {Function} onWinCallback - Callback when player wins
 */
async function startBattle(enemyEntity, onWinCallback) {
  console.log('Starting battle...');
  let player = gameState.characterEntity;

  if (!player) {
    // Create a temporary player for testing
    player = new Knight(true);
  }

  // Use provided enemy or default for testing
  const enemy = enemyEntity || new (player.name === 'Knight' ? Archer : Knight)(false);

  await loadScene('battleScene');
  const battleController = new BattleSceneController(
    player,
    enemy,
    player.items,
    async (winner) => {
      if (winner === player) {
        if (onWinCallback) {
          await onWinCallback();
        } else {
          // Return to exploration
          const floorId = gameState.currentSaveData?.world?.currentFloor || 'floor-1';
          await startFloorExploration(floorId);
        }
      } else {
        // Player lost - offer retry
        console.log('Player lost. Restarting battle...');
        await startBattle(enemy, onWinCallback);
      }
    }
  );

  window.battleController = battleController;
}

// Debug keyboard shortcuts
document.addEventListener('keydown', async (e) => {
  if (e.key === 'r' || e.key === 'R') {
    // Restart current floor
    const floorId = gameState.currentSaveData?.world?.currentFloor || 'floor-1';
    console.log(`Restarting floor: ${floorId}`);
    await startFloorExploration(floorId);
  } else if (e.key === 'e' || e.key === 'E') {
    // Start a test battle
    await startBattle();
  } else if (e.key === 'c' || e.key === 'C') {
    // Clear all saves and reload
    gameState.clearSave();
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  } else if (e.key === 'm' || e.key === 'M') {
    // Return to main menu
    await loadScene('mainMenuScene');
    new MainMenuSceneController({
      onNewGame: startNewGame,
      onContinue: continueGame,
    });
  }
});

// Initialize application
async function init() {
  await initApp().catch(console.error);
}

// Load audio assets
const AUDIO_PATH = '/team-byteclub-comp305-project/src/assets/media/';

audioManager.load('loading-screen', AUDIO_PATH + 'Loading-Screen.mp3');
audioManager.load('button-click', AUDIO_PATH + 'Button-Click.mp3');
audioManager.load('battle-background', AUDIO_PATH + 'Battle-Background.mp3');
audioManager.load('enemy-hit', AUDIO_PATH + 'Enemy-Hit.mp3');
audioManager.load('mp-strike', AUDIO_PATH + 'MP-Strike.mp3');
audioManager.load('mp-heavy', AUDIO_PATH + 'MP-Heavy.mp3');
audioManager.load('inventory', AUDIO_PATH + 'Inventory.mp3');
audioManager.load('health-potion', AUDIO_PATH + 'Health-Potion.mp3');
audioManager.load('poison-potion', AUDIO_PATH + 'Poison-Potion.mp3');
audioManager.load('fire-potion', AUDIO_PATH + 'Fire-Potion.mp3');
audioManager.load('mystery-potion', AUDIO_PATH + 'Mystery-Potion.mp3');
audioManager.load('victory', AUDIO_PATH + 'Victory.mp3');
audioManager.load('death', AUDIO_PATH + 'Death.mp3');
audioManager.load('character-choice', AUDIO_PATH + 'Character-Choice.mp3');
audioManager.load('scroll-background', AUDIO_PATH + 'Scroll-Background.mp3');

// Start the application
init();
