import { Shape } from './Shape';
import { Point, Color } from './Point';

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

    const points = [];

    if (this.blanking) {
      // Add first point as blanking.
      points.push(new Point(this.from.x, this.from.y));
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
