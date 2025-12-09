import { Knight } from '../../definitions/heroesRegistry.js';
import {
  FadeInAnimation,
  FadeOutAnimation,
  SlideInAnimation,
} from '../../animations/ExplorationAnimations.js';

const BACKGROUNDS = {
  CELL: '../../src/assets/art/backgrounds/floor-1/Starting Cell.png',
  CORRIDOR: '../../src/assets/art/backgrounds/floor-1/CoC.png',
  RITUAL: '../../src/assets/art/backgrounds/floor-1/Small Ritual Chamber.png',
  WARDEN_CELL: '../../src/assets/art/backgrounds/floor-1/wardens_cell.png',
};

const WARDEN_ENTITY = {
  name: 'Warden',
  image: '../../src/assets/art/characters/Warden.png',
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
  WARDEN: {
    name: 'Warden',
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

// TODO: fix this to be right (adding enemy registry and using taht)
const createWardenEnemy = () => {
  const warden = new Knight(false);
  warden.name = 'Warden';
  warden.image = '../../src/assets/art/backgrounds/floor-1/Warden.png';
  // Optionally buff stats
  warden.maxHP = 50;
  warden.currentHP = 50;
  return warden;
};

export const F1_INTRO_WAKE = {
  id: 'F1_INTRO_WAKE',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.CELL },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I wake to the sound of water. Not the gentle kind, but a slow, indifferent trickle that [effect: shaking]nags[/] at the back of your head.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Each drop hits stone with the same hollow cadence. My back is frigid against a hard slick wall and my head steadily [effect: shaking]throbs[/] with a painstaking ache.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'My face is pressed against something damp that smells of [color: #8b4513]rust[/] and [color: #daa520]old straw[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I slowly open my eyes.',
        speaker: SPEAKERS.PLAYER,
      },
    },
  ],
  connections: ['F1_CELL'],
};

export const F1_CELL = {
  id: 'F1_CELL',
  events: [
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
        text: 'I am in a small, damp enclosed room. When I go to lift my hand to my temple, chains [effect: shaking]rattle[/] against the ground.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'There are chains around my wrists. Through a small barred hole in the door a lantern swings beyond, its light slowly [effect: waving]swaying like a pendulum[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Near my knee lies a small glass vial, half buried in straw. The glass is cloudy, the liquid inside a [color: #8b0000]deep rust red[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Instinct supplies a label my conscious mind does not have to earn: [effect: glowing, color: #ff4444]Cracked Red Tonic[/].',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I slide it into a pocket at my belt I do not remember owning, but which my fingers find automatically.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'My name. [effect: fade]I do not know my name.[/] The realization arrives very slowly and calmly.',
        speaker: { ...SPEAKERS.PLAYER, style: 'thinking' },
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I move to sit up straighter, and that is when I see my wrist.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'A sigil has been burned into my skin, still raw and red, an [effect: glowing]ouroboros made of teeth[/]. The flesh around it is puckered and glossy.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'My stomach turns. The mark feels [effect: shaking]wrong[/], dark in its essence.',
        speaker: SPEAKERS.PLAYER,
      },
    },
  ],
  connections: ['F1_CELL_DOOR'],
};

export const F1_CELL_DOOR = {
  id: 'F1_CELL_DOOR',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'The cell door stands half open, hanging crooked on its hinges. Why would it be open?',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Someone let me out or forgot to lock me in. The stone corridor beyond slopes away into darkness.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'A bell tolls somewhere above, five slow chimes that [effect: shaking]vibrate[/] through the walls and into my teeth.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I put a hand against the wall and push myself up. My legs shake with fatigue, but they remember how to stand.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'As I step through the doorway, the teeth on my wrist seem to [effect: glowing]pulse[/] once with a faint heat.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
  ],
  connections: ['F1_HALLWAY_FIRST_STEP'],
};

