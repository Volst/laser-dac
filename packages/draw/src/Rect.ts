import { Shape } from './Shape';
import { Color } from './Point';
import { Line } from './Line';
import { Wait } from './Wait';
import { MAX_WAIT_AMOUNT } from './constants';

//
const WAIT_AMOUNT = MAX_WAIT_AMOUNT / 2;

// TODO: I don't like these options being duplicated in the class
// I have a feeling there is a better way...
interface RectOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  color: Color;
}

export class Rect extends Shape {
  x: number;
  y: number;
  width: number;
  height: number;
  color: Color;

  constructor(options: RectOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.color = options.color;
  }

  draw(resolution: number) {
    return [
      // Top.
      ...new Line({
        from: { x: this.x, y: this.y },
        to: { x: this.x + this.width, y: this.y },
        color: this.color,
        blankBefore: true,
      }).draw(resolution),

      ...new Wait({
        x: this.x + this.width,
        y: this.y,
        color: this.color,
        amount: WAIT_AMOUNT,
      }).draw(),

      // Right.
      ...new Line({
        from: { x: this.x + this.width, y: this.y },
        to: { x: this.x + this.width, y: this.y + this.height },
        color: this.color,
      }).draw(resolution),

      ...new Wait({
        x: this.x + this.width,
        y: this.y + this.height,
        color: this.color,
        amount: WAIT_AMOUNT,
      }).draw(),

      // Bottom.
      ...new Line({
        from: { x: this.x + this.width, y: this.y + this.height },
        to: { x: this.x, y: this.y + this.height },
        color: this.color,
      }).draw(resolution),

      ...new Wait({
        x: this.x,
        y: this.y + this.height,
        color: this.color,
        amount: WAIT_AMOUNT,
      }).draw(),

      // Left.
      ...new Line({
        from: { x: this.x, y: this.y + this.height },
        to: { x: this.x, y: this.y },
        color: this.color,
        blankAfter: true,
      }).draw(resolution),
    ];
  }
}
