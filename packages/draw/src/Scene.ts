import { Point } from './Point';
import { Shape } from './Shape';

interface SceneOptions {
  // This number sets the requested number of points from a perpendicular line drawn from one side of the projection to the other.
  // Decreasing this number will make drawing faster but less accurate, increasing will make it slower but more accurate.
  resolution?: number;
}

export class Scene {
  points: Point[] = [];
  resolution: number;

  constructor(options?: SceneOptions) {
    this.resolution = (options && options.resolution) || 500;
  }

  add(...shapes: Shape[]) {
    shapes.forEach(shape => {
      const points = shape.draw(this.resolution);
      this.points = this.points.concat(points);
    });
  }
}
