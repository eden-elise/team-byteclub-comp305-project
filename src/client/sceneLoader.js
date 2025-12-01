export async function loadScene(sceneName) {
    const html = await fetch(`./scenes/${sceneName}.html`).then(r => r.text());
    const container = document.getElementById('app');
    container.innerHTML = html;

    // Load scene CSS
    const existing = document.getElementById('scene-style');
    if (existing) existing.remove();

    const link = document.createElement('link');
    link.id = 'scene-style';
    link.rel = 'stylesheet';
    link.href = `./css/${sceneName}.css`;

    document.head.appendChild(link);
}
