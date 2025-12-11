/**
 * @fileoverview Battle Scene Controller - Manages turn-based combat UI and logic
 * for the game's battle system. Handles player actions, enemy AI, inventory management,
 * status effects, and combat logging with typewriter-style text display.
 * @module BattleSceneController
 */

import { getAttackByName } from '../../gameplay/definitions/attackRegistry.js';
import { getItemByName } from '../../gameplay/definitions/itemRegistry.js';
import '../components/TypewriterTextbox.js';
import { createSpeaker } from '../components/TypewriterTextbox.js';
import { audioManager } from '../utils/AudioManager.js';

/**
 * @typedef {Object} Entity
 * @property {string} name - The entity's display name
 * @property {string} image - Path to the entity's sprite image
 * @property {number} currentHP - Current hit points
 * @property {number} maxHP - Maximum hit points
 * @property {string[]} moves - Array of attack names the entity can use
 * @property {Object} stats - Entity statistics
 * @property {number} stats.SPEED - Speed stat for turn order calculation
 * @property {StatusEffect[]} activeEffects - Currently active status effects
 * @property {Function} isAlive - Returns whether the entity has HP > 0
 * @property {Function} processStatusEffectsTurnStart - Process effects at turn start
 * @property {Function} processStatusEffectsTurnEnd - Process effects at turn end
 */

/**
 * @typedef {Object} StatusEffect
 * @property {string} name - Name of the status effect
 * @property {string} description - Description of the effect
 * @property {string} icon - Path to the status effect icon image
 * @property {number} duration - Remaining turns for the effect
 */

/**
 * @typedef {Object} InventorySlot
 * @property {string} name - Name of the item
 * @property {number} quantity - Number of this item in inventory
 */

/**
 * @typedef {Object} Action
 * @property {string} name - Name of the action/attack
 * @property {Function} execute - Async function to execute the action
 */

/**
 * @typedef {Object} ItemInstance
 * @property {string} name - Item name
 * @property {Object} data - Item data properties
 * @property {string} data.name - Item display name
 * @property {string} data.description - Item description
 * @property {string} data.spritePath - Path to item sprite
 * @property {boolean} data.isVariableTarget - Whether item requires target selection
 * @property {number} data.defaultTarget - Default target (0 = self, 1 = enemy)
 * @property {Function} execute - Async function to use the item
 */

/**
 * @typedef {Object} MessageStyleConfig
 * @property {RegExp} pattern - Regex pattern to match message content
 * @property {string} style - Style preset name to apply
 * @property {string|null} effect - Text effect to apply
 * @property {'left'|'right'|'center'} orientation - Text alignment
 * @property {string} color - CSS color for the message
 * @property {number} speed - Typing speed in ms per character
 */

/**
 * @typedef {Object} StatusEffectStyleConfig
 * @property {string} color - CSS color for the status effect text
 * @property {string} effect - Text effect name to apply
 */

/**
 * @typedef {'actions'|'inventory'|'target-selection'} UIState
 * @description The current state of the battle UI
 */

/**
 * Message styling rules for the battle log.
 * Defines how different types of messages are displayed based on pattern matching.
 * @type {Object.<string, MessageStyleConfig>}
 * @constant
 */
const MESSAGE_STYLES = {
  /**
   * Style for turn announcement messages
   */
  turn: {
    pattern: /'s turn/,
    style: 'important',
    effect: null,
    orientation: 'center',
    color: '#ffaa00',
    speed: 15,
  },
  /**
   * Style for victory messages
   */
  victory: {
    pattern: /wins!|victory|victorious/,
    style: 'important',
    effect: 'glowing',
    orientation: 'center',
    color: '#ffd700',
    speed: 30,
  },
  /**
   * Style for defeat messages
   */
  defeat: {
    pattern: /defeated|loses/,
    style: 'yelling',
    effect: null,
    orientation: 'center',
    color: '#ff4444',
    speed: 25,
  },
};

/**
 * Styling configuration for status effect keywords in messages.
 * When these keywords appear in battle log messages, they receive special styling.
 * @type {Object.<string, StatusEffectStyleConfig>}
 * @constant
 */
