# ADR: Testing Architecture & Test Suite Design

## Status

Accepted – documents current testing approach and its rationale.

---

## Context

The project is a browser-based single-player RPG with:

* **Client/UI code** under `src/client` (scene controllers, UI components, utilities like `AudioManager`).
* **Gameplay logic** under `src/gameplay` (game state, room/room registry, hero definitions).
* **Tests** under:

  * `tests/core` – primarily focused/isolated unit-style tests.
  * `tests/systems` – broader integration-style tests that exercise multiple modules together.

The team needed a testing approach that:

* Works well in **Node**, not a real browser.
* Is **lightweight** (low tooling overhead).
* Still lets us exercise **DOM-driven controllers**, singletons like `gameState` and `audioManager`, and scene loading behavior.

This ADR explains **why** key testing architecture decisions were made and the **tradeoffs** we accepted.

---

## Decision

We intentionally adopted the following testing architecture:

1. **Use Node’s built-in `node:test` harness and `assert` instead of Jest/Vitest.**
2. **Use `jsdom` to emulate the browser DOM and window environment where needed.**
3. **Organize tests into `tests/core` (unit-focused) and `tests/systems` (integration-focused).**
4. **Test controllers and UI logic via DOM operations and browser-like mocks, rather than pure logic extraction.**
5. **Mock browser APIs (e.g., `Audio`, `fetch`, `localStorage`) with simple, explicit test doubles.**
6. **Treat singletons (`gameState`, `audioManager`) as shared integration points and test against them directly where it adds value.**

The rest of this ADR explains *why* each of these decisions was made and what they imply.

---

## Rationale

### 1. Node’s `node:test` over Jest/Vitest

**What we decided:**
Use Node’s built-in `node:test` module and `node:assert/strict` for all unit and integration tests.

**Why:**

* **Zero extra framework dependency:**
  Using `node:test` keeps the test stack minimal. There’s no additional runner to configure, upgrade, or debug in CI.
* **Fits project scale:**
  Our tests rely mostly on straightforward assertions and manual mocks; we’re not heavily using snapshots, matchers, or Jest’s advanced mocking features.
* **Consistent runtime:**
  Tests run in the same runtime as the game backend logic (Node), which reduces surprises around module resolution and ES module behavior.

**Tradeoffs:**

* We **don’t get** convenient Jest features (e.g., `jest.fn()`, rich matchers, auto-mocking).
* More manual work is needed for **spies/mocks** and **fake timers**.
* The team accepted this in favor of a leaner stack and fewer moving parts.

---

### 2. `jsdom` for DOM Emulation

**What we decided:**
When a test needs DOM APIs or browser globals (e.g., scene controllers manipulating `document`), we instantiate a `jsdom` environment and attach `window`/`document` to `globalThis`.

**Why:**

* **We want to test controllers “as they run”:**
  Controllers like `BattleSceneController`, `MainMenuSceneController`, and `ExplorationSceneController` interact directly with the DOM (querying elements, updating text, toggling visibility). Using `jsdom` lets tests exercise this logic in a realistic way without requiring a real browser.
* **More realistic than pure logic extraction:**
  Instead of stripping controllers down into artificial “logic-only” functions just to unit-test them, we preserve their actual structure and rely on a simulated DOM. This helps catch issues around incorrect selectors, missing elements, or incorrect DOM mutations.
* **No full browser requirement:**
  `jsdom` provides enough DOM fidelity for our current needs (text updates, basic events, attributes) without introducing a browser into CI.

**Tradeoffs:**

* `jsdom` is not a full browser: **layout, CSS, and real rendering aren’t tested**.
* Tests need to carefully **set up and tear down DOM globals** to avoid cross-test pollution.
* Some browser APIs (e.g., `Audio`, animation frames, custom elements) still need custom mocks on top of `jsdom`.

---

### 3. Test Organization: `tests/core` vs `tests/systems`

**What we decided:**

* `tests/core`: focused on **specific modules**, usually one or two at a time; tends to mock external dependencies.
* `tests/systems`: simulate **larger flows** that wire multiple modules together (e.g., controllers + `GameState` + `sceneLoader`).

**Why:**

