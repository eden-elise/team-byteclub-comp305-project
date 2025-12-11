# Manual Test Plan

## Overview
This document outlines manual testing procedures for BYTECLUB.

## Test Environment
- Browser: Chrome 120+, Firefox 120+, Safari 17+
- Screen: Desktop/laptop (1280x720 minimum)

## Test Cases

### TC-001: New Game Flow
**Preconditions:** Fresh browser session, no saved game
**Steps:**
1. Open index.html in browser
2. Click "New Game"
3. Select Knight character
4. Verify intro scroll plays
5. Verify Floor 1 exploration loads

**Expected Result:** Player enters Floor 1 with Knight selected
**Status:** [ ] Pass / [ ] Fail

### TC-002: Character Selection
**Preconditions:** At main menu
**Steps:**
1. Click "New Game"
2. Select "Archer"
3. Verify archer sprite displays

**Expected Result:** Archer character is selected and visible
**Status:** [ ] Pass / [ ] Fail

### TC-003: Battle System
**Preconditions:** In exploration mode
**Steps:**
1. Trigger a battle encounter
2. Use Attack 1
3. Use Attack 2
4. Use an item from inventory
5. Defeat enemy

**Expected Result:** Battle completes, return to exploration
**Status:** [ ] Pass / [ ] Fail

### TC-004: Save/Load
**Preconditions:** Progress to Floor 2+
**Steps:**
1. Note current floor and HP
2. Close browser
3. Reopen and click "Continue"
4. Verify floor and HP restored

**Expected Result:** Game state correctly restored
**Status:** [ ] Pass / [ ] Fail

### TC-005: Full Playthrough
**Preconditions:** Fresh game
**Steps:**
1. Complete all 5 floors
2. Defeat all bosses
3. Reach game end

**Expected Result:** Game completes without errors
**Status:** [ ] Pass / [ ] Fail

## Audio Tests

### TC-006: Audio Controls
**Steps:**
1. Open options menu
2. Adjust volume slider
3. Verify audio level changes

**Expected Result:** Volume adjusts accordingly
**Status:** [ ] Pass / [ ] Fail

## Edge Cases

### TC-007: Death and Retry
**Steps:**
1. Lose a battle intentionally
2. Verify death screen appears
3. Click restart option

**Expected Result:** Game restarts properly
**Status:** [ ] Pass / [ ] Fail
