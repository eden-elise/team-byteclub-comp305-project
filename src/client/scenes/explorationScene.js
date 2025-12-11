/**
 * @fileoverview ExplorationSceneController - Manages the exploration UI and room events
 * This class handles dialogue, choices, character animations, and room progression
 * @module scenes/explorationScene
 */
import '../components/TypewriterTextbox.js';
import { getRoomById } from '../../gameplay/exploration/roomRegistry.js';
import { gameState } from '../../gameplay/state/GameState.js';
import { audioManager } from '../utils/AudioManager.js';

/**
 * Controller class for managing exploration scenes in the game.
 * Handles dialogue display, player choices, entity animations, background changes,
 * and room transitions during exploration gameplay.
 * @class
 */
export class ExplorationSceneController {
    /**
     * Creates a new ExplorationSceneController instance.
     * @constructor
     * @param {Object} room - The room object containing events and connections
     * @param {string} room.id - Unique identifier for the room
     * @param {Array<Object>} room.events - Array of event objects to process in the room
     * @param {Array<string>} room.connections - Array of room IDs that this room connects to
     * @param {Object} player - The player entity object
     * @param {string} player.name - The player's display name
     * @param {string} player.image - Path to the player's sprite image
     * @param {number} [startEventIndex=0] - The index of the event to start processing from
     */
    constructor(room, player, startEventIndex = 0) {
        /**
         * The current room being explored
         * @type {Object}
         */
        this.room = room;

        /**
         * The player entity
         * @type {Object}
         */
        this.player = player;

        /**
         * The index of the current event being processed
         * @type {number}
         */
        this.currentEventIndex = startEventIndex;

        /**
         * Flag indicating if an event is currently being processed
         * @type {boolean}
         */
        this.isProcessingEvent = false;

        /**
         * Track entities by their screen position
         * @type {Object}
         * @property {Object|null} left - Entity on the left side of the screen
         * @property {Object|null} right - Entity on the right side of the screen
         */
        this.entities = {
            left: null,
            right: null,
        };

        /**
         * The typewriter text display controller
         * @type {HTMLElement|null}
         */
        this.typewriterController = null;

        this.initializeUI();
        this.startRoom();
    }

