import { Point } from './Point';
import { Shape } from './Shape';

// Frames per second; 30fps will be enough for most use-cases.
const DEFAULT_FPS = 30;
const DEFAULT_RESOLUTION = 500;

interface SceneOptions {
  // This number sets the requested number of points from a perpendicular line drawn from one side of the projection to the other.
  // Decreasing this number will make drawing faster but less accurate, increasing will make it slower but more accurate.
  resolution?: number;
}

type TransformFn = (points: Point[]) => Point[];

export class Scene {
  points: Point[] = [];
  resolution: number;
  interval?: NodeJS.Timer;

  constructor(options?: SceneOptions) {
    this.resolution = (options && options.resolution) || DEFAULT_RESOLUTION;
  }

  add(shape: Shape, transformer?: TransformFn) {
    let points = shape.draw(this.resolution);
    if (transformer) {
      points = transformer(points);
    }
    this.points = this.points.concat(points);
  }

  reset() {
    this.points = [];
  }

  start(renderFrame: () => void, fps: number = DEFAULT_FPS) {
    const ms = 1000 / fps;
    this.interval = setInterval(() => {
      this.reset();
      renderFrame();
    }, ms);
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
