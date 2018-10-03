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
      x: Math.floor(x * MAX_VALUE - MAX_VALUE / 2),
      y: Math.floor(y * MAX_VALUE - MAX_VALUE / 2),
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
        x: Math.floor(stepX * MAX_VALUE - MAX_VALUE / 2),
        y: Math.floor(stepY * MAX_VALUE - MAX_VALUE / 2),
        r: Math.floor(MAX_VALUE * this.red),
        g: Math.floor(MAX_VALUE * this.green),
        b: Math.floor(MAX_VALUE * this.blue)
      });
    }

    this.currentX = x;
    this.currentY = y;
    this.points = this.points.concat(points);
  }

  color(r: number, g: number, b: number) {
    this.red = Math.floor(MAX_VALUE * r);
    this.green = Math.floor(MAX_VALUE * g);
    this.blue = Math.floor(MAX_VALUE * b);
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
}

export function loadIldaFile(path: string) {
  const buffer = fs.readFileSync(path);
  const byteArray = Array.prototype.slice.call(buffer, 0);

  return IldaReader.fromByteArray(byteArray);
}
