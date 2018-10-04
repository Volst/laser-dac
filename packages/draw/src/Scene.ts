import { Point } from './Point';
import { Shape } from './Shape';

export class Scene {
  points: Point[] = [];

  add(...shapes: Shape[]) {
    shapes.forEach(shape => {
      const points = shape.draw();
      this.points = this.points.concat(points);
    });
  }
}
