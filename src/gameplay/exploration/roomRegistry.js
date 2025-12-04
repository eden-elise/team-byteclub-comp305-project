import { Room } from './Room.js';
import { Knight } from '../definitions/characters/heroes.js';
import { FadeInAnimation, FadeOutAnimation, SlideInAnimation } from '../animations/ExplorationAnimations.js';

/**
 * Room Registry - Defines all rooms in the game
 */

// Define room data
const ROOM_DATA = {
    testRoom: {
        id: 'Test Room',
        events: [
            {
                type: 'background-change',
                params: {
                    background: '../../src/assets/art/backgrounds/bkg-library.png'
                }
            },
            {
                type: 'entity-enter',
                params: {
                    entity: 'player',
                    position: 'left',
                    animation: SlideInAnimation
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'Where am I? This place looks strange...',
                    speaker: { name: 'Player', color: '#66ccff', orientation: 'left' }
                }
            },
            {
                type: 'entity-enter',
                params: {
                    entity: new Knight(false), // Create NPC Knight
                    position: 'right',
                    animation: SlideInAnimation
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: '[effect: rainbow]RAINBOW POWER test test hi[/]',
                    speaker: { name: 'Knight', color: '#ffcc00', orientation: 'right' }
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'group one is [effect: shaking]definately the best group :0[/]',
                    speaker: { name: 'Knight', color: '#ffcc00', orientation: 'right' }
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'see we even made [effect: waving]waving text........[/]',
                    speaker: { name: 'Knight', color: '#ffcc00', orientation: 'right' }
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'and even [effect: glowing]glowing text[/]!',
                    speaker: { name: 'Knight', color: '#ffcc00', orientation: 'right' }
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'and how about choices?',
                    speaker: { name: 'Player', color: '#66ccff', orientation: 'left' }
                }
            },
            {
                type: 'choice',
                params: {
                    choices: [
                        {
                            text: 'Show me more!',
                            callback: async (controller) => {
                                await controller.addDialogue('Excellent enthusiasm! Let\'s continue.', 30);
                            }
                        },
                        {
                            text: 'I\'m impressed.',
                            callback: async (controller) => {
                                await controller.addDialogue('I am glad you like it!', 30);
                            }
                        }
                    ]
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'Now, watch me [effect: fade]disappear like a ghost...[/]',
                    speaker: { name: 'Knight', color: '#ffcc00', orientation: 'right' }
                }
            },
            {
                type: 'entity-leave',
                params: {
                    position: 'right',
                    animation: FadeOutAnimation
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'And he is gone. [effect: fade]Fading away...[/]',
                    speaker: { name: 'Narrator', color: '#aaaaaa', orientation: 'center', showPrefix: false },
                    speed: 50
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'End of showcase.',
                    speaker: { name: 'System', color: '#ff0000', orientation: 'center' }
                }
            }
        ]
    }
};


// Create room instances
const rooms = {};
for (const [key, data] of Object.entries(ROOM_DATA)) {
    rooms[data.id] = new Room(data.id, data.events);
}

/**
 * Get a room by its ID
 * @param {string} roomId - The room ID
 * @returns {Room} The room instance
 */
export function getRoomById(roomId) {
    const room = rooms[roomId];
    if (!room) {
        console.warn(`Room with ID "${roomId}" not found`);
        return null;
    }
    return room;
}

/**
 * Get all available room IDs
 * @returns {Array<string>} Array of room IDs
 */
export function getAllRoomIds() {
    return Object.keys(rooms);
}

/**
 * Check if a room exists
 * @param {string} roomId - The room ID
 * @returns {boolean} True if room exists
 */
export function roomExists(roomId) {
    return roomId in rooms;
}

// Export the test room for easy access
export const TEST_ROOM = rooms['Test Room'];