const STATUS_EFFECT_STYLES = {
  poison: { color: '#9c27b0', effect: 'fade' },
  burn: { color: '#ff5722', effect: 'waving' },
  heal: { color: '#4caf50', effect: 'glowing' },
};

/**
 * Audio mapping for item usage.
 * Maps item name keywords to audio asset keys.
 * @type {Object.<string, string>}
 * @constant
 */
const ITEM_AUDIO_MAP = {
  health: 'health-potion',
  poison: 'poison-potion',
  fire: 'fire-potion',
  mystery: 'mystery-potion',
};

/**
 * Audio mapping for attack types.
 * Maps attack name keywords to audio asset keys.
 * @type {Object.<string, string>}
 * @constant
 */
const ATTACK_AUDIO_MAP = {
  strike: 'mp-strike',
  heavy: 'mp-heavy',
};

/**
 * Play audio based on name matching against a keyword map.
 * Searches the name for keywords and plays the corresponding audio.
 *
 * @param {string|null} name - The name to search for keywords
 * @param {Object.<string, string>} audioMap - Map of keywords to audio asset keys
 * @returns {void}
 *
 * @example
 * // Plays 'health-potion' audio
 * playAudioForName('Health Potion', ITEM_AUDIO_MAP);
 */
function playAudioForName(name, audioMap) {
  if (!name) return;

  const lowerName = name.toLowerCase();
  for (const [keyword, audioKey] of Object.entries(audioMap)) {
    if (lowerName.includes(keyword)) {
      audioManager.play(audioKey);
      return;
    }
  }
}

/**
 * Safely extract item name from an item instance or inventory slot.
 * Handles different data structures for item naming.
 *
 * @param {ItemInstance|null} itemInstance - The item instance object
 * @param {InventorySlot|null} inventorySlot - The inventory slot object
 * @returns {string} The item name, or empty string if not found
 */
function getItemName(itemInstance, inventorySlot) {
  if (itemInstance?.data?.name) return itemInstance.data.name;
  if (inventorySlot?.name) return inventorySlot.name;
  return '';
}

/**
 * Determine the appropriate styling for a battle log message.
 * Checks predefined patterns first, then checks for player/enemy names.
 *
 * @param {string} message - The message to style
 * @param {string} playerName - The player entity's name
 * @param {string} enemyName - The enemy entity's name
 * @returns {Object} Style configuration object with speaker, speed, and optional style properties
 * @returns {Object} returns.speaker - Speaker configuration for the typewriter
 * @returns {number} returns.speed - Typing speed for this message
 * @returns {string} [returns.wrapStyle] - Style preset to wrap the message
 * @returns {string} [returns.wrapEffect] - Effect to apply to the message
 * @returns {boolean} [returns.hasCritical] - Whether message contains critical hit
 */
function getMessageStyle(message, playerName, enemyName) {
  // Check predefined patterns
  for (const [key, config] of Object.entries(MESSAGE_STYLES)) {
    if (config.pattern.test(message)) {
      return {
        speaker: createSpeaker('', {
          orientation: config.orientation,
          showPrefix: false,
          color: config.color,
        }),
        speed: config.speed,
        wrapStyle: config.style,
        wrapEffect: config.effect,
      };
    }
  }

  // Player messages
  if (message.includes(playerName)) {
    return {
      speaker: createSpeaker(playerName, {
        orientation: 'left',
        color: '#4af',
        prefix: '',
        showPrefix: false,
      }),
      speed: 20,
      hasCritical: message.toLowerCase().includes('critical') || message.includes('!'),
    };
  }

  // Enemy messages
  if (message.includes(enemyName)) {
    return {
      speaker: createSpeaker(enemyName, {
        orientation: 'left',
        color: '#f44',
        prefix: '',
        showPrefix: false,
      }),
      speed: 20,
      hasCritical: message.toLowerCase().includes('critical') || message.includes('!'),
    };
  }

  // Default
  return {
    speaker: createSpeaker('', {
      orientation: 'left',
      showPrefix: false,
      color: '#aaa',
    }),
    speed: 20,
  };
}

