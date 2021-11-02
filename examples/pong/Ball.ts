import { Rect } from '@laser-dac/draw';
import { AREA_HEIGHT, AREA_WIDTH } from './renderer';
import { PADDLE_WIDTH } from './Player';
import Victor = require('victor');

const RADIUS = 0.002;

interface BallOptions {
  players: { top: {}; bottom: {} };
}

export class Ball {
  x: number = 0.5;
  y: number = 0.5;
  vector: Victor = new Victor(0.002, 0.002);
  players: { top: any; bottom: any };

  constructor(options: BallOptions) {
    this.players = options.players;
  }

  resetBall = () => {
    this.x = 0.5;
    this.y = 0.5;
  };

  update = () => {
    this.x += this.vector.x;
    this.y += this.vector.y;

    this.updateBounds();
    this.updateBounce();
  };

  updateBounce = () => {
    if (
      this.y + RADIUS > this.players.bottom.y &&
      this.y - RADIUS < this.players.bottom.y &&
      this.x + RADIUS > this.players.bottom.x &&
      this.x - RADIUS < this.players.bottom.x + PADDLE_WIDTH
    ) {
      this.vector.invertY();
    }

    if (
      this.y - RADIUS < this.players.top.y &&
      this.y + RADIUS > this.players.top.y &&
      this.x + RADIUS > this.players.top.x &&
      this.x - RADIUS < this.players.top.x + PADDLE_WIDTH
    ) {
      this.vector.invertY();
    }
  };

  updateBounds = () => {
    // Left bound.
    if (this.x - RADIUS <= 0.5 - AREA_WIDTH / 2) {
      this.vector.invertX();
    }

    // Right bound.
    if (this.x + RADIUS >= 0.5 + AREA_WIDTH / 2) {
      this.vector.invertX();
    }

    // Top bound.
    if (this.y - RADIUS <= 0.5 - AREA_HEIGHT / 2) {
      this.resetBall();
    }

    // Bottom bound.
    if (this.y + RADIUS >= 0.5 + AREA_HEIGHT / 2) {
      this.resetBall();
    }
  };

  draw = () =>
    new Rect({
      x: this.x - RADIUS,
      y: this.y - RADIUS,
      width: RADIUS * 2,
      height: RADIUS * 2,
      color: [0, 1, 0],
    });
}
