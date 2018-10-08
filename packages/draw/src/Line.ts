import { Shape } from './Shape';
import { Point, Color } from './Point';

interface coordinates {
  x: number;
  y: number;
}

interface LineOptions {
  from: coordinates;
  to: coordinates;
  color: Color;
}

export class Line extends Shape {
  from: coordinates;
  to: coordinates;
  color: Color;

  constructor(options: LineOptions) {
    super();
    this.from = options.from;
    this.to = options.to;
    this.color = options.color;
  }

  draw(resolution: number) {
    const distanceX = this.from.x - this.to.x;
    const distanceY = this.from.y - this.to.y;
    // Calculate distance using the Pythagorean theorem.
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
    const steps = Math.round(distance * resolution);

    const points = [];

    // Add first point as blanking.
    points.push(new Point(this.from.x, this.from.y));

    for (let stepNumber = 0; stepNumber < steps; stepNumber++) {
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
