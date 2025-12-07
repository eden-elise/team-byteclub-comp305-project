import { Room } from './Room.js';

/**
 * Room Registry - Defines all rooms in the game
 * Automatically loads all room definitions from ./rooms-data/
 */

const rooms = {};

/** 
 * We want to load every file from the rooms-data folder so we can organize 
 * and make multiple files for organization and ease of access
 * */
const roomModules = import.meta.glob('./rooms-data/*.js', { eager: true });

for (const path in roomModules) {
    const module = roomModules[path];
    
    // Iterate through all exports in the module
    for (const exportName in module) {
        const roomData = module[exportName];
        
        // Check if it looks like a room definition
        if (roomData && roomData.id && Array.isArray(roomData.events)) {
            if (rooms[roomData.id]) {
                console.warn(`Duplicate room ID found: "${roomData.id}" in ${path}. Overwriting.`);
            }
            rooms[roomData.id] = new Room(roomData.id, roomData.events, roomData.connections);
        }
    }
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
