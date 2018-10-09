import { Shape } from './Shape';
import { Point, Color } from './Point';
import { Line } from './Line';
import { CubicCurve } from './CubicCurve';
import { SVGPathData } from 'svg-pathdata';
import { CommandM, SVGCommand } from 'svg-pathdata/lib/types';
import { QuadCurve } from './QuadCurve';
import { flatten } from './helpers';

interface PathOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: Color;
  path: string;
}

export class Path extends Shape {
  x: number;
  y: number;
  width: number;
  height: number;
  color: Color;
  // Example: "M0.67 0 L0.33 0.88 L1 0.88 Z" draws a triangle
  // Works exactly like SVG path. Learn everything about it: https://css-tricks.com/svg-path-syntax-illustrated-guide/
  path: string;

  constructor(options: PathOptions) {
    super();
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 1;
    this.height = options.height || 1;
    this.color = options.color;
    this.path = options.path;
  }

  transformSize = (command: SVGCommand) => {
    if ('x' in command) {
      command.x = this.x + command.x / this.width;
    }
    if ('x1' in command) {
      command.x1 = this.x + command.x1 / this.width;
    }
    if ('x2' in command) {
      command.x2 = this.x + command.x2 / this.width;
    }
    if ('y' in command) {
      command.y = this.y + command.y / this.height;
    }
    if ('y1' in command) {
      command.y1 = this.y + command.y1 / this.height;
    }
    if ('y2' in command) {
      command.y2 = this.y + command.y2 / this.height;
    }
    return command;
  };

  draw(resolution: number) {
    const pathData = new SVGPathData(this.path)
      // Transforms relative commands to absolute so we don't have to implement relative commands at all!
      .toAbs()
      // Transforms S and T commands to C and Q so we don't have to implement S and T commands!
      .normalizeST()
      .transform(this.transformSize);

    if (!pathData.commands.length) {
      return [];
    }

    // The path can end by going to back to the first drawn line
    let lastMoveCommand: CommandM | undefined;
    // Keep track of where the last line was drawn so relative positions work
    let prevX = 0;
    let prevY = 0;

    const points = pathData.commands.map(command => {
      let commandPoints: Point[] = [];

      switch (command.type) {
        case SVGPathData.MOVE_TO:
          commandPoints.push(new Point(command.x, command.y));
          lastMoveCommand = command;
          prevX = command.x;
          prevY = command.y;
          break;

        case SVGPathData.HORIZ_LINE_TO:
        case SVGPathData.VERT_LINE_TO:
        case SVGPathData.LINE_TO:
          const toX = 'x' in command ? command.x : prevX;
          const toY = 'y' in command ? command.y : prevY;
          commandPoints = new Line({
            from: { x: prevX, y: prevY },
            to: { x: toX, y: toY },
            color: this.color
          }).draw(resolution);
          prevX = toX;
          prevY = toY;
          break;

        case SVGPathData.CURVE_TO:
          commandPoints = new CubicCurve({
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
          prevX = command.x;
          prevY = command.y;
          break;

        case SVGPathData.QUAD_TO:
          commandPoints = new QuadCurve({
            from: { x: prevX, y: prevY },
            to: { x: command.x, y: command.y },
            control: { x: command.x1, y: command.y1 },
            color: this.color
          }).draw(resolution);
          prevX = command.x;
          prevY = command.y;
          break;

        case SVGPathData.CLOSE_PATH:
          if (!lastMoveCommand) {
            throw new Error(
              'Path parsing error: close path command called without a prior move command.'
            );
          }
          commandPoints = new Line({
            from: { x: prevX, y: prevY },
            to: { x: lastMoveCommand.x, y: lastMoveCommand.y },
            color: this.color
          }).draw(resolution);
          prevX = lastMoveCommand.x;
          prevY = lastMoveCommand.y;
          break;

        default:
          console.warn(
            `Path parsing warning: command ${command.type} is not supported`
          );
      }

      return commandPoints;
    });

    return flatten(points) as Point[];
  }
}
