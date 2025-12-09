import { gameState } from '../../gameplay/state/GameState.js';
import { audioManager } from '../utils/AudioManager.js';

export class OptionsModalController {
  constructor() {
    this.overlay = null;
    this.isOpen = false;
    this.init();
  }

  async init() {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './css/optionsModal.css';
    document.head.appendChild(link);

    // Load HTML
    const html = await fetch('./components/optionsModal.html').then((r) => r.text());

    // Create container outside of #app
    const container = document.createElement('div');
    container.id = 'options-layer';
    container.innerHTML = html;
    document.body.appendChild(container);

    this.overlay = document.getElementById('options-modal-overlay');
    this.setupListeners();
    this.loadCurrentSettings();
  }

  setupListeners() {
    // Toggle button
    document.getElementById('options-btn').addEventListener('click', () => {
      audioManager.play('button-click');
      this.open();
    });

    // Close button
    document.getElementById('options-close').addEventListener('click', () => {
      audioManager.play('button-click');
      this.close();
    });

    // Close on click outside
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Settings listeners
    document.getElementById('opt-volume').addEventListener('change', (e) => {
      const volume = parseInt(e.target.value); // ADD THIS LINE - define volume
      this.updateSetting('volume', volume);
      audioManager.setMasterVolume(volume);
    });

    document.getElementById('opt-text-speed').addEventListener('change', (e) => {
      this.updateSetting('textSpeed', e.target.value);
    });

    document.getElementById('opt-language').addEventListener('change', (e) => {
      this.updateSetting('language', e.target.value);
    });

    document.getElementById('opt-battle-speed').addEventListener('change', (e) => {
      this.updateSetting('battleSpeed', parseFloat(e.target.value));
    });

    // Actions
    document.getElementById('opt-save').addEventListener('click', () => {
      gameState.saveGame();

      // Trigger download
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(gameState.currentSaveData));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', 'byteclub_save.json');
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      alert('Game Saved & Downloaded!');
      this.close();
    });

    document.getElementById('opt-load').addEventListener('click', () => {
      if (gameState.loadGame()) {
        alert('Game Loaded!');
        // Reloading the page is the safest way to ensure the full state
        // (scene, character, etc.) is correctly re-initialized.
        // main.js will handle checking for the save and loading the correct scene.
        location.reload();
      } else {
        alert('No save file found.');
      }
    });
  }

  loadCurrentSettings() {
    // If we have a save, load settings from it. Otherwise use defaults.
    // Note: GameState might not be fully initialized with a save yet if we are at main menu
    // But we can check if there are settings in the currentSaveData

    const settings = gameState.currentSaveData?.settings || {
      volume: 100,
      textSpeed: 'medium',
      language: 'en',
      battleSpeed: 1.0,
    };

    document.getElementById('opt-volume').value = settings.volume;
    document.getElementById('opt-text-speed').value = settings.textSpeed;
    document.getElementById('opt-language').value = settings.language;
    document.getElementById('opt-battle-speed').value = settings.battleSpeed;

    audioManager.setMasterVolume(settings.volume);
  }

  updateSetting(key, value) {
    // Update local state
    // In a real app, we'd apply these changes immediately (e.g. set audio volume)
    console.log(`Setting ${key} to ${value}`);

    // If we have an active game, save to it
    if (gameState.currentSaveData) {
      gameState.currentSaveData.settings[key] = value;
      gameState.saveGame();
    }
  }

  open() {
    this.loadCurrentSettings(); // Refresh in case they changed elsewhere
    this.overlay.style.display = 'flex';
    // Force reflow
    this.overlay.offsetHeight;
    this.overlay.classList.add('visible');
    this.isOpen = true;
  }

  close() {
    this.overlay.classList.remove('visible');
    setTimeout(() => {
      this.overlay.style.display = 'none';
      this.isOpen = false;
    }, 300);
  }
}