/**
 * Apply inline styling to status effect keywords in a message.
 * Replaces keywords like "poison", "burn", "heal" with styled versions.
 *
 * @param {string} message - The message to process
 * @returns {string} Message with status effect keywords wrapped in style tags
 *
 * @example
 * applyStatusEffectStyles("You were hit by poison!")
 * // Returns: "You were hit by [color: #9c27b0, effect: fade]poison[/]!"
 */
function applyStatusEffectStyles(message) {
  let styled = message;
  for (const [keyword, config] of Object.entries(STATUS_EFFECT_STYLES)) {
    const regex = new RegExp(keyword, 'gi');
    styled = styled.replace(
      regex,
      `[color: ${config.color}, effect: ${config.effect}]${keyword}[/]`
    );
  }
  return styled;
}

/**
 * Apply styling for critical hit messages.
 * Makes "critical" text bold, red, and shaking, and highlights exclamation marks.
 *
 * @param {string} message - The message to process
 * @returns {string} Message with critical hit styling applied
 *
 * @example
 * applyCriticalStyles("Critical hit!")
 * // Returns: "[style: yelling, effect: shaking]CRITICAL[/] hit[color: #ff6600]![/]"
 */
function applyCriticalStyles(message) {
  let styled = message.replace(/critical/gi, '[style: yelling, effect: shaking]CRITICAL[/]');
  styled = styled.replace(/!/g, '[color: #ff6600]![/]');
  return styled;
}

/**
 * Attach mouseover/mouseout event handlers for status effect tooltips.
 * Positions the tooltip relative to the icon based on entity side (player/enemy).
 *
 * @param {HTMLImageElement} icon - The status icon element
 * @param {StatusEffect} effect - The status effect data
 * @param {'player'|'enemy'} prefix - Which entity the icon belongs to
 * @returns {void}
 */
function attachTooltipHandlers(icon, effect, prefix) {
  icon.addEventListener('mouseover', () => {
    const tooltip = document.getElementById('status-tooltip');
    const turnText = effect.duration === 1 ? 'turn -' : 'turns -';
    tooltip.textContent = `${effect.name}: ${effect.duration} ${turnText} ${effect.description}`;
    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';
    tooltip.style.visibility = 'visible';

    const rect = icon.getBoundingClientRect();
    const offset = 10;
    tooltip.style.left =
      prefix === 'player'
        ? `${rect.right + offset}px`
        : `${rect.left - tooltip.offsetWidth - offset}px`;
    tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;
  });

  icon.addEventListener('mouseout', () => {
    const tooltip = document.getElementById('status-tooltip');
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
  });
}

/**
 * Create a status effect icon element with tooltip functionality.
 *
 * @param {StatusEffect} effect - The status effect to create an icon for
 * @param {'player'|'enemy'} prefix - Which entity the icon belongs to
 * @returns {HTMLImageElement} The configured icon element
 */
function createStatusIcon(effect, prefix) {
  const icon = document.createElement('img');
  icon.src = effect.icon;
  icon.className = 'status-icon';
  icon.dataset.info = effect.description;
  attachTooltipHandlers(icon, effect, prefix);
  return icon;
}

/**
 * Build HTML markup for a single inventory item.
 *
 * @param {InventorySlot} inventorySlot - The inventory slot data
 * @param {number} index - The index in the inventory array
 * @returns {string} HTML string for the inventory item list element
 */
function buildInventoryItemHTML(inventorySlot, index) {
  const itemClass = getItemByName(inventorySlot.name);
  return `
    <li class="inventory-item interactive" data-item-index="${index}">
      <img src="${itemClass.data.spritePath}" alt="${inventorySlot.name}" class="inventory-item__icon">
      <div class="inventory-item__info">
        <div class="inventory-item__name">
          ${inventorySlot.name} 
          <span style="opacity: 0.6;">x${inventorySlot.quantity}</span>
          — 
          <span class="inventory-item__description">${itemClass.data.description}</span>
        </div>
      </div>
    </li>
  `;
}

