/**
 * @fileoverview Integration tests for the roomRegistry module. Verifies that
 * registered rooms can be retrieved, that registry queries remain consistent
 * under repeated calls, and that warning noise is avoided for valid operations.
 * @module tests/systems/roomRegistry.int.test
 */

// ===========================================================================================
// IMPORTS
// ===========================================================================================

import { strict as assert } from 'assert';
import { describe, it } from 'node:test';

import {
  getRoomById,
  getAllRoomIds,
  roomExists,
} from '../../src/gameplay/exploration/roomRegistry.js';
import { Room } from '../../src/gameplay/exploration/Room.js';

describe('roomRegistry (integration)', () => {
  it('can retrieve all rooms and verify they are valid', () => {
    const ids = getAllRoomIds();

    ids.forEach((id) => {
      assert.ok(
        roomExists(id),
        `room "${id}" should be verified by roomExists`,
      );

      const room = getRoomById(id);
      assert.ok(
        room instanceof Room,
        `room "${id}" should be a Room instance`,
      );
      assert.strictEqual(
        room.id,
        id,
        `room ID should match request for "${id}"`,
      );
      assert.ok(
        Array.isArray(room.events),
        `room "${id}" should have events array`,
      );
    });
  });

  it('handles rapid successive calls without issues', () => {
    // This test simulates repeated registry access patterns to ensure the
    // module is resilient to quick, repeated lookups and does not mutate
    // global registry state in surprising ways.
    const testIds = ['Test Room', 'NonexistentRoom', 'Test Room'];

    testIds.forEach((id) => {
      const room = getRoomById(id);
      const exists = roomExists(id);
      const ids = getAllRoomIds();
      const idInList = ids.includes(id);

      if (room) {
        assert.ok(exists, `room should exist if retrievable: ${id}`);
        assert.ok(idInList, `room should be in list if retrievable: ${id}`);
      } else {
        // For non-existent IDs, roomExists may be false and ID not in list
        assert.strictEqual(
          exists,
          false,
          `roomExists should be false for non-existent room: ${id}`,
        );
      }
    });
  });

  it('maintains consistency between getRoomById and roomExists', () => {
    const allIds = getAllRoomIds();

    // Existing rooms
    allIds.forEach((id) => {
      const room = getRoomById(id);
      const exists = roomExists(id);

      assert.ok(room, `should retrieve room for ID "${id}"`);
      assert.ok(exists, `should confirm existence for ID "${id}"`);
    });

    // Non-existing rooms
    const nonExistentIds = ['FakeRoom1', 'FakeRoom2', ''];
    nonExistentIds.forEach((id) => {
      const room = getRoomById(id);
      const exists = roomExists(id);

      assert.strictEqual(
        room,
        null,
        `getRoomById should return null for non-existent ID "${id}"`,
      );
      assert.strictEqual(
        exists,
        false,
        `roomExists should return false for non-existent ID "${id}"`,
      );
    });
  });

  it('does not pollute console with warnings for valid operations', () => {
    const consoleWarnCalls = [];
    const origConsoleWarn = console.warn;
    console.warn = (...args) => {
      consoleWarnCalls.push(args.join(' '));
    };

    try {
      getAllRoomIds().forEach((id) => {
        const room = getRoomById(id);
        assert.ok(room, `room "${id}" should be retrievable`);
      });

      assert.strictEqual(
        consoleWarnCalls.length,
        0,
        'no console.warn calls should occur for valid room IDs',
      );
    } finally {
      console.warn = origConsoleWarn;
    }
  });
});
