export const RESOLUTION = 65535;

export function relativeToPosition(n: number) {
  return Math.floor(n * RESOLUTION - RESOLUTION / 2) * -1;
}

// TODO this is broken
export function relativeToColor(color: number) {
  return Math.floor(RESOLUTION * color);
}
