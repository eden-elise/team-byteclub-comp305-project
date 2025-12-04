export class IntroScrollSceneController {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.scrollComplete = false;
        this.skipped = false;
        this.init();
    }

    init() {
        // load the CSS
        this.loadCSS();

        // wait for animation to complete naturally
        this.setupAnimationEnd();

        // allow user to skip
        this.setupSkipHandlers();
    }

    loadCSS() {
        // check if CSS is already loaded
        if (!document.querySelector('link[href*="introScrollScene.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = './css/introScrollScene.css';
            document.head.appendChild(link);
        }
    }

    setupAnimationEnd() {
        // the scroll animation is 45 seconds (45000ms)
        // add a small buffer to ensure animation completes
        setTimeout(() => {
            if (!this.skipped) {
                this.complete();
            }
        }, 46000); // 46 seconds = 45s animation + 1s buffer
    }

    setupSkipHandlers() {
        // allow skip via keyboard
        const handleKeyPress = (e) => {
            this.skip();
        };

        // allow skip via mouse click
        const handleClick = (e) => {
            this.skip();
        };

        // add event listeners (once only)
        document.addEventListener('keydown', handleKeyPress, { once: true });
        document.addEventListener('click', handleClick, { once: true });

        // store references so we can clean up if needed
        this.keyHandler = handleKeyPress;
        this.clickHandler = handleClick;
    }

    skip() {
        if (this.scrollComplete) return;

        this.skipped = true;
        this.complete();
    }

    complete() {
        if (this.scrollComplete) return;

        this.scrollComplete = true;

        // fade out effect before transitioning
        const scene = document.getElementById('intro-scroll-scene');
        if (scene) {
            scene.style.transition = 'opacity 0.5s ease-out';
            scene.style.opacity = '0';
        }

        // wait for fade out, then call completion callback
        setTimeout(() => {
            if (this.callbacks && this.callbacks.onComplete) {
                this.callbacks.onComplete();
            }
        }, 500);
    }
}
