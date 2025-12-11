import { createMemoryWraith } from '../../definitions/enemiesRegistry.js';

import {
  FadeInAnimation,
  FadeOutAnimation,
  SlideInAnimation,
} from '../../animations/ExplorationAnimations.js';

const BACKGROUNDS = {
    BEDROOM: '../../src/assets/art/backgrounds/floor4/bg_f4_02_bedroom.png',
    CHAPEL: '../../src/assets/art/backgrounds/floor4/bg_f4_03_chapel.png',
    GRAND_CORRIDOR: '../../src/assets/art/backgrounds/floor4/bg_f4_01_grand_corridor.png',
    MEMORY_WRAITH_BG: '../../src/assets/art/backgrounds/floor4/bg_f4_04_memory_wraith_corridor.png',
    MWC: '../../src/assets/art/backgrounds/floor4/bg_f4_05_memory_wraith_corridor_with_shard.png'
};


const MEMORY_WRAITH = {
  name: 'Memory-Wraith',
  image: '../../src/assets/art/enemies/memory-wraith.png',
};

// Reusable speaker definitions
const SPEAKERS = {
  NARRATOR: {
    name: 'Narrator',
    color: '#aaaaaa',
    orientation: 'center',
    showPrefix: false,
    fontStyle: 'italic',
  },
  PLAYER: {
    name: 'Player',
    color: '#66ccff',
    orientation: 'left',
    fontWeight: 'bold',
  },
  MEMORY_WRAITH: {
    name: 'Memory-Wraith',
    color: '#ff4444',
    orientation: 'right',
    fontFamily: 'Courier New',
  },
  SYSTEM: {
    name: 'System',
    color: '#ffff00',
    orientation: 'center',
    fontWeight: 'bold',
  },
};


export const F3_INTRO = {
  id: 'F3_INTRO',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.BEDROOM },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I arrive on this floor, the personal quarters of someone important. Dust motes float in shafts of dying light.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
  ],
  connections: ['F3_PATH_CHOICE'],
};

export const F3_PATH_CHOICE = {
  id: 'F3_PATH_CHOICE',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'Two paths lie before me: one leads to a chapel, the other to a private room. Both call to me.',
        speaker: SPEAKERS.PLAYER,
      },
    },
  ],
  connections: ['F3_CHAPEL', 'F3_YOUR_QUARTERS'],
};

export const F3_CHAPEL = {
  id: 'F3_CHAPEL',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.CHAPEL },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The chapel is ritualistic, candles burned down to stubs. Symbols line the walls.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
  ],
  connections: ['F3_MERGE_CORRIDOR'],
};

export const F3_YOUR_QUARTERS = {
  id: 'F3_YOUR_QUARTERS',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.BEDROOM },
    },
    {
      type: 'dialogue',
      params: {
        text: 'This room feels familiar. Memories surface—some comforting, some painful. My own hand brushes against a carved sigil.',
        speaker: SPEAKERS.PLAYER,
      },
    },
  ],
  connections: ['F3_MERGE_CORRIDOR'],
};

export const F3_MERGE_CORRIDOR = {
  id: 'F3_MERGE_CORRIDOR',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.GRAND_CORRIDOR },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The paths converge into a narrow corridor. The air is thick, heavy with anticipation.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
  ],
  connections: ['F3_MEMORY_WRAITH_FIGHT'],
};

export const F3_MEMORY_WRAITH_FIGHT = {
  id: 'F3_MEMORY_WRAITH_FIGHT',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.MEMORY_WRAITH_BG },
    },
    {
      type: 'entity-enter',
      params: {
        entity: MEMORY_WRAITH,
        position: 'center',
        animation: FadeInAnimation,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'A wraith formed of my memories manifests. Its gaze pierces my soul.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'battle',
      params: {
        enemy: createMemoryWraith(),
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The wraith dissipates, leaving behind only silence and a shard of memory.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'entity-leave',
      params: { position: 'center', animation: FadeOutAnimation },
    },
  ],
  connections: ['F3_FINAL_JOURNAL'],
};

export const F3_FINAL_JOURNAL = {
  id: 'F3_FINAL_JOURNAL',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.MWC },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I discover the last shard, a fragment of my memory long buried. The pieces of the past fit together at last.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
  ],
  connections: ['F3_STAIRS_UP'],
};

export const F3_STAIRS_UP = {
  id: 'F3_STAIRS_UP',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'A staircase rises before me. Beyond it lies the tower and Dravik awaits.',
        speaker: SPEAKERS.PLAYER,
      },
    },
  ],
  connections: ['F4_TOWER_INTRO'],
};
