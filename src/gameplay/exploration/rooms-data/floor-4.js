// ============================================
// FLOOR 4: THE TOWER - FINAL CONFRONTATION
// File: src/gameplay/exploration/rooms-data/floor-4.js
// ============================================

import { createLordDravik } from '../../definitions/enemiesRegistry.js';
import {
  FadeInAnimation,
  FadeOutAnimation,
  SlideInAnimation,
} from '../../animations/ExplorationAnimations.js';

// ============================================
// BACKGROUND PATHS
// Note: Using floor-5 assets since Tower was originally floor 5
// You may want to rename the folder to floor-4 for consistency
// ============================================
const BACKGROUNDS = {
  TOWER_STAIRWELL: '../../src/assets/art/backgrounds/floor5/bg_f5_01_tower_stairwell.png',
  RITUAL_HALL: '../../src/assets/art/backgrounds/floor5/bg_f5_02_final_battle.png',
  POST_BATTLE_CELL: '../../src/assets/art/backgrounds/floor5/bg_f5_03_post_final_cell.png',
  CASTLE_EXIT: '../../src/assets/art/backgrounds/floor5/bg_f5_04_castle_exit_broken_gate.png',
  OUTSIDE_WORLD: '../../src/assets/art/backgrounds/floor5/bg_f5_05_outside_world_forest_road.png',
};

// ============================================
// ENTITY DEFINITIONS (for visual exploration scenes)
// ============================================
const DRAVIK_ENTITY = {
  name: 'Lord Dravik',
  image: '../../src/assets/art/characters/dravik.png',
};

// ============================================
// SPEAKER CONFIGURATIONS
// ============================================
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
  PLAYER_THINKING: {
    name: 'Player',
    color: '#88aacc',
    orientation: 'left',
    fontStyle: 'italic',
  },
  DRAVIK: {
    name: 'Lord Dravik',
    color: '#8b0000', // Dark crimson - the villain
    orientation: 'right',
    fontFamily: 'Courier New',
    fontWeight: 'bold',
  },
  SYSTEM: {
    name: 'System',
    color: '#ffff00',
    orientation: 'center',
    fontWeight: 'bold',
  },
};

// ============================================
// ROOM: F4_TOWER_INTRO - The Ascent Begins
// Connection from Floor 3 should lead here
// ============================================
export const F4_TOWER_INTRO = {
  id: 'F4_TOWER_INTRO',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.TOWER_STAIRWELL },
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
        text: 'The staircase to the top of the tower is a spiral narrow enough to be [effect: shaking]claustrophobic[/]. Wind threads down from above, carrying the faint chill of dawn air.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'My legs ache. My mind feels like a library whose shelves have been knocked over, books spilling out faster than I can read them.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Glass clinks softly whenever I move, my belt loaded with the accumulated [effect: glowing]pharmacopeia[/] of my former self.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'All the shards I have collected hum within me, their memories braiding into a single, painful thread.',
        speaker: SPEAKERS.PLAYER_THINKING,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I see the contract I signed. The subjects I agreed to use. The servants who have watched me loop again and again.',
        speaker: SPEAKERS.PLAYER_THINKING,
      },
    },
  ],
  connections: ['F4_TOWER_DOOR'],
};

// ============================================
// ROOM: F4_TOWER_DOOR - The Sigiled Gate
// ============================================
export const F4_TOWER_DOOR = {
  id: 'F4_TOWER_DOOR',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'At the top, a door awaits.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'It is made of some dark metal that [effect: fade]swallows light[/]. The sigil at its center is familiar—the teeth ouroboros, more intricate now, with additions that form a complex diagram of recurrence.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Little circles along its edge match the size of phial mouths. I realize, abruptly, that part of the lock was always keyed to my own inventory.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I lay my marked wrist against it.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Heat rushes through the metal, [effect: glowing]recognizing its own pattern[/]. The door unlocks with a low, satisfying thrum and swings inward.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
  ],
  connections: ['F4_RITUAL_HALL'],
};

// ============================================
// ROOM: F4_RITUAL_HALL - The Cathedral of Mad Science
// ============================================
export const F4_RITUAL_HALL = {
  id: 'F4_RITUAL_HALL',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.RITUAL_HALL },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The ritual hall is a [effect: glowing]cathedral of mad science[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Mirrors tower in arches overhead, their surfaces etched with sigils that catch and split the candlelight into a thousand [effect: waving]looping beams[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Chains descend from the ceiling, not to bind bodies but to suspend glass cylinders filled with swirling, luminous fragments—[effect: rainbow]memory shards[/], hundreds of them, each pulsing in its own rhythm.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I realize with a twist of disgust that this entire place is both laboratory and armory, and [effect: fade]I built half of it[/].',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'At the center of it all sits the [effect: glowing]throne[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'It is less a chair than a convergence point: metal and bone and glass meeting in a design that channels all those mirrored beams down into a single locus—the heart of whoever sits there.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
  ],
  connections: ['F4_DRAVIK_APPEARS'],
};

// ============================================
// ROOM: F4_DRAVIK_APPEARS - The Master Reveals Himself
// ============================================
export const F4_DRAVIK_APPEARS = {
  id: 'F4_DRAVIK_APPEARS',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'Tonight, that someone is not me.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'entity-enter',
      params: {
        entity: DRAVIK_ENTITY,
        position: 'right',
        animation: SlideInAnimation,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Lord Dravik stands beside the throne, one hand resting lightly on its arm as if on the shoulder of a beloved pet.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'He wears the same high-collared coat from my visions, though time has added no lines to his face. His eyes are bright, amused, and [effect: fade]utterly unsurprised[/] to see me.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[effect: glowing]Apprentice[/]. Right on schedule.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I step fully into the hall, letting the door swing shut behind me.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'How many times have we had this conversation?',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'He considers.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'That depends on how you count. Strictly speaking, this is the [effect: glowing]sixty-third instance[/] in which you have reached the tower with enough cognitive integrity to speak in complete sentences.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'He tilts his head.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Which means the infection you seeded in the system is working [style: mysterious]very nicely[/].',
        speaker: SPEAKERS.DRAVIK,
      },
    },
  ],
  connections: ['F4_DRAVIK_TRUTH'],
};

// ============================================
// ROOM: F4_DRAVIK_TRUTH - The Terrible Revelation
// ============================================
export const F4_DRAVIK_TRUTH = {
  id: 'F4_DRAVIK_TRUTH',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'My breath catches. [effect: shaking]You knew[/].',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Of course I knew.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'His smile is gentle.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'You are intelligent, but you are not [effect: fade]opaque[/] to me. Every adjustment you tried to make to the loop, I observed. Every shard you hid, I watched you place.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'It was... [style: mysterious]charming[/].',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'He steps away from the throne, strolling around me in a slow circle. As he passes one of the potion tables, he trails a finger along a row of phials.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I [effect: glowing]allowed[/] it.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[effect: shaking]Allowed[/]...?',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'What is experiment without variation? You think yourself my rebel creation, but you are my [effect: glowing]collaborator[/] still.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'This stage of the project concerns [style: important]resilience[/]—how the self reasserts itself under repetitive erasure. Your attempts to outmaneuver me are not errors in the method; they [effect: fade]are[/] the method.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Anger flares hot in my chest.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'You [style: yelling]used me[/] to test my own resistance to you.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[effect: glowing]Exactly[/].',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'He looks pleased that I have kept up.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
  ],
  connections: ['F4_DRAVIK_OFFER'],
};

// ============================================
// ROOM: F4_DRAVIK_OFFER - The Temptation
// ============================================
export const F4_DRAVIK_OFFER = {
  id: 'F4_DRAVIK_OFFER',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'But take heart. This is the furthest you have come with this degree of recollection. The function is [effect: glowing]converging[/].',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'On what?',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'On [style: important]acceptance[/], of course.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'His tone is patient, as if explaining calculus to a stubborn child.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Every time you climb, you carry a few more fragments of memory, a few more self-observations. You grow more aware of the loop, more aware of your complicity in its creation.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Eventually, you will come to understand that there is [effect: fade]nothing to escape[/].',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'He spreads his hands.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'We [effect: glowing]are[/] the loop, you and I. We are its authors and its executors.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I look up at the swirling cylinders of stolen memory. Each one holds a version of me that never got this far, never remembered this much.',
        speaker: SPEAKERS.PLAYER_THINKING,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The fear that has been rising in me throughout the castle peaks—not as a shriek but as a quiet, [effect: glowing]focused line[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'You think I will accept this. You think I will sit in that chair willingly again.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Not [style: whispering]think[/]. [effect: glowing]Know[/]. You did once. You will again. Iteration is proof.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'He moves closer, his presence cool and steady, the smell of old books and colder things lingering around him.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Join me, apprentice. No more struggling against the method you designed. Help me [effect: glowing]perfect[/] it.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Imagine a world in which pain can be excised as cleanly as a tumor, memories reshaped to fit better lives. You wanted that before you forgot. You can want it [effect: fade]again[/].',
        speaker: SPEAKERS.DRAVIK,
      },
    },
  ],
  connections: ['F4_PLAYER_CHOICE'],
};

