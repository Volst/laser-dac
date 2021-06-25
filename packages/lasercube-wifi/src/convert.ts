// The Ether Dream firmware uses 16-bit integers for the resolution, ranging from 0 to 65535.
// Source: https://github.com/j4cbo/j4cDAC/blob/e592ebcb7c9b6fb521be2005f4b85de54bc04f0f/common/protocol.h
export const XY_RESOLUTION = 4095;
export const COLOR_RESOLUTION = 255;

export function relativeToPosition(n: number) {
  return Math.floor(n * XY_RESOLUTION);
}

export function relativeToRedGreen(r: number, g: number) {
  r = Math.floor(r * COLOR_RESOLUTION);
  g = Math.floor(g * COLOR_RESOLUTION);
  return r | (g << 8);
}

export function relativeToBlue(b: number) {
  return Math.floor(b * COLOR_RESOLUTION);
}
