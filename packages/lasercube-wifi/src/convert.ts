export const XY_RESOLUTION = 4095;

export function relativeToPosition(n: number) {
  return Math.floor(n * XY_RESOLUTION);
}

export function relativeToColorRed(r: number) {
  return Math.floor(r * 0x20f);
}

export function relativeToColorBlue(b: number) {
  return Math.floor(b * 0x0ff);
}

export function relativeToColorGreen(g: number) {
  return Math.floor(g * 0x080);
}
