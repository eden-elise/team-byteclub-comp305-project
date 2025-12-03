
## Exploration Room

We need to figure out the best way to build out the exploration room template. It should be a template similar to the battle scene, then we should build out a "room" data structure so we can easily build out all of the rooms with the text from the story and events.

## Main though process

- We need to have some animations or movement on screen, since just text would be insanely boring
- Best way to achieve this: have the character on screen at the top like in the battle scene, with a background that can change, and a way for other characters (npcs) to enter and leave the scene.
- This way we can loosely base this scene on the battle scene

## We need for this:

- Functions for and Entity object to enter the screen (that would, for example, animate player character moving from middle to the left while NPC enters from the right)
- Functions and animations for Entity to leave the screen
- Typewriter textbox
  - Speed variants (maybe based on emotion? like yelling can be fast)
  - Color and animation, maybe jumping text or something?
- Functions to change background
- Sound effects for talking
- Effects to make more engaging
  - Dust, particles, sparkles, etc.
  - Camera movements, shakes, zooms even?
  - On screen emotes, question marks, etc.

## Data Structure (first attempt)

### /scenes/explorationScene.js and .html

These have all the visuals. We will load them WITH a certain room data from the main scene loader, this room data will have a series of events, and all event handling will happen in these files, including all effects and animations.

### /gameplay/exploration/Room.js

This is the data structure for a room. It will have a series of events that will be a list of objects with a type and parameters, for example (work in progress example):

events: [
    {
        type: 'dialogue',
        params: {
            speaker: 'npc',
            text: 'Hello, player!',
        }
    }
]

