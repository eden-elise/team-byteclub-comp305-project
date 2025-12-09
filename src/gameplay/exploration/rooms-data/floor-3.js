// rooms-data/floor-3.js

import { FadeInAnimation, FadeOutAnimation, SlideInAnimation } from '../../animations/ExplorationAnimations.js';
import { Knight } from '../../definitions/heroesRegistry.js';

// Backgrounds used in Floor 3
const BACKGROUNDS = {
    AISLE: '../../src/assets/art/backgrounds/floor-3/WMLaboratory Aisle.png',
    WORKBENCH: '../../src/assets/art/backgrounds/floor-3/Research Table.png',
    READING_ROOM: '../../src/assets/art/backgrounds/floor-3/Circular Reading Room.png',
    ARCHIVE: '../../src/assets/art/backgrounds/floor-3/CRR with Shard.png'
};

// Enemy visual entity
const SCHOLAR_ENTITY = {
    name: 'Cursed Scholar',
    image: '../../src/assets/art/backgrounds/floor-3/Cursed Scholar.png'
};

// Reusable speakers
const SPEAKERS = {
    NARRATOR: {
        name: 'Narrator',
        color: '#aaaaaa',
        orientation: 'center',
        showPrefix: false
    },
    PLAYER: {
        name: 'Player',
        color: '#66ccff',
        orientation: 'left'
    },
    SCHOLAR: {
        name: 'Scholar',
        color: '#cc33cc',
        orientation: 'right',
        fontStyle: 'italic'
    }
};

// Enemy logic factory (placeholder stats)
const createCursedScholarEnemy = () => {
    const scholar = new Knight(false);
    scholar.name = 'Cursed Scholar';
    scholar.image = '../../src/assets/art/characters/Cursed Scholar.png';
    scholar.maxHP = 80;
    scholar.currentHP = 80;
    return scholar;
};

export {
    BACKGROUNDS,
    SPEAKERS,
    createCursedScholarEnemy,
    SCHOLAR_ENTITY
};

export const F3_INTRO = {
    id: 'F3_INTRO',
    background: BACKGROUNDS.AISLE,
    events: [
        {
            type: 'background-change',
            background: BACKGROUNDS.AISLE
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.NARRATOR,
            text: 'The air shifts. Gone is the cold stone — replaced by dust, glass, and the crackle of arcane residue.'
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.NARRATOR,
            text: 'This was once a place of thought. Study. Control. Now it rots under ink and memory.'
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.PLAYER,
            text: '...I know this place.'
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.PLAYER,
            text: 'We did the math here. We were proud of it. Gods... what did we make?'
        }
    ],
    connections: ['F3_MAIN_HALL']
};

export const F3_MAIN_HALL = {
    id: 'F3_MAIN_HALL',
    background: BACKGROUNDS.AISLE,
    events: [
        {
            type: 'dialogue',
            speaker: SPEAKERS.NARRATOR,
            text: 'The hallway stretches — branching into shadowed alcoves, shattered labs, and silenced tomes.'
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.PLAYER,
            text: 'I should look around. Maybe... maybe something’s left.'
        }
    ],
    connections: ['F3_WORKBENCH', 'F3_STUDY', 'F3_READING_ROOM']
};

export const F3_WORKBENCH = {
    id: 'F3_WORKBENCH',
    background: BACKGROUNDS.WORKBENCH,
    events: [
        {
            type: 'background-change',
            background: BACKGROUNDS.WORKBENCH
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.NARRATOR,
            text: 'Schematics are strewn across the bench — blueprints of memory cages, rune-bonded phials, and alchemical feedback loops.'
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.PLAYER,
            text: 'We built machines to erase... and called it mercy.'
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.PLAYER,
            text: 'No components left worth salvaging.'
        }
    ],
    connections: ['F3_MAIN_HALL']
};

export const F3_STUDY = {
    id: 'F3_STUDY',
    background: BACKGROUNDS.WORKBENCH,
    events: [
        {
            type: 'background-change',
            background: BACKGROUNDS.WORKBENCH
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.NARRATOR,
            text: 'A private nook. Pages torn from journals. Names scratched out. A single vial rests, glowing faintly.'
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.PLAYER,
            text: 'That’s... the anchor. The memory phial I hid for myself.'
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.PLAYER,
            text: 'Still stable. This could hold me together when it starts to break.'
        },
        {
            type: 'dialogue',
            speaker: SPEAKERS.NARRATOR,
            text: 'You take the [color:#99e6ff]Memory Anchor Phial[/color].'
        }
    ],
    connections: ['F3_MAIN_HALL']
};