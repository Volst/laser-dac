import * as fs from 'fs';
import * as IldaReader from './ilda/reader';
import { Shape } from './Shape';
import { File } from './ilda/file';
import { relativeToPosition, positionToRelative } from './helpers';

interface IldaOptions {
  x?: number;
  y?: number;
  size?: number;
  frame: number;
  file: File;
}

export class Ilda extends Shape {
  x?: number;
  y?: number;
  size?: number;
  frame: number;
  file: File;

  constructor(options: IldaOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.size = options.size;
    this.frame = options.frame;
    this.file = options.file;
  }

  isStatic() {
    return (
      this.x === undefined && this.y === undefined && this.size === undefined
    );
  }

  draw() {
    const section = this.file.sections[this.frame];
    // Take a shortcut if there are no dynamic values.
    if (this.isStatic()) {
      return section.points;
    }
    const x = this.x || 0;
    const y = this.y || 0;
    const size = this.size || 1;
    return section.points.map(point => {
      return {
        x: relativeToPosition(x + positionToRelative(point.x) * size),
        y: relativeToPosition(y + positionToRelative(point.y) * size),
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
