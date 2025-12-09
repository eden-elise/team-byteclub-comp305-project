
/**
 * Text effect styles that can be applied to characters
 */
const TEXT_EFFECTS = {
    jumping: (char, time, index) => {
        const offset = Math.sin(time * 0.005 + index * 0.3) * 5;
        return `translateY(${offset}px)`;
    },
    shaking: (char, time, index) => {
        const offsetX = (Math.random() - 0.5) * 3;
        const offsetY = (Math.random() - 0.5) * 3;
        return `translate(${offsetX}px, ${offsetY}px)`;
    },
    waving: (char, time, index) => {
        const offset = Math.sin(time * 0.003 + index * 0.5) * 3;
        return `translateY(${offset}px)`;
    },
    rainbow: (char, time, index) => {
        const hue = (time * 0.1 + index * 20) % 360;
        return { color: `hsl(${hue}, 80%, 60%)` };
    },
    glowing: (char, time, index) => {
        const intensity = (Math.sin(time * 0.005 + index * 0.2) + 1) / 2;
        return { textShadow: `0 0 ${5 + intensity * 10}px currentColor` };
    },
    fade: (char, time, index) => {
        const opacity = (Math.sin(time * 0.003 + index * 0.3) + 1) / 2 * 0.5 + 0.5;
        return { opacity: opacity.toFixed(2) };
    }
};

/**
 * Predefined style presets for common text styles
 */
const STYLE_PRESETS = {
    yelling: {
        'font-weight': 'bold',
        'font-size': '1.2em',
        'color': '#ff4444'
    },
    whispering: {
        'font-size': '0.85em',
        'font-style': 'italic',
        'opacity': '0.7'
    },
    thinking: {
        'font-style': 'italic',
        'color': '#888888'
    },
    important: {
        'font-weight': 'bold',
        'color': '#ffaa00',
        'text-shadow': '0 0 5px rgba(255, 170, 0, 0.5)'
    },
    mysterious: {
        'color': '#9966ff',
        'font-style': 'italic'
    }
};

/**
 * Parse text with inline style flags
 * Format: [flag1: value1, flag2: value2] text content [/]
 */
function parseStyledText(text) {
    const segments = [];
    const regex = /\[([^\]]+)\](.*?)\[\/\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add unstyled text before this match
        if (match.index > lastIndex) {
            segments.push({
                text: text.substring(lastIndex, match.index),
                styles: {},
                effect: null
            });
        }

        // Parse style flags
        const flagsStr = match[1];
        const content = match[2];
        const styles = {};
        let effect = null;

        // Parse individual flags
        const flags = flagsStr.split(',').map(f => f.trim());
        flags.forEach(flag => {
            const [key, ...valueParts] = flag.split(':').map(s => s.trim());
            const value = valueParts.join(':').trim();

            if (key === 'style' && STYLE_PRESETS[value]) {
                // Apply preset styles
                Object.assign(styles, STYLE_PRESETS[value]);
            } else if (key === 'effect') {
                effect = value;
            } else {
                // Direct style property
                styles[key] = value;
            }
        });

        segments.push({
            text: content,
            styles,
            effect
        });

        lastIndex = regex.lastIndex;
    }

    // Add remaining unstyled text
    if (lastIndex < text.length) {
        segments.push({
            text: text.substring(lastIndex),
            styles: {},
            effect: null
        });
    }

    return segments;
}

/**
 * Create a speaker configuration
 */
export function createSpeaker(name, options = {}) {
    return {
        name,
        prefix: options.prefix || `${name}: `,
        orientation: options.orientation || 'left', // 'left', 'right', 'center'
        color: options.color || '#ffffff',
        fontWeight: options.fontWeight || 'bold',
        fontSize: options.fontSize || '1em',
        showPrefix: options.showPrefix || true,
        ...options
    };
}

/**
 * Typewriter Textbox Web Component
 */
