
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Version](https://img.shields.io/badge/version-1.0.0-lightgrey)

BYTECLUB is a narrative-driven, turn-based combat prototype and demo built by Team Byte Club for COMP305. The repo contains a small client UI, a modular combat system implemented in JavaScript, demo pages, art assets, testing, and documentation for the game's narrative and design.

**Status:** Prototype — playable demos included in `demo/` and a modular combat engine under `src/gameplay/`.

## Table of contents

- [What it does](#what-it-does)
- [Why it's useful](#why-its-useful)
- [Key features](#key-features)
- [Getting started](#getting-started)
- [Usage examples](#usage-examples)
- [Project structure](#project-structure)
- [Where to get help](#where-to-get-help)
- [Maintainers & contributing](#maintainers--contributing)
- [License](#license)

## What it does

BYTECLUB is a small web-based prototype for a gothic, loop-based narrative with a turn-based combat system. The codebase separates gameplay logic (combat engine, actions, entities, status effects) from presentation (browser demos and simple UI) so other projects can reuse the engine.

## Why it's useful

- Reusable combat system: `src/gameplay/` exposes composable classes such as `Entity`, `Action`/`Attack`, `StatusEffect`, `BattleEngine`, and `BattleSequence` helpful for turn-based game prototypes.
- Lightweight demos: HTML/JS demo pages under `demo/` and `src/client/` demonstrate simple integration and visuals.
- Clear separation: engine, definitions (items/attacks/characters), animations, and UI are split for easy extension.

## Key features

- Modular combat engine with turn order, status effects, and a battle log.
- Animation hooks (promises) so UI code can wait for animations to complete.
- Definitions registry for attacks, items, characters (under `src/gameplay/definitions/`).
- Demo pages and assets to try concepts quickly in the browser.

## Getting started

Prerequisites

- Node.js (for tooling like lint/format) — optional for running local demos.
- A modern browser to open demo HTML pages.

Install dev tools (optional)

```bash
# from repo root (macOS / zsh)
npm install
```

Available npm scripts (development)

```bash
# run linter
npm run lint

# auto-fix lint issues
npm run lint:fix

# format source files
npm run format

# check formatting
npm run format:check
```

Run demos

Open any of the HTML demo pages in the `demo/` folder or the `src/client/index.html` file in your browser. For example, from Finder or using a lightweight static server:

```bash
# serve current folder with a simple static server (optional)
# install one (if needed): npm install -g serve
serve .
# then open http://localhost:3000/demo/aman/demo.html (or other demo files)
```

## Usage examples

Importing the gameplay module (ESM)

```javascript
import { Entity, Attack, BattleEngine } from './src/gameplay/index.js';

const hero = new Entity('Hero', 30, { ATTACK: 5, DEFEND: 2, SPEED: 3 });
const enemy = new Entity('Goblin', 12, { ATTACK: 3, DEFEND: 1, SPEED: 2 });

const bite = new Attack('Bite', { basePower: 2 });
hero.moves.push(bite);

const engine = new BattleEngine(hero, enemy);
engine.startBattle();
// Use engine.processTurn(entity, action, target) to run turns
```

For more complete examples, see `src/gameplay/` and the demo pages in `demo/` and `src/client/`.

## Project structure

- `src/gameplay/` — combat engine, core entities, actions, animations, definitions, and engine components.
- `src/client/` — simple client UI and scene loader used by demos.
- `src/assets/` — artwork, icons, and media used by demos.
- `demo/` — small demo pages (open in browser) grouped by contributor.
- `docs/` — narrative notes and team artifacts (e.g., `docs/gamePlot.md`, `docs/team-charter.md`).
- `tests/` — lightweight test harnesses (manual tests / examples).

## Where to get help

- Open an issue: `https://github.com/eden-elise/team-byteclub-comp305-project/issues`
- Read the narrative/design doc: `docs/gamePlot.md` and team notes in `docs/`.
- Inspect example code: `src/gameplay/` and `demo/`.

## Maintainers & contributing

- **Maintainer (repo owner):** `eden-elise` (see repository owner on GitHub).
- If you'd like to contribute:
	- Open an issue describing the change or feature.
	- Send a pull request with a clear description and targeted changes.
	- Keep changes focused and follow the existing code style (run `npm run format`).

## License

This project is released under the MIT License — see the `LICENSE` file for details.