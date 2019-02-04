export type Color = [number, number, number];

export class Point {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;

  constructor(x: number, y: number, color?: Color) {
    this.x = x;
    this.y = y;
    this.r = color ? color[0] : 0;
    this.g = color ? color[1] : 0;
    this.b = color ? color[2] : 0;
  }
}
