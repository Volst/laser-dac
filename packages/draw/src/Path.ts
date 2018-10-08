import { Shape } from './Shape';
import { Point, Color } from './Point';
import { Line } from './Line';
import { Curve } from './Curve';
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

  draw(resolution: number) {
    const pathData = new SVGPathData(this.path).toAbs();

    if (!pathData.commands.length) {
      return [];
    }

    // The path can end by going to back to the first drawn line
    const firstCommand = pathData.commands[0];
    const firstX = 'x' in firstCommand ? firstCommand.x : 0;
    const firstY = 'y' in firstCommand ? firstCommand.y : 0;
    // Keep track of where the last line was drawn so relative positions work
    let prevX = 0;
    let prevY = 0;

    const points = pathData.commands.map(command => {
      let commandPoints = [];

      switch (command.type) {
        case SVGPathData.MOVE_TO:
          commandPoints.push(new Point(command.x, command.y));
          break;

        case SVGPathData.LINE_TO:
          commandPoints = new Line({
            from: { x: prevX, y: prevY },
            to: { x: command.x, y: command.y },
            color: this.color
          }).draw(resolution);
          break;

        case SVGPathData.HORIZ_LINE_TO:
          commandPoints = new Line({
            from: { x: prevX, y: prevY },
            to: { x: command.x, y: prevY },
            color: this.color
          }).draw(resolution);
          break;

        case SVGPathData.VERT_LINE_TO:
          commandPoints = new Line({
            from: { x: prevX, y: prevY },
            to: { x: prevX, y: command.y },
            color: this.color
          }).draw(resolution);
          break;

        case SVGPathData.CURVE_TO:
          commandPoints = new Curve({
            from: {
              x: prevX,
              y: prevY,
              control: { x: command.x1, y: command.y1 }
            },
            to: {
              x: command.x,
              y: command.y,
              control: { x: command.x2, y: command.y2 }
            },
            color: this.color
          }).draw(resolution);
          break;

        case SVGPathData.CLOSE_PATH:
          commandPoints = new Line({
            from: { x: prevX, y: prevY },
            to: { x: firstX, y: firstY },
            color: this.color
          }).draw(resolution);
          break;

        default:
          commandPoints.push(new Point(0, 0));
      }

      if ('x' in command) {
        prevX = command.x;
      }
      if ('y' in command) {
        prevY = command.y;
      }

      return commandPoints;
    });

    // Flatten points array.
    return points.reduce((flat, commandPoints) => flat.concat(commandPoints));
  }
}
