/**
 * ExplorationSceneController - Manages the exploration UI and room events
 * This class handles dialogue, choices, character animations, and room progression
 */
import '../components/TypewriterTextbox.js';
import { getRoomById } from '../../gameplay/exploration/roomRegistry.js';
import { gameState } from '../../gameplay/state/GameState.js';

export class ExplorationSceneController {
    constructor(room, player, startEventIndex = 0) {
        this.room = room;
        this.player = player;
        this.currentEventIndex = startEventIndex;
        this.isProcessingEvent = false;
        
        // Track entities by position
        this.entities = {
            left: null,
            right: null
        };
        
        // Typewriter controller
        this.typewriterController = null;

        this.initializeUI();
        this.startRoom();
    }

    initializeUI() {
        // Both sections start hidden - entities will be shown via entity-enter events
        const playerSection = document.getElementById('player-section');
        const npcSection = document.getElementById('npc-section');
        playerSection.style.visibility = 'hidden';
        npcSection.style.visibility = 'hidden';

        // Initialize typewriter controller
        const oldDialogueText = document.getElementById('dialogue-text');
        this.typewriterController = document.createElement('typewriter-textbox');
        this.typewriterController.id = 'dialogue-text';
        this.typewriterController.className = 'dialogue-panel__text';
        this.typewriterController.init({
            defaultSpeed: 30
        });
        this.typewriterController.style.height = '150px'; // Set default height

        if (oldDialogueText) {
            oldDialogueText.replaceWith(this.typewriterController);
        }
        
        document.getElementById('choice-container').innerHTML = '';
    }

    async startRoom() {
        // Process the first event
        await this.processNextEvent();
    }

    async processNextEvent() {
        if (this.isProcessingEvent) {
            return;
        }

        // Check if we've processed all events
        if (this.currentEventIndex >= this.room.events.length) {
            this.handleRoomComplete();
            return;
        }

        this.isProcessingEvent = true;
        const event = this.room.events[this.currentEventIndex];
        
        // Process event based on type
        await this.handleEvent(event);

        // If the event is a choice or battle, we pause execution here.
        // The choice handler will trigger the next event manually.
        // The battle handler will reload the scene, so we don't need to continue.
        if (event.type === 'choice' || event.type === 'battle') {
            if (event.type === 'choice') {
                 this.currentEventIndex++;
            }
            this.isProcessingEvent = false;
            return;
        }

        this.currentEventIndex++;
        this.isProcessingEvent = false;

        // Chain the next event
        this.processNextEvent();
    }

    async handleEvent(event) {
        switch (event.type) {
            case 'dialogue':
                await this.showDialogue(event.params);
                break;
            case 'choice':
                await this.showChoices(event.params);
                break;
            case 'entity-enter':
                await this.entityEnter(event.params);
                break;
            case 'entity-leave':
                await this.entityLeave(event.params);
                break;
            case 'background-change':
                await this.changeBackground(event.params);
                break;
            case 'battle':
                await this.handleBattle(event.params);
                break;
            default:
                console.warn(`Unknown event type: ${event.type}`);
                await this.processNextEvent();
        }
    }

    async handleBattle(params) {
        const { enemy } = params;
        
        // Save current state: room, event index to resume after battle
        const currentFloor = gameState.currentSaveData?.world?.currentFloor || 'floor-1';
        if (gameState.currentSaveData && gameState.currentSaveData.world) {
            gameState.currentSaveData.world.currentRoom = this.room.id;
            gameState.currentSaveData.world.currentEventIndex = this.currentEventIndex + 1;
            gameState.saveGame();
        }

        // Start battle
        if (window.gameApp && window.gameApp.startBattle) {
            await window.gameApp.startBattle(enemy, async () => {
                // On win, return to exploration at the same room, next event
                console.log(`Battle won! Resuming room ${this.room.id} at event ${this.currentEventIndex + 1}`);
                await window.gameApp.startFloorExploration(currentFloor);
            });
        } else {
            console.error('GameApp not initialized');
        }
    }

    async showDialogue(params) {
        const { text, speed, speaker } = params;

        // Clear choices while dialogue is showing
        document.getElementById('choice-container').innerHTML = '';

        // Use typewriter controller to display text
        await new Promise(resolve => {
            this.typewriterController.queue(text, {
                speed: speed || 30,
                speaker: speaker,
                waitForInput: true,
                onComplete: resolve
            });
        });

        // Auto-continue to next event after dialogue finishes
        await new Promise(resolve => setTimeout(resolve, 500));
    }


