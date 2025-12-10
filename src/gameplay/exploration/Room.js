/**
 *  This Room.js is the data structure that will hold all of the room data.
 *  In a separate registry, we will define all the rooms data
 */

export class Room {
  constructor(id, events, connections) {
    this.id = id;
    this.events = events;
    this.connections = connections;
  }
}
