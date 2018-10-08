import { Shape } from '@ether-dream/draw/src/Shape';
import { Point, Color } from '@ether-dream/draw/src/Point';

// TODO: Can't get this to work with @types/bezier-js and import syntax.
const Bezier = require('bezier-js');

interface BezierCoordinates {
  x: number;
  y: number;
  control: {
    x: number;
    y: number;
  };
}

interface CurveOptions {
  from: BezierCoordinates;
  to: BezierCoordinates;
  color: Color;
}

export class Curve extends Shape {
  from: BezierCoordinates;
  to: BezierCoordinates;
  color: Color;

  constructor(options: CurveOptions) {
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
    const curvePoints = curve.getLUT(steps);

    return curvePoints.map(
      (point: any) => new Point(point.x, point.y, this.color)
    );
  }
}
