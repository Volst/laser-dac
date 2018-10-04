import { Point } from './Point';
import { Shape } from './Shape';

export class Scene {
  points: Point[] = [];

  add(shape: Shape) {
    const points = shape.draw();
    this.points = points.concat(points);
  }
}