/**
 * Build HTML markup for an empty inventory message.
 *
 * @returns {string} HTML string for the empty inventory display
 */
function buildEmptyInventoryHTML() {
  return `
    <li class="inventory-item" style="cursor: default; opacity: 0.6;">
      <div class="inventory-item__info" style="width: 100%; text-align: center;">
    <li class="inventory-item" style="cursor: default; opacity: 0.6; text-align: center;">
      <div class="inventory-item__info">
        <div class="inventory-item__description">Inventory is empty</div>
      </div>
    </li>
  `;
}

/**
 * Build the complete HTML markup for the inventory panel.
 * Includes the back button, scrollable list container, and all items.
 *
 * @param {InventorySlot[]} inventory - Array of inventory slots
 * @returns {string} Complete HTML string for the inventory container
 */
function buildInventoryHTML(inventory) {
  const itemsHTML =
    inventory.length === 0
      ? buildEmptyInventoryHTML()
      : inventory.map((slot, i) => buildInventoryItemHTML(slot, i)).join('');

  return `
    <div class="inventory-container">
      <div class="inventory-header">
        <button id="btn-inventory-back" class="action-btn action-btn--back">Back</button>
      </div>
      <div class="inventory-list-container">
        <ul class="inventory-list" id="inventory-list">
          ${itemsHTML}
        </ul>
      </div>
    </div>
  `;
}

/**
 * BattleSceneController - Manages the UI and battle logic for turn-based combat.
 *
 * This class is self-contained and handles:
 * - Turn order management based on entity speed
 * - Player action selection (attacks, items)
 * - Enemy AI decision making
 * - Inventory management and item usage
 * - Status effect processing and display
 * - Combat logging with styled typewriter text
 * - Win/loss condition checking
 *
 * @class
 *
 * @example
 * const battle = new BattleSceneController(
 *   playerEntity,
 *   enemyEntity,
 *   playerInventory,
 *   (winner) => {
 *     console.log(`${winner.name} won the battle!`);
 *   }
 * );
 */
export class BattleSceneController {
  /**
   * Create a new battle scene controller.
   *
   * @param {Entity} player - The player entity
   * @param {Entity} enemy - The enemy entity
   * @param {InventorySlot[]} [inventory=[]] - Player's inventory items
   * @param {Function} onBattleEnd - Callback when battle ends, receives winner entity
   */

  constructor(player, enemy, background, inventory = [], onBattleEnd) {
    /**
     * Callback function invoked when the battle ends
     * @type {Function}
     */
    this.onBattleEnd = onBattleEnd;
    /**
     * The player entity
     * @type {Entity}
     */
    this.player = player;

    /**
     * The enemy entity
     * @type {Entity}
     */

    this.enemy = enemy;

    // Read exploration header background
    const explBG = getComputedStyle(document.documentElement)
      .getPropertyValue('--exploration-header-bg')
      .trim();

    // Decide what background to use:
    // 1. prefer the passed-in background
    // 2. fallback to exploration bg
    const finalBG = background || explBG;

    if (finalBG) {
      document.documentElement.style.setProperty(
        '--battle-header-bg',
        `url('${finalBG.replace(/url\(|\)|"/g, '')}')`
      );
    }
    audioManager.stop('explore-scene');
    audioManager.play('battle-background', true);

    /**
     * Player's inventory of usable items
     * @type {InventorySlot[]}
     */
    this.inventory = inventory;

    /**
     * The entity whose turn is currently being processed
     * @type {Entity|null}
     */
    this.currentTurnEntity = null;

    /**
     * Whether a turn is currently being processed (prevents double actions)
     * @type {boolean}
     */
    this.isProcessingTurn = false;

    /**
     * Queue of entities in turn order
     * @type {Entity[]}
     */
    this.turnOrderQueue = [];

    /**
     * Current state of the UI
     * @type {UIState}
     */
    this.uiState = 'actions';

    /**
     * Currently selected item instance (for variable target items)
     * @type {ItemInstance|null}
     */
    this.selectedItem = null;

    /**
     * Index of the pending item in inventory (awaiting target selection)
     * @type {number|null}
     */
    this.pendingItem = null;

    /**
     * Reference to the typewriter text display component
     * @type {TypewriterTextbox|null}
     */
    this.typewriterController = null;

    this.initializeUI();
    this.setupEventListeners();
    this.startBattle();
  }

