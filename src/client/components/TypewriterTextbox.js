/**
 * @fileoverview TypewriterTextbox Web Component - A customizable typewriter-style text display
 * component with support for text effects, styled text segments, and speaker configurations.
 * @module TypewriterTextbox
 */

/**
 * @typedef {Object} TextSegment
 * @property {string} text - The text content of the segment
 * @property {Object.<string, string>} styles - CSS styles to apply to the segment
 * @property {string|null} effect - The name of the text effect to apply (e.g., 'jumping', 'shaking')
 */

/**
 * @typedef {Object} Speaker
 * @property {string} name - The speaker's display name
 * @property {string} prefix - Text prefix shown before dialogue (e.g., "Name: ")
 * @property {'left'|'right'|'center'} orientation - Text alignment for the speaker
 * @property {string} color - CSS color for the speaker's name
 * @property {string} fontWeight - CSS font-weight for the speaker's name
 * @property {string} fontSize - CSS font-size for the speaker's name
 * @property {boolean} showPrefix - Whether to display the speaker prefix
 */

/**
 * @typedef {Object} QueueEntry
 * @property {string} text - The text to display
 * @property {Speaker|null} speaker - Speaker configuration for this entry
 * @property {number} speed - Typing speed in milliseconds per character
 * @property {boolean} [waitForInput] - Whether to wait for user input before continuing
 * @property {Function|null} [onComplete] - Callback fired when this entry finishes displaying
 */

/**
 * @typedef {Object} TypewriterConfig
 * @property {number} defaultSpeed - Default typing speed in ms per character
 * @property {number} skipSpeed - Typing speed when skip is requested
 * @property {number} punctuationDelay - Additional delay after punctuation marks
 * @property {boolean} autoAdvance - Whether to auto-advance through queue
 * @property {number} autoAdvanceDelay - Delay before auto-advancing in ms
 * @property {boolean} showCursor - Whether to show the cursor
 * @property {string} cursorChar - Character to use for cursor
 * @property {number} cursorBlinkSpeed - Cursor blink interval in ms
 * @property {boolean} allowSkip - Whether users can skip typing animation
 * @property {boolean} clearOnComplete - Whether to clear text when queue empties
 * @property {Function|null} onComplete - Callback when all text is displayed
 * @property {Function|null} onQueueEmpty - Callback when queue becomes empty
 * @property {Function|null} onCharacter - Callback fired for each character typed
 * @property {Function|null} soundEffect - Function to play sound for each character
 */

/**
 * @typedef {function(string, number, number): (string|Object.<string, string>)} EffectFunction
 * @description Function that calculates transform or style for a character
 * @param {string} char - The character being animated
 * @param {number} time - Current timestamp for animation
 * @param {number} index - Character index in the text
 * @returns {string|Object.<string, string>} CSS transform string or style object
 */

/**
 * Text effect styles that can be applied to characters.
 * Each effect is a function that returns either a CSS transform string
 * or an object of CSS properties to apply.
 * @type {Object.<string, EffectFunction>}
 */
const TEXT_EFFECTS = {
  /**
   * Makes characters bounce up and down in a wave pattern
   * @type {EffectFunction}
   */
  jumping: (char, time, index) => {
    const offset = Math.sin(time * 0.005 + index * 0.3) * 5;
    return `translateY(${offset}px)`;
  },
  /**
   * Makes characters shake randomly in place
   * @type {EffectFunction}
   */
  shaking: (char, time, index) => {
    const offsetX = (Math.random() - 0.5) * 3;
    const offsetY = (Math.random() - 0.5) * 3;
    return `translate(${offsetX}px, ${offsetY}px)`;
  },
  /**
   * Makes characters move in a gentle wave motion
   * @type {EffectFunction}
   */
  waving: (char, time, index) => {
    const offset = Math.sin(time * 0.003 + index * 0.5) * 3;
    return `translateY(${offset}px)`;
  },
  /**
   * Cycles character colors through the rainbow spectrum
   * @type {EffectFunction}
   */
  rainbow: (char, time, index) => {
    const hue = (time * 0.1 + index * 20) % 360;
    return { color: `hsl(${hue}, 80%, 60%)` };
  },
  /**
   * Makes characters pulse with a glowing effect
   * @type {EffectFunction}
   */
  glowing: (char, time, index) => {
    const intensity = (Math.sin(time * 0.005 + index * 0.2) + 1) / 2;
    return { textShadow: `0 0 ${5 + intensity * 10}px currentColor` };
  },
  /**
   * Makes characters fade in and out
   * @type {EffectFunction}
   */
  fade: (char, time, index) => {
    const opacity = ((Math.sin(time * 0.003 + index * 0.3) + 1) / 2) * 0.5 + 0.5;
    return { opacity: opacity.toFixed(2) };
  },
};

/**
 * Predefined style presets for common text styles.
 * These can be referenced using [style: presetName] in text.
 * @type {Object.<string, Object.<string, string>>}
 */
const STYLE_PRESETS = {
  /**
   * Bold, larger red text for shouting/emphasis
   */
  yelling: {
    'font-weight': 'bold',
    'font-size': '1.2em',
    color: '#ff4444',
  },
  /**
   * Smaller, italic, faded text for quiet speech
   */
  whispering: {
    'font-size': '0.85em',
    'font-style': 'italic',
    opacity: '0.7',
  },
  /**
   * Gray italic text for internal thoughts
   */
  thinking: {
    'font-style': 'italic',
    color: '#888888',
  },
  /**
   * Bold gold text with glow for important information
   */
  important: {
    'font-weight': 'bold',
    color: '#ffaa00',
    'text-shadow': '0 0 5px rgba(255, 170, 0, 0.5)',
  },
  /**
   * Purple italic text for mysterious/magical content
   */
  mysterious: {
    color: '#9966ff',
    'font-style': 'italic',
  },
};

/**
 * Parse text with inline style flags.
 * Supports format: [flag1: value1, flag2: value2]text content[/]
 *
 * @param {string} text - The text to parse for style flags
 * @returns {TextSegment[]} Array of text segments with their associated styles and effects
 *
 * @example
 * // Returns segments for styled and unstyled text
 * parseStyledText("Hello [style: yelling]WORLD[/]!")
 * // Returns: [
 * //   { text: "Hello ", styles: {}, effect: null },
 * //   { text: "WORLD", styles: { 'font-weight': 'bold', ... }, effect: null },
 * //   { text: "!", styles: {}, effect: null }
 * // ]
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
        effect: null,
      });
    }

    // Parse style flags
    const flagsStr = match[1];
    const content = match[2];
    const styles = {};
    let effect = null;

    // Parse individual flags
    const flags = flagsStr.split(',').map((f) => f.trim());
    flags.forEach((flag) => {
      const [key, ...valueParts] = flag.split(':').map((s) => s.trim());
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
      effect,
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining unstyled text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      styles: {},
      effect: null,
    });
  }

  return segments;
}

/**
 * Create a speaker configuration object with default values.
 * Speakers define how dialogue is displayed including name prefix,
 * text alignment, and styling.
 *
 * @param {string} name - The speaker's display name
 * @param {Object} [options={}] - Configuration options
 * @param {string} [options.prefix] - Custom prefix (defaults to "name: ")
 * @param {'left'|'right'|'center'} [options.orientation='left'] - Text alignment
 * @param {string} [options.color='#ffffff'] - CSS color for speaker name
 * @param {string} [options.fontWeight='bold'] - CSS font-weight
 * @param {string} [options.fontSize='1em'] - CSS font-size
 * @param {boolean} [options.showPrefix=true] - Whether to show the speaker prefix
 * @returns {Speaker} Configured speaker object
 *
 * @example
 * const narrator = createSpeaker('Narrator', {
 *   orientation: 'center',
 *   color: '#aaaaaa',
 *   showPrefix: false
 * });
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
    ...options,
  };
}

/**
 * Normalize a speaker object by applying default values for any missing properties.
 *
 * @param {Speaker|null} speaker - The speaker object to normalize
 * @returns {Speaker|null} Normalized speaker object or null if input is null
 * @private
 */
function normalizeSpeaker(speaker) {
  if (!speaker) return null;

  return {
    prefix: speaker.prefix || `${speaker.name}: `,
    color: speaker.color || '#ffffff',
    fontWeight: speaker.fontWeight || 'bold',
    fontSize: speaker.fontSize || '1em',
    orientation: speaker.orientation || 'left',
    showPrefix: speaker.showPrefix !== undefined ? speaker.showPrefix : true,
    ...speaker,
  };
}

/**
 * Create a span element for a single character in the typewriter effect.
 * Handles spacing for space characters and sets up effect data attributes.
 *
 * @param {string} char - The character to display
 * @param {number} index - The character's index in the text (used for effect calculations)
 * @param {string|null} effect - The effect name to apply, or null for no effect
 * @returns {HTMLSpanElement} Configured span element for the character
 * @private
 */
function createCharSpan(char, index, effect) {
  const charSpan = document.createElement('span');
  charSpan.textContent = char;
  charSpan.style.display = effect ? 'inline-block' : 'inline';
  charSpan.style.willChange = effect ? 'transform' : 'auto';

  if (char === ' ') {
    charSpan.style.width = '0.25em';
  }

  if (effect) {
    charSpan.dataset.effect = effect;
    charSpan.dataset.index = index;
  }

  return charSpan;
}

/**
 * Get the CSS text-align value based on speaker orientation.
 *
 * @param {Speaker|null} speaker - The speaker object to get alignment from
 * @returns {'left'|'right'|'center'} CSS text-align value
 * @private
 */
function getTextAlignment(speaker) {
  if (!speaker) return 'center';

  const orientationMap = {
    right: 'right',
    center: 'center',
    left: 'left',
  };

  return orientationMap[speaker.orientation] || 'left';
}

/**
 * TypewriterTextbox Web Component
 *
 * A custom HTML element that displays text with a typewriter animation effect.
 * Supports multiple speakers, text effects, styled text segments, and a queue system
 * for managing multiple dialogue entries.
 *
 * @extends HTMLElement
 *
 * @example
 * // HTML usage
 * <typewriter-textbox id="dialogue"></typewriter-textbox>
 *
 * @example
 * // JavaScript usage
 * const textbox = document.querySelector('#dialogue');
 * textbox.init({ defaultSpeed: 50, showCursor: true });
 *
 * const speaker = createSpeaker('Hero', { color: '#00ff00' });
 * textbox.queue('Hello, world!', { speaker });
 *
 * @fires TypewriterTextbox#complete - When all text in queue has been displayed
 * @fires TypewriterTextbox#queueEmpty - When the queue becomes empty
 */
export class TypewriterTextbox extends HTMLElement {
  /**
   * Creates a new TypewriterTextbox instance.
   * Initializes internal state and default configuration.
   */
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    /**
     * Queue of text entries waiting to be displayed
     * @type {QueueEntry[]}
     * @private
     */
    this._queue = [];

    /**
     * Whether the component is currently processing the queue
     * @type {boolean}
     */
    this.isProcessing = false;

    /**
     * Whether text is currently being typed out
     * @type {boolean}
     */
    this.isTyping = false;

    /**
     * Whether the typewriter is paused
     * @type {boolean}
     */
    this.isPaused = false;

    /**
     * Whether a skip has been requested
     * @type {boolean}
     */
    this.skipRequested = false;

    /**
     * Array of animation frame IDs for cleanup
     * @type {number[]}
     * @private
     */
    this.currentAnimationFrames = [];

    /**
     * Component configuration
     * @type {TypewriterConfig}
     */
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
      soundEffect: null,
    };

    /**
     * Currently active speaker configuration
     * @type {Speaker|null}
     */
    this.currentSpeaker = null;

    /**
     * Reference to the cursor DOM element
     * @type {HTMLSpanElement|null}
     */
    this.cursorElement = null;

    /**
     * Reference to the text container DOM element
     * @type {HTMLDivElement|null}
     */
    this.textContainer = null;
  }

  /**
   * Called when element is added to the DOM.
   * Sets up rendering and event listeners.
   * @override
   */
  connectedCallback() {
    this.render();
    this._setupCursor();

    window.addEventListener('pointerdown', (e) => this.handleInput(e));
    window.addEventListener('keydown', (e) => this.handleInput(e));
  }

  /**
   * Called when element is removed from the DOM.
   * Cleans up resources.
   * @override
   */
  disconnectedCallback() {
    this.destroy();
  }

  /**
   * Initialize the component with custom options.
   * Merges provided options with default configuration.
   *
   * @param {Partial<TypewriterConfig>} [options={}] - Configuration options to override defaults
   * @returns {TypewriterTextbox} This instance for method chaining
   *
   * @example
   * textbox.init({
   *   defaultSpeed: 50,
   *   autoAdvance: true,
   *   autoAdvanceDelay: 2000,
   *   soundEffect: (char) => playSound('type')
   * });
   */
  init(options = {}) {
    this.config = { ...this.config, ...options };
    if (this.cursorElement) {
      this.cursorElement.textContent = this.config.cursorChar;
    }
    return this;
  }

  /**
   * Render the component's shadow DOM structure.
   * Creates the style element and text container.
   * @private
   */
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
                word-wrap: break-word;       
                overflow-wrap: break-word;
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
   * Resize the textbox container with animation.
   *
   * @param {string} height - CSS height value (e.g., '300px', 'auto')
   * @returns {Promise<void>} Resolves when the resize transition completes
   *
   * @example
   * await textbox.resize('200px');
   */
  async resize(height) {
    this.style.height = height;
    // Wait for transition to complete
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  /**
   * Set up the cursor element and start blinking animation.
   * @private
   */
  _setupCursor() {
    if (!this.config.showCursor) return;

    this.cursorElement = document.createElement('span');
    this.cursorElement.className = 'cursor';
    this.cursorElement.textContent = this.config.cursorChar;
    this.cursorElement.style.transition = `opacity ${this.config.cursorBlinkSpeed}ms`;

    this._startCursorBlink();
  }

  /**
   * Start the cursor blinking interval.
   * @private
   */
  _startCursorBlink() {
    if (!this.cursorElement) return;
    this._stopCursorBlink();

    this.cursorBlinkInterval = setInterval(() => {
      if (!this.cursorElement) return;
      const currentOpacity = parseFloat(window.getComputedStyle(this.cursorElement).opacity);
      this.cursorElement.style.opacity = currentOpacity > 0.5 ? '0' : '1';
    }, this.config.cursorBlinkSpeed);
  }

  /**
   * Stop the cursor blinking interval.
   * @private
   */
  _stopCursorBlink() {
    if (this.cursorBlinkInterval) {
      clearInterval(this.cursorBlinkInterval);
      this.cursorBlinkInterval = null;
    }
  }

  /**
   * Add text to the display queue.
   * If not currently processing, starts processing the queue.
   *
   * @param {string} text - The text to display (can include style flags)
   * @param {Object} [options={}] - Display options for this entry
   * @param {Speaker} [options.speaker] - Speaker configuration for this text
   * @param {number} [options.speed] - Typing speed override for this entry
   * @param {boolean} [options.waitForInput] - Wait for user input after displaying
   * @param {Function} [options.onComplete] - Callback when this entry finishes
   * @returns {TypewriterTextbox} This instance for method chaining
   *
   * @example
   * textbox
   *   .queue('Hello!', { speaker: hero })
   *   .queue('How are you?', { speaker: hero, waitForInput: true })
   *   .queue('[style: thinking]I wonder...[/]');
   */
  queue(text, options = {}) {
    this._queue.push({
      ...options,
      text,
      speaker: normalizeSpeaker(options.speaker),
      speed: options.speed || this.config.defaultSpeed,
      onComplete: options.onComplete || null,
    });

    if (!this.isProcessing) {
      this._processQueue();
    }

    return this;
  }

  /**
   * Process entries in the queue sequentially.
   * Handles auto-advance and user input waiting.
   * @private
   * @async
   */
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
          new Promise((resolve) => setTimeout(resolve, this.config.autoAdvanceDelay)),
          this._waitForAdvance(),
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

  /**
   * Display a single queue entry with typewriter effect.
   *
   * @param {QueueEntry} entry - The queue entry to display
   * @private
   * @async
   */
  async _displayEntry(entry) {
    this.skipRequested = false;
    this.currentSpeaker = entry.speaker;
    this.textContainer.innerHTML = '';
    this.textContainer.style.textAlign = getTextAlignment(entry.speaker);

    this._addSpeakerPrefix(entry.speaker);

    const segments = parseStyledText(entry.text);
    for (const segment of segments) {
      await this._typeSegment(segment, entry.speed);
    }

    if (this.cursorElement && (!this.config.autoAdvance || entry.waitForInput)) {
      this.textContainer.appendChild(this.cursorElement);
    }
  }

  /**
   * Add the speaker's name prefix to the text container.
   *
   * @param {Speaker|null} speaker - The speaker whose prefix to add
   * @private
   */
  _addSpeakerPrefix(speaker) {
    if (!speaker || speaker.showPrefix !== true) return;

    const speakerSpan = document.createElement('span');
    speakerSpan.textContent = speaker.prefix;
    speakerSpan.style.color = speaker.color;
    speakerSpan.style.fontWeight = speaker.fontWeight;
    speakerSpan.style.fontSize = speaker.fontSize;
    speakerSpan.style.display = 'inline-block';
    speakerSpan.style.marginRight = '0.5em';
    this.textContainer.appendChild(speakerSpan);
  }

  /**
   * Type out a single text segment character by character.
   *
   * @param {TextSegment} segment - The segment to type
   * @param {number} speed - Typing speed in ms per character
   * @private
   * @async
   */
  async _typeSegment(segment, speed) {
    this.isTyping = true;
    const container = this._createSegmentContainer(segment.styles);
    this.textContainer.appendChild(container);

    for (let i = 0; i < segment.text.length; i++) {
      const charSpan = createCharSpan(segment.text[i], i, segment.effect);
      if (segment.effect) {
        this._applyEffect(charSpan);
      }
      container.appendChild(charSpan);

      if (this.skipRequested) {
        this._addRemainingChars(segment, container, i + 1);
        break;
      }

      this._triggerCharCallbacks(segment.text[i], i);
      await this._waitForCharDelay(segment.text[i], speed);
    }
    this.isTyping = false;
  }

  /**
   * Create a container span for a styled text segment.
   *
   * @param {Object.<string, string>} styles - CSS styles to apply
   * @returns {HTMLSpanElement} Configured container element
   * @private
   */
  _createSegmentContainer(styles) {
    const container = document.createElement('span');
    container.style.display = 'inline';
    container.style.wordBreak = 'keep-all';
    Object.entries(styles).forEach(([key, value]) => {
      container.style[key] = value;
    });
    return container;
  }

  /**
   * Add remaining characters instantly when skip is requested.
   *
   * @param {TextSegment} segment - The segment being typed
   * @param {HTMLSpanElement} container - The container element
   * @param {number} startIndex - Index to start adding from
   * @private
   */
  _addRemainingChars(segment, container, startIndex) {
    for (let j = startIndex; j < segment.text.length; j++) {
      const charSpan = createCharSpan(segment.text[j], j, segment.effect);
      if (segment.effect) {
        this._applyEffect(charSpan);
      }
      container.appendChild(charSpan);
    }
  }

  /**
   * Trigger sound effect and character callbacks.
   *
   * @param {string} char - The character that was typed
   * @param {number} index - The character's index
   * @private
   */
  _triggerCharCallbacks(char, index) {
    if (this.config.soundEffect && char.trim()) {
      this.config.soundEffect(char);
    }
    if (this.config.onCharacter) {
      this.config.onCharacter(char, index);
    }
  }

  /**
   * Wait for the appropriate delay after typing a character.
   * Adds extra delay for punctuation marks.
   *
   * @param {string} char - The character that was typed
   * @param {number} speed - Base typing speed
   * @returns {Promise<void>} Resolves after the delay
   * @private
   */
  _waitForCharDelay(char, speed) {
    let delay = this.skipRequested ? this.config.skipSpeed : speed;
    if (['.', '!', '?'].includes(char)) {
      delay += this.config.punctuationDelay;
    }
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Apply an animated text effect to a character span.
   * Sets up requestAnimationFrame loop for continuous animation.
   *
   * @param {HTMLSpanElement} charSpan - The character element to animate
   * @private
   */
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

  /**
   * Create a promise that resolves when advance() is called.
   * Used to wait for user input before continuing.
   *
   * @returns {Promise<void>} Resolves when user advances
   * @private
   */
  _waitForAdvance() {
    return new Promise((resolve) => {
      this._advanceResolver = resolve;
    });
  }

  /**
   * Advance to the next queue entry.
   * Call this to continue when waiting for user input.
   */
  advance() {
    if (this._advanceResolver) {
      this._advanceResolver();
      this._advanceResolver = null;
    }
  }

  /**
   * Skip the current typing animation.
   * Immediately displays remaining text if allowSkip is enabled.
   */
  skip() {
    if (this.config.allowSkip) {
      this.skipRequested = true;
    }
  }

  /**
   * Handle user input (click/key press).
   * Skips typing if currently typing, or advances if waiting.
   *
   * @param {Event} e - The input event (pointerdown or keydown)
   * @returns {boolean} True if input was handled, false otherwise
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

  /**
   * Pause the typewriter.
   * Currently sets isPaused flag but does not stop active typing.
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume the typewriter after pausing.
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * Clear all displayed text and stop animations.
   */
  clear() {
    if (this.textContainer) {
      this.textContainer.innerHTML = '';
    }
    this._stopAnimations();
  }

  /**
   * Cancel all running text effect animations.
   * @private
   */
  _stopAnimations() {
    this.currentAnimationFrames.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
    this.currentAnimationFrames = [];
  }

  /**
   * Clear all entries from the queue without displaying them.
   */
  clearQueue() {
    this._queue = [];
  }

  /**
   * Check if the typewriter is currently processing the queue.
   *
   * @returns {boolean} True if processing, false otherwise
   */
  isActive() {
    return this.isProcessing;
  }

  /**
   * Get the number of entries remaining in the queue.
   *
   * @returns {number} Number of queued entries
   */
  getQueueLength() {
    return this._queue.length;
  }

  /**
   * Clean up all resources.
   * Stops cursor blinking, animations, and clears the queue.
   * Called automatically when element is removed from DOM.
   */
  destroy() {
    this._stopCursorBlink();
    this._stopAnimations();
    this.clearQueue();
    this.clear();
  }
}

customElements.define('typewriter-textbox', TypewriterTextbox);
