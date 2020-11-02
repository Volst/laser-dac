import { Rect } from '@laser-dac/draw';
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
    (Math.random() - 0.5) / 200,
    (Math.random() - 0.5) / 200
  );

  constructor(options: BallOptions) {
    this.x = options.x;
    this.y = options.y;
    this.radius = options.radius;
  }

  update = () => {
    this.x += this.vector.x;
    this.y += this.vector.y;

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
    new Rect({
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
      color: [0, 1, 0]
    });
}
