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

  clamp() {
    this.x = this.x < 0 ? 0 : this.x > 1 ? 1 : this.x;
    this.y = this.y < 0 ? 0 : this.y > 1 ? 1 : this.y;
    this.r = this.r < 0 ? 0 : this.r > 1 ? 1 : this.r;
    this.g = this.g < 0 ? 0 : this.g > 1 ? 1 : this.g;
    this.b = this.b < 0 ? 0 : this.b > 1 ? 1 : this.b;
  }
}
