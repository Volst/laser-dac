import { Shape } from './Shape';
import { Point, Color } from './Point';

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

  draw() {
    return [
      new Point(this.x, this.y),
      new Point(this.x + this.width, this.y, this.color),
      new Point(this.x + this.width, this.y + this.height, this.color),
      new Point(this.x, this.y + this.height, this.color),
      new Point(this.x, this.y, this.color)
    ];
  }
}
