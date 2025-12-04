

export async function BaseDeathAnimation(isPlayer) {
    const spriteElement = document.getElementById(isPlayer ? "player-sprite" : "enemy-sprite");

    if (!spriteElement) {
        console.error("Sprite element not found for death animation.");
        return Promise.resolve();
    }
    
    spriteElement.style.transition = 'transform 4s cubic-bezier(0.2, 0.6, 0.2, 1), opacity 4s cubic-bezier(0.2, 0.6, 0.2, 1)';
    const existing = window.getComputedStyle(spriteElement).transform;
    const baseTransform = existing === 'none' ? '' : existing;

    await new Promise(r => setTimeout(r, 1000));
    return new Promise((resolve) => {
        const onTransitionEnd = (event) => {
            if (event.propertyName === 'opacity' || event.propertyName === 'transform') {
                spriteElement.removeEventListener('transitionend', onTransitionEnd);
                spriteElement.style.transition = ''; 
                resolve();
            }
        };

        spriteElement.addEventListener('transitionend', onTransitionEnd);
        
        spriteElement.style.opacity = '0'; 
        spriteElement.style.transform = `${baseTransform} translateY(60px)`;
    });
}