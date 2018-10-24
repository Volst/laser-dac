import { Line } from '@ether-dream/draw';
import { AREA_HEIGHT, AREA_WIDTH } from './index';

const GAP = 0.04;
export const PADDLE_WIDTH = 0.125;

interface PlayerOptions {
  position: 'top' | 'bottom';
}

export class Player {
  x: number;
  y: number;
  score: number = 0;
  speed: number = 0.004;

  constructor(options: PlayerOptions) {
    const distanceFromCenter = AREA_HEIGHT / 2 - GAP;
    this.y =
      options.position === 'top'
        ? 0.5 - distanceFromCenter
        : 0.5 + distanceFromCenter;
    this.x = 0.5 - PADDLE_WIDTH / 2;

    if (options.position === 'top') {
      this.speed *= -1;
    }
  }

  update = () => {
    this.x += this.speed;
    if (
      this.x + PADDLE_WIDTH > 0.5 + AREA_WIDTH / 2 ||
      this.x < 0.5 - AREA_WIDTH / 2
    ) {
      this.speed *= -1;
    }
  };

  draw = () =>
    new Line({
      from: {
        x: this.x,
        y: this.y
      },
      to: {
        x: this.x + PADDLE_WIDTH,
        y: this.y
      },
      color: [0, 1, 0],
      blanking: true
    });
}
