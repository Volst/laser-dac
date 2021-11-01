import { Shape } from './Shape';
import { Point, Color } from './Point';
import Bezier = require('bezier-js');

interface BezierCoordinates {
  x: number;
  y: number;
}

interface QuadCurveOptions {
  from: BezierCoordinates;
  to: BezierCoordinates;
  control: BezierCoordinates;
  color: Color;
}

export class QuadCurve extends Shape {
  from: BezierCoordinates;
  to: BezierCoordinates;
  control: BezierCoordinates;
  color: Color;

  constructor(options: QuadCurveOptions) {
    super();
    this.from = options.from;
    this.to = options.to;
    this.control = options.control;
    this.color = options.color;
  }

  draw(resolution: number): Point[] {
    const curve = new Bezier(
      this.from.x,
      this.from.y,
      this.control.x,
      this.control.y,
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
