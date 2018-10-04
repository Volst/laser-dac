import { Point } from './Point';

export interface ShapeOptions {
  x: number;
  y: number;
}

export class Shape {
  x: number;
  y: number;

  constructor(options: ShapeOptions) {
    this.x = options.x;
    this.y = options.y;
  }

  draw(): Point[] {
    return [];
  }
}