  /**
   * Initialize the battle UI with entity information.
   * Sets up player/enemy names, sprites, stats, and the typewriter controller.
   *
   * @returns {void}
   */
  initializeUI() {
    document.getElementById('player-name').textContent = this.player.name.toUpperCase();
    document.getElementById('player-sprite').src = this.player.image;

    document.getElementById('enemy-name').textContent = this.enemy.name.toUpperCase();
    document.getElementById('enemy-sprite').src = this.enemy.image;
    this.updateEntityStats();

    // Initialize typewriter controller
    this.typewriterController = document.getElementById('combat-log-text');
    this.typewriterController.init({
      defaultSpeed: 20,
      showCursor: false,
      autoAdvance: true,
      autoAdvanceDelay: 800,
    });

    this.showActionButtons();
  }

  /**
   * Set up event listeners for battle interactions.
   * Adds click handlers for target selection on entity sprites.
   *
   * @returns {void}
   */
  setupEventListeners() {
    // Listen for battle log updates
    // NOTE: battleEngine is not initialized, skipping log event binding
    // TODO: Initialize proper battle engine if needed

    // Add click listeners for target selection
    document.getElementById('player-sprite').addEventListener('click', () => {
      if (this.uiState === 'target-selection') {
        this.handleTargetSelection(this.player);
      }
    });
    document.getElementById('enemy-sprite').addEventListener('click', () => {
      if (this.uiState === 'target-selection') {
        this.handleTargetSelection(this.enemy);
      }
    });
  }

  /**
   * Start the battle by determining turn order and beginning the first turn.
   * Turn order is based on entity speed stats (higher speed goes first).
   *
   * @async
   * @returns {Promise<void>}
   */
  async startBattle() {
    // Initialize battle
    if (this.player.stats.SPEED >= this.enemy.stats.SPEED) {
      this.turnOrderQueue.push(this.player, this.enemy);
    } else {
      this.turnOrderQueue.push(this.enemy, this.player);
    }
    this.addLogEntry(`${this.player.name} vs ${this.enemy.name}`);

    // Start the first turn
    this.processNextTurn();
  }

  /**
   * Process a single turn for an entity.
   * Handles status effects at turn start/end and executes the chosen action.
   *
   * @async
   * @param {Entity} entity - The entity taking the turn
   * @param {Action} action - The action to perform
   * @param {Entity} target - The target entity for the action
   * @returns {Promise<void>} Resolves when the turn and animations are complete
   */
  async processTurn(entity, action, target) {
    this.addLogEntry(`--- ${entity.name}'s turn ---`);

    // 1. Process pre-turn status effects
    entity.processStatusEffectsTurnStart(this);

    // 2. Execute the action (waits for animation to complete)
    if (action) {
      await action.execute(entity, target, this);
    }

    // 3. Process post-turn status effects (decrements duration, removes expired effects)
    entity.processStatusEffectsTurnEnd(this);

    // 4. Check for win/loss conditions
    this.checkBattleEnd();
  }

  /**
   * Check if the battle has ended (player or enemy defeated).
   * Calls onBattleEnd callback with the winner if battle is over.
   *
   * @returns {void}
   */
  checkBattleEnd() {
    if (!this.player.isAlive()) {
      this.addLogEntry(`${this.enemy.name} wins!`);
      this.onBattleEnd(this.enemy);
    } else if (!this.enemy.isAlive()) {
      this.addLogEntry(`${this.player.name} wins!`);
      this.onBattleEnd(this.player);
    }
  }

  /**
   * Add a message to the battle log.
   * Alias for addLogEntry for external use.
   *
   * @param {string} message - The message to log
   * @returns {void}
   */
  logEvent(message) {
    this.addLogEntry(message);
  }