* **Separation of concerns:**

  * `tests/core` helps verify *individual behaviors* (e.g., `AudioManager.load`, `GameState.saveGame`, `roomRegistry.getRoomById`) in isolation.
  * `tests/systems` focuses on *how pieces interact*, like how scenes load or how state flows between controllers and game systems.
* **Clarity for contributors:**
  It’s easy to decide where a new test goes:

  * “Testing a single function or module?” → `tests/core`.
  * “Testing a user flow or multi-module behavior?” → `tests/systems`.
* **Performance and signal:**
  Core tests tend to be fast and run frequently; system tests can be fewer but cover critical integration scenarios.

**Tradeoffs:**

* Some behaviors are tested in both layers (e.g., a controller in `tests/core` and a flow involving that controller in `tests/systems`), which can feel redundant but is intentional: core tests catch bugs early, system tests catch wiring issues.
* Test failures in `tests/systems` can be **harder to diagnose**, because they involve more modules; this is accepted as normal for integration tests.

---

### 4. Testing Controllers Through DOM & Events

**What we decided:**
For scene controllers and UI pieces, we **test them in terms of DOM and user-like interactions**, not by splitting their logic into pure helpers.

**Why:**

* **Closer to how the code runs in reality:**
  Controllers are responsible for wiring up event handlers, reading/writing DOM, and coordinating with audio and game state. Testing them through DOM behavior (e.g., clicking a button, seeing text change) validates the real contract they have with the rest of the game.
* **Discourages over-abstracting UI logic:**
  We intentionally avoid extracting every bit of logic into pure utility functions solely for testability. The tests are allowed to “touch the DOM” so that controllers can remain expressive and focused on behavior rather than test scaffolding.
* **Naturally supports small integration:**
  A controller test implicitly covers interactions with injected dependencies (e.g., stubbed `audioManager`, fake `typewriter` components) while still being “just a unit test” from the runner’s perspective.

**Tradeoffs:**

* These tests naturally become **larger and more complex**, because they have HTML setup, mocks, and behavior assertions.
* Refactoring controllers may require updates to tests that rely on specific DOM structures or CSS selectors.
* It’s easier to accidentally couple tests to implementation details (e.g., exact HTML structure), so extra care is needed when writing expectations.

---

### 5. Explicit, Lightweight Mocks for Browser APIs

**What we decided:**
Mock browser-dependent pieces explicitly using **simple test doubles**, often defined in each test file:

* `globalThis.Audio` → `MockAudio` with a controllable `.play()` implementation.
* `globalThis.localStorage` → in-memory fake object with `getItem/setItem/removeItem/clear`.
* `fetch` → stubbed to return controlled HTML/content.
* Custom elements (`typewriter-textbox`) → replaced using `document.createElement` patches or simple stub classes.

**Why:**

* **Transparency and control:**
  Each test can see exactly how a mock behaves without going through a large mocking framework. For example, `MockAudio` used in `AudioManager` tests makes it obvious how “play” and “stop” work.
* **Fine-grained behavior testing:**
  We can simulate edge cases like `Audio.play()` rejecting, or `localStorage` returning invalid JSON, in a way that is easy to reason about.
* **Framework-agnostic:**
  Because mocks are plain JS, we aren’t tied to a specific test framework’s mocking APIs, which keeps the door open for future changes.

**Tradeoffs:**

* Some mocking patterns are **duplicated across tests** (e.g., custom audio and localStorage mocks).
* Without a centralized helper layer, each test file must carefully **restore globals** in `afterEach`, or risk shared state issues.
* There is no “automatic spying” like Jest; capturing calls often relies on arrays or manual wrappers, which are more verbose.

---

### 6. Direct Use of Singletons in Tests (`gameState`, `audioManager`)

**What we decided:**
We test against real singleton exports (`gameState`, `audioManager`) in many places instead of wrapping everything in factories or dependency injection.

**Why:**

* **Matches production usage:**
  In the actual app, controllers import and use `gameState` and `audioManager` singletons directly. Testing against those same singletons helps ensure tests reflect real wiring and flows.
* **Simple mental model:**
  It’s clear to contributors that:

  * `gameState` represents “the” game state.
  * `audioManager` represents “the” audio system.
    There is less indirection around how instances are created or passed around.
* **Useful for integration/system tests:**
  Having a single shared `gameState` simplifies integration-style tests where we want to simulate “start a game, save, reload, continue.”

**Tradeoffs:**

* Singletons **retain state across tests** if not reset, which can cause cross-test pollution.
* Some tests need to know internal behavior (e.g., clearing or reinitializing `gameState.currentSaveData`), which slightly blurs the line between black-box and white-box testing.
* It makes it harder to test modules in complete isolation if they import these singletons at module load time; that’s an accepted tradeoff for now.

---

## Consequences

### Positive Outcomes

* **Lean tooling stack:**
  `node:test` + `jsdom` + simple mocks is enough to cover most of our needs without bringing in heavier frameworks.

* **Good balance between unit and integration coverage:**

  * Core logic like `AudioManager`, `GameState`, and `roomRegistry` has focused, predictable tests.
  * Controllers and scene flows are tested in more realistic scenarios that involve DOM and shared state.

* **Tests read like behavior descriptions:**

  * Many tests describe scenarios a player might encounter (“when starting a new game”, “when an invalid save is loaded”, “when multiple sounds play at once”), which makes them valuable documentation.

### Known Limitations

* **No true browser/E2E coverage yet:**

  * We don’t currently validate CSS/layout, real audio playback, or full user flows in a real browser.
  * Bugs that depend on actual browser behavior or asset loading may not be caught by the existing tests.

* **Manual mocking and cleanup burden:**

  * Each test file must manually set up and tear down mocks and globals.
  * Inconsistent patterns can lead to brittle or flaky tests if cleanup is missed.

* **Complex controller tests:**

  * Some test files are large and dense because they contain HTML templates, mocks, and behavior checks all in one place.
  * This is a conscious tradeoff to keep controllers close to their real usage pattern, but it does increase cognitive load.

---

## Alternatives Considered

### 1. Using Jest or Vitest from the Start

**Pros:**

* Built-in mocking, spies, fake timers, and matchers.
* Potentially better VS Code integration and community familiarity.

**Cons:**

* Additional dependency and configuration overhead.
* Migration complexity if we ever wanted to switch or upgrade.
* Existing needs could be satisfied with the built-in Node tooling.

**Why we didn’t choose it initially:**

We prioritized a **minimal stack** with fewer moving parts, and the initial tests did not require advanced framework features. Node’s `node:test` was good enough for our early needs.

---

### 2. Forcing “Pure Logic” Only in Controllers

**Pros:**

* Unit tests become trivial and fast, with no DOM or jsdom needed.
* Controllers become thin wrappers around pure functions.

**Cons:**

* Unrealistic separation between “logic” and “view” for this project’s structure.
* Risk of drifting away from how the code is actually used in the game.
* Increased overall complexity as we introduce layers solely for testability.

**Why we didn’t choose it:**

We explicitly wanted to **test how controllers behave with real DOM-like structures**, not just pure functions. Testing via DOM keeps the controllers’ responsibilities honest and gives more confidence in actual runtime behavior.

---

### 3. Full Browser-Based E2E Testing Only

**Pros:**

* Highest fidelity tests; exactly what players experience.
* Catches CSS, focus, real asset loading, and animation details.

**Cons:**

* Slower feedback cycles.
* Heavier and more complex CI setup.
* Harder to debug compared to unit/integration tests.

**Why we didn’t choose it as the primary approach:**

We opted to start with **Node-based unit and integration tests** for speed and simplicity, with the option to add targeted E2E tests later if needed.

---

## Summary

This ADR explains why our current testing architecture looks the way it does:

* **Node’s `node:test` + `jsdom`** gives us a lean, Node-native way to test both pure logic and DOM-dependent controllers.
* **Explicit, lightweight mocks** and **direct singleton usage** keep tests close to real runtime behavior, at the cost of some manual cleanup and boilerplate.
* Organizing tests into **core (unit) and systems (integration)** suites gives us a clear mental model and avoids overloading any single layer with all responsibilities.

Future ADRs can build on this by documenting *changes* (e.g., introducing shared helpers, adding browser E2E tests, or migrating tooling), but this record captures the **intent behind the current design** and the tradeoffs the team accepted.