export const RESOLUTION = 64000;

export function relativeToPosition(n: number) {
  return Math.floor(n * RESOLUTION - RESOLUTION / 2) * -1;
}

export function relativeToColor(r: number, g: number, b: number) {
  const a = 0;
  r = Math.floor(r * 255);
  g = Math.floor(g * 255);
  b = Math.floor(b * 255);
  return (a << 24) | (b << 16) | (g << 8) | r;
}
