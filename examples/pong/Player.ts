import { Line } from '@laser-dac/draw';
import { AREA_HEIGHT, AREA_WIDTH } from './renderer';

const GAP = 0.02;
export const PADDLE_WIDTH = 0.035;

interface PlayerOptions {
  position: 'top' | 'bottom';
  isUser: boolean;
}

const SPEED = 0.002;

export class Player {
  x: number;
  y: number;
  score: number = 0;
  isUser: boolean;
  speed: number = SPEED;

  constructor(options: PlayerOptions) {
    const distanceFromCenter = AREA_HEIGHT / 2 - GAP;
    this.isUser = options.isUser;
    this.y =
      options.position === 'top'
        ? 0.5 - distanceFromCenter
        : 0.5 + distanceFromCenter;
    this.x = 0.5 - PADDLE_WIDTH / 2;

    if (options.position === 'top') {
      this.speed *= -1;
    }
  }

  move(direction: 'left' | 'right') {
    const speed = 0.004;
    if (direction === 'left') {
      this.speed = -speed;
    }
    if (direction === 'right') {
      this.speed = speed;
    }
  }

  update() {
    if (this.isUser) {
      this.updateUser();
    } else {
      this.updateRandom();
    }
  }

  private updateRandom() {
    this.x += this.speed;
    if (
      this.x + PADDLE_WIDTH > 0.5 + AREA_WIDTH / 2 ||
      this.x < 0.5 - AREA_WIDTH / 2
    ) {
      this.speed *= -1;
    }
  }

  private updateUser() {
    if (
      (this.x + PADDLE_WIDTH > 0.5 + AREA_WIDTH / 2 && this.speed > 0) ||
      (this.x < 0.5 - AREA_WIDTH / 2 && this.speed < 0)
    ) {
      this.speed = 0;
    }
    this.x += this.speed;
  }

  draw() {
    return new Line({
      from: {
        x: this.x,
        y: this.y,
      },
      to: {
        x: this.x + PADDLE_WIDTH,
        y: this.y,
      },
      color: [0, 1, 0],
      blankBefore: true,
      blankAfter: true,
    });
  }
}
