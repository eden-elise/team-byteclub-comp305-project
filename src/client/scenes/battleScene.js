import { getAttackByName } from '../../gameplay/definitions/attackRegistry.js';
import { getItemByName } from '../../gameplay/definitions/itemRegistry.js';
import '../components/TypewriterTextbox.js';
import { createSpeaker } from '../components/TypewriterTextbox.js';
import { audioManager } from "../utils/AudioManager.js";

/**
 * BattleSceneController - Manages the UI and battle logic independently
 * This class is now self-contained and doesn't require external engine classes
 */
export class BattleSceneController {
    constructor(player, enemy, inventory = [], onBattleEnd) {
        this.onBattleEnd = onBattleEnd;

        this.player = player;
        this.enemy = enemy;
        audioManager.play('battle-background', true);  // Start battle music looping
        
        this.inventory = inventory; // Separate inventory array
        this.currentTurnEntity = null;
        this.isProcessingTurn = false;

        // Battle state
        this.turnOrderQueue = []; // List<Entity>

        // UI state management
        this.uiState = 'actions'; // 'actions', 'inventory', 'target-selection'
        this.selectedItem = null;
        this.pendingItem = null; // Item waiting for target selection
        
        // Typewriter controller
        this.typewriterController = null;

        this.initializeUI();
        this.setupEventListeners();
        this.startBattle();
    }

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
            autoAdvanceDelay: 800
        });

        this.showActionButtons();
    }

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
     * Process a single turn for an entity
     * @param {Entity} entity - The entity taking the turn
     * @param {Action} action - The action to perform
     * @param {Entity} target - The target entity
     * @returns {Promise} Promise that resolves when the turn and animations are complete
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

    // Check battle end
    checkBattleEnd() {
        if (!this.player.isAlive()) {
            this.addLogEntry(`${this.enemy.name} wins!`);
            this.onBattleEnd(this.enemy);
        } else if (!this.enemy.isAlive()) {
            this.addLogEntry(`${this.player.name} wins!`);
            this.onBattleEnd(this.player);
        }
    }

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
        // at some point we should make this a global variable then they can chooes to speed up or slow down enemy turns
        await new Promise(r => setTimeout(r, 500));
        // Simple AI: Use first available action on player
        const attackName = getAttackByName(this.enemy.moves[0]);
        if (attackName && this.player.isAlive()) {
            const attackInstance = new attackName();
            await this.processTurn(this.enemy, attackInstance, this.player);
            
            audioManager.play("enemy-hit");
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
            audioManager.play("button-click");
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
            document.getElementById('btn-inventory').addEventListener('click', () => { this.showInventory();});
        } else {
            // Show waiting message during enemy turn
            container.innerHTML = `
                <div class="action-buttons-container">
                    <button class="action-btn action-btn--primary" disabled>Waiting for enemy turn...</button>
                </div>
            `;
        }
    }

    showInventory() {
        audioManager.play("inventory");
        const container = document.getElementById('action-container');
        this.uiState = 'inventory';
        this.selectedItem = null;
        this.pendingItem = null;

        // Remove target selection highlights
        document.getElementById('player-sprite').classList.remove('target-selectable');
        document.getElementById('enemy-sprite').classList.remove('target-selectable');


        // Build inventory list HTML
        let inventoryHTML = `
            <div class="inventory-container">
                <div class="inventory-header">
                    <button id="btn-inventory-back" class="action-btn action-btn--back">Back</button>
                </div>
                <div class="inventory-list-container">
                    <ul class="inventory-list" id="inventory-list">
        `;

        if (this.inventory.length === 0) {
            inventoryHTML += `
                <li class="inventory-item" style="cursor: default; opacity: 0.6;">
                    <div class="inventory-item__info" style="width: 100%; text-align: center;">
                <li class="inventory-item" style="cursor: default; opacity: 0.6; text-align: center;">
                    <div class="inventory-item__info">
                        <div class="inventory-item__description">Inventory is empty</div>
                    </div>
                </li>
            `;
        } else {
            this.inventory.forEach((inventorySlot, index) => {
                const itemClass = getItemByName(inventorySlot.name);
                inventoryHTML += `
                    <li class="inventory-item" data-item-index="${index}">
                        <img src="${itemClass.data.spritePath}" alt="${inventorySlot.name}" class="inventory-item__icon">
                        <div class="inventory-item__info">
                            <div class="inventory-item__name">
                                ${inventorySlot.name} 
                                <span style="opacity: 0.6;">
                                    x${inventorySlot.quantity}
                                </span>
                                     — 
                                <span class="inventory-item__description">${itemClass.data.description}</span>
                            </div>
                        </div>
                    </li>
                `;
            });
        }

        inventoryHTML += `
                    </ul>
                </div>
            </div>
        `;

        container.innerHTML = inventoryHTML;

        // Add event listeners
        document.getElementById('btn-inventory-back').addEventListener('click', () => {
            // Revert container height when going back
            this.showActionButtons();
        });

        // Add click listeners to inventory items
        document.querySelectorAll('.inventory-item').forEach((itemEl, index) => {
            itemEl.addEventListener('click', () => {
                this.selectInventoryItem(index);
            });
        });
    }

    async selectInventoryItem(index) {
        audioManager.play("button-click");
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

    showTargetSelection() {
        audioManager.play("button-click");
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

    async handleTargetSelection(target) {
        if (this.selectedItem === null || this.pendingItem === null || this.isProcessingTurn) {
            return;
        }

        document.getElementById('player-sprite').classList.remove('target-selectable');
        document.getElementById('enemy-sprite').classList.remove('target-selectable');

        await this.executeItem(target);
    }

    async executeItem(target) {

        this.isProcessingTurn = true;
        this.disableActionButtons();

        const inventoryIndex = this.pendingItem;
        const itemInstance = this.selectedItem;
        const inventorySlot = this.inventory[inventoryIndex];

        try {
            const itemName = (itemInstance && itemInstance.data && itemInstance.data.name)
                ? itemInstance.data.name.toLowerCase()
                : (inventorySlot && inventorySlot.name ? inventorySlot.name.toLowerCase() : '');

            if (itemName.includes("health")) audioManager.play("health-potion");
            else if (itemName.includes("poison")) audioManager.play("poison-potion");
            else if (itemName.includes("fire")) audioManager.play("fire-potion");
            else if (itemName.includes("mystery")) audioManager.play("mystery-potion");
            // else: no potion keyword matched — don't play a potion SFX (keeps behavior unchanged)
        } catch (e) {
            // Defensive: log if something unexpected happened (won't break game)
            console.warn("Audio play skipped — could not determine item name.", e);
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

    async handleActionClick(action) {
        if (this.isProcessingTurn || this.currentTurnEntity !== this.player) return;

        this.disableActionButtons();

        this.isProcessingTurn = true;
        await this.processTurn(this.player, action, this.enemy);
        
        // Wait for all typewriter messages to finish
        await this.waitForTypewriter();
        try {
            const attackName = action.name.toLowerCase();
            if (attackName.includes("strike")) audioManager.play("mp-strike");
            else if (attackName.includes("heavy")) audioManager.play("mp-heavy");
        } catch (e) {
            console.warn("Attack sound skipped", e);
        }

        this.updateEntityStats();

        this.turnOrderQueue.push(this.currentTurnEntity);

        this.isProcessingTurn = false;

        this.checkBattleEnd();
        setTimeout(() => this.processNextTurn(), 500);
    }

    enableActionButtons() {
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            if (!btn.disabled && btn.id !== 'btn-use-item') {
                btn.disabled = false;
            }
        });
    }

    disableActionButtons() {
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(btn => btn.disabled = true);
    }

    updateEntityStats() {
        ['player', 'enemy'].forEach(prefix => {
            const entity = prefix === 'player' ? this.player : this.enemy;
            // update hp
            const hpBar = document.getElementById(`${prefix}-hp`);
            const hpText = document.getElementById(`${prefix}-hp-text`);
            const hpMax = document.getElementById(`${prefix}-hp-max`);

            hpBar.max = entity.maxHP;
            hpBar.value = entity.currentHP;
            hpText.textContent = entity.currentHP;
            hpMax.textContent = entity.maxHP;

            const iconContainer = document.getElementById(`${prefix}-status-icons`);
            iconContainer.innerHTML = '';

            entity.activeEffects.forEach(effect => {
                const icon = document.createElement('img');
                icon.src = effect.icon;
                icon.className = 'status-icon';
                icon.dataset.info = effect.description;

                icon.addEventListener('mouseover', () => {
                    const tooltip = document.getElementById('status-tooltip');
                    tooltip.textContent = effect.name + ': ' + effect.duration + (effect.duration === 1 ? 'turn -' : 'turns -') + effect.description;
                    tooltip.style.display = 'block';
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';

                    const rect = icon.getBoundingClientRect();
                    const offset = 10;
                    if (prefix === 'player') {
                        tooltip.style.left = `${rect.right + offset}px`;
                    } else {
                        tooltip.style.left = `${rect.left - tooltip.offsetWidth - offset}px`;
                    }
                    tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;
                });

                icon.addEventListener('mouseout', () => {
                    const tooltip = document.getElementById('status-tooltip');
                    tooltip.style.display = 'none';
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                });

                iconContainer.appendChild(icon);
            });

        });
    }

    addLogEntry(message) {
        if (!this.typewriterController) return;
        
        // Determine speaker and styling based on message content
        let speaker = null;
        let styledMessage = message;
        let speed = 20;
        
        // Turn indicator messages - centered
        if (message.includes("'s turn")) {
            styledMessage = `[style: important]${message}[/]`;
            speaker = createSpeaker('', {
                orientation: 'center',
                showPrefix: false,
                color: '#ffaa00'
            });
            speed = 15;
        }
        // Victory/Defeat messages - centered with special effects
        else if (message.includes('wins!') || message.includes('victory') || message.includes('victorious')) {
            styledMessage = `[style: important, effect: glowing]${message}[/]`;
            speaker = createSpeaker('', {
                orientation: 'center',
                showPrefix: false,
                color: '#ffd700'
            });
            speed = 30;
        } 
        // Defeat messages
        else if (message.includes('defeated') || message.includes('loses')) {
            styledMessage = `[color: #ff4444, style: yelling]${message}[/]`;
            speaker = createSpeaker('', {
                orientation: 'center',
                showPrefix: false
            });
            speed = 25;
        }
        // Player action messages - left aligned
        else if (message.includes(this.player.name)) {
            // Check for special effects like critical hits or status effects
            if (message.toLowerCase().includes('critical') || message.includes('!')) {
                styledMessage = message.replace(/critical/gi, '[style: yelling, effect: shaking]CRITICAL[/]');
                styledMessage = styledMessage.replace(/!/g, '[color: #ff6600]![/]');
            }
            speaker = createSpeaker(this.player.name, {
                orientation: 'left',
                color: '#4af',
                prefix: '',
                showPrefix: false
            });
        }
        // Enemy action messages - left aligned
        else if (message.includes(this.enemy.name)) {
            // Check for special effects
            if (message.toLowerCase().includes('critical') || message.includes('!')) {
                styledMessage = message.replace(/critical/gi, '[style: yelling, effect: shaking]CRITICAL[/]');
                styledMessage = styledMessage.replace(/!/g, '[color: #ff6600]![/]');
            }
            speaker = createSpeaker(this.enemy.name, {
                orientation: 'left',
                color: '#f44',
                prefix: '',
                showPrefix: false
            });
        }
        // Generic messages - left aligned
        else {
            speaker = createSpeaker('', {
                orientation: 'left',
                showPrefix: false,
                color: '#aaa'
            });
        }
        
        // Add status effect messages with special styling
        if (message.toLowerCase().includes('poison') || message.toLowerCase().includes('burn')) {
            styledMessage = styledMessage.replace(/poison/gi, '[color: #9c27b0, effect: fade]poison[/]');
            styledMessage = styledMessage.replace(/burn/gi, '[color: #ff5722, effect: waving]burn[/]');
        }
        if (message.toLowerCase().includes('heal')) {
            styledMessage = styledMessage.replace(/heal/gi, '[color: #4caf50, effect: glowing]heal[/]');
        }
        
        this.typewriterController.queue(styledMessage, {
            speed: speed,
            speaker: speaker
        });
    }

    //Wait for the typewriter to finish displaying all queued messages
    async waitForTypewriter() {
        while (this.typewriterController.getQueueLength() > 0 || this.typewriterController.isActive()) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
