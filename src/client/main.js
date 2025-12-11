// Mobile device detection
function isMobileDevice() {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768
  );
}

function showMobileWarning() {
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #1a1a2e;
      color: #eee;
      font-family: serif;
      text-align: center;
      padding: 20px;
    ">
      <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚔️ BYTECLUB ⚔️</h1>
      <p style="font-size: 1.2rem; max-width: 400px;">
        This game is designed for <strong>desktop and laptop</strong> computers only and <strong>requires javaScript enabled to play</strong>.
      </p>
      <p style="font-size: 1rem; margin-top: 1rem; color: #888;">
        Please visit us on a larger screen to play!
      </p>
    </div>
  `;
}

// Check on load
if (isMobileDevice()) {
  showMobileWarning();
  throw new Error('Mobile device detected - stopping game initialization');
}

window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    showMobileWarning();
  }
});

import { loadScene } from './sceneLoader.js';
import { CharacterSelectSceneController } from './scenes/characterSelectScene.js';
import { MainMenuSceneController } from './scenes/mainMenuScene.js';
import { BattleSceneController } from './scenes/battleScene.js';
import { ExplorationSceneController } from './scenes/explorationScene.js';
import { gameState } from '../gameplay/state/GameState.js';
import { OptionsModalController } from './components/optionsModal.js';
import { IntroScrollSceneController } from './scenes/introScrollScene.js';
import { getRoomById } from '../gameplay/exploration/roomRegistry.js';
import { audioManager } from './utils/AudioManager.js';
import { DeathScreenSceneController } from './scenes/deathScreenScene.js';

// Floor progression order - maps floor to starting room
const FLOOR_ROOMS = {
  'floor-1': 'F1_INTRO_WAKE',
  'floor-2': 'F2_INTRO',
  'floor-3': 'F3_INTRO',
  'floor-4': 'F4_TOWER_INTRO',
};

// Track the current scene controller to handle cleanup
let currentSceneController = null;

/**
 * Sets the current active scene controller and cleans up the previous one.
 * @param {Object} controller - The new scene controller instance
 */
function setCurrentController(controller) {
  if (currentSceneController && typeof currentSceneController.cleanup === 'function') {
    console.log('Cleaning up previous scene controller');
    currentSceneController.cleanup();
  }
  currentSceneController = controller;
}

async function initApp() {
  try {
    // init global cursor
    document.addEventListener('mousedown', () => {
      document.body.classList.add('grabbed');
    });

    document.addEventListener('mouseup', () => {
      document.body.classList.remove('grabbed');
    });

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
    setCurrentController(
      new MainMenuSceneController({
        onNewGame: startNewGame,
        onContinue: continueGame,
      })
    );
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
  setCurrentController(
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
      setCurrentController(
        new IntroScrollSceneController({
          onComplete: async () => {
            // After intro, start exploring floor 1
            await startFloorExploration('floor-1');
          },
        })
      );
    })
  );
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
          setCurrentController(
            new MainMenuSceneController({
              onNewGame: startNewGame,
              onContinue: continueGame,
            })
          );
        }
      }
    );
    setCurrentController(explorationController);

    window.explorationController = explorationController;
  } catch (error) {
    console.error('Error in startFloorExploration:', error);
  }
}

/**
 * Start a battle (called from exploration scene)
 * @param {params} params - enemy entity, background image
 * @param {Function} onWinCallback - Callback when player wins
 */
async function startBattle(params, onWinCallback) {
  let player = gameState.characterEntity;

  const enemy = params.enemy;

  await loadScene('battleScene');
  const battleController = new BattleSceneController(
    player,
    enemy,
    params.background,
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
        // handle loss
        await handleLoss();
      }
    }
  );
  setCurrentController(battleController);

  window.battleController = battleController;
}

/**
 * Handle player loss
 * player will have to go back to previous save
 */
async function handleLoss() {
  console.log('Player defeated. Loading death screen scene...');
  // Clear temporary save data for the current exploration/battle state
  // but keep character entity for display on the death screen if needed

  // Stop battle music
  audioManager.stop('battle-background');
  audioManager.play('death');

  // Load the Death Screen Scene
  await loadScene('deathScreenScene');

  // Initialize the Death Screen Controller
  // The callback will be executed when the player clicks "Wake Up"
  new DeathScreenSceneController({
    onWakeUp: async () => {
      console.log('Returning to main menu...');
      // Reload the main menu scene for a fresh restart/continue prompt
      audioManager.stop('death');
      await loadScene('mainMenuScene');
      new MainMenuSceneController({
        onNewGame: startNewGame,
        onContinue: continueGame,
      });
    },
  });
}

// Debug keyboard shortcuts
document.addEventListener('keydown', async (e) => {
  if (e.key === 'r' || e.key === 'R') {
    // Restart current floor
    const floorId = 'F4_PLAYER_CHOICE';
    console.log(floorId);
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
    setCurrentController(
      new MainMenuSceneController({
        onNewGame: startNewGame,
        onContinue: continueGame,
      })
    );
  }
});

// Initialize application
async function init() {
  await initApp().catch(console.error);
}

// Load audio assets
const AUDIO_PATH = '../../src/assets/media/';

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
audioManager.load('lightning', AUDIO_PATH + 'Lightning.mp3');
audioManager.load('explore-scene', AUDIO_PATH + 'Explore-Scene.mp3');

// Start the application
init();
