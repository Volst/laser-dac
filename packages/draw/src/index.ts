import * as fs from 'fs';
import * as IldaReader from './ilda/reader';
import { MAX_VALUE, RESOLUTION } from './constants';

type Point = { x: number; y: number; r: number; g: number; b: number };

export class DrawingContext {
  points: Point[] = [];
  red = 0;
  green = 0;
  blue = 0;
  currentX = 0;
  currentY = 0;
  constructor() {}

  moveTo(x: number, y: number) {
    this.currentX = x;
    this.currentY = y;
    const point = {
      x: this.relativeToPosition(x),
      y: this.relativeToPosition(y),
      r: 0,
      g: 0,
      b: 0
    };
    this.points.push(point);
  }

  lineTo(x: number, y: number) {
    const distanceX = this.currentX - x;
    const distanceY = this.currentY - y;
    const distanceTotal = Math.sqrt(
      Math.pow(distanceX, 2) + Math.pow(distanceY, 2)
    );

    const steps = Math.round(distanceTotal * RESOLUTION);
    const points = [];

    for (let i = 0; i < steps; i++) {
      const stepX = this.currentX - (distanceX / steps) * i;
      const stepY = this.currentY - (distanceY / steps) * i;

      points.push({
        x: this.relativeToPosition(stepX),
        y: this.relativeToPosition(stepY),
        r: this.relativeToColor(this.red),
        g: this.relativeToColor(this.green),
        b: this.relativeToColor(this.blue)
      });
    }

    this.currentX = x;
    this.currentY = y;
    this.points = this.points.concat(points);
  }

  color(r: number, g: number, b: number) {
    this.red = r;
    this.green = g;
    this.blue = b;
  }

  rect(x: number, y: number, width: number, height: number) {
    this.moveTo(x, y);

    this.lineTo(x + width, y);
    this.lineTo(x + width, y + height);
    this.lineTo(x, y + height);
    this.lineTo(x, y);
  }

  // TODO: typings
  ilda(ildaJson: any, options: any = {}) {
    const frame = options.frame || 0;

    const section = ildaJson.sections[frame];

    this.points = this.points.concat(section.points);
  }

  private relativeToPosition(n: number) {
    return Math.floor(n * MAX_VALUE - MAX_VALUE / 2);
  }

  private relativeToColor(color: number) {
    return Math.floor(MAX_VALUE * color);
  }
}

export function loadIldaFile(path: string) {
  const buffer = fs.readFileSync(path);
  const byteArray = Array.prototype.slice.call(buffer, 0);

  return IldaReader.fromByteArray(byteArray);
}
