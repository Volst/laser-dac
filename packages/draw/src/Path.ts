import { Shape } from './Shape';
import { Point, Color } from './Point';
import { SVGPathData } from 'svg-pathdata';

interface PathOptions {
  x: number;
  y: number;
  color: Color;
  path: string;
}

export class Path extends Shape {
  x: number;
  y: number;
  color: Color;
  // Example: "M0.67 0 L0.33 0.88 L1 0.88 Z" draws a triangle
  // Works exactly like SVG path. Learn everything about it: https://css-tricks.com/svg-path-syntax-illustrated-guide/
  path: string;

  constructor(options: PathOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.color = options.color;
    this.path = options.path;
    // TODO: https://yarnpkg.com/en/package/svg-pathdata
    // Use x,y as offset
  }

  draw() {
    const pathData = new SVGPathData(this.path).toAbs();

    if (!pathData.commands.length) {
      return [];
    }

    // TODO: this is weird, the svg-pathdata pkg is written in TS but contains the wrong interface for "SVGCommand". Should send a PR.
    // The path can end by going to back to the first drawn line
    const firstCommand = pathData.commands[0] as any;
    // Keep track of where the last line was drawn so relative positions work
    let prevX = 0;
    let prevY = 0;

    const points = pathData.commands.map((command: any, i) => {
      let point = null;
      switch (command.type) {
        case SVGPathData.MOVE_TO:
          point = new Point(command.x, command.y);
          break;
        case SVGPathData.LINE_TO:
          point = new Point(command.x, command.y, this.color);
          break;
        case SVGPathData.HORIZ_LINE_TO:
          point = new Point(command.x, prevY, this.color);
          break;
        case SVGPathData.VERT_LINE_TO:
          point = new Point(prevX, command.y, this.color);
          break;
        case SVGPathData.CLOSE_PATH:
          point = new Point(firstCommand.x, firstCommand.y, this.color);
          break;
        default:
          point = new Point(0, 0);
      }
      if (command.x) {
        prevX = command.x;
      }
      if (command.y) {
        prevY = command.y;
      }
      return point;
    });
    return points;
  }
}
