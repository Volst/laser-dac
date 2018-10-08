import { Shape } from '@ether-dream/draw/src/Shape';
import { Point, Color } from '@ether-dream/draw/src/Point';
const Bezier = require('bezier-js');

interface coordinates {
  x: number;
  y: number;
  control: {
    x: number;
    y: number;
  };
}

interface CurveOptions {
  from: coordinates;
  to: coordinates;
  color: Color;
}

export class Curve extends Shape {
  from: coordinates;
  to: coordinates;
  color: Color;

  constructor(options: CurveOptions) {
    super();
    this.from = options.from;
    this.to = options.to;
    this.color = options.color;
  }

  draw(resolution: number) {
    const curve = new Bezier(
      this.from.x,
      this.from.y,
      this.from.control.x,
      this.from.control.y,
      this.to.control.x,
      this.to.control.y,
      this.to.x,
      this.to.y
    );

    const distance = curve.length();
    const steps = Math.round(distance * resolution);
    const curvePoints = curve.getLUT(steps);

    const points = curvePoints.map(
      (point: any) => new Point(point.x, point.y, this.color)
    );

    return points;
  }
}
