// Import battle system classes
import { getAttackByName } from '../../gameplay/definitions/attacks/attackRegistry.js';
import { getItemByName } from '../../gameplay/definitions/items/itemRegistry.js';

/**
 * BattleSceneController - Manages the UI and connects it to the battle engine
 * This class should be instantiated from the calling page with a BattleSequence
 */
export class BattleSceneController {
    constructor(battleSequence, inventory = []) {
        this.battleSequence = battleSequence;
        this.battleEngine = battleSequence.getBattleEngine();
        this.player = battleSequence.player;
        this.enemy = battleSequence.enemy;
        this.inventory = inventory; // Separate inventory array
        this.currentTurnEntity = null;
        this.turnCount = 0;
        this.isProcessingTurn = false;

        // UI state management
        this.uiState = 'actions'; // 'actions', 'inventory', 'target-selection'
        this.selectedItem = null;
        this.pendingItem = null; // Item waiting for target selection

        // Apply flex layout to the main battle container for proper scaling
        const battleContainer = document.querySelector('.battle-container');
        if (battleContainer) {
            battleContainer.style.display = 'flex';
            battleContainer.style.flexDirection = 'column';
            battleContainer.style.height = '100vh'; // Ensure container fills viewport height
        }
        this.initializeUI();
        this.setupEventListeners();
        this.startBattle();
    }

    initializeUI() {
        // Set player info
        document.getElementById('player-name').textContent = this.player.name.toUpperCase();
        document.getElementById('player-sprite').src = this.player.image;

        // Set enemy info
        document.getElementById('enemy-name').textContent = this.enemy.name.toUpperCase();
        document.getElementById('enemy-sprite').src = this.enemy.image;
        this.updateEntityStats();

        // Initialize action panel
        this.showActionButtons();
    }

    setupEventListeners() {
        const music = document.getElementById('battle-background');
        music.play().catch(err => console.log(err));
        // Listen for battle log updates
        const originalLogEvent = this.battleEngine.logEvent.bind(this.battleEngine);
        this.battleEngine.logEvent = (message) => {
            originalLogEvent(message);
            this.addLogEntry(message);
        };

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
        // Start the battle sequence
        const battlePromise = this.battleSequence.start();

        // Handle battle end
        battlePromise.then(result => {
            this.handleBattleEnd(result);
        });

        // Start the first turn
        this.processNextTurn();
    }

    async processNextTurn() {
        if (!this.battleSequence.isActive() || this.isProcessingTurn) {
            return;
        }

        // Check if battle ended
        if (!this.player.isAlive() || !this.enemy.isAlive()) {
            return;
        }

        this.isProcessingTurn = true;
        this.turnCount++;

        // Get the current entity from turn order
        let turnOrder = this.battleEngine.turnOrderQueue;
        if (turnOrder.length === 0) {
            this.battleEngine.determineTurnOrder();
            turnOrder = this.battleEngine.turnOrderQueue;
        }

        // Find next alive entity in queue
        let nextEntity = null;
        for (const entity of turnOrder) {
            if (entity.isAlive()) {
                nextEntity = entity;
                break;
            }
        }

        // If no alive entity found, end battle
        if (!nextEntity) {
            this.isProcessingTurn = false;
            return;
        }

        // Rotate queue so next entity is first
        while (turnOrder[0] !== nextEntity) {
            turnOrder.push(turnOrder.shift());
        }

        this.currentTurnEntity = nextEntity;
        const isPlayerTurn = this.currentTurnEntity === this.player;

        // Update UI to show whose turn it is
        if (isPlayerTurn) {
            this.showActionButtons();
            this.enableActionButtons();
            this.isProcessingTurn = false; // Allow player to make a choice
        } else {
            this.showActionButtons();
            this.disableActionButtons();
            await this.processEnemyTurn();
        }
    }

