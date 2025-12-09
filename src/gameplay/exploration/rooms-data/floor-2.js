// rooms-data/floor-2.js

import {
  FadeInAnimation,
  FadeOutAnimation,
  SlideInAnimation,
} from '../../animations/ExplorationAnimations.js';
import { Knight } from '../../definitions/heroesRegistry.js';
import { createCursedScholar } from '../../definitions/enemiesRegistry.js';

// Backgrounds used in Floor 2
const BACKGROUNDS = {
  AISLE: '../../src/assets/art/backgrounds/floor-3/WMLaboratory Aisle.png',
  WORKBENCH: '../../src/assets/art/backgrounds/floor-3/Research Table.png',
  READING_ROOM: '../../src/assets/art/backgrounds/floor-3/Circular Reading Room.png',
  ARCHIVE: '../../src/assets/art/backgrounds/floor-3/CRR with Shard.png',
};

// Enemy visual entity
const SCHOLAR_ENTITY = {
  name: 'Cursed Scholar',
  image: '../../src/assets/art/characters/Cursed Scholar.png',
};

// Reusable speakers
const SPEAKERS = {
  NARRATOR: {
    name: 'Narrator',
    color: '#aaaaaa',
    orientation: 'center',
    showPrefix: false,
  },
  PLAYER: {
    name: 'Player',
    color: '#66ccff',
    orientation: 'left',
  },
  SCHOLAR: {
    name: 'Scholar',
    color: '#cc33cc',
    orientation: 'right',
    fontStyle: 'italic',
  },
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

export { BACKGROUNDS, SPEAKERS, createCursedScholarEnemy, SCHOLAR_ENTITY };

// ----------------------
// F2_INTRO
// ----------------------
export const F2_INTRO = {
  id: 'F2_INTRO',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.AISLE },
    },
    {
      type: 'entity-enter',
      params: {
        entity: 'player',
        position: 'left',
        animation: FadeInAnimation,
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: 'The air shifts. Gone is the cold stone — replaced by dust, glass, and the crackle of arcane residue.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: 'This was once a place of thought. Study. Control. Now it rots under ink and memory.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.PLAYER,
        text: '...I know this place.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.PLAYER,
        text: 'We did the math here. We were proud of it. Gods... what did we make?',
      },
    },
  ],
  connections: ['F2_MAIN_HALL'],
};

// ----------------------
// F2_MAIN_HALL
// ----------------------
export const F2_MAIN_HALL = {
  id: 'F2_MAIN_HALL',
  events: [
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: 'The hallway stretches — branching into shadowed alcoves, shattered labs, and silenced tomes.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.PLAYER,
        text: 'I should look around. Maybe... maybe something’s left.',
      },
    },
  ],
  connections: ['F2_WORKBENCH', 'F2_STUDY', 'F2_READING_ROOM'],
};

// ----------------------
// F2_WORKBENCH
// ----------------------
export const F2_WORKBENCH = {
  id: 'F2_WORKBENCH',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.WORKBENCH },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: 'Schematics are strewn across the bench — blueprints of memory cages, rune-bonded phials, and alchemical feedback loops.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.PLAYER,
        text: 'We built machines to erase... and called it mercy.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.PLAYER,
        text: 'No components left worth salvaging.',
      },
    },
  ],
  connections: ['F2_MAIN_HALL'],
};

// ----------------------
// F2_STUDY
// ----------------------
export const F2_STUDY = {
  id: 'F2_STUDY',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.WORKBENCH },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: 'A private nook. Pages torn from journals. Names scratched out. A single vial rests, glowing faintly.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.PLAYER,
        text: 'That’s... the anchor. The memory phial I hid for myself.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.PLAYER,
        text: 'Still stable. This could hold me together when it starts to break.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: 'You take the [color:#99e6ff]Memory Anchor Phial[/color].',
      },
    },
  ],
  connections: ['F2_MAIN_HALL'],
};

// ----------------------
// F2_READING_ROOM
// ----------------------
export const F2_READING_ROOM = {
  id: 'F2_READING_ROOM',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.READING_ROOM },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: 'Someone is muttering between shelves. Pages flip on their own.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.PLAYER,
        text: 'That voice... I know it.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.SCHOLAR,
        text: '...they will not remember... they cannot... they must not...',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: 'Ink tendrils pulse along the walls. The source waits deeper within.',
      },
    },
  ],
  connections: ['F2_CORE_ARCHIVE'],
};

// ----------------------
// F2_CORE_ARCHIVE
// ----------------------
export const F2_CORE_ARCHIVE = {
  id: 'F2_CORE_ARCHIVE',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.ARCHIVE },
    },
    {
      type: 'entity-enter',
      params: {
        entity: SCHOLAR_ENTITY,
        position: 'right',
        animation: SlideInAnimation,
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.SCHOLAR,
        text: 'You should not have come. The ritual holds only if we forget!',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.PLAYER,
        text: 'I helped make it. I have the right to remember.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.SCHOLAR,
        text: 'Then we are both damned.',
      },
    },
  ],
  connections: ['F2_CURSED_SCHOLAR_FIGHT'],
};

// ----------------------
// F2_CURSED_SCHOLAR_FIGHT
// ----------------------
export const F2_CURSED_SCHOLAR_FIGHT = {
  id: 'F2_CURSED_SCHOLAR_FIGHT',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.ARCHIVE },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: '[effect: shaking]Ink explodes outward. Sigils burn mid-air. The Cursed Scholar rises, screaming equations.',
      },
    },
    {
      type: 'battle',
      params: {
        enemy: createCursedScholar(),
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.SCHOLAR,
        text: '[effect: glitching] It will break... it must break... I... I forgot why...',
      },
    },
    {
      type: 'entity-leave',
      params: {
        entity: SCHOLAR_ENTITY,
        position: 'right',
        animation: FadeOutAnimation,
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: 'As the ink fades, silence returns. Something flickers in the air ahead.',
      },
    },
  ],
  connections: ['F2_STAIRS_UP'],
};

// ----------------------
// F2_STAIRS_UP
// ----------------------
export const F2_STAIRS_UP = {
  id: 'F2_STAIRS_UP',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.AISLE },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: 'A shard of thought flickers midair. Waiting. Remembering.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.PLAYER,
        text: '[style: whispering]...We made the ritual. Me and the Scholar.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.PLAYER,
        text: 'We knew what it would cost. We did it anyway.',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: '[effect: glowing]Shard 3 unlocked: [color:#ffd700]“Co-Author of Oblivion.”[/color]',
      },
    },
    {
      type: 'dialogue',
      params: {
        speaker: SPEAKERS.NARRATOR,
        text: 'The air trembles. A staircase spirals upward, beckoning you into Floor 4.',
      },
    },
  ],
  connections: ['F3_INTRO'],
};
