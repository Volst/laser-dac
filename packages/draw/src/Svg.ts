import * as fs from 'fs';
import { Shape } from './Shape';
import { parse, Node } from 'svg-parser';
import { Path } from './Path';
import { Color, Point } from './Point';
import { hexToRgb, flatten } from './helpers';

const DEFAULT_COLOR: Color = [0, 1, 0];

interface SvgOptions {
  x: number;
  y: number;
  file: Node;
  color?: Color;
}

export class Svg extends Shape {
  x: number;
  y: number;
  file: Node;
  color: Color;
  private pathNodes: Node[] = [];

  constructor(options: SvgOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.file = options.file;
    this.color = options.color || DEFAULT_COLOR;
  }

  parseViewBox(raw: string) {
    raw = raw || '0 0 1 1';

    const values = raw.split(' ');
    if (values.length !== 4) {
      throw new Error('SVG parser: Invalid viewBox given');
    }
    return {
      minX: parseFloat(values[0]),
      minY: parseFloat(values[1]),
      width: parseFloat(values[2]),
      height: parseFloat(values[3])
    };
  }

  parseHexToRelativeColor(color: string): Color {
    const rgb = hexToRgb(color);
    if (rgb) {
      return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
    }
    return this.color;
  }

  nodeWalker = (child: Node) => {
    if (child.name === 'path') {
      this.pathNodes.push(child);
    } else {
      child.children.forEach(this.nodeWalker);
    }
  };

  draw(resolution: number) {
    const viewBox = this.parseViewBox(String(this.file.attributes.viewBox));
    const aspectRatio = viewBox.width / viewBox.height;

    this.nodeWalker(this.file);

    const points = this.pathNodes.map(node =>
      new Path({
        path: node.attributes.d as string,
        color: this.parseHexToRelativeColor(node.attributes.fill as string),
        x: this.x,
        y: this.y,
        width: viewBox.width,
        height: aspectRatio * viewBox.height
      }).draw(resolution)
    );

    return flatten(points) as Point[];
  }
}

export function loadSvgFile(path: string) {
  const buffer = fs.readFileSync(path);
  const content = buffer.toString();
  return parse(content);
}
