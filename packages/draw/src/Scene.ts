import { Point } from './Point';
import { Shape } from './Shape';

const DEFAULT_FRAME_RATE = 15;
const DEFAULT_RESOLUTION = 500;

interface SceneOptions {
  // This number sets the requested number of points from a perpendicular line drawn from one side of the projection to the other.
  // Decreasing this number will make drawing faster but less accurate, increasing will make it slower but more accurate.
  resolution?: number;
}

export class Scene {
  points: Point[] = [];
  resolution: number;
  interval?: NodeJS.Timer;

  constructor(options?: SceneOptions) {
    this.resolution = (options && options.resolution) || DEFAULT_RESOLUTION;
  }

  add(...shapes: Shape[]) {
    shapes.forEach(shape => {
      const points = shape.draw(this.resolution);
      this.points = this.points.concat(points);
    });
  }

  reset() {
    this.points = [];
  }

  start(renderFrame: () => void, frameRate: number = DEFAULT_FRAME_RATE) {
    this.interval = setInterval(() => {
      this.reset();
      renderFrame();
    }, frameRate);
  }

  stop() {
    this.pause();
    this.reset();
  }

  pause() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }
}
