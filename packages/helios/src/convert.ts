// The Helios DAC firmware uses 12-bit integers for the resolution, ranging from 0 to 4095.
// Source: https://github.com/Grix/helios_dac/blob/master/sdk/HeliosDac.h
export const XY_RESOLUTION = 4095;
export const COLOR_RESOLUTION = 255;

export function relativeToX(n: number) {
  return Math.min(Math.floor(n * XY_RESOLUTION), XY_RESOLUTION);
}

// Helios has 0 Y at the bottom, but laser-dac has 0 Y at the top.
export function relativeToY(n: number) {
  return Math.min(Math.floor((1 - n) * XY_RESOLUTION), XY_RESOLUTION);
}

export function relativeToColor(n: number) {
  return Math.min(Math.floor(n * COLOR_RESOLUTION), COLOR_RESOLUTION);
}
