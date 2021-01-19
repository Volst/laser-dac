import { Shape } from './Shape';
import { Point, Color } from './Point';
import { SceneOptions } from './Scene';
import { Line } from './Line';
import { Wait } from './Wait';
import { CubicCurve } from './CubicCurve';
import { SVGPathData } from 'svg-pathdata';
import { CommandM, SVGCommand } from 'svg-pathdata/lib/types';
import { QuadCurve } from './QuadCurve';
import { flatten } from './helpers';
import arcToBezier = require('svg-arc-to-cubic-bezier');

interface PathOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: Color;
  path: string;
  waitAmount?: number;
  blankingAmount?: number;
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

  waitAmount: number | undefined;
  blankingAmount: number | undefined;

  constructor(options: PathOptions) {
    super();
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || 1;
    this.height = options.height || 1;
    this.color = options.color;
    this.path = options.path;

    this.waitAmount = options.waitAmount;
    this.blankingAmount = options.blankingAmount;
  }

  transformSize = (command: SVGCommand) => {
    // TODO: yes this is a bit messy.
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
    if ('rX' in command) {
      command.rX = this.x + command.rX / this.width;
    }
    if ('rY' in command) {
      command.rY = this.y + command.rY / this.height;
    }
    return command;
  };

  draw(options: SceneOptions): Point[] {
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

    // Any shapes should be constructed with undefined blankingAmount
    // if this.blankingAmount is undefined. This will cause drawing to
    // use the value from SceneOptions at render time. The same goes
    // for waitAmount.
    const blankingAmount = this.blankingAmount ?? options.blankingPoints;

    const points = pathData.commands.reduce(
      (accumulator: Point[], command: SVGCommand) => {
        let commandPoints: Point[] = [];

        switch (command.type) {
          case SVGPathData.MOVE_TO:
            commandPoints = new Wait({
              x: command.x,
              y: command.y,
              amount: blankingAmount
            }).draw();

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
              color: this.color,
              waitAmount: this.waitAmount,
              blankingAmount: this.blankingAmount
            }).draw(options);
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
            }).draw(options);
            prevX = command.x;
            prevY = command.y;
            break;

          case SVGPathData.QUAD_TO:
            commandPoints = new QuadCurve({
              from: { x: prevX, y: prevY },
              to: { x: command.x, y: command.y },
              control: { x: command.x1, y: command.y1 },
              color: this.color
            }).draw(options);
            prevX = command.x;
            prevY = command.y;
            break;

          case SVGPathData.ARC:
            // TODO: Of course it would be better to implement this properly instead of converting arcs to a cubic bezier.
            const curves = arcToBezier({
              px: prevX,
              py: prevY,
              cx: command.x,
              cy: command.y,
              rx: command.rX,
              ry: command.rY,
              xAxisRotation: command.xRot,
              largeArcFlag: command.lArcFlag,
              sweepFlag: command.sweepFlag
            });
            let curvePrevX = prevX;
            let curvePrevY = prevY;
            curves.forEach(curve => {
              const curvePoints = new CubicCurve({
                from: {
                  x: curvePrevX,
                  y: curvePrevY,
                  control: { x: curve.x1, y: curve.y1 }
                },
                to: {
                  x: curve.x,
                  y: curve.y,
                  control: { x: curve.x2, y: curve.y2 }
                },
                color: this.color
              }).draw(options);
              curvePrevX = curve.x;
              curvePrevY = curve.y;
              Array.prototype.push.apply(commandPoints, curvePoints);
            });
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
              color: this.color,
              blankAfter: true,
              waitAmount: this.waitAmount,
              blankingAmount: this.blankingAmount
            }).draw(options);
            prevX = lastMoveCommand.x;
            prevY = lastMoveCommand.y;
            break;

          default:
            console.warn(
              `Path parsing warning: command ${command.type} is not supported`
            );
        }

        let wait: Point[] = [];
        if (accumulator.length >= 2 && commandPoints.length) {
          const nextPoint: Point = commandPoints[0];
          const lastPoint: Point = accumulator[accumulator.length - 1];
          const secondLastPoint: Point = accumulator[accumulator.length - 2];

          // Get previous angle in radians.
          const previousAngle = Math.atan2(
            secondLastPoint.y - lastPoint.y,
            secondLastPoint.x - lastPoint.x
          );

          // Get next angle in radians.
          const nextAngle = Math.atan2(
            lastPoint.y - nextPoint.y,
            lastPoint.x - nextPoint.x
          );

          // Get difference in angle where 90 degrees is 0.5, and 180 is 1.
          const relativeAngle =
            Math.abs(
              Math.atan2(
                Math.sin(previousAngle - nextAngle),
                Math.cos(previousAngle - nextAngle)
              )
            ) / Math.PI;

          const waitShape = new Wait({
            x: lastPoint.x,
            y: lastPoint.y,
            color: [lastPoint.r, lastPoint.g, lastPoint.b],
            amount: Math.floor(this.waitAmount * relativeAngle)
          });
          wait = waitShape.draw();
        }

        return [...accumulator, ...wait, ...commandPoints];
      },
      []
    );

    return flatten(points) as Point[];
  }
}
