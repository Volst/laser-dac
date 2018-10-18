import { Shape } from './Shape';
import { Point, Color } from './Point';

interface WaitOptions {
  x: number;
  y: number;
  color?: Color;
  amount: number;
}

export class Wait extends Shape {
  x: number;
  y: number;
  color?: Color;
  amount: number;

  constructor(options: WaitOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.color = options.color;
    this.amount = options.amount;
  }

  draw() {
    const points: Point[] = [];
    for (let i = 0; i < this.amount; i++) {
      points.push(new Point(this.x, this.y, this.color));
    }
    return points;
  }
}