export const F1_HALLWAY_FIRST_STEP = {
  id: 'F1_HALLWAY_FIRST_STEP',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.CORRIDOR },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The corridor is a spine of stone lined with iron mouthed cages. Some doors hang open. Some remain shut.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'All of them are marked with variations on the sigils carved into my own flesh. Circles intersecting circles, triangles nested like teeth.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'My footsteps sound too loud. With every step a feeling grows that is not quite a memory, more like the [effect: fade]ghost of one[/].',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'It is as if my body already knows where to go. [style: whispering]Turn here[/], my mind tugs; [style: whispering]do not look too closely into that cell[/].',
        speaker: { ...SPEAKERS.PLAYER, style: 'thinking' },
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I look anyway.',
        speaker: SPEAKERS.PLAYER,
      },
    },
  ],
  connections: ['F1_HALLWAY_AMBIENT', 'F1_FIGHT'],
};

export const F1_HALLWAY_AMBIENT = {
  id: 'F1_HALLWAY_AMBIENT',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'The first door I pass has been forced inward. The bed inside is a slab of stone with a dark indentation in the center.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'On the floor lies a small stoppered bottle the color of [color: #556b2f]swamp water[/]. A slow working draught.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I pocket it without thinking.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Another cell holds nothing but chains so thick they must have been meant for something that could bend steel.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'A ring of keys lies beside them. One key bears a small fragment of the tooth ouroboros. My wrist [effect: glowing]burns[/] in response.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I take that one. The metal is cold and heavy, a [effect: glowing, color: #ffd700]Sigiled Cell Key[/].',
        speaker: SPEAKERS.PLAYER,
      },
    },
  ],
  connections: ['F1_FIGHT'],
};

export const F1_FIGHT = {
  id: 'F1_FIGHT',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.WARDEN_CELL },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The third cell contains a shape.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'At first I take it for a heap of discarded rags. Then the rags move, unfolding into the outline of a human form.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'entity-enter',
      params: {
        entity: WARDEN_ENTITY, // Visual only for exploration
        position: 'right',
        animation: SlideInAnimation,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'A mask glints faintly in the dark: iron, cracked down the center, covering everything but the eyes.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Subject awake. Iteration... [effect: fade]lost[/]. No matter. Corridor protocol engaged.',
        speaker: SPEAKERS.WARDEN,
      },
    },
    {
      type: 'battle',
      params: {
        enemy: createWardenEnemy(),
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Chains [effect: shaking]clatter[/]. The thing shudders once, then collapses.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'entity-leave',
      params: {
        position: 'right',
        animation: FadeOutAnimation,
      },
    },
  ],
  connections: ['F1_EXIT_TO_F2'],
};

export const F1_EXIT_TO_F2 = {
  id: 'F1_EXIT_TO_F2',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'As it falls, something slips free from the folds of its robe: a small crystal ampoule filled with faintly [effect: glowing]glowing liquid[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'A [effect: rainbow]Mystery Phial[/]. The label is gone. The effect is unknown. I pocket it anyway.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Beyond the fallen warden, a side door stands ajar. Warm light spills from within.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.RITUAL },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The room inside is small and circular. At its center, hovering a few inches above bare stone, is a shard of glass the size of my palm.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The mark on my wrist [effect: glowing]burns[/]. As I step closer, the shard flares brighter.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I reach out for the shard anyway.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The shard sears my fingers. Heat races up my arm and drives nails into my skull. For a heartbeat I am [effect: shaking]nowhere and everywhere[/] at once.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[effect: fade]Then there is a laboratory...[/]',
        speaker: { ...SPEAKERS.NARRATOR, style: 'mysterious' },
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I am back in the cell room, kneeling on cold stone. The name settles into me like a key into a well worn lock.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[style: important]Lord Dravik[/]. I designed the sigil on my wrist. I helped build whatever this place is.',
        speaker: { ...SPEAKERS.PLAYER, style: 'important' },
      },
    },
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.CORRIDOR },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The staircase up from the cells is narrow. As I climb, torches flicker to life.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
  ],

  connections: ['F2_INTRO'],
};
