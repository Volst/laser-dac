import { Shape } from './Shape';
import { Point, Color } from './Point';
import { Line } from './Line';

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
        blanking: true
      }).draw(resolution),

      // Right.
      ...new Line({
        from: { x: this.x + this.width, y: this.y },
        to: { x: this.x + this.width, y: this.y + this.height },
        color: this.color
      }).draw(resolution),

      // Bottom.
      ...new Line({
        from: { x: this.x + this.width, y: this.y + this.height },
        to: { x: this.x, y: this.y + this.height },
        color: this.color
      }).draw(resolution),

      // Left.
      ...new Line({
        from: { x: this.x, y: this.y + this.height },
        to: { x: this.x, y: this.y },
        color: this.color
      }).draw(resolution)
    ];
  }
}
