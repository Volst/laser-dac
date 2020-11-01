// The Helios DAC firmware uses 12-bit integers for the resolution, ranging from 0 to 4095.
// Source: https://github.com/Grix/helios_dac/blob/master/sdk/HeliosDac.h
export const XY_RESOLUTION = 4095;
export const COLOR_RESOLUTION = 255;

export function relativeToPosition(n: number) {
  return Math.floor((1 - n) * XY_RESOLUTION);
}

export function relativeToColor(n: number) {
  return Math.floor(n * COLOR_RESOLUTION);
}
