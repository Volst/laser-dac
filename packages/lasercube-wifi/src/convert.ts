export const XY_RESOLUTION = 4095;
export const COLOR_RESOLUTION = 255;

export function relativeToPosition(n: number) {
  return Math.floor(n * XY_RESOLUTION);
}

export function relativeToColorRed(r: number) {
  return Math.floor(r * COLOR_RESOLUTION);
}

export function relativeToColorBlue(b: number) {
  return Math.floor(b * COLOR_RESOLUTION);
}

export function relativeToColorGreen(g: number) {
  return Math.floor(g * COLOR_RESOLUTION);
}
