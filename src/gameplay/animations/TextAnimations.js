
import { animateWithFrame } from './AnimationUtils.js';

/**
 * Create a floating damage/healing number animation
 * @param {number} amount - The amount of damage/healing
 * @param {string} prefix - Element prefix ('player' or 'enemy') to find the target
 * @returns {Promise} Promise that resolves when animation completes
 */
export async function createFloatingDamageNumber(amount, isPlayer) {
    window.battleController?.updateEntityStats();

    const sprite = document.getElementById(`${isPlayer ? 'player' : 'enemy'}-sprite`);
    if (!sprite) return Promise.resolve();

    const isHealing = amount > 0;
    const displayAmount = Math.abs(amount);
    const sign = isHealing ? '+' : '-';
    const color = isHealing ? '#00ff00' : '#ff0000';

    // Get sprite position
    const rect = sprite.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    // Create text element
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.left = `${startX}px`;
    element.style.top = `${startY}px`;
    element.style.pointerEvents = 'none';
    element.style.zIndex = '1001';
    element.style.fontSize = '2rem';
    element.style.fontWeight = 'bold';
    element.style.color = color;
    element.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    element.style.transform = 'translate(-50%, -50%)';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.whiteSpace = 'nowrap';
    element.textContent = `${sign}${displayAmount}`;

    document.body.appendChild(element);

    // Animate upward and fade out
    await animateWithFrame(element, (el, progress) => {
        const yOffset = 100 * progress;
        const opacity = Math.max(0, 1 - progress);
        el.style.top = `${startY - yOffset}px`;
        el.style.opacity = opacity;
    }, 1500);

    // Remove element
    if (element.parentNode) {
        element.parentNode.removeChild(element);
    }
}


