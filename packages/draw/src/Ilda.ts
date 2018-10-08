import * as fs from 'fs';
import * as IldaReader from './ilda/reader';
import { Shape } from './Shape';

interface IldaOptions {
  x: number;
  y: number;
  frame: number;
  file: any;
}

export class Ilda extends Shape {
  x: number;
  y: number;
  frame: number;
  file: any;

  constructor(options: IldaOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.frame = options.frame;
    this.file = options.file;
  }

  draw() {
    const section = this.file.sections[this.frame];
    return section.points;
  }
}

export function loadIldaFile(path: string) {
  const buffer = fs.readFileSync(path);
  const byteArray = Array.prototype.slice.call(buffer, 0);

  return IldaReader.fromByteArray(byteArray);
}
