import { Shape } from './Shape';
import { Point, Color } from './Point';
import Bezier = require('bezier-js');

interface BezierCoordinates {
  x: number;
  y: number;
  control: {
    x: number;
    y: number;
  };
}

interface CubicCurveOptions {
  from: BezierCoordinates;
  to: BezierCoordinates;
  color: Color;
}

export class CubicCurve extends Shape {
  from: BezierCoordinates;
  to: BezierCoordinates;
  color: Color;

  constructor(options: CubicCurveOptions) {
    super();
    this.from = options.from;
    this.to = options.to;
    this.color = options.color;
  }

  draw(resolution: number): Point[] {
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
    // When there are less than two steps, we can skip making a curve altogether.
    if (steps < 2) {
      return [new Point(this.to.x, this.to.y, this.color)];
    }
    const curvePoints = curve.getLUT(steps);

    // Remove the first point if there is one.
    if (curvePoints.length > 1) curvePoints.shift();

    return curvePoints.map((point) => new Point(point.x, point.y, this.color));
  }
}