    /**
     * Initializes the UI elements for the exploration scene.
     * Sets up the typewriter controller and hides entity sections.
     * @returns {void}
     */
    initializeUI() {
      audioManager.stop('battle-background');
      audioManager.play('explore-scene', true);
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
            defaultSpeed: 30,
        });
      this.typewriterController.style.height = '150px'; // Set default height

        if (oldDialogueText) {
            oldDialogueText.replaceWith(this.typewriterController);
        }

    document.getElementById('choice-container').innerHTML = '';

    // Setup Skip Button
    const skipBtn = document.getElementById('skip-cutscene-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => this.skipCutscene());
    }
  }

  async startRoom() {
    // Ensure skip button is visible
    const btn = document.getElementById('skip-cutscene-btn');
    if (btn) btn.style.display = 'block';

    // Process the first event
    await this.processNextEvent();
  }
    /**
     * Starts processing events in the current room.
     * @async
     * @returns {Promise<void>}
     */
    async startRoom() {
        // Process the first event
        await this.processNextEvent();
    }

    /**
     * Processes the next event in the room's event queue.
     * Handles event chaining and determines when the room is complete.
     * @async
     * @returns {Promise<void>}
     */
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

    /**
     * Handles an individual event based on its type.
     * Routes the event to the appropriate handler method.
     * @async
     * @param {Object} event - The event object to handle
     * @param {string} event.type - The type of event ('dialogue', 'choice', 'entity-enter', 'entity-leave', 'background-change', 'battle')
     * @param {Object} event.params - Parameters specific to the event type
     * @returns {Promise<void>}
     */
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
    
    /**
     * Handles battle events by saving the game state and initiating combat.
     * @async
     * @param {Object} params - The battle parameters
     * @param {Object} params.enemy - The enemy entity to battle
     * @returns {Promise<void>}
     */
    async handleBattle(params) {
      // Hide skip button during battle
      const btn = document.getElementById('skip-cutscene-btn');
      if (btn) btn.style.display = 'none';

      // Save current state: room, event index to resume after battle
      const roomPrefix = this.room.id.split('_')[0]; // e.g., "F2"
      const currentFloor = roomPrefix ? `floor-${roomPrefix.slice(1)}` : 'floor-1';
      if (gameState.currentSaveData && gameState.currentSaveData.world) {
        gameState.currentSaveData.world.currentRoom = this.room.id;
        gameState.currentSaveData.world.currentEventIndex = this.currentEventIndex + 1;
        gameState.saveGame();
      }
      const header = document.getElementById('exploration-header');
      const currentBackground = getComputedStyle(header).backgroundImage;

      // Pass the EXACT bg currently on screen into the battle
      params.background = currentBackground;
      // Start battle
      if (window.gameApp && window.gameApp.startBattle) {
        await window.gameApp.startBattle(params, async () => {
          // On win, return to exploration at the same room, next event
          console.log(
            `Battle won! Resuming room ${this.room.id} at event ${this.currentEventIndex + 1}`
          );
          await window.gameApp.startFloorExploration(currentFloor);
        });
      } else {
        console.error('GameApp not initialized');
      }
    }

    /**
     * Displays dialogue text using the typewriter effect.
     * @async
     * @param {Object} params - The dialogue parameters
     * @param {string} params.text - The dialogue text to display
     * @param {number} [params.speed] - The typewriter speed in milliseconds per character
     * @param {string} [params.speaker] - The name of the speaker
     * @returns {Promise<void>}
     */
    async showDialogue(params) {
        const { text, speed, speaker } = params;

        // Clear choices while dialogue is showing
        document.getElementById('choice-container').innerHTML = '';

        // Use typewriter controller to display text
        await new Promise((resolve) => {
            this.typewriterController.queue(text, {
                speed: speed || 30,
                speaker: speaker,
                waitForInput: true,
                onComplete: resolve,
            });
        });

        // Auto-continue to next event after dialogue finishes
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    /**
     * Displays choice buttons for the player to select from.
     * @async
     * @param {Object} params - The choice parameters
     * @param {Array<Object>} params.choices - Array of choice objects
     * @param {string} params.choices[].text - The display text for the choice button
     * @param {Function} [params.choices[].callback] - Optional callback function when choice is selected
     * @returns {Promise<void>}
     */
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

    /**
     * Handles when a choice button is clicked.
     * Executes the choice callback and continues to the next event.
     * @async
     * @param {Object} choice - The choice object that was clicked
     * @param {string} choice.text - The display text of the choice
     * @param {Function} [choice.callback] - Optional callback function to execute
     * @param {number} index - The index of the choice in the choices array
     * @returns {Promise<void>}
     */
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

    /**
     * Animates an entity entering the scene.
     * Handles positioning for single or dual entity displays.
     * @async
     * @param {Object} params - The entity enter parameters
     * @param {Object|string} params.entity - The entity object or 'player' keyword
     * @param {string} params.entity.name - The entity's display name
     * @param {string} params.entity.image - Path to the entity's sprite image
     * @param {string} params.position - The screen position ('left' or 'right')
     * @param {Function} params.animation - Animation function to execute for the entrance
     * @returns {Promise<void>}
     */
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

        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    /**
     * Animates an entity leaving the scene.
     * Uses provided animation or falls back to default slide-out animation.
     * @async
     * @param {Object} params - The entity leave parameters
     * @param {string} params.position - The screen position ('left' or 'right')
     * @param {Function} [params.animation] - Optional custom animation function for the exit
     * @returns {Promise<void>}
     */
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

            await new Promise((resolve) => setTimeout(resolve, 500));

            section.style.visibility = 'hidden';
        }

        // Clear entity
        this.entities[position] = null;
    }

    /**
     * Changes the background image of the exploration scene with a fade transition.
     * @async
     * @param {Object} params - The background change parameters
     * @param {string} params.background - Path to the new background image
     * @returns {Promise<void>}
     */
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