  /**
   * Process the next turn in the queue.
   * Waits for typewriter to finish, then either enables player actions
   * or processes the enemy's turn automatically.
   *
   * @async
   * @returns {Promise<void>}
   */
  async processNextTurn() {
    await this.waitForTypewriter();
    this.isProcessingTurn = true;

    this.currentTurnEntity = this.turnOrderQueue.shift();
    const isPlayerTurn = this.currentTurnEntity === this.player;

    if (isPlayerTurn) {
      this.showActionButtons();
      this.enableActionButtons();
      this.isProcessingTurn = false;
    } else {
      this.showActionButtons();
      this.disableActionButtons();
      await this.processEnemyTurn();
    }
  }

  async processEnemyTurn() {
    await new Promise((r) => setTimeout(r, 500));
    const moves = this.enemy.moves || [];
    const choice = moves[Math.floor(Math.random() * moves.length)] || moves[0];
    const AttackClass = getAttackByName(choice);
    if (AttackClass && this.player.isAlive()) {
      const attackInstance = new AttackClass();
      await this.processTurn(this.enemy, attackInstance, this.player);
      audioManager.play('enemy-hit');
      this.updateEntityStats();
      this.turnOrderQueue.push(this.currentTurnEntity);
      this.isProcessingTurn = false;
      this.checkBattleEnd();
      setTimeout(() => this.processNextTurn(), 500);
    } else {
      this.isProcessingTurn = false;
    }
  }

  showActionButtons() {
    const container = document.getElementById('action-container');

    this.uiState = 'actions';
    this.selectedItem = null;
    this.pendingItem = null;

    // Remove target selection highlights
    document.getElementById('player-sprite').classList.remove('target-selectable');
    document.getElementById('enemy-sprite').classList.remove('target-selectable');

    if (this.currentTurnEntity === this.player) {
      audioManager.play('button-click');
      const attacks = this.player.moves;

      let attackButton1 = `<button id="btn-attack-1" class="action-btn action-btn--primary">${attacks[0]}</button>`;
      let attackButton2 = `<button id="btn-attack-2" class="action-btn action-btn--primary">${attacks[1]}</button>`;

      container.innerHTML = `
                <div class="action-buttons-container">
                    ${attackButton1}
                    ${attackButton2}
                    <button id="btn-inventory" class="action-btn action-btn--primary">Inventory</button>
                </div>
            `;

      // Add event listeners
      document.getElementById('btn-attack-1').addEventListener('click', () => {
        const attackName = getAttackByName(attacks[0]);
        const attackInstance = new attackName();
        this.handleActionClick(attackInstance);
      });
      document.getElementById('btn-attack-2').addEventListener('click', () => {
        const attackName = getAttackByName(attacks[1]);
        const attackInstance = new attackName();
        this.handleActionClick(attackInstance);
      });
      document.getElementById('btn-inventory').addEventListener('click', () => {
        this.showInventory();
      });
    } else {
      // Show waiting message during enemy turn
      container.innerHTML = `
                <div class="action-buttons-container">
                    <button class="action-btn action-btn--primary" disabled>Waiting for enemy turn...</button>
                </div>
            `;
    }
  }

  /**
   * Display the inventory panel.
   * Shows all items with their icons, names, quantities, and descriptions.
   * Items can be clicked to use them.
   *
   * @returns {void}
   */
  showInventory() {
    audioManager.play('inventory');
    const container = document.getElementById('action-container');

    this.uiState = 'inventory';
    this.selectedItem = null;
    this.pendingItem = null;
    this._removeTargetHighlights();

    container.innerHTML = buildInventoryHTML(this.inventory);

    document.getElementById('btn-inventory-back').addEventListener('click', () => {
      this.showActionButtons();
    });

    document.querySelectorAll('.inventory-item').forEach((itemEl, index) => {
      itemEl.addEventListener('click', () => this.selectInventoryItem(index));
    });
  }