    async processEnemyTurn() {
        // at some point we should make this a global variable then they can chooes to speed up or slow down enemy turns
        await new Promise(r => setTimeout(r, 1000));
        // Simple AI: Use first available action on player
        const attackName = getAttackByName(this.enemy.moves[0]);
        if (attackName && this.player.isAlive()) {
            const attackInstance = new attackName();
            await this.battleSequence.processTurn(this.enemy, attackInstance, this.player);
            this.updateEntityStats();

            // Rotate turn order: move current entity to end
            this.battleEngine.turnOrderQueue.push(this.battleEngine.turnOrderQueue.shift());

            this.isProcessingTurn = false;

            // Continue to next turn if battle is still active
            if (this.battleSequence.isActive() && this.player.isAlive() && this.enemy.isAlive()) {
                setTimeout(() => this.processNextTurn(), 1000);
            }
        } else {
            this.isProcessingTurn = false;
        }
    }

    showActionButtons() {
        const container = document.getElementById('action-container');
        // Allow container to size to its content
        container.style.flex = '0 0 auto';

        this.uiState = 'actions';
        this.selectedItem = null;
        this.pendingItem = null;

        // Show combat log
        document.getElementById('combat-log').style.display = '';

        // Remove target selection highlights
        document.getElementById('player-sprite').classList.remove('target-selectable');
        document.getElementById('enemy-sprite').classList.remove('target-selectable');

        if (this.currentTurnEntity === this.player) {
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
        const container = document.getElementById('action-container');
        this.uiState = 'inventory';
        this.selectedItem = null;
        this.pendingItem = null;

        // Remove target selection highlights
        document.getElementById('player-sprite').classList.remove('target-selectable');
        document.getElementById('enemy-sprite').classList.remove('target-selectable');

        // Hide combat log
        document.getElementById('combat-log').style.display = 'none';


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

        // Execute the item
        await this.battleSequence.processTurn(this.player, itemInstance, target);

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
        this.battleEngine.turnOrderQueue.push(this.battleEngine.turnOrderQueue.shift());
        this.isProcessingTurn = false;
        this.showActionButtons();

        // Continue to next turn if battle is still active
        if (this.battleSequence.isActive() && this.player.isAlive() && this.enemy.isAlive()) {
            setTimeout(() => this.processNextTurn(), 1000);
        }
    }

    async handleActionClick(action) {
        if (this.isProcessingTurn || this.currentTurnEntity !== this.player || !this.battleSequence.isActive()) {
            return;
        }

        this.isProcessingTurn = true;
        this.disableActionButtons();

        // Process the turn
        await this.battleSequence.processTurn(this.player, action, this.enemy);

        // Update UI
        this.updateEntityStats();

        // Rotate turn order: move current entity to end
        this.battleEngine.turnOrderQueue.push(this.battleEngine.turnOrderQueue.shift());

        this.completePlayerTurn();
    }

    completePlayerTurn() {
        this.isProcessingTurn = false;

        // Continue to next turn if battle is still active
        if (this.battleSequence.isActive() && this.player.isAlive() && this.enemy.isAlive()) {
            setTimeout(() => this.processNextTurn(), 1000);
        }
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
        const logContent = document.getElementById('combat-log-content');
        const entry = document.createElement('p');
        entry.className = 'combat-log__entry';

        // Determine entry style based on message content
        if (message.includes('wins!') || message.includes('victory')) {
            entry.className += ' combat-log__entry--victory';
        } else if (message.includes('defeated') || message.includes('loses')) {
            entry.className += ' combat-log__entry--defeat';
        } else if (message.includes(this.player.name)) {
            entry.className += ' combat-log__entry--player';
        } else if (message.includes(this.enemy.name)) {
            entry.className += ' combat-log__entry--enemy';
        }

        entry.textContent = message;
        logContent.appendChild(entry);

        // Auto-scroll to bottom
        const combatLog = document.getElementById('combat-log');
        combatLog.scrollTop = combatLog.scrollHeight;
    }

    handleBattleEnd(result) {
        this.disableActionButtons();
        this.addLogEntry(`Battle ended! ${result.winner.name} is victorious!`);

        // Disable further interactions
        this.isProcessingTurn = true;
    }
}
