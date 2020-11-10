import { Point } from '../Point';

export function monochromeSingle(p: Point): Point {
  p.r = p.g = p.b = Math.max(p.r, p.g, p.b);
  return p;
}

export function monochrome(points: Point[]): Point[] {
  return points.map(monochromeSingle);
}