  /**
   * Remove target selection highlight classes from entity sprites.
   *
   * @private
   * @returns {void}
   */
  _removeTargetHighlights() {
    document.getElementById('player-sprite').classList.remove('target-selectable');
    document.getElementById('enemy-sprite').classList.remove('target-selectable');
  }

  /**
   * Handle selection of an inventory item.
   * If item requires target selection, shows target selection UI.
   * Otherwise, uses the item on its default target.
   *
   * @async
   * @param {number} index - Index of the selected item in inventory
   * @returns {Promise<void>}
   */
  async selectInventoryItem(index) {
    audioManager.play('button-click');
    if (this.isProcessingTurn) {
      return;
    }

    const inventorySlot = this.inventory[index];
    const itemClass = getItemByName(inventorySlot.name);
    const itemInstance = new itemClass();

    // Store the item instance and inventory index
    this.selectedItem = itemInstance;
    this.pendingItem = index;

    // Check if item needs target selection
    if (itemInstance.data.isVariableTarget) {
      this.showTargetSelection();
    } else {
      // Use default target
      const defaultTarget = itemInstance.data.defaultTarget === 1 ? this.enemy : this.player;
      await this.executeItem(defaultTarget);
    }
  }

  /**
   * Display the target selection UI.
   * Highlights entity sprites as clickable targets and shows cancel button.
   *
   * @returns {void}
   */
  showTargetSelection() {
    audioManager.play('button-click');
    const container = document.getElementById('action-container');
    this.uiState = 'target-selection';

    container.innerHTML = `
            <div class="target-selection-container">
                <button id="btn-target-cancel" class="action-btn action-btn--back">Cancel</button>
                <p class="target-selection-text">Select target for ${this.selectedItem.name}</p>
            </div>
        `;

    document.getElementById('btn-target-cancel').addEventListener('click', () => {
      this.selectedItem = null;
      this.pendingItem = null;
      this.showInventory();
    });

    document.getElementById('player-sprite').classList.add('target-selectable');
    document.getElementById('enemy-sprite').classList.add('target-selectable');
  }

  /**
   * Handle target selection for a variable-target item.
   * Validates state and executes the item on the selected target.
   *
   * @async
   * @param {Entity} target - The selected target entity
   * @returns {Promise<void>}
   */
  async handleTargetSelection(target) {
    if (this.selectedItem === null || this.pendingItem === null || this.isProcessingTurn) {
      return;
    }

    document.getElementById('player-sprite').classList.remove('target-selectable');
    document.getElementById('enemy-sprite').classList.remove('target-selectable');

    await this.executeItem(target);
  }

  /**
   * Execute the selected item on a target.
   * Processes the turn, decrements item quantity, and advances to next turn.
   *
   * @async
   * @param {Entity} target - The target entity for the item
   * @returns {Promise<void>}
   */
  async executeItem(target) {
    this.isProcessingTurn = true;
    this.disableActionButtons();

    const inventoryIndex = this.pendingItem;
    const itemInstance = this.selectedItem;
    const inventorySlot = this.inventory[inventoryIndex];

    try {
      const itemName = getItemName(itemInstance, inventorySlot);
      playAudioForName(itemName, ITEM_AUDIO_MAP);
    } catch (e) {
      console.warn('Audio play skipped — could not determine item name.', e);
    }

    // Execute the item
    await this.processTurn(this.player, itemInstance, target);

    // Wait for all typewriter messages to finish
    await this.waitForTypewriter();

    // Decrement quantity and remove from inventory if needed
    inventorySlot.quantity -= 1;
    if (inventorySlot.quantity <= 0) {
      this.inventory.splice(inventoryIndex, 1);
    }

    this.updateEntityStats();

    // Clear selected item
    this.selectedItem = null;
    this.pendingItem = null;

    // Rotate turn order
    this.turnOrderQueue.push(this.currentTurnEntity);
    this.isProcessingTurn = false;
    this.showActionButtons();

    setTimeout(() => this.processNextTurn(), 500);
  }

