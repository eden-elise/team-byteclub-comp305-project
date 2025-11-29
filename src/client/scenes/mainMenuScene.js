import { gameState } from '../../gameplay/state/GameState.js';

export class MainMenuSceneController {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.animationComplete = false;
        this.userInterrupted = false;
        this.init();
    }

    init() {
        this.checkSaveFile();
        this.setupListeners();
        this.startAnimationSequence();
    }

    checkSaveFile() {
        const saveData = gameState.getFullSaveData();
        const continueContainer = document.getElementById('continue-container');
        const saveInfo = document.getElementById('save-info');

        if (saveData) {
            continueContainer.style.display = 'flex';
            
            const date = new Date(saveData.metadata.timestamp).toLocaleString();
            saveInfo.innerHTML = `
                <div style="color: var(--color-text-gold); font-weight: bold;">${saveData.hero.name}</div>
                <div>Level ${saveData.hero.level} ${saveData.hero.classId.toUpperCase()}</div>
                <div style="font-size: 0.8rem; margin-top: 5px;">Last played: ${date}</div>
            `;
        } else {
            continueContainer.style.display = 'none';
        }
    }

    setupListeners() {
        const btnContinue = document.getElementById('btn-continue');
        if (btnContinue) {
            btnContinue.addEventListener('click', () => {
                if (this.callbacks.onContinue) this.callbacks.onContinue();
            });
        }

        document.getElementById('btn-new-game').addEventListener('click', () => {
            if (this.callbacks.onNewGame) this.callbacks.onNewGame();
        });

        document.getElementById('btn-load-file').addEventListener('click', () => {
            // Create a hidden file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const json = JSON.parse(event.target.result);
                        if (this.callbacks.onLoadFile) {
                            this.callbacks.onLoadFile(json);
                        }
                    } catch (err) {
                        console.error('Error parsing save file:', err);
                        alert('Invalid save file!');
                    }
                };
                reader.readAsText(file);
            };

            input.click();
        });

        // Listen for any user input to speed up animation
        this.setupUserInputDetection();
    }

    setupUserInputDetection() {
        const handleUserInput = () => {
            if (!this.animationComplete && !this.userInterrupted) {
                this.userInterrupted = true;
                this.skipToButtons();
            }
        };

        // Listen for keyboard, mouse, and touch events
        document.addEventListener('keydown', handleUserInput, { once: true });
        document.addEventListener('click', handleUserInput, { once: true });
        document.addEventListener('touchstart', handleUserInput, { once: true });
    }

    startAnimationSequence() {
        // Background fades in (0-2s)
        // Title fades in (2-4s)
        // Lightning strikes at 4.5s
        // Birds start flying around 3s and continue
        // Buttons fade in at 6s (or immediately on user input)

        // Start bird animations
        setTimeout(() => this.startBirdAnimations(), 3000);

        // Lightning strike
        setTimeout(() => this.triggerLightning(), 4500);

        // Show buttons after full sequence
        setTimeout(() => {
            if (!this.userInterrupted) {
                this.showButtons();
            }
        }, 6000);
    }

    startBirdAnimations() {
        const birdsContainer = document.getElementById('birds-container');
        const birdImages = [
            '../../src/assets/art/title-screen/crow/crow-1.png',
            '../../src/assets/art/title-screen/crow/crow-2.png',
            '../../src/assets/art/title-screen/crow/crow-3.png'
        ];

        // Create multiple birds flying across the screen
        const createBird = (delay) => {
            setTimeout(() => {
                const bird = document.createElement('div');
                bird.className = 'bird';
                
                // Random bird image
                const randomImage = birdImages[Math.floor(Math.random() * birdImages.length)];
                bird.style.backgroundImage = `url('${randomImage}')`;
                
                // Random starting position (left side of screen)
                const startY = Math.random() * 40 + 10; // 10-50% from top
                bird.style.top = `${startY}%`;
                bird.style.left = '-50px';
                
                // Random flight path
                const flyDistanceX = Math.random() * 600 + 800; // 800-1400px to the right
                const flyDistanceY = (Math.random() - 0.5) * 200; // -100 to +100px vertical
                const duration = Math.random() * 5 + 8; // 8-13 seconds
                
                bird.style.setProperty('--fly-distance-x', `${flyDistanceX}px`);
                bird.style.setProperty('--fly-distance-y', `${flyDistanceY}px`);
                bird.style.animation = `flyBird ${duration}s linear forwards`;
                
                birdsContainer.appendChild(bird);
                
                // Remove bird after animation
                setTimeout(() => {
                    bird.remove();
                }, duration * 1000);
            }, delay);
        };

        // Create birds at intervals
        for (let i = 0; i < 8; i++) {
            createBird(i * 2000); // Every 2 seconds
        }
        
        // Continue creating birds periodically
        this.birdInterval = setInterval(() => {
            createBird(0);
        }, 4000);
    }

    triggerLightning() {
        const lightningFlash = document.getElementById('lightning-flash');
        lightningFlash.style.animation = 'lightningStrike 0.8s ease-out forwards';
        
        // Reset animation so it can be triggered again if needed
        setTimeout(() => {
            lightningFlash.style.animation = '';
        }, 800);
    }

    showButtons() {
        this.animationComplete = true;
        const menuButtons = document.getElementById('menu-buttons');
        menuButtons.classList.add('visible');
    }

    skipToButtons() {
        // Instantly show everything
        const background = document.getElementById('background');
        const titleText = document.getElementById('title-text');
        const menuButtons = document.getElementById('menu-buttons');
        
        // Force all animations to complete instantly
        background.style.animation = 'none';
        background.style.opacity = '1';
        
        titleText.style.animation = 'none';
        titleText.style.opacity = '1';
        titleText.style.transform = 'scale(1)';
        
        menuButtons.classList.add('instant');
        
        this.animationComplete = true;
    }

    cleanup() {
        // Clear bird interval when leaving the scene
        if (this.birdInterval) {
            clearInterval(this.birdInterval);
        }
    }
}

