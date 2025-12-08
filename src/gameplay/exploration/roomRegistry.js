import { Room } from './Room.js';
import * as Floor1Rooms from './rooms-data/floor-1.js';
import * as Floor2Rooms from './rooms-data/floor-2.js';
import * as Floor3Rooms from './rooms-data/floor-3.js';
import * as Floor4Rooms from './rooms-data/floor-4.js';
import * as Floor5Rooms from './rooms-data/floor-5.js';
import * as TestRooms from './rooms-data/test-room.js';

/**
 * Room Registry - Defines all rooms in the game
 * Manually imports all room definitions from ./rooms-data/
 */

const rooms = {};

// Combine all room modules
const roomModules = [
    Floor1Rooms,
    Floor2Rooms,
    Floor3Rooms,
    Floor4Rooms,
    Floor5Rooms,
    TestRooms
];

// Register all rooms
for (const module of roomModules) {
    // Iterate through all exports in the module
    for (const exportName in module) {
        const roomData = module[exportName];
        
        // Check if it looks like a room definition
        if (roomData && roomData.id && Array.isArray(roomData.events)) {
            if (rooms[roomData.id]) {
                console.warn(`Duplicate room ID found: "${roomData.id}". Overwriting.`);
            }
            rooms[roomData.id] = new Room(roomData.id, roomData.events, roomData.connections);
        }
    }
}

console.log(`Loaded ${Object.keys(rooms).length} rooms:`, Object.keys(rooms));

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
