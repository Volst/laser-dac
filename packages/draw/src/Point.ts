import { relativeToPosition, relativeToColor } from './helpers';

export type Color = [number, number, number];

export class Point {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;

  constructor(x: number, y: number, color?: Color) {
    this.x = relativeToPosition(x);
    this.y = relativeToPosition(y);
    this.r = color ? relativeToColor(color[0]) : 0;
    this.g = color ? relativeToColor(color[1]) : 0;
    this.b = color ? relativeToColor(color[2]) : 0;
  }
}
