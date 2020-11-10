import { Point } from './Point';

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

export function isBlankingPoint(point: Pick<Point, 'r' | 'g' | 'b'>) {
  return !point.r && !point.g && !point.b;
}

export function outOfBounds(p: Point): boolean {
  return Math.min(p.x, p.y, p.r, p.g, p.b) < 0
    || Math.max(p.x, p.y, p.r, p.g, p.b) > 1;
}

export function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x
   && a.y === b.y
   && a.r === b.r
   && a.g === b.g
   && a.b === b.b;
}

export function makeTransformer(fn: (p: Point) => Point): (points: Point[]) => Point[] {
  return (points: Point[]) => points.map(fn);
}

export function clampPoint(point: Point): Point {
  point.x = point.x < 0 ? 0 : point.x > 1 ? 1 : point.x;
  point.y = point.y < 0 ? 0 : point.y > 1 ? 1 : point.y;
  point.r = point.r < 0 ? 0 : point.r > 1 ? 1 : point.r;
  point.g = point.g < 0 ? 0 : point.g > 1 ? 1 : point.g;
  point.b = point.b < 0 ? 0 : point.b > 1 ? 1 : point.b;
  return point;
}

export function monochromePoint(p: Point): Point {
  p.r = p.g = p.b = Math.max(p.r, p.g, p.b);
  return p;
}

export const clamp = makeTransformer(clampPoint);
export const monochrome = makeTransformer(monochromePoint);
