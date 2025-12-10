export async function BaseDamageAnimation(isPlayer) {
  const sprite = document.getElementById(isPlayer ? 'player-sprite' : 'enemy-sprite');
  if (!sprite) return;

  const knockback = 20;
  const shake = 10;
  const duration = 50;

  const style = window.getComputedStyle(sprite);
  const matrix = new DOMMatrix(style.transform);

  const keyframes = [knockback, knockback - shake, knockback + shake, knockback - shake, 0].map(
    (offset) => {
      const x = isPlayer ? -offset : offset;
      return `matrix(${matrix.a},${matrix.b},${matrix.c},${matrix.d},${matrix.e + x},${matrix.f})`;
    }
  );

  for (const frame of keyframes) {
    sprite.style.transform = frame;
    await new Promise((r) => setTimeout(r, duration));
  }
}
