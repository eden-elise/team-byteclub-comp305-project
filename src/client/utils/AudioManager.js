export class AudioManager {
    constructor() {
        this.sounds = {};
        this.masterVolume = 1.0; // Add this property
    }

    load(name, src, volume = 1) {
        const audio = new Audio(src);
        audio.volume = volume * this.masterVolume; // Apply master volume
        this.sounds[name] = {
            audio: audio,
            baseVolume: volume  // Store base volume for later adjustments
        };
    }

    play(name, loop = false) {
        const sound = this.sounds[name];
        if (sound && sound.audio) {  // Access sound.audio
            sound.audio.currentTime = 0;
            sound.audio.loop = loop;
            sound.audio.play().catch(e => console.log('Audio blocked:', e));
        }
    }

    stop(name) {
        const sound = this.sounds[name];
        if (sound && sound.audio) {  // Access sound.audio
            sound.audio.pause();
            sound.audio.currentTime = 0;
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = volume / 100; // Convert 0-100 to 0-1
        // Update all loaded sounds
        Object.values(this.sounds).forEach(sound => {
            if (sound && sound.audio && sound.baseVolume !== undefined) {
                sound.audio.volume = sound.baseVolume * this.masterVolume;
            }
        });
    }
}

export const audioManager = new AudioManager();