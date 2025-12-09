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

