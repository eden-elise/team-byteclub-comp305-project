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
        const menuMusic = document.getElementById('menu-lobby');
        menuMusic.play().catch(err => console.log(err));
        // Play button → show secondary menu
        const btnPlay = document.getElementById('btn-play');
        btnPlay.addEventListener('click', () => {
            const music = document.getElementById('play');
            music.play().catch(err => console.log(err));

            this.showSecondaryMenu();
        });

        // Exit button → show exit confirmation
        const btnExit = document.getElementById('btn-exit');
        btnExit.addEventListener('click', () => this.showExitConfirmation());

        // Exit confirmation buttons
        const btnExitYes = document.getElementById('btn-exit-yes');
        btnExitYes.addEventListener('click', () => window.close());

        const btnExitNo = document.getElementById('btn-exit-no');
        btnExitNo.addEventListener('click', () => this.hideExitConfirmation());

        // Continue / New Game / Load File buttons
        const btnContinue = document.getElementById('btn-continue');
        if (btnContinue) {
            btnContinue.addEventListener('click', () => {
                const music = document.getElementById('battle-intro');
                music.play().catch(err => console.log(err));
                if (this.callbacks.onContinue) this.callbacks.onContinue();
            });
        }

        document.getElementById('btn-new-game').addEventListener('click', () => {
            if (this.callbacks.onNewGame) this.callbacks.onNewGame();
        });

        document.getElementById('btn-load-file').addEventListener('click', () => {
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
                        if (this.callbacks.onLoadFile) this.callbacks.onLoadFile(json);
                    } catch (err) {
                        console.error('Error parsing save file:', err);
                        alert('Invalid save file!');
                    }
                };
                reader.readAsText(file);
            };

            input.click();
        });

        // Back button in secondary menu
        const btnBack = document.getElementById('btn-back');
        if (btnBack) {
            btnBack.addEventListener('click', () => this.hideSecondaryMenu());
        }

        this.setupUserInputDetection();
    }

    setupUserInputDetection() {
        const handleUserInput = () => {
            if (!this.animationComplete && !this.userInterrupted) {
                this.userInterrupted = true;
                this.skipToButtons();
            }
        };
        document.addEventListener('keydown', handleUserInput, { once: true });
        document.addEventListener('click', handleUserInput, { once: true });
        document.addEventListener('touchstart', handleUserInput, { once: true });
    }

    startAnimationSequence() {
        setTimeout(() => this.startBirdAnimations(), 3000);
        setTimeout(() => this.triggerLightning(), 4500);
        setTimeout(() => {
            if (!this.userInterrupted) this.showButtons();
        }, 6000);
    }

    startBirdAnimations() {
        const birdsContainer = document.getElementById('birds-container');
        const birdImages = [
            '../../src/assets/art/title-screen/crow/crow-1.png',
            '../../src/assets/art/title-screen/crow/crow-2.png',
            '../../src/assets/art/title-screen/crow/crow-3.png'
        ];

        const createBird = (delay) => {
            setTimeout(() => {
                const bird = document.createElement('div');
                bird.className = 'bird';
                const randomImage = birdImages[Math.floor(Math.random() * birdImages.length)];
                bird.style.backgroundImage = `url('${randomImage}')`;
                const startY = Math.random() * 40 + 10;
                bird.style.top = `${startY}%`;
                bird.style.left = '-50px';
                const flyDistanceX = Math.random() * 600 + 800;
                const flyDistanceY = (Math.random() - 0.5) * 200;
                const duration = Math.random() * 5 + 8;
                bird.style.setProperty('--fly-distance-x', `${flyDistanceX}px`);
                bird.style.setProperty('--fly-distance-y', `${flyDistanceY}px`);
                bird.style.animation = `flyBird ${duration}s linear forwards`;
                birdsContainer.appendChild(bird);
                setTimeout(() => bird.remove(), duration * 1000);
            }, delay);
        };

        for (let i = 0; i < 8; i++) createBird(i * 2000);
        this.birdInterval = setInterval(() => createBird(0), 4000);
    }

    triggerLightning() {
        const lightningFlash = document.getElementById('lightning-flash');
        lightningFlash.style.animation = 'lightningStrike 0.8s ease-out forwards';
        setTimeout(() => { lightningFlash.style.animation = ''; }, 800);
    }

    showButtons() {
        this.animationComplete = true;
        const menuButtons = document.getElementById('menu-buttons');
        menuButtons.classList.add('visible');
    }

    skipToButtons() {
        const background = document.getElementById('background');
        const titleText = document.getElementById('title-text');
        const menuButtons = document.getElementById('menu-buttons');

        background.style.animation = 'none';
        background.style.opacity = '1';

        titleText.style.animation = 'none';
        titleText.style.opacity = '1';
        titleText.style.transform = 'scale(1)';

        menuButtons.classList.add('instant');
        this.animationComplete = true;
    }

    showSecondaryMenu() {
        const titleText = document.getElementById('title-text');
        const initialButtons = document.getElementById('initial-buttons');
        const secondary = document.getElementById('secondary-buttons');

        // Fade out title & initial buttons
        titleText.style.transition = 'opacity 0.5s ease';
        initialButtons.style.transition = 'opacity 0.5s ease';
        titleText.style.opacity = 0;
        initialButtons.style.opacity = 0;

        setTimeout(() => {
            titleText.style.display = 'none';
            initialButtons.style.display = 'none';

            // Show secondary menu centered
            secondary.style.display = 'flex';
            secondary.style.opacity = 0;
            secondary.style.transition = 'opacity 0.5s ease-in';
            requestAnimationFrame(() => secondary.style.opacity = 1);
        }, 500);
    }

    hideSecondaryMenu() {
        const secondary = document.getElementById('secondary-buttons');
        secondary.style.opacity = 0;
        secondary.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            secondary.style.display = 'none';
            const titleText = document.getElementById('title-text');
            const initialButtons = document.getElementById('initial-buttons');

            titleText.style.display = 'block';
            initialButtons.style.display = 'flex';
            titleText.style.opacity = 0;
            initialButtons.style.opacity = 0;

            requestAnimationFrame(() => {
                titleText.style.transition = 'opacity 0.5s ease';
                initialButtons.style.transition = 'opacity 0.5s ease';
                titleText.style.opacity = 1;
                initialButtons.style.opacity = 1;
            });
        }, 500);
    }

    showExitConfirmation() {
        const title = document.getElementById('title-text');
        const initialButtons = document.getElementById('initial-buttons');

        title.style.transition = 'opacity 0.5s ease';
        initialButtons.style.transition = 'opacity 0.5s ease';
        title.style.opacity = 0;
        initialButtons.style.opacity = 0;

        setTimeout(() => {
            title.style.display = 'none';
            initialButtons.style.display = 'none';

            const panel = document.getElementById('exit-confirmation');
            panel.style.display = 'flex';
            panel.style.opacity = 0;
            panel.style.transition = 'opacity 0.5s ease-in';
            requestAnimationFrame(() => panel.style.opacity = 1);
        }, 500);
    }

    hideExitConfirmation() {
        const panel = document.getElementById('exit-confirmation');
        panel.style.opacity = 0;
        panel.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            panel.style.display = 'none';

            const title = document.getElementById('title-text');
            const initialButtons = document.getElementById('initial-buttons');

            title.style.display = 'block';
            initialButtons.style.display = 'flex';
            title.style.opacity = 0;
            initialButtons.style.opacity = 0;

            requestAnimationFrame(() => {
                title.style.transition = 'opacity 0.5s ease';
                initialButtons.style.transition = 'opacity 0.5s ease';
                title.style.opacity = 1;
                initialButtons.style.opacity = 1;
            });
        }, 500);
    }

    cleanup() {
        if (this.birdInterval) clearInterval(this.birdInterval);
    }
}
