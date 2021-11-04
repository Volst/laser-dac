export const XY_RESOLUTION = 4095;
const MAX_RED = 4095;
const MAX_GREEN = 4095;
const MAX_BLUE = 4095;

export function relativeToPosition(n: number) {
  return Math.floor((1 - n) * XY_RESOLUTION);
}

export function relativeToColorRed(r: number) {
  return Math.floor(r * MAX_RED);
}

export function relativeToColorGreen(g: number) {
  return Math.floor(g * MAX_GREEN);
}

export function relativeToColorBlue(b: number) {
  return Math.floor(b * MAX_BLUE);
}