// ============================================
// ROOM: F4_PLAYER_CHOICE - The Decision
// ============================================
export const F4_PLAYER_CHOICE = {
  id: 'F4_PLAYER_CHOICE',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'His eyes search mine, and for a terrifying moment I feel the [effect: waving]pull[/] of him—the allure of order, of a world where everything painful about myself could be neatly labeled and severed.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'He speaks the language my past self loved: refinement, convergence, [effect: fade]perfection[/].',
        speaker: SPEAKERS.PLAYER_THINKING,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'He does not lie. That might be the worst of it. He simply [effect: fade]omits the costs[/].',
        speaker: SPEAKERS.PLAYER_THINKING,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'What happens if I say [style: important]no[/]?',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'He lifts one shoulder.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Then we reset. We have done it many times. There is data to be gained from your resistance as well.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I simply think you will find acceptance less... [effect: fade]fatiguing[/].',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The tower seems very still.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The teeth on my wrist [effect: glowing]burn[/]. All the shards I have collected hum within me, their memories braiding into a single, painful thread.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'He is right about one thing: I am [effect: fade]not innocent[/].',
        speaker: SPEAKERS.PLAYER_THINKING,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'But neither is he the sole author.',
        speaker: SPEAKERS.PLAYER_THINKING,
      },
    },
    {
      type: 'choice',
      params: {
        choices: [
          {
            text: 'Accept his offer',
            callback: async (controller) => {
              await controller.showDialogue({
                text: 'I... I accept.',
                speaker: SPEAKERS.PLAYER,
              });
              await controller.showDialogue({
                text: '[effect: glowing]Excellent[/]. Welcome back, apprentice. Let us begin the next iteration... together.',
                speaker: SPEAKERS.DRAVIK,
              });
              window.handleLoss();
            },
          },
          {
            text: 'Refuse and fight',
            callback: async (controller) => {
              // Continue to battle
            },
          },
        ],
      },
    },
  ],
  connections: ['F4_FINAL_BATTLE'],
};

// ============================================
// ROOM: F4_FINAL_BATTLE - The Boss Fight
// ============================================
export const F4_FINAL_BATTLE = {
  id: 'F4_FINAL_BATTLE',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'The teeth on my wrist [effect: glowing]flare[/] with sudden heat. Every shard I have absorbed ignites.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[style: yelling]No more resets. No more iterations. This ends NOW.[/]',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: "Dravik's smile falters—just for a moment.",
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[effect: shaking]Interesting[/]. Very well, apprentice. Let us see what Iteration 63 is truly capable of.',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The sigils on the walls [effect: shaking]ignite[/] with dark fire. The apparatus hums to life.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    // ========================================
    // THE FINAL BOSS BATTLE
    // ========================================
    {
      type: 'battle',
      params: {
        enemy: createLordDravik(),
      },
    },
  ],
  connections: ['F4_POST_BATTLE'],
};

// ============================================
// ROOM: F4_POST_BATTLE - Victory
// ============================================
export const F4_POST_BATTLE = {
  id: 'F4_POST_BATTLE',
  events: [
    {
      type: 'dialogue',
      params: {
        text: 'The hall [effect: shaking]shudders[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: "Every shard in the room ignites. Memories spill out of their glass prisons—mine, others', a whole crowd of [effect: rainbow]discarded lives[/].",
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'All of them converge on him.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Dravik staggers, bombarded by the flood of experience. His hands claw at the air as if to push the memories back into their bottles, but the ritual [effect: fade]no longer obeys him[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[effect: shaking]Impossible[/]... After all my calculations...',
        speaker: SPEAKERS.DRAVIK,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'That is the problem with functions, Lord Dravik. They never quite behave once you run them [effect: glowing]outside the bounds you assumed[/].',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'entity-leave',
      params: {
        position: 'right',
        animation: FadeOutAnimation,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The mirrors crack. The chains snap. The apparatus disintegrates into shards of glass and metal that fall like [effect: waving]rain[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The loop is [effect: glowing]breaking[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Light engulfs me.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
  ],
  connections: ['F4_AWAKENING'],
};

// ============================================
// ROOM: F4_AWAKENING - After the Storm
// ============================================
export const F4_AWAKENING = {
  id: 'F4_AWAKENING',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.POST_BATTLE_CELL },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I wake to the sound of water.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The drip is [effect: fade]slower[/] this time.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'My face is on stone. My back is cold. A lantern swings beyond bars. The sigil on my wrist, the teeth ouroboros, stings faintly.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'For a moment, icy dread claws up my spine. [effect: shaking]Did it fail? Was all of that only another iteration logged and reset?[/]',
        speaker: SPEAKERS.PLAYER_THINKING,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Then I notice the [effect: glowing]silence[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'There is no bell tolling above. No echo of servants moving. No distant hum of ritual machinery vibrating through the walls.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The castle feels [effect: fade]empty[/], like a shell evacuated by whatever creature once lived inside.',
        speaker: SPEAKERS.NARRATOR,
      },
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
        text: 'I stand, slower than before.',
        speaker: SPEAKERS.PLAYER,
      },
    },
  ],
  connections: ['F4_CASTLE_EXIT'],
};

// ============================================
// ROOM: F4_CASTLE_EXIT - Freedom Beckons
// ============================================
export const F4_CASTLE_EXIT = {
  id: 'F4_CASTLE_EXIT',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.CASTLE_EXIT },
    },
    {
      type: 'dialogue',
      params: {
        text: 'When I step into the corridor, the sigils on the walls are [effect: fade]dead lines[/], their power gone. The air smells only of dust.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'At the foot of the stairs, a plaque I do not remember seeing before has been bolted into the wall. Its surface is blank except for a single hand-carved sentence:',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[effect: glowing]There is no clean slate. Only the stories you choose to carry forward.[/]',
        speaker: { ...SPEAKERS.NARRATOR, fontStyle: 'normal', fontWeight: 'bold' },
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The handwriting is [effect: fade]mine[/].',
        speaker: SPEAKERS.PLAYER_THINKING,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I laugh then, despite everything. Not the triumphant cackle of a villain, nor the brittle giggle of a broken mind, but something [effect: glowing]steadier[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Something that might one day become forgiveness—for myself, if not for Dravik.',
        speaker: SPEAKERS.PLAYER_THINKING,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'At the main gate—how did I never reach this far before?—I push open doors that used to be barred by mechanisms I designed.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'They groan, but they [effect: glowing]move[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
  ],
  connections: ['F4_ENDING'],
};

// ============================================
// ROOM: F4_ENDING - The New Beginning
// ============================================
export const F4_ENDING = {
  id: 'F4_ENDING',
  events: [
    {
      type: 'background-change',
      params: { background: BACKGROUNDS.OUTSIDE_WORLD },
    },
    {
      type: 'dialogue',
      params: {
        text: 'Beyond the gates lies not another loop, not another corridor, but the [effect: rainbow]world[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[effect: glowing]Trees. Mist. A road.[/]',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I step out.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'The sigil on my wrist throbs once, then [effect: fade]quiets[/]. The teeth remain—a scar that will never fully fade—but they no longer move of their own accord.',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'No potions tick at the edge of my awareness, no timers, no carefully balanced buffs. Just breath, and sky, and the raw, unmeasured ache of [effect: glowing]being alive[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: "Somewhere, in some forgotten ledger, Dravik's experiment ends mid-sentence.",
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[effect: fade]Mine, however, continues.[/]',
        speaker: SPEAKERS.PLAYER_THINKING,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I do not know my full name yet, but I know this much:',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I am the [effect: glowing]apprentice of my own choices[/] now, and that is more terrifying—and more hopeful—than any loop he could design.',
        speaker: SPEAKERS.PLAYER,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: 'I walk into the uncertain morning, the castle collapsing behind me like a story finally allowed to [effect: fade]end[/].',
        speaker: SPEAKERS.NARRATOR,
      },
    },
    {
      type: 'dialogue',
      params: {
        text: '[effect: glowing, color: #ffd700]THE END[/]',
        speaker: { ...SPEAKERS.SYSTEM, showPrefix: false },
      },
    },
  ],
  connections: [], // End of game - no more connections
};

// ============================================
// EXPORT ALL FLOOR 4 ROOMS
// ============================================
export const FLOOR_4_ROOMS = {
  F4_TOWER_INTRO,
  F4_TOWER_DOOR,
  F4_RITUAL_HALL,
  F4_DRAVIK_APPEARS,
  F4_DRAVIK_TRUTH,
  F4_DRAVIK_OFFER,
  F4_PLAYER_CHOICE,
  F4_FINAL_BATTLE,
  F4_POST_BATTLE,
  F4_AWAKENING,
  F4_CASTLE_EXIT,
  F4_ENDING,
};

// ============================================
// STARTING ROOM FOR FLOOR 4
// ============================================
export const F4_START = 'F4_TOWER_INTRO';
