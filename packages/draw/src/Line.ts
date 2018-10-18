import { Shape } from './Shape';
import { Point, Color } from './Point';
import { Wait } from './Wait';
import { BLANKING_AMOUNT } from './constants';

interface Coordinates {
  x: number;
  y: number;
}

interface LineOptions {
  from: Coordinates;
  to: Coordinates;
  color: Color;
  blanking?: boolean;
}

export class Line extends Shape {
  from: Coordinates;
  to: Coordinates;
  color: Color;
  blanking: boolean;

  constructor(options: LineOptions) {
    super();
    this.from = options.from;
    this.to = options.to;
    this.color = options.color;
    this.blanking = options.blanking || false;
  }

  draw(resolution: number) {
    const distanceX = this.from.x - this.to.x;
    const distanceY = this.from.y - this.to.y;
    // Calculate distance using the Pythagorean theorem.
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
    const steps = Math.round(distance * resolution);

    let points: Point[] = [];

    if (this.blanking) {
      // Add blanking points.
      points = new Wait({
        x: this.from.x,
        y: this.from.y,
        color: [0, 0, 0],
        amount: BLANKING_AMOUNT
      }).draw();
    }

    for (let stepNumber = 1; stepNumber <= steps; stepNumber++) {
      points.push(
        new Point(
          this.from.x - (distanceX / steps) * stepNumber,
          this.from.y - (distanceY / steps) * stepNumber,
          this.color
        )
      );
    }
    return points;
  }
}
