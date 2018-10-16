import * as fs from 'fs';
import * as IldaReader from './ilda/reader';
import { Shape } from './Shape';
import { File } from './ilda/file';
import { relativeToPosition, positionToRelative } from './helpers';

interface IldaOptions {
  x?: number;
  y?: number;
  frame: number;
  file: File;
}

export class Ilda extends Shape {
  x?: number;
  y?: number;
  frame: number;
  file: File;

  constructor(options: IldaOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.frame = options.frame;
    this.file = options.file;
  }

  draw() {
    const section = this.file.sections[this.frame];
    // Take a shortcut if there are no dynamic values.
    if (this.x === undefined || this.y === undefined) {
      return section.points;
    }
    return section.points.map(point => {
      return {
        x: relativeToPosition((this.x || 0) + positionToRelative(point.x)),
        y: relativeToPosition((this.y || 0) + positionToRelative(point.y)),
        r: point.r,
        g: point.g,
        b: point.b
      };
    });
  }
}

export function loadIldaFile(path: string) {
  const buffer = fs.readFileSync(path);
  const byteArray = Array.prototype.slice.call(buffer, 0);

  return IldaReader.fromByteArray(byteArray);
}
