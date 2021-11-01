import { Shape } from './Shape';
import { Color, Point } from './Point';
import { Wait } from './Wait';
import { BLANKING_AMOUNT } from './constants';

// TODO: I don't like these options being duplicated in the class
// I have a feeling there is a better way...
interface CircleOptions {
  x: number;
  y: number;
  radius: number;
  color: Color;
}

export class Circle extends Shape {
  x: number;
  y: number;
  radius: number;
  color: Color;

  constructor(options: CircleOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius;
    this.color = options.color;
  }

  draw(resolution: number): Point[] {
    const circumference = 2.0 * this.radius * Math.PI;
    const pointCount = Math.round(circumference * resolution);

    const points: Point[] = new Wait({
      x: this.x + this.radius,
      y: this.y,
      color: [0, 0, 0],
      amount: BLANKING_AMOUNT,
    }).draw();

    // If there are less then 3 points just return blank
    if (pointCount < 3) {
      return points;
    }

    const stepSize = (Math.PI * 2) / pointCount;
    for (let i: number = 0.0; i < Math.PI * 2; i += stepSize) {
      points.push(
        new Point(
          this.x + this.radius * Math.cos(i),
          this.y + this.radius * Math.sin(i),
          this.color
        )
      );
    }

    // Close circle
    points.push(new Point(this.x + this.radius, this.y, this.color));

    // Blank after
    return points.concat(
      new Wait({
        x: this.x + this.radius,
        y: this.y,
        color: [0, 0, 0],
        amount: BLANKING_AMOUNT,
      }).draw()
    );
  }
}
