export const XY_RESOLUTION = 4095;
export const COLOR_RESOLUTION = 255;

export function relativeToPosition(n: number) {
  return Math.floor(n * XY_RESOLUTION);
}

export function relativeToColor(b: number) {
  return Math.floor(b * COLOR_RESOLUTION);
}