    async showChoices(params) {
        const { choices } = params;
        
        // Resize textbox to make room for choices
        await this.typewriterController.resize('300px');

        const choiceContainer = document.getElementById('choice-container');
        choiceContainer.innerHTML = '';

        // Create a button for each choice
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.addEventListener('click', () => {
                this.handleChoiceClick(choice, index);
            });
            choiceContainer.appendChild(button);
        });
    }

    async handleChoiceClick(choice, index) {
        // Clear choices
        document.getElementById('choice-container').innerHTML = '';

        // Resize textbox back to default
        await this.typewriterController.resize('150px');

        // Execute choice callback if provided
        if (choice.callback) {
            await choice.callback(this);
        }

        // Continue to next event
        await this.processNextEvent();
    }

    async entityEnter(params) {
        const { entity, position, animation } = params;
        
        // Handle special 'player' keyword
        const actualEntity = entity === 'player' ? this.player : entity;
        
        this.entities[position] = actualEntity;
        
        // Determine which section to use
        const isLeft = position === 'left';
        const sectionId = isLeft ? 'player-section' : 'npc-section';
        const nameId = isLeft ? 'player-name' : 'npc-name';
        const spriteId = isLeft ? 'player-sprite' : 'npc-sprite';
        
        const section = document.getElementById(sectionId);
        const nameElement = document.getElementById(nameId);
        const spriteElement = document.getElementById(spriteId);
        
        // Set entity data
        nameElement.textContent = actualEntity.name.toUpperCase();
        spriteElement.src = actualEntity.image;
        
        // Check if other position has an entity
        const otherPosition = isLeft ? 'right' : 'left';
        const bothEntitiesPresent = this.entities[otherPosition] !== null;
        
        // Calculate target positions using viewport width for responsiveness
        let targetPosition;
        if (bothEntitiesPresent) {
            // Both entities present - position them on opposite sides
            targetPosition = isLeft ? '-15vw' : '15vw';
            
            // Also move the other entity to its side
            const otherSectionId = isLeft ? 'npc-section' : 'player-section';
            const otherSection = document.getElementById(otherSectionId);
            const otherTargetPosition = isLeft ? '15vw' : '-15vw';
            otherSection.style.transition = 'transform 0.5s ease-in-out';
            otherSection.style.transform = `translateX(${otherTargetPosition})`;
        } else {
            targetPosition = '0vw';
        }
        
        const direction = isLeft ? 'left' : 'right';

        await animation(section, targetPosition, direction);
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    async entityLeave(params) {
        const { position, animation } = params;
        
        // Determine which section to hide
        const isLeft = position === 'left';
        const sectionId = isLeft ? 'player-section' : 'npc-section';
        const section = document.getElementById(sectionId);
        
        // Use animation if provided, otherwise use default
        if (animation) {
            await animation(section, position);
        } else {
            // Default animation (slide out)
            const exitTo = isLeft ? '-100px' : '100px';
            section.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
            section.style.opacity = '0';
            section.style.transform = `translateX(${exitTo})`;
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            section.style.visibility = 'hidden';
        }
        
        // Clear entity
        this.entities[position] = null;
    }

    async changeBackground(params) {
        const backgroundImage = params.background;
        const header = document.getElementById('exploration-header');

        // Fade out
        header.style.transition = 'opacity 0.3s ease-in-out';
        header.style.opacity = '0';

        await new Promise(resolve => setTimeout(resolve, 300));

        // Change background
        header.style.backgroundImage = `url(${backgroundImage})`;
        // Fade in
        header.style.opacity = '1';

        await new Promise(resolve => setTimeout(resolve, 300));
    }

    handleRoomComplete() {
        const choiceContainer = document.getElementById('choice-container');
        choiceContainer.innerHTML = '';

        this.room.connections.forEach(connectionId => {
            const button = document.createElement('button');
            button.className = 'choice-btn choice-btn--continue';
            button.textContent = `Go to ${connectionId.replace(/_/g, ' ')}`; 
            
            button.addEventListener('click', () => {
                this.transitionToRoom(connectionId);
            });
            choiceContainer.appendChild(button);
        });
    }

    async transitionToRoom(roomId) {
        const newRoom = getRoomById(roomId);
        
        if (newRoom) {
            this.room = newRoom;
            this.currentEventIndex = 0;
            this.isProcessingEvent = false;
            
            document.getElementById('choice-container').innerHTML = '';
            
            console.log(`Transitioning to room: ${roomId}`);
            await this.startRoom();
        } else {
            console.error(`Could not find room: ${roomId}`);
        }
    }

    // Utility methods that can be called from room event callbacks

    /**
     * Add a custom dialogue without advancing the event queue
     */
    async addDialogue(text, speed = null) {
        return new Promise(resolve => {
            this.typewriterController.queue(text, {
                speed: speed || 30,
                onComplete: resolve
            });
        });
    }


    /**
     * Add custom choices without advancing the event queue
     */
    addCustomChoices(choices) {
        const choiceContainer = document.getElementById('choice-container');
        choiceContainer.innerHTML = '';

        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.addEventListener('click', async () => {
                choiceContainer.innerHTML = '';
                if (choice.callback) {
                    await choice.callback(this);
                }
            });
            choiceContainer.appendChild(button);
        });
    }

    /**
     * Clear the dialogue text
     */
    clearDialogue() {
        if (this.typewriterController) {
            this.typewriterController.clear();
        }
    }

    /**
     * Clear the choice buttons
     */
    clearChoices() {
        document.getElementById('choice-container').innerHTML = '';
    }
}
