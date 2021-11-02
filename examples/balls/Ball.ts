import { Circle } from '@laser-dac/draw';
import Victor = require('victor');

interface BallOptions {
  x: number;
  y: number;
  radius: number;
}

export class Ball {
  radius: number;
  x: number;
  y: number;
  vector: Victor = new Victor(
    (Math.random() - 0.5) / 2,
    (Math.random() - 0.5) / 2
  );

  constructor(options: BallOptions) {
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius;
  }

  update = (timeStep: number) => {
    this.x += this.vector.x * timeStep;
    this.y += this.vector.y * timeStep;

    this.updateBounds();
  };

  updateBounds = () => {
    // Left bound.
    if (this.x - this.radius <= 0) {
      this.x = this.radius;
      this.vector.invertX();
    }

    // Right bound.
    if (this.x + this.radius > 1) {
      this.x = 1 - this.radius;
      this.vector.invertX();
    }

    // Top bound.
    if (this.y - this.radius <= 0) {
      this.y = this.radius;
      this.vector.invertY();
    }

    // Bottom bound.
    if (this.y + this.radius > 1) {
      this.y = 1 - this.radius;
      this.vector.invertY();
    }
  };

  draw = () =>
    new Circle({
      x: this.x,
      y: this.y,
      radius: this.radius,
      color: [0, 1, 0],
    });
}
