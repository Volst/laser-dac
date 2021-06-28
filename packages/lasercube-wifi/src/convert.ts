export const XY_RESOLUTION = 4095;
const MAX_RED = 0x20f;
const MAX_GREEN = 0x0ff;
const MAX_BLUE = 0x080;

export function relativeToPosition(n: number) {
  return Math.floor(n * XY_RESOLUTION) * -1;
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
