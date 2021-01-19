import { Point } from './Point';
import { Shape } from './Shape';
import { clamp } from './helpers';

export interface SceneOptions {
  // This number sets the requested number of points from a perpendicular line drawn from one side of the projection to the other.
  // Decreasing this number will make drawing faster but less accurate, increasing will make it slower but more accurate.
  resolution: number;
  fps: number;
  blankingPoints: number;
  // This value determines how many times a Wait-point should be applied for the sharpest possible angles (360 degree angles).
  maxWaitPoints: number;
}

const defaultOptions: SceneOptions = {
  resolution: 500,
  fps: 30,
  blankingPoints: 24,
  maxWaitPoints: 10,
};

type TransformFn = (points: Point[]) => Point[];

export class Scene {
  points: Point[] = [];
  interval?: NodeJS.Timer;
  options: SceneOptions;

  constructor(options: Partial<SceneOptions> = {}) {
    this.options = Object.assign(defaultOptions, options);
  }

  add(shape: Shape, transformer?: TransformFn) {
    let points = shape.draw(this.options);
    if (transformer) {
      points = transformer(points);
    }
    points = clamp(points);
    this.points = this.points.concat(points);
  }

  reset() {
    this.points = [];
  }

  start(renderFrame: () => void, fps: number = this.options.fps) {
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

  setOptions(options: Partial<SceneOptions>) {
    this.options = Object.assign(this.options, options);
  }
}
