import { MAX_VALUE } from './constants';
import { Point } from './Point';

export function relativeToPosition(n: number) {
  return Math.floor(n * MAX_VALUE - MAX_VALUE / 2) * -1;
}

export function positionToRelative(n: number) {
  return -(2 * n - MAX_VALUE) / (MAX_VALUE * 2);
}

export function relativeToColor(color: number) {
  return Math.floor(MAX_VALUE * color);
}

export function colorToRelative(color: number) {
  return color / MAX_VALUE;
}

const RGB_HEX = /^#?(?:([\da-f]{3})[\da-f]?|([\da-f]{6})(?:[\da-f]{2})?)$/i;

export function hexToRgb(str: string) {
  const [, short, long] = String(str).match(RGB_HEX) || ['', '', ''];

  if (long) {
    const value = Number.parseInt(long, 16);
    return [value >> 16, (value >> 8) & 0xff, value & 0xff];
  } else if (short) {
    return Array.from(short, s => Number.parseInt(s, 16)).map(
      n => (n << 4) | n
    );
  }
}

export function flatten(arr: any[], result: any[] = []) {
  for (let i = 0, length = arr.length; i < length; i++) {
    const value = arr[i];
    if (Array.isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
}

export function isBlankingPoint(point: Point) {
  return !point.r && !point.g && !point.b;
}
