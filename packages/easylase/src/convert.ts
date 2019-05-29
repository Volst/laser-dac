export const XY_RESOLUTION = 2147483647 * 2; // max value of an int
export const COLOR_RESOLUTION = 65535;

export function relativeToPosition(n: number) {
  return Math.floor(n * XY_RESOLUTION - XY_RESOLUTION / 2) * -1;
}

export function relativeToColor(c: number) {
  return Math.floor(c * COLOR_RESOLUTION);
}
