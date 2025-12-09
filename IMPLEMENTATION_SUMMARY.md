# Main Application Flow Implementation

## Overview

Your game now has a complete flow from `index.html` → `main.js` → all scenes with proper scene loading, state management, and progression through all 5 floors.

## Application Flow

```
index.html (Single Page App)
    ↓
main.js (Initializes the game)
    ↓
Main Menu Scene
    ├─ New Game → Character Select Scene
    │   ├─ Knight / Archer Selection
    │   └─ → Intro Scroll Scene
    │       └─ → Floor 1 Exploration
    │           ├─ Battles (transitions to Battle Scene)
    │           └─ → Floor 2 Exploration
    │               ├─ Battles
    │               └─ → Floor 3, 4, 5...
    │
    └─ Continue → Load Saved Game
        └─ Resume from last floor

```

## How It Works

### 1. **index.html Setup**

- Single `<div id="app"></div>` container
- Loads `main.js` as a module
- sceneLoader.js dynamically loads scene HTML and CSS

### 2. **main.js - Application Entry Point**

#### Key Functions:

**`initApp()`**

- Initializes the application on page load
- Sets up the OptionsModal
- Loads the main menu scene
- Exposes global game functions: `startFloorExploration`, `startBattle`, `startNewGame`, `continueGame`

**`startNewGame()`**

1. Loads `characterSelectScene.html`
2. Player selects Knight or Archer
3. Creates character entity and saves game state
4. Loads `introScrollScene.html`
5. After intro completes → calls `startFloorExploration('floor-1')`

**`continueGame()`**

1. Loads save data from localStorage
2. Hydrates the character entity
3. Resumes from the last floor
4. Falls back to `startNewGame()` if no save exists

**`startFloorExploration(floorId)`**

1. Gets the room data for the specified floor (floor-1, floor-2, etc.)
2. Loads `explorationScene.html`
3. Initializes ExplorationSceneController with the room
4. When floor completes:
   - If more floors exist → Load next floor
   - If all 5 floors completed → Return to main menu

**`startBattle(enemyEntity, onWinCallback)`**

1. Loads `battleScene.html`
2. Initializes BattleSceneController
3. On player victory:
   - Calls provided `onWinCallback` (from exploration), or
   - Returns to current floor exploration
4. On player defeat:
   - Allows retry of the same battle

### 3. **Scene Loading via sceneLoader.js**

- `loadScene(sceneName)` dynamically loads:
  - `scenes/{sceneName}.html`
  - `css/{sceneName}.css`
  - Always includes `css/base.css`
- Handles CSS cleanup (removes old scene CSS before loading new)

### 4. **Game State Management (GameState.js)**

- Saves character data, floor progress, and metadata to localStorage
- `saveGame()` - Persists current state
- `loadGame()` - Restores from localStorage
- `getFullSaveData()` - Retrieves save file
- `clearSave()` - Resets game state

### 5. **Room/Floor System**

- Uses `roomRegistry.js` to load all floors from `/rooms-data/`
- Floors: `floor-1.js`, `floor-2.js`, `floor-3.js`, `floor-4.js`, `floor-5.js`
- Each floor contains rooms with events and enemy encounters
- `ExplorationSceneController` manages room progression

## Debug Keyboard Shortcuts

While testing, you can use:

- **R** - Restart current floor
- **E** - Start a test battle
- **C** - Clear all saves and reload app
- **M** - Return to main menu

## Audio Integration

All audio is preloaded on app start:

- Loading screen, button clicks, battle music
- Victory/death sounds
- Inventory and potion effects
- Character selection and scroll background music

## Scene Files Utilized

1. **mainMenuScene.html/js** - Initial menu with play/continue options
2. **characterSelectScene.html/js** - Knight vs Archer selection
3. **introScrollScene.html/js** - Story introduction with typewriter effect
4. **explorationScene.html/js** - Room navigation and events
5. **battleScene.html/js** - Combat system
6. **Rooms Data** - floor-1.js through floor-5.js

## Key Features Implemented

✅ Complete scene flow with sceneLoader.js
✅ Character progression through all 5 floors
✅ Save/load game functionality
✅ Battle integration from exploration
✅ Floor-by-floor progression with completion tracking
✅ Return to main menu after game completion
✅ Resume from last played floor
✅ Proper state management across all scenes
✅ Debug keyboard shortcuts for testing

## Testing the Flow

1. Open `index.html` in a browser
2. Click "New Game"
3. Select a character (Knight or Archer)
4. Watch intro scroll
5. Start exploring floor-1
6. Complete all 5 floors
7. Return to main menu on completion
8. Use "Continue" to resume from saved progress
