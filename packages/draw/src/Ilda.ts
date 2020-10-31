import * as fs from 'fs';
import { fromByteArray, Section } from '@laser-dac/ilda-reader';
import { Shape } from './Shape';
import { Color, Point } from './Point';
import { isBlankingPoint } from './helpers';

export const XY_RESOLUTION = 65535;

export function convertCoordinate(n: number) {
  return -(2 * n - XY_RESOLUTION) / (XY_RESOLUTION * 2);
}

export interface File {
  sections: Section[];
}

interface IldaOptions {
  x?: number;
  y?: number;
  size?: number;
  color?: Color;
  frame: number;
  file: File;
}

export class Ilda extends Shape {
  x?: number;
  y?: number;
  size?: number;
  color?: Color;
  frame: number;
  file: File;

  constructor(options: IldaOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.size = options.size;
    this.color = options.color;
    this.frame = options.frame;
    this.file = options.file;
  }

  draw() {
    const section = this.file.sections[this.frame];
    const x = this.x || 0;
    const y = this.y || 0;
    const color = this.color;
    const size = this.size || 1;

    // These are Point objects from the ilda file,
    // not laser-dac Point objects.
    return section.points.map((point) => {
      const pointColor: Color = color !== undefined && !isBlankingPoint(point)
        ? color
        : [point.r, point.g, point.b];
      return new Point(
        x + (1 - convertCoordinate(point.x)) * size,
        y + convertCoordinate(point.y) * size,
        pointColor);
    });
  }
}

export function loadIldaFile(path: string): File {
  const buffer = fs.readFileSync(path);
  const byteArray = Array.prototype.slice.call(buffer, 0) as number[];

  return { sections: fromByteArray(byteArray) };
}
