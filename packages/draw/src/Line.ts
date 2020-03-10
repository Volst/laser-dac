import { Shape } from './Shape';
import { Point, Color } from './Point';
import { Wait } from './Wait';
import { BLANKING_AMOUNT, MAX_WAIT_AMOUNT } from './constants';

interface Coordinates {
  x: number;
  y: number;
}

interface LineOptions {
  from: Coordinates;
  to: Coordinates;
  color: Color;
  blankBefore?: boolean;
  blankAfter?: boolean;
  waitAmount?: number;
  blankingAmount?: number;
}

export class Line extends Shape {
  from: Coordinates;
  to: Coordinates;
  color: Color;
  blankBefore: boolean;
  blankAfter: boolean;

  waitAmount: number;
  blankingAmount: number;

  constructor(options: LineOptions) {
    super();
    this.from = options.from;
    this.to = options.to;
    this.color = options.color;
    this.blankBefore = options.blankBefore || false;
    this.blankAfter = options.blankAfter || false;

    this.waitAmount = options.waitAmount || MAX_WAIT_AMOUNT;
    this.blankingAmount = options.blankingAmount || BLANKING_AMOUNT;
  }

  draw(resolution: number) {
    const distanceX = this.from.x - this.to.x;
    const distanceY = this.from.y - this.to.y;
    // Calculate distance using the Pythagorean theorem.
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
    const steps = Math.round(distance * resolution);

    let points: Point[] = [];

    if (this.blankBefore) {
      // Add blanking points.
      points = new Wait({
        x: this.from.x,
        y: this.from.y,
        color: [0, 0, 0],
        amount: this.blankingAmount
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

    if (this.blankAfter) {
      // Add blanking points.
      points = [
        ...points,
        ...new Wait({
          x: this.to.x,
          y: this.to.y,
          color: this.color,
          amount: this.waitAmount / 2
        }).draw()
      ];
    }

    return points;
  }
}