  /**
   * Handle click on an attack action button.
   * Executes the attack, waits for animations, and advances to next turn.
   *
   * @async
   * @param {Action} action - The attack action to execute
   * @returns {Promise<void>}
   */
  async handleActionClick(action) {
    if (this.isProcessingTurn || this.currentTurnEntity !== this.player) return;

    this.disableActionButtons();

    this.isProcessingTurn = true;
    await this.processTurn(this.player, action, this.enemy);

    // Wait for all typewriter messages to finish
    await this.waitForTypewriter();
    try {
      playAudioForName(action.name, ATTACK_AUDIO_MAP);
    } catch (e) {
      console.warn('Attack sound skipped', e);
    }
    this.updateEntityStats();

    this.turnOrderQueue.push(this.currentTurnEntity);

    this.isProcessingTurn = false;

    this.checkBattleEnd();
    setTimeout(() => this.processNextTurn(), 500);
  }

  /**
   * Enable all action buttons (except special cases).
   *
   * @returns {void}
   */
  enableActionButtons() {
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach((btn) => {
      if (!btn.disabled && btn.id !== 'btn-use-item') {
        btn.disabled = false;
      }
    });
  }

  /**
   * Disable all action buttons to prevent input during processing.
   *
   * @returns {void}
   */
  disableActionButtons() {
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach((btn) => (btn.disabled = true));
  }

  /**
   * Update the HP bars and status icons for both entities.
   *
   * @returns {void}
   */
  updateEntityStats() {
    this._updateEntityUI('player', this.player);
    this._updateEntityUI('enemy', this.enemy);
  }

  /**
   * Update the UI elements for a single entity (HP bar and status icons).
   *
   * @private
   * @param {'player'|'enemy'} prefix - The entity prefix for DOM element IDs
   * @param {Entity} entity - The entity to update UI for
   * @returns {void}
   */
  _updateEntityUI(prefix, entity) {
    // Update HP bar
    const hpBar = document.getElementById(`${prefix}-hp`);
    const hpText = document.getElementById(`${prefix}-hp-text`);
    const hpMax = document.getElementById(`${prefix}-hp-max`);

    hpBar.max = entity.maxHP;
    hpBar.value = entity.currentHP;
    hpText.textContent = entity.currentHP;
    hpMax.textContent = entity.maxHP;

    // Update status icons
    const iconContainer = document.getElementById(`${prefix}-status-icons`);
    iconContainer.innerHTML = '';

    entity.activeEffects.forEach((effect) => {
      const icon = createStatusIcon(effect, prefix);
      iconContainer.appendChild(icon);
    });
  }

  /**
   * Add a styled message to the battle log using the typewriter component.
   * Automatically applies styling based on message content.
   *
   * @param {string} message - The message to add to the log
   * @returns {void}
   */
  addLogEntry(message) {
    if (!this.typewriterController) return;

    const styleConfig = getMessageStyle(message, this.player.name, this.enemy.name);
    let styledMessage = message;

    // Apply wrapper style if specified
    if (styleConfig.wrapStyle || styleConfig.wrapEffect) {
      const styleStr = [
        styleConfig.wrapStyle ? `style: ${styleConfig.wrapStyle}` : '',
        styleConfig.wrapEffect ? `effect: ${styleConfig.wrapEffect}` : '',
      ]
        .filter(Boolean)
        .join(', ');
      styledMessage = `[${styleStr}]${message}[/]`;
    }

    // Apply critical styling if needed
    if (styleConfig.hasCritical) {
      styledMessage = applyCriticalStyles(styledMessage);
    }

    // Apply status effect styling
    styledMessage = applyStatusEffectStyles(styledMessage);

    this.typewriterController.queue(styledMessage, {
      speed: styleConfig.speed,
      speaker: styleConfig.speaker,
    });
  }

  /**
   * Wait for the typewriter to finish displaying all queued messages.
   * Polls the typewriter state until queue is empty and not active.
   *
   * @async
   * @returns {Promise<void>} Resolves when all messages have been displayed
   */
  async waitForTypewriter() {
    while (this.typewriterController.getQueueLength() > 0 || this.typewriterController.isActive()) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
