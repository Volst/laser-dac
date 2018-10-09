import * as fs from 'fs';
import { Shape } from './Shape';
import { parse, Node } from 'svg-parser';
import { Path } from './Path';

interface SvgOptions {
  x: number;
  y: number;
  file: Node;
}

export class Svg extends Shape {
  x: number;
  y: number;
  file: Node;

  constructor(options: SvgOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.file = options.file;
  }

  parseViewBox(raw: string) {
    raw = raw || '0 0 1 1';

    const values = raw.split(' ');
    if (values.length !== 4) {
      throw new Error('SVG parser: Invalid viewBox given');
    }
    return {
      minX: parseInt(values[0]),
      minY: parseInt(values[1]),
      width: parseInt(values[2]),
      height: parseInt(values[3])
    };
  }

  draw(resolution: number) {
    const viewBox = this.parseViewBox(String(this.file.attributes.viewBox));

    const points: any[] = [];

    this.file.children.forEach(child => {
      // TODO: use real Volst logo to see if groups are supported
      if (child.name === 'path') {
        points.push(
          new Path({
            path: child.attributes.d as string,
            // TODO: add support for colors
            color: [0, 1, 0],
            x: this.x,
            y: this.y,
            width: viewBox.width,
            height: viewBox.height
          }).draw(resolution)
        );
      }
    });
    return points.reduce((flat, commandPoints) => flat.concat(commandPoints));
  }
}

export function loadSvgFile(path: string) {
  const buffer = fs.readFileSync(path);
  const content = buffer.toString();
  return parse(content);
}
