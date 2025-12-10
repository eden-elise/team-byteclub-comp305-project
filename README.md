# Team -- Byte Club -- Final Project

# **Definition of Done (DoD)**

A floor or feature is considered **Done** when the following criteria are met:

## **1. Floor Logic Works to Intended Scope**
- Rooms load correctly through the registry.  
- Backgrounds update to the appropriate scene.  
- Battles start and return to the correct room without breaking navigation.  
- All navigation buttons lead to valid, connected rooms.

## **2. Enemies and Moves Are Fully Wired**
- Enemy registry entries exist and correctly map to sprites/assets.  
- All intended moves execute without errors.  
- Enemy AI can use its entire move set.

## **3. Core Gameplay Flows Function End-to-End**
- Starting a new game works properly.  
- Progression through all floors behaves as expected.  
- Battle → return flow is consistent at each floor.  
- No blocking or critical console errors are present.

## **4. Assets Resolve Correctly**
- All referenced background, character, and sound files load (no 404s).  
- Sensible fallback assets are in place where needed.

## **5. Testing Is Completed**
- Full manual playthrough of each floor to completion.  
- Save/Continue correctly stores and restores player state.  
- Debug hotkeys remain functional for development.

## **6. Code Health Is Maintained**
- No obsolete stubs or outdated logic shadow new systems (e.g., old enemy factories).  
- File paths and imports are consistent.  
- Critical comments/documentation updated to match the current implementation.
