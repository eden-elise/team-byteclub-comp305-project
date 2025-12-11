/**
 * @fileoverview AudioManager - A lightweight audio system for loading, playing,
 * stopping, and globally controlling volume for multiple sound effects.
 * @module AudioManager
 */

/**
 * @typedef {Object} LoadedSound
 * @property {HTMLAudioElement} audio - The underlying HTML audio element
 * @property {number} baseVolume - The volume before applying master volume
 */

/**
 * AudioManager
 *
 * Handles loading, playing, stopping, and volume control for multiple audio files.
 * Supports global master volume so all audio adjusts together.
 *
 * @example
 * // Load sounds
 * audioManager.load('typing-sound', 'assets/typing.wav', 0.6);
 * audioManager.load('beep', 'assets/beep.mp3', 1.0);
 *
 * // Play a sound
 * audioManager.play('typing-sound');
 *
 * // Stop a sound
 * audioManager.stop('typing-sound');
 *
 * // Adjust master volume (0–100)
 * audioManager.setMasterVolume(50);
 */
export class AudioManager {
  /**
   * Create a new AudioManager instance.
   */
  constructor() {
    /**
     * A map of loaded sounds indexed by name.
     * @type {Object.<string, LoadedSound>}
     */
    this.sounds = {};

    /**
     * Global volume multiplier applied to all sounds (0.0–1.0).
     * @type {number}
     */
    this.masterVolume = 1.0;
  }

  /**
   * Load a sound into memory.
   *
   * @param {string} name - Identifier used to reference this sound later
   * @param {string} src - File path or URL to the audio file
   * @param {number} [volume=1] - Base volume for this sound (0.0–1.0)
   *
   * @example
   * audioManager.load('click', 'sounds/click.mp3', 0.7);
   */
  load(name, src, volume = 1) {
    const audio = new Audio(src);
    audio.volume = volume * this.masterVolume;

    this.sounds[name] = {
      audio,
      baseVolume: volume,
    };
  }

  /**
   * Play a loaded sound.
   *
   * @param {string} name - The name used when loading the sound
   * @param {boolean} [loop=false] - Whether the sound should loop continuously
   *
   * @example
   * audioManager.play('typing-sound', true);
   */
  play(name, loop = false) {
    const sound = this.sounds[name];
    if (sound && sound.audio) {
      sound.audio.currentTime = 0;
      sound.audio.loop = loop;
      sound.audio.play().catch((e) => console.log('Audio playback blocked:', e));
    }
  }

  /**
   * Stop a playing sound immediately.
   *
   * @param {string} name - Sound identifier
   *
   * @example
   * audioManager.stop('typing-sound');
   */
  stop(name) {
    const sound = this.sounds[name];
    if (sound && sound.audio) {
      sound.audio.pause();
      sound.audio.currentTime = 0;
    }
  }

  /**
   * Adjust global master volume (0–100).
   * All loaded sounds automatically update their volume.
   *
   * @param {number} volume - Volume percentage (0–100)
   *
   * @example
   * audioManager.setMasterVolume(20); // 20% volume
   */
  setMasterVolume(volume) {
    this.masterVolume = volume / 100;

    // Update all sound instances
    Object.values(this.sounds).forEach((sound) => {
      if (sound && sound.audio) {
        sound.audio.volume = sound.baseVolume * this.masterVolume;
      }
    });
  }
}

/**
 * Singleton instance of AudioManager for global use.
 * @type {AudioManager}
 */
export const audioManager = new AudioManager();