/**
     * Handles the completion of all events in a room.
     * Displays navigation buttons for connected rooms.
     * @returns {void}
     */
  handleRoomComplete() {
    // Hide skip button when room is complete
    const btn = document.getElementById('skip-cutscene-btn');
    if (btn) btn.style.display = 'none';

    const choiceContainer = document.getElementById('choice-container');
    choiceContainer.innerHTML = '';

    this.room.connections.forEach((connectionId) => {
            const button = document.createElement('button');
            button.className = 'choice-btn choice-btn--continue';
            button.textContent = `Go to ${connectionId.replace(/_/g, ' ')}`;

            button.addEventListener('click', () => {
              audioManager.play('button-click');
              this.transitionToRoom(connectionId);
            });
            choiceContainer.appendChild(button);
        });
    }

    /**
     * Transitions to a new room by its ID.
     * Resets the controller state and starts processing the new room's events.
     * @async
     * @param {string} roomId - The ID of the room to transition to
     * @returns {Promise<void>}
     */
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
     * Add a custom dialogue without advancing the event queue.
     * Useful for callbacks that need to display additional dialogue.
     * @async
     * @param {string} text - The dialogue text to display
     * @param {number} [speed=null] - The typewriter speed in milliseconds per character (defaults to 30)
     * @returns {Promise<void>} Resolves when the dialogue has finished displaying
     */
    async addDialogue(text, speed = null) {
        return new Promise((resolve) => {
            this.typewriterController.queue(text, {
                speed: speed || 30,
                onComplete: resolve,
            });
        });
    }

    /**
     * Add custom choices without advancing the event queue.
     * Useful for callbacks that need to present additional choices.
     * @param {Array<Object>} choices - Array of choice objects
     * @param {string} choices[].text - The display text for the choice button
     * @param {Function} [choices[].callback] - Optional async callback function when choice is selected
     * @returns {void}
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
     * Clear the dialogue text.
     * Removes all text from the typewriter controller.
     * @returns {void}
     */
    clearDialogue() {
        if (this.typewriterController) {
            this.typewriterController.clear();
        }
    }



  /**
   * Skips events until the next battle or the end of the event list
   */
  skipCutscene() {
    // Always clear current dialogue instantly
    if (this.typewriterController) {
      this.typewriterController.clear();
      console.log('clearing dialogue');
    }

    // Prevent double-triggering during processing
    if (this.isProcessingEvent) {
      console.log('preventing double-triggering');
    }

    const events = this.room.events;
    let nextIndex = this.currentEventIndex;

    // Find the next battle event
    for (let i = this.currentEventIndex; i < events.length; i++) {
      const e = events[i];
      if (e.type === 'battle') {
        nextIndex = i;
        break;
      }
      nextIndex = i; // If no battles at all, end up on the last event
      console.log('next index: ' + nextIndex);
    }

    // Move index to that point
    this.currentEventIndex = nextIndex;
    console.log('current index: ' + this.currentEventIndex);

    // Clear choices immediately, since skipping invalidates them
    const choiceContainer = document.getElementById('choice-container');
    if (choiceContainer) choiceContainer.innerHTML = '';

    // Process the event at the new position
    this.processNextEvent();
  }

  /**
   * Clear the choice buttons
   */
  clearChoices() {
    document.getElementById('choice-container').innerHTML = '';
  }
    /**
     * Clear the choice buttons.
     * Removes all choice buttons from the choice container.
     * @returns {void}
     */
    clearChoices() {
        document.getElementById('choice-container').innerHTML = '';
    }
}