export class TypewriterTextbox extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        this._queue = [];
        this.isProcessing = false;
        this.isTyping = false;
        this.isPaused = false;
        this.skipRequested = false;
        this.currentAnimationFrames = [];
        
        // Default configuration
        this.config = {
            defaultSpeed: 30,
            skipSpeed: 5,
            punctuationDelay: 200,
            autoAdvance: false,
            autoAdvanceDelay: 1500,
            showCursor: true,
            cursorChar: '▼',
            cursorBlinkSpeed: 500,
            allowSkip: true,
            clearOnComplete: false,
            onComplete: null,
            onQueueEmpty: null,
            onCharacter: null,
            soundEffect: null
        };

        this.currentSpeaker = null;
        this.cursorElement = null;
        this.textContainer = null;
    }

    connectedCallback() {
        this.render();
        this._setupCursor();

        window.addEventListener('pointerdown', (e) => this.handleInput(e));
        window.addEventListener('keydown', (e) => this.handleInput(e));
    }

    disconnectedCallback() {
        this.destroy();
    }

    /**
     * Initialize with options
     */
    init(options = {}) {
        this.config = { ...this.config, ...options };
        if (this.cursorElement) {
            this.cursorElement.textContent = this.config.cursorChar;
        }
        return this;
    }

    render() {
        // Create styles
        const style = document.createElement('style');
        style.textContent = `
            :host {
                display: block;
                position: relative;
                font-family: inherit;
                line-height: 1.5;
                font-size: 1.5rem;
                transition: height 0.5s ease-in-out;
                overflow: hidden;
            }
            .text-container {
                white-space: pre-wrap;
                position: relative;
                color: inherit;
            }
            .cursor {
                display: inline-block;
                margin-left: 5px;
                opacity: 0;
                transition: opacity 0.2s;
            }
        `;

        this.textContainer = document.createElement('div');
        this.textContainer.className = 'text-container';

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(this.textContainer);
    }

    /**
     * Resize the textbox container
     * @param {string} height - CSS height value (e.g., '300px', 'auto')
     */
    async resize(height) {
        this.style.height = height;
        // Wait for transition to complete
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    _setupCursor() {
        if (!this.config.showCursor) return;

        this.cursorElement = document.createElement('span');
        this.cursorElement.className = 'cursor';
        this.cursorElement.textContent = this.config.cursorChar;
        this.cursorElement.style.transition = `opacity ${this.config.cursorBlinkSpeed}ms`;
        
        this._startCursorBlink();
    }

    _startCursorBlink() {
        if (!this.cursorElement) return;
        this._stopCursorBlink();

        this.cursorBlinkInterval = setInterval(() => {
            if (!this.cursorElement) return;
            const currentOpacity = parseFloat(window.getComputedStyle(this.cursorElement).opacity);
            this.cursorElement.style.opacity = currentOpacity > 0.5 ? '0' : '1';
        }, this.config.cursorBlinkSpeed);
    }

    _stopCursorBlink() {
        if (this.cursorBlinkInterval) {
            clearInterval(this.cursorBlinkInterval);
            this.cursorBlinkInterval = null;
        }
    }

    /**
     * Add text to the queue
     */
    queue(text, options = {}) {
        // Normalize speaker object to ensure showPrefix defaults to true
        let speaker = options.speaker || null;
        if (speaker) {
            // Set defaults for missing properties
            speaker = {
                prefix: speaker.prefix || `${speaker.name}: `,
                color: speaker.color || '#ffffff',
                fontWeight: speaker.fontWeight || 'bold',
                fontSize: speaker.fontSize || '1em',
                orientation: speaker.orientation || 'left',
                showPrefix: speaker.showPrefix !== undefined ? speaker.showPrefix : true,
                ...speaker
            };
        }

        this._queue.push({
            ...options,
            text,
            speaker: speaker,
            speed: options.speed || this.config.defaultSpeed,
            onComplete: options.onComplete || null
        });

        if (!this.isProcessing) {
            this._processQueue();
        }

        return this;
    }

    async _processQueue() {
        if (this.isProcessing || this._queue.length === 0) return;

        this.isProcessing = true;

        while (this._queue.length > 0) {
            const entry = this._queue.shift();
            await this._displayEntry(entry);

            // Wait for input if configured
            if (entry.waitForInput) {
                await this._waitForAdvance();
            }

            if (entry.onComplete) {
                entry.onComplete();
            }

            if (this.config.autoAdvance && this._queue.length > 0) {
                // Wait for either timeout OR advance signal (user click)
                await Promise.race([
                    new Promise(resolve => setTimeout(resolve, this.config.autoAdvanceDelay)),
                    this._waitForAdvance()
                ]);
            } else if (this._queue.length > 0 && !entry.waitForInput) {
                await this._waitForAdvance();
            }
        }

        this.isProcessing = false;

        if (this.config.clearOnComplete) {
            this.clear();
        }

        if (this.config.onQueueEmpty) {
            this.config.onQueueEmpty();
        }
    }

    async _displayEntry(entry) {
        this.skipRequested = false;
        this.currentSpeaker = entry.speaker;

        // Clear previous content
        this.textContainer.innerHTML = '';

        // Add speaker prefix
        if (entry.speaker && entry.speaker.showPrefix === true) {
            const speakerSpan = document.createElement('span');
            speakerSpan.textContent = entry.speaker.prefix || `${entry.speaker.name}: `;
            speakerSpan.style.color = entry.speaker.color || '#ffffff';
            speakerSpan.style.fontWeight = entry.speaker.fontWeight || 'bold';
            speakerSpan.style.fontSize = entry.speaker.fontSize || '1em';
            speakerSpan.style.display = 'inline-block';
            speakerSpan.style.marginRight = '0.5em';
            this.textContainer.appendChild(speakerSpan);
        }

        // Apply orientation to the container
        if (entry.speaker) {
            if (entry.speaker.orientation === 'right') {
                this.textContainer.style.textAlign = 'right';
            } else if (entry.speaker.orientation === 'center') {
                this.textContainer.style.textAlign = 'center';
            } else {
                this.textContainer.style.textAlign = 'left';
            }
        } else {
            this.textContainer.style.textAlign = 'center'; // Default
        }

        const segments = parseStyledText(entry.text);

        for (const segment of segments) {
            await this._typeSegment(segment, entry.speed);
        }

        if (this.cursorElement && (!this.config.autoAdvance || entry.waitForInput)) {
            this.textContainer.appendChild(this.cursorElement);
        }


    }

    async _typeSegment(segment, speed) {
        this.isTyping = true;
        const container = document.createElement('span');
        container.style.display = 'inline-block'; // Ensure container respects transforms of children
        
        Object.entries(segment.styles).forEach(([key, value]) => {
            container.style[key] = value;
        });

        this.textContainer.appendChild(container);
        for (let i = 0; i < segment.text.length; i++) {
            
            const char = segment.text[i];
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.style.display = 'inline-block';
            charSpan.style.willChange = 'transform'; // Optimize for animations
            
            // Preserve spaces
            if (char === ' ') {
                charSpan.style.width = '0.25em';
            }
            
            if (segment.effect) {
                charSpan.dataset.effect = segment.effect;
                charSpan.dataset.index = i;
                this._applyEffect(charSpan);
            }

            container.appendChild(charSpan);

            // If skip is requested, instantly add all remaining characters
            if (this.skipRequested) {
                // Continue loop to add remaining characters instantly
                for (let j = i + 1; j < segment.text.length; j++) {
                    const remainingChar = segment.text[j];
                    const remainingSpan = document.createElement('span');
                    remainingSpan.textContent = remainingChar;
                    remainingSpan.style.display = 'inline-block';
                    remainingSpan.style.willChange = 'transform';
                    
                    if (remainingChar === ' ') {
                        remainingSpan.style.width = '0.25em';
                    }
                    
                    if (segment.effect) {
                        remainingSpan.dataset.effect = segment.effect;
                        remainingSpan.dataset.index = j;
                        this._applyEffect(remainingSpan);
                    }
                    
                    container.appendChild(remainingSpan);
                }
                break; // Exit the main loop
            }

            if (this.config.soundEffect && char.trim()) {
                this.config.soundEffect(char);
            }

            if (this.config.onCharacter) {
                this.config.onCharacter(char, i);
            }

            let delay = this.skipRequested ? this.config.skipSpeed : speed;
            if (['.', '!', '?'].includes(char)) {
                delay += this.config.punctuationDelay;
            }

            await new Promise(resolve => setTimeout(resolve, delay));
        }
        this.isTyping = false;
    }

    _applyEffect(charSpan) {
        const effect = charSpan.dataset.effect;
        const index = parseInt(charSpan.dataset.index);
        const effectFn = TEXT_EFFECTS[effect];

        if (!effectFn) {
            console.warn(`Effect "${effect}" not found in TEXT_EFFECTS`);
            return;
        }

        let frameId;
        const animate = () => {
            if (!charSpan.isConnected) {
                // Stop animation if element is removed
                if (frameId) {
                    cancelAnimationFrame(frameId);
                    const idx = this.currentAnimationFrames.indexOf(frameId);
                    if (idx > -1) {
                        this.currentAnimationFrames.splice(idx, 1);
                    }
                }
                return;
            }
            
            const time = Date.now();
            const result = effectFn(charSpan.textContent, time, index);

            if (typeof result === 'string') {
                charSpan.style.transform = result;
            } else if (typeof result === 'object') {
                Object.entries(result).forEach(([key, value]) => {
                    charSpan.style[key] = value;
                });
            }

            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);
        this.currentAnimationFrames.push(frameId);
    }

    _waitForAdvance() {
        return new Promise(resolve => {
            this._advanceResolver = resolve;
        });
    }

    advance() {
        if (this._advanceResolver) {
            this._advanceResolver();
            this._advanceResolver = null;
        }
    }

    skip() {
        if (this.config.allowSkip) {
            this.skipRequested = true;
        }
    }

    /**
     * Handle user input (click/key press)
     * Returns true if input was handled
     */
    handleInput(e) {
        if (this.isTyping) {
            this.skip();
            return true;
        } else if (this._advanceResolver) {
            this.advance();
            return true;
        }
        return false;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    clear() {
        if (this.textContainer) {
            this.textContainer.innerHTML = '';
        }
        this._stopAnimations();
    }

    _stopAnimations() {
        this.currentAnimationFrames.forEach(frameId => {
            cancelAnimationFrame(frameId);
        });
        this.currentAnimationFrames = [];
    }

    clearQueue() {
        this._queue = [];
    }

    isActive() {
        return this.isProcessing;
    }

    getQueueLength() {
        return this._queue.length;
    }

    destroy() {
        this._stopCursorBlink();
        this._stopAnimations();
        this.clearQueue();
        this.clear();
    }
}

customElements.define('typewriter-textbox', TypewriterTextbox);
