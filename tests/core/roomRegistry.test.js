import { strict as assert } from 'assert';
import { describe, it } from 'node:test';

import {
  getRoomById,
  getAllRoomIds,
  roomExists,
  TEST_ROOM,
} from '../../src/gameplay/exploration/roomRegistry.js';
import { Room } from '../../src/gameplay/exploration/Room.js';

describe('roomRegistry (unit)', () => {
  describe('getRoomById()', () => {
    it('returns a Room instance when room ID exists', () => {
      const room = getRoomById('Test Room');

      assert.ok(room, 'getRoomById should return a room for valid ID');
      assert.ok(room instanceof Room, 'returned value should be a Room instance');
    });

    it('returns an object with id and events properties', () => {
      const room = getRoomById('Test Room');

      assert.ok(room.id, 'room should have an id property');
      assert.strictEqual(
        room.id,
        'Test Room',
        'room id should match requested ID',
      );
      assert.ok(Array.isArray(room.events), 'room should have events array');
    });

    it('returns null and warns when room ID does not exist', () => {
      const consoleWarnCalls = [];
      const origConsoleWarn = console.warn;
      console.warn = (...args) => {
        consoleWarnCalls.push(args.join(' '));
      };

      try {
        const result = getRoomById('NonexistentRoom123');

        assert.strictEqual(
          result,
          null,
          'getRoomById should return null for invalid ID',
        );
        assert.ok(
          consoleWarnCalls.some((msg) => msg.includes('NonexistentRoom123')),
          'console.warn should log warning with room ID',
        );
      } finally {
        console.warn = origConsoleWarn;
      }
    });

    it('returns null for undefined room ID without crashing', () => {
      const result = getRoomById(undefined);

      assert.strictEqual(
        result,
        null,
        'getRoomById should handle undefined gracefully',
      );
    });

    it('returns null for empty string room ID', () => {
      const result = getRoomById('');

      assert.strictEqual(
        result,
        null,
        'getRoomById should return null for empty string',
      );
    });

    it('returns the same room instance on repeated calls', () => {
      const room1 = getRoomById('Test Room');
      const room2 = getRoomById('Test Room');

      assert.strictEqual(
        room1,
        room2,
        'repeated calls with same ID should return same instance',
      );
    });

    it('is case-sensitive when matching room IDs', () => {
      const room = getRoomById('Test Room');
      const lowerCaseRoom = getRoomById('test room');

      assert.ok(room, 'exact case match should return room');
      assert.strictEqual(
        lowerCaseRoom,
        null,
        'different case should return null',
      );
    });
  });

  describe('getAllRoomIds()', () => {
    it('returns an array of room IDs', () => {
      const ids = getAllRoomIds();

      assert.ok(Array.isArray(ids), 'getAllRoomIds should return an array');
      assert.ok(ids.length > 0, 'should have at least one room registered');
    });

    it('includes the Test Room ID', () => {
      const ids = getAllRoomIds();

      assert.ok(
        ids.includes('Test Room'),
        'Test Room should be included in room IDs list',
      );
    });

    it('all returned IDs correspond to valid rooms', () => {
      const ids = getAllRoomIds();

      ids.forEach((id) => {
        const room = getRoomById(id);
        assert.ok(room, `room with ID "${id}" should be retrievable`);
      });
    });

    it('returns consistent results on repeated calls', () => {
      const ids1 = getAllRoomIds();
      const ids2 = getAllRoomIds();

      assert.strictEqual(
        ids1.length,
        ids2.length,
        'room count should be consistent',
      );
      assert.deepStrictEqual(
        [...ids1].sort(),
        [...ids2].sort(),
        'room IDs list should be consistent',
      );
    });

    it('does not include duplicate IDs', () => {
      const ids = getAllRoomIds();
      const uniqueIds = new Set(ids);

      assert.strictEqual(
        ids.length,
        uniqueIds.size,
        'no duplicate room IDs should exist',
      );
    });
  });

  describe('roomExists()', () => {
    it('returns true for registered room IDs', () => {
      const exists = roomExists('Test Room');

      assert.strictEqual(
        exists,
        true,
        'roomExists should return true for valid room ID',
      );
    });

    it('returns false for non-existent room IDs', () => {
      const exists = roomExists('NonexistentRoom456');

      assert.strictEqual(
        exists,
        false,
        'roomExists should return false for invalid room ID',
      );
    });

    it('returns false for undefined room ID', () => {
      const exists = roomExists(undefined);

      assert.strictEqual(
        exists,
        false,
        'roomExists should return false for undefined',
      );
    });

    it('returns false for empty string room ID', () => {
      const exists = roomExists('');

      assert.strictEqual(
        exists,
        false,
        'roomExists should return false for empty string',
      );
    });

    it('returns false for null room ID', () => {
      const exists = roomExists(null);

      assert.strictEqual(
        exists,
        false,
        'roomExists should return false for null',
      );
    });

    it('is case-sensitive when checking room existence', () => {
      const exists = roomExists('Test Room');
      const wrongCase = roomExists('test room');

      assert.strictEqual(exists, true, 'exact case should return true');
      assert.strictEqual(
        wrongCase,
        false,
        'different case should return false',
      );
    });

    it('matches getAllRoomIds() results for existing rooms', () => {
      const ids = getAllRoomIds();
      const allExist = ids.every((id) => roomExists(id));

      assert.ok(allExist, 'all IDs from getAllRoomIds should exist');
    });
  });

  describe('TEST_ROOM export', () => {
    it('exports the Test Room instance', () => {
      assert.ok(TEST_ROOM, 'TEST_ROOM should be exported');
      assert.ok(
        TEST_ROOM instanceof Room,
        'TEST_ROOM should be a Room instance',
      );
    });

    it('TEST_ROOM has the correct ID', () => {
      assert.strictEqual(
        TEST_ROOM.id,
        'Test Room',
        'TEST_ROOM.id should be "Test Room"',
      );
    });

    it('TEST_ROOM matches getRoomById result', () => {
      const retrieved = getRoomById('Test Room');

      assert.strictEqual(
        TEST_ROOM,
        retrieved,
        'TEST_ROOM should match getRoomById("Test Room")',
      );
    });

    it('TEST_ROOM has events array', () => {
      assert.ok(
        Array.isArray(TEST_ROOM.events),
        'TEST_ROOM should have events array',
      );
      assert.ok(
        TEST_ROOM.events.length > 0,
        'TEST_ROOM should have at least one event',
      );
    });
  });
});
