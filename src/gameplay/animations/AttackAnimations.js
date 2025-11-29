import { playSound, animateWithFrame } from './AnimationUtils.js';

const DEFAULT_ATTACK_CONFIG = {
    lungeDistance: 30,
    duration: 300,
    soundPath: null,
    soundVolume: 0.5,
    onComplete: null
};
export async function createBaseAttackAnimation(source, target, battle, config = {}) {
    const finalConfig = { ...DEFAULT_ATTACK_CONFIG, ...config };

    const sprite = document.getElementById(source.isPlayer ? 'player-sprite' : 'enemy-sprite');
    if (!sprite) return;

    const targetSprite = document.getElementById(target.isPlayer ? 'player-sprite' : 'enemy-sprite');
    if (!targetSprite) return;

    const style = window.getComputedStyle(sprite);
    const matrix = new DOMMatrix(style.transform);
    const startX = matrix.e;
    const startY = matrix.f;
    const distance = source.isPlayer ? finalConfig.lungeDistance : -finalConfig.lungeDistance;

    let hitMarkerSpawned = false;

    await animateWithFrame(sprite, (element, progress) => {
        const eased = 1 - Math.pow(1 - progress, 3);

        let currentOffset;
        if (eased <= 0.5) {
            currentOffset = distance * (eased / 0.5);
        } else {
            currentOffset = distance * (1 - (eased - 0.5) / 0.5);

            // Spawn hit marker right after peak
            if (!hitMarkerSpawned) {
                hitMarkerSpawned = true;

                const rect = targetSprite.getBoundingClientRect();
                const marker = document.createElement('img');
                marker.src = '../../src/assets/effects/hit-markers/hit-1.png';
                marker.style.position = 'absolute';
                marker.style.width = '70px';
                marker.style.height = '70px';
                marker.style.left = `${rect.left + rect.width / 2 + (source.isPlayer ? -60 : 60)}px`;
                marker.style.top = `${rect.top + rect.height / 2}px`;
                marker.style.transform = 'translate(-50%, -50%)';
                document.body.appendChild(marker);


                setTimeout(() => {
                    marker.style.transition = 'opacity 0.2s ease-out';
                    marker.style.opacity = '0';
                    setTimeout(() => marker.remove(), 200);
                }, 50);
            }
        }

        element.style.transform = `matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${startX + currentOffset},${startY})`;
    }, finalConfig.duration);

    if (finalConfig.soundPath) await playSound(finalConfig.soundPath, finalConfig.soundVolume);
    if (finalConfig.onComplete) finalConfig.onComplete();
};




export const createBaseAttackAnimationCallback = (config = {}) => 
    (source, target, battle) => createBaseAttackAnimation(source, target, battle, config);
