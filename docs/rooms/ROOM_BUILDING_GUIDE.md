# Room Building Guide

This guide details how to build rooms in the Room Registry (`src/gameplay/exploration/roomRegistry.js`).

## Backgrounds:

they are all in a corresponding floor folder in the src/assets/art/backgrounds folder

## Room Structure

Rooms are defined in `ROOM_DATA` and consist of an `id` and a list of `events`.

```javascript
testRoom: {
    id: 'Test Room',
    events: [
        // ... events go here
    ]
}
```

## Event Types

### 1. Background Change
Changes the background image of the room.
```javascript
{
    type: 'background-change',
    params: {
        background: '../../src/assets/art/backgrounds/bkg-library.png'
    }
}
```

### 2. Entity Enter
Brings a character into the scene.
```javascript
{
    type: 'entity-enter',
    params: {
        entity: 'player', // 'player' or a Character instance (e.g. new Knight(false))
        position: 'left', // 'left' or 'right'
        animation: SlideInAnimation // Imported from ExplorationAnimations.js
    }
}
```
**Available Animations:** `SlideInAnimation`, `FadeInAnimation`

### 3. Entity Leave
Removes a character from the scene.
```javascript
{
    type: 'entity-leave',
    params: {
        position: 'right', // 'left' or 'right'
        animation: FadeOutAnimation
    }
}
```
**Available Animations:** `SlideOutAnimation`, `FadeOutAnimation`

### 4. Dialogue
Displays text in the typewriter box.
```javascript
{
    type: 'dialogue',
    params: {
        text: 'Hello world!',
        speaker: { 
            name: 'Name', 
            color: '#ffcc00', 
            orientation: 'left' // 'left', 'right', 'center'
        },
        speed: 30 // Optional: ms per character (lower is faster)
    }
}
```

### 5. Choices
Presents the player with clickable options.
```javascript
{
    type: 'choice',
    params: {
        choices: [
            {
                text: 'Option 1',
                callback: async (controller) => {
                    await controller.addDialogue('You chose option 1.');
                }
            },
            {
                text: 'Option 2',
                callback: async (controller) => {
                    // Logic for option 2
                }
            }
        ]
    }
}
```

### 6. Battle Event
Starts a battle with a specified enemy. The scene will reload after the battle, resuming at the next event in the list.

*   `enemy`: The enemy entity instance to fight.

**Example:**
```javascript
{
    type: 'battle',
    params: {
        enemy: createWardenEnemy() // Function returning an Entity instance
    }
}
```

## Text Styling & Effects

You can style text using tags: `[tag: value]content[/]`.

### Visual Effects (`[effect: name]`)
*   `jumping`: Text bounces up and down.
*   `shaking`: Text jitters randomly.
*   `waving`: Text waves in a sine pattern.
*   `rainbow`: Text cycles through colors.
*   `glowing`: Text pulses with a glow.
*   `fade`: Text fades in and out.

**Example:** `[effect: rainbow]Magic Text[/]`

### Style Presets (`[style: name]`)
*   `yelling`: Bold, large, red.
*   `whispering`: Small, italic, semi-transparent.
*   `thinking`: Italic, grey.
*   `important`: Bold, orange, glowing.
*   `mysterious`: Purple, italic.

**Example:** `[style: yelling]STOP![/]`

### Inline CSS
You can also use direct CSS properties.
**Example:** `[color: #ff0000, font-weight: bold]Custom Style[/]`

## Speaker Configuration

The `speaker` object in dialogue events controls the nametag and text alignment.

*   `name`: Display name.
*   `color`: Color of the nametag text.
*   `orientation`: Text alignment (`left`, `right`, `center`).
*   `showPrefix`: Boolean (default `true`). If `false`, hides "Name: " prefix in the text box.
*   `prefix`: Custom prefix string (overrides default "Name: ").

## Example Room

```javascript
exampleRoom: {
    id: 'Example',
    events: [
        {
            type: 'background-change',
            params: { background: 'path/to/bg.png' }
        },
        {
            type: 'entity-enter',
            params: { entity: 'player', position: 'left', animation: SlideInAnimation }
        },
        {
            type: 'dialogue',
            params: {
                text: 'Look at this [effect: rainbow]cool text[/]!',
                speaker: { name: 'Player', color: '#66ccff', orientation: 'left' }
            }
        }
    ]
}
```
