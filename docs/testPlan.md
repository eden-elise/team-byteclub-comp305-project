# Test Plan: Text-Based Rogue-like game

Related: 
[see Testing ADR](ADRS/TESTING.md)

## 0. Table of Contents
- [1. Project Overview](#1-project-overview)
- [2. Current Testing Strategy](#2-current-testing-strategy)
  - [2.0 Play Testing](#20-play-testing)
  - [2.1 Test Framework & Style](#21-test-framework--style)
  - [2.2 Modules with Strong Unit Coverage](#22-modules-with-strong-unit-coverage)
  - [2.3 Patterns in Current Coverage](#23-patterns-in-current-coverage)
- [3. Coverage Gaps & Risks](#3-coverage-gaps--risks)
  - [3.1 Missing or Weak Areas](#31-missing-or-weak-areas)
  - [3.2 High-Risk Areas (From Complexity & Test Density)](#32-high-risk-areas-from-complexity--test-density)
- [4. Future Testing Strategy](#4-future-testing-strategy)
  - [4.1 Unit Testing (Continue & Refine)](#41-unit-testing-continue--refine)
  - [4.2 Integration Testing](#42-integration-testing)
  - [4.3 End-to-End (E2E) / Acceptance Testing](#43-end-to-end-e2e--acceptance-testing)
  - [4.4 Performance Testing](#44-performance-testing)
  - [4.5 Security Testing](#45-security-testing)
- [5. Test Environment](#5-test-environment)
  - [5.1 Framework & Runtime](#51-framework--runtime)
  - [5.2 Tooling Summary](#52-tooling-summary)
- [6. Test Data & Fixtures](#6-test-data--fixtures)
- [7. Pass / Fail Criteria](#7-pass--fail-criteria)
  - [7.1 Unit Tests](#71-unit-tests)
  - [7.2 Integration Tests](#72-integration-tests)
  - [7.3 E2E / Acceptance Tests](#73-e2e--acceptance-tests)
  - [7.4 Performance](#74-performance)
  - [7.5 Security](#75-security)
- [8. Roadmap & Implementation Phases](#8-roadmap--implementation-phases)
  - [Phase 1 – Stabilize & Measure (1–2 sprints)](#phase-1--stabilize--measure-1-2-sprints)
  - [Phase 2 – Expand Integration & E2E (3–6 sprints)](#phase-2--expand-integration--e2e-3-6-sprints)
  - [Phase 3 – Performance & Security (ongoing)](#phase-3--performance--security-ongoing)

## 1. Project Overview

This project is a **single-player, browser-based RPG** built with modular scenes and a lightweight game state. The application is structured as:

* **Client UI (`src/client`)**
  Scene HTML/CSS/JS, scene controllers (e.g., main menu, battle, exploration), UI components (e.g., typewriter textbox), and utilities (e.g., `AudioManager`).
* **Gameplay logic (`src/gameplay`)**
  Game state and save/load (`GameState`), room/exploration logic (`roomRegistry`, room definitions), hero definitions, entities, and items.
* **Utilities**
  Cross-cutting helpers such as `sceneLoader` for HTML/CSS injection and `AudioManager` for audio playback and volume control.

Core user flows:

1. Start a new game or continue from a saved game.
2. Navigate scenes through exploration (rooms and floors).
3. Engage in turn-based battles with UI feedback, inventory usage, and audio.
4. Persist and restore progress via saves.

---

## 2. Current Testing Strategy

### 2.0 Play Testing

#### Test Environment
- Browser: Chrome 120+, Firefox 120+, Safari 17+
- Screen: Desktop/laptop (1280x720 minimum)

#### Test Cases

##### TC-001: New Game Flow
**Preconditions:** Fresh browser session, no saved game
**Steps:**
1. Open index.html in browser
2. Click "New Game"
3. Select Knight character
4. Verify intro scroll plays
5. Verify Floor 1 exploration loads

**Expected Result:** Player enters Floor 1 with Knight selected
**Status:** [ ] Pass / [ ] Fail

##### TC-002: Character Selection
**Preconditions:** At main menu
**Steps:**
1. Click "New Game"
2. Select "Archer"
3. Verify archer sprite displays

**Expected Result:** Archer character is selected and visible
**Status:** [ ] Pass / [ ] Fail

##### TC-003: Battle System
**Preconditions:** In exploration mode
**Steps:**
1. Trigger a battle encounter
2. Use Attack 1
3. Use Attack 2
4. Use an item from inventory
5. Defeat enemy

**Expected Result:** Battle completes, return to exploration
**Status:** [ ] Pass / [ ] Fail

##### TC-004: Save/Load
**Preconditions:** Progress to Floor 2+
**Steps:**
1. Note current floor and HP
2. Close browser
3. Reopen and click "Continue"
4. Verify floor and HP restored

**Expected Result:** Game state correctly restored
**Status:** [ ] Pass / [ ] Fail

##### TC-005: Full Playthrough
**Preconditions:** Fresh game
**Steps:**
1. Complete all 5 floors
2. Defeat all bosses
3. Reach game end

**Expected Result:** Game completes without errors
**Status:** [ ] Pass / [ ] Fail

#### Audio Tests

##### TC-006: Audio Controls
**Steps:**
1. Open options menu
2. Adjust volume slider
3. Verify audio level changes

**Expected Result:** Volume adjusts accordingly
**Status:** [ ] Pass / [ ] Fail

#### Edge Cases

##### TC-007: Death and Retry
**Steps:**
1. Lose a battle intentionally
2. Verify death screen appears
3. Click restart option

**Expected Result:** Game restarts properly
**Status:** [ ] Pass / [ ] Fail


### 2.1 Test Framework & Style

* **Runner:** Node’s built-in test harness (`node:test`).
* **Assertions:** `node:assert/strict`.
* **DOM Emulation:** `jsdom` is used where DOM access is required.
* **Playtesting:** ensures the game works correctly through user interactions. [see more](@TODO: LINK)
* **Mocking:**

  * Browser APIs: `Audio`, `fetch`, `localStorage`, timers (`setTimeout`, possibly `requestAnimationFrame`).
  * Some cross-module interactions are simulated via light mocking or stubbing.

### 2.2 Modules with Strong Unit Coverage

#### `AudioManager` (`src/client/utils/AudioManager.js`)

**Covered behaviors:**

* `load(name, src)` – loads or overwrites audio resources.
* `play(name, options)` – plays defined sounds, handles missing sounds gracefully.
* `stop(name)` – stops specific sounds.
* `setMasterVolume(value)` – handles master volume and sound-specific base volume interaction.
* Singleton export behavior.

**Validation types:**

* Happy paths: load–play–stop cycles.
* Edge cases: missing sounds, repeated loads, volume extremes.
* Error handling: promise rejections from `Audio.play()` are caught and logged rather than crashing.

---

#### `BattleSceneController` / `battleScene` (`src/client/scenes/battleScene.js`)

**Covered behaviors:**

* Controller construction with supplied DOM and dependencies.
* UI state updates: `updateEntityStats`, visibility of action buttons, inventory panels.
* Log behavior: queuing and displaying combat log entries (typewriter-style text).
* Button enable/disable logic, including back navigation from inventory.
* Audio interactions (sounds for actions / events).
* Some small integration flows (multiple sounds, chained actions, timeouts).

**Validation types:**

* Happy paths: standard battles (player actions, enemy actions, turn loop).
* UI state correctness: DOM reflects HP, inventory, available actions.
* Edge conditions: multiple audio calls, disabling input at the right times.

---

#### `GameState` (`src/gameplay/state/GameState.js`)

**Covered behaviors:**

* `startNewGame()` – initializes a new game state.
* `saveGame()` – persists to `localStorage` and maintains internal state.
* `loadGame()` – restores from `localStorage`, handling missing or corrupted data.
* `setCurrentScene(name)` – tracks current scene for the game.
* `loadFromFile()` (if present) – loads external saves.
* `clearSave()` – wipes all saved data and in-memory state.
* Singleton export `gameState`.

**Validation types:**

* Happy paths: save–load round trip.
* Edge cases: missing saves, corrupted JSON, unknown character class IDs.
* Error handling: ensure operations do not throw on invalid saves and fall back safely.

---

#### Exploration / `roomRegistry` (`src/gameplay/exploration/roomRegistry.js`)

**Covered behaviors:**

* `getRoomById(id)` – retrieves rooms by ID.
* `getAllRoomIds()` – lists defined rooms.
* `roomExists(id)` – checks for room existence.
* `TEST_ROOM` export.

**Validation types:**

* Happy paths: valid IDs return correct structure.
* Edge cases: undefined/empty IDs, repeated calls.
* Behavior consistency: same ID returns same room data.

---

#### `sceneLoader` (`src/client/sceneLoader.js`)

**Covered behaviors:**

* Fetching and injecting scene HTML into a root container (e.g. `#app`).
* Managing base/scene-specific stylesheets, including adding/removing link tags.
* Notifying `GameState` of the current scene via `setCurrentScene(name)`.

**Validation types:**

* Happy paths: scene HTML fetched and inserted correctly.
* DOM correctness: root element contents updated.
* Interaction: state updated when a new scene is loaded.

---

### 2.3 Patterns in Current Coverage

* **Happy Path Coverage:** Strong across audio, battle UI, game state operations, and scene loading.
* **Edge Case Coverage:** Present for invalid inputs (unknown IDs, missing resources, volume bounds).
* **Error Handling:** Key failure paths (audio play errors, corrupted saves, missing rooms) are tested to avoid crashes.
* **Micro-Integration Tests:** Some tests validate interactions between 2–3 modules with mocks (`BattleSceneController` + `AudioManager`, `sceneLoader` + `GameState`).

---

## 3. Coverage Gaps & Risks

### 3.1 Missing or Weak Areas

* **End-to-End Browser Flows:**

  * No tests run in a real browser context (all tests are Node + jsdom).
  * Actual asset loading (HTML/CSS/audio) in a real browser is unverified.
* **Dedicated Integration Test Layer:**

  * Existing tests focus on units or micro-integrations; there is no layer that runs multiple modules together with minimal mocking.
  * Example missing flows:

    * `initApp()` → `sceneLoader` → `MainMenuSceneController` → `GameState`.
    * Full game flow across scenes and floors.
* **Performance Under Load:**

  * No performance benchmarks for:

    * Multiple simultaneous audio streams.
    * Large or deeply nested logs and UI updates in battle.
    * Large or corrupted save data.
* **Security / Content Safety:**

  * No automated tests for:

    * XSS / unsafe HTML injection via scenes.
    * Malicious or malformed save files.
    * Input sanitization when injecting or rendering content.

### 3.2 High-Risk Areas (From Complexity & Test Density)

* **Battle System:** Complex interactions among DOM, timing, game entities, and audio. High density of tests indicates risk and importance.
* **Persistence & Hydration (`GameState`):** User progress depends on safe load/save and correct hydration of heroes/entities.

These areas should be priority targets for integration, E2E, performance, and security testing.

---

## 4. Future Testing Strategy

### 4.1 Unit Testing (Continue & Refine)

* **Objective:** Maintain correctness and prevent regressions in individual modules.
* **Actions:**

  * Keep using `node:test` + `assert` for units.
  * Maintain and expand coverage in:

    * `AudioManager` (new audio features, fade, mute, etc.).
    * `BattleSceneController` (new actions, behaviors).
    * `GameState` (migration logic, new save schema, floors).
    * `roomRegistry` (new floors/rooms).
    * `sceneLoader` (additional scenes, CSS handling).
  * Add tests for newly created controllers and components (e.g., intro scroll scene, death screen controller).

### 4.2 Integration Testing

* **Objective:** Verify that key subsystems work correctly together with minimal mocking.

**Targets:**

1. **App Initialization Flow**

   * `initApp()` → `sceneLoader.loadScene('mainMenuScene')` → `MainMenuSceneController` construction → `GameState` interaction.
   * Assert:

     * Global `window.gameApp` is set.
     * Main menu scene is loaded and visible.
     * Audio is preloaded as expected.

2. **New Game Flow**

   * `startNewGame()` → `characterSelectScene` → hero selection → `introScrollScene` → first exploration floor.
   * Use minimal mocking:

     * Real `sceneLoader` with test HTML assets.
     * Fake but deterministic hero classes.
   * Assert:

     * `GameState.currentSaveData` populated correctly.
     * `GameState.characterEntity` set.
     * Correct starting floor and room for exploration.

3. **Save/Load Round Trip**

   * Start game → perform actions (battle, exploration) → save → reload application → `continueGame()`.
   * Assert:

     * Save is read correctly.
     * Player resumes in correct floor, room, and event index.

4. **Battle Integration**

   * Construct a battle using real `BattleSceneController`, real-type entities, and `AudioManager` (but possibly stub actual `Audio`).
   * Assert:

     * Battle transitions are correct (turn order, victory/defeat).
     * Post-battle callbacks correctly return to exploration or death screen.

**Implementation Suggestions:**

* Use a thin **“integration test harness”** that:

  * Spins up a jsdom-based environment.
  * Uses real client modules for `sceneLoader`, controllers, `GameState`.
  * Serves static HTML templates from `src/client/scenes` where feasible (or uses representative test fixtures).

---

### 4.3 End-to-End (E2E) / Acceptance Testing

* **Objective:** Validate core user flows in a real browser environment.

**Tooling:**

* Recommended: **Playwright** (multi-browser, good for CI).

**Minimum Critical Journeys:**

1. **New Game Journey**

   * Launch app → main menu → “New Game” → character selection → intro scroll → first exploration room.
   * Verify:

     * UI transitions are correct and visually present (DOM checks).
     * Buttons and controls are clickable and behave as expected.

2. **Save & Continue Journey**

   * Start a game → play until a natural save point → trigger save.
   * Reload app → select “Continue” → ensure player resumes correctly from saved state.

3. **Battle Journey**

   * Start a battle via a known scenario.
   * Perform a series of actions (attack, inventory use, etc.).
   * Verify:

     * HP changes are reflected correctly.
     * Combat log updates visible.
     * Victory/defeat flows go to the expected scenes.

**Execution:**

* Run E2E tests in CI using Chromium; optionally add Firefox/WebKit for broader coverage.
* Gate releases on passing E2E tests for these core flows.

---

### 4.4 Performance Testing

* **Objective:** Ensure the game remains responsive under typical and heavy loads.

**Targets:**

1. **Scene Loading**

   * Measure time to load and render key scenes (main menu, battle, exploration).
   * Target: < 250ms median, < 1s p95 on CI-like machine.

2. **Battle Loop Performance**

   * Simulate long battles (many turns, many log lines).
   * Check for UI responsiveness and no long pauses.

3. **Save/Load Performance**

   * Use large mock save data (many items, large inventory, long progress).
   * Measure `saveGame()` and `loadGame()` durations and ensure they are within acceptable bounds.

**Tooling Ideas:**

* Simple timing using `performance.now()` in test harnesses.
* Optionally integrate a performance benchmark tool or custom Node scripts.

---

### 4.5 Security Testing

* **Objective:** Reduce risk of client-side vulnerabilities, especially XSS or corrupted data exploits.

**Areas to Test:**

1. **Scene HTML Injection**

   * Ensure `sceneLoader` sanitizes or safely injects scene HTML.
   * Add tests for:

     * Potential script tags or inline event handlers.
     * Malformed HTML.

2. **Save Data Handling**

   * Test `GameState.loadGame()` and any external `loadFromFile()` functions with:

     * Malformed JSON.
     * Overly large data.
     * Unexpected types or fields.
   * Assert: no unhandled exceptions; safe fallback behavior.

3. **User-Controlled Content**

   * Any field that may reflect user input in UI should be sanitized or escaped.

**Tooling:**

* Start with unit/integration tests simulating malicious payloads.
* Optionally add static analysis or a small security linting pass for HTML/JS.

---

## 5. Test Environment

### 5.1 Framework & Runtime

* **Unit/Integration:**

  * Node.js LTS **>= 18** (20 recommended).
  * Native **`node:test`** harness.
  * **`node:assert/strict`** for assertions.
  * **`jsdom`** to simulate DOM where needed.

* **Coverage:**

  * `c8` to generate coverage reports.

* **E2E:**

  * **Playwright**:

    * Chromium (CI-required).
    * Optionally Firefox/WebKit.

### 5.2 Tooling Summary

* `node:test` – unit and integration tests.
* `jsdom` – DOM emulation.
* `c8` – coverage.
* `Playwright` – E2E acceptance tests.

---

## 6. Test Data & Fixtures

* **Unit Tests:**

  * Continue using small, focused mocks (e.g., `makeMockEntity`, small rooms, minimal inventory).

* **Integration Tests:**

  * Medium-size fixtures:

    * Several rooms across multiple floors.
    * A few hero types with different stats and inventories.
    * Saves with mid-game progress.

* **Performance Tests:**

  * Large fixtures:

    * Large inventories.
    * Deep progress (many floors/events).
    * Long combat logs.

* **Assets:**

  * Unit tests: mock audio and fetch.
  * Integration/E2E: serve real HTML and CSS files; audio can be stub files to limit CI overhead.

---

## 7. Pass / Fail Criteria

### 7.1 Unit Tests

* **Pass:** 100% of unit tests must pass on every CI run.
* **Coverage Goal:**

  * Overall: **≥ 85%** statement/branch coverage.
  * Critical modules (`battleScene`, `GameState`, `AudioManager`): **≥ 90%**.

### 7.2 Integration Tests

* All integration test cases must pass.
* Failures are considered blocking for merges into main or release branches.

### 7.3 E2E / Acceptance Tests

* All core flows (New Game, Save/Continue, battle flow) must pass in Chromium.
* Any failure in these primary journeys is release-blocking.

### 7.4 Performance

* No regressions beyond established baselines for:

  * Scene load times.
  * Battle loop responsiveness.
  * Save/load times.
* Hard thresholds set after initial baseline runs.

### 7.5 Security

* No known critical security vulnerabilities in dependency scans.
* No failing security tests for:

  * XSS-like HTML injection.
  * Malformed save data handling.

---

## 8. Roadmap & Implementation Phases

### Phase 1 – Stabilize & Measure (1–2 sprints)

* Ensure all existing unit tests pass in Node 18/20.
* Add coverage collection with `c8`.
* Introduce 1–2 integration tests for:

  * `initApp()` + main menu.
  * New game flow start.

### Phase 2 – Expand Integration & E2E (3–6 sprints)

* Add integration tests for:

  * Save/load flows.
  * Battle → exploration transitions.
* Introduce Playwright E2E tests for:

  * New Game journey.
  * Save/Continue journey.

### Phase 3 – Performance & Security (ongoing)

* Add performance benchmarks for scene load, battle loop, save/load.
* Add security-focused tests for HTML injection and save-file parsing.
* Set baseline metrics and thresholds; monitor in CI.