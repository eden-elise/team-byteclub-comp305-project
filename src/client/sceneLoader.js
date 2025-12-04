import { gameState } from '../gameplay/state/GameState.js';

export async function loadScene(sceneName, cssName = sceneName) {
    const html = await fetch(`./scenes/${sceneName}.html`).then(r => r.text());
    const container = document.getElementById('app');
    container.innerHTML = html;

    // Ensure base CSS is loaded
    if (!document.getElementById('base-style')) {
        const baseLink = document.createElement('link');
        baseLink.id = 'base-style';
        baseLink.rel = 'stylesheet';
        baseLink.href = './css/base.css';
        document.head.appendChild(baseLink);
    }

    // Load scene CSS
    const existing = document.getElementById('scene-style');
    if (existing) existing.remove();

    const link = document.createElement('link');
    link.id = 'scene-style';
    link.rel = 'stylesheet';
    link.href = `./css/${cssName}.css`;

    document.head.appendChild(link);

    // Save current scene to state
    gameState.setCurrentScene(sceneName);
}
