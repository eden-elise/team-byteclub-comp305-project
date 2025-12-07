import { Knight } from '../../definitions/characters/heroes.js';
import { FadeOutAnimation, SlideInAnimation } from '../../animations/ExplorationAnimations.js';

export const testRoom = {
        id: 'Test Room',
        events: [
            {
                type: 'background-change',
                params: {
                    background: '../../src/assets/art/backgrounds/bkg-library.png'
                }
            },
            {
                type: 'entity-enter',
                params: {
                    entity: 'player',
                    position: 'left',
                    animation: SlideInAnimation
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'Where am I? This place looks strange...',
                    speaker: { name: 'Player', color: '#66ccff', orientation: 'left' }
                }
            },
            {
                type: 'entity-enter',
                params: {
                    entity: new Knight(false), // Create NPC Knight
                    position: 'right',
                    animation: SlideInAnimation
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: '[effect: rainbow]RAINBOW POWER test test hi[/]',
                    speaker: { name: 'Knight', color: '#ffcc00', orientation: 'right' }
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'group one is [effect: shaking]definately the best group :0[/]',
                    speaker: { name: 'Knight', color: '#ffcc00', orientation: 'right' }
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'see we even made [effect: waving]waving text........[/]',
                    speaker: { name: 'Knight', color: '#ffcc00', orientation: 'right' }
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'and even [effect: glowing]glowing text[/]!',
                    speaker: { name: 'Knight', color: '#ffcc00', orientation: 'right' }
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'and how about choices?',
                    speaker: { name: 'Player', color: '#66ccff', orientation: 'left' }
                }
            },
            {
                type: 'choice',
                params: {
                    choices: [
                        {
                            text: 'Show me more!',
                            callback: async (controller) => {
                                await controller.addDialogue('Excellent enthusiasm! Let\'s continue.', 30);
                            }
                        },
                        {
                            text: 'I\'m impressed.',
                            callback: async (controller) => {
                                await controller.addDialogue('I am glad you like it!', 30);
                            }
                        }
                    ]
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'Now, watch me [effect: fade]disappear like a ghost...[/]',
                    speaker: { name: 'Knight', color: '#ffcc00', orientation: 'right' }
                }
            },
            {
                type: 'entity-leave',
                params: {
                    position: 'right',
                    animation: FadeOutAnimation
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'And he is gone. [effect: fade]Fading away...[/]',
                    speaker: { name: 'Narrator', color: '#aaaaaa', orientation: 'center', showPrefix: false },
                    speed: 50
                }
            },
            {
                type: 'dialogue',
                params: {
                    text: 'End of showcase.',
                    speaker: { name: 'System', color: '#ff0000', orientation: 'center' }
                }
            }
        ],
        connections: ['F1_CELL']
    }