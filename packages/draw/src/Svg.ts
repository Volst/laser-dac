import * as fs from 'fs';
import { Shape } from './Shape';
import { parse, Node } from 'svg-parser';
import { Path } from './Path';
import { Color, Point } from './Point';
import { hexToRgb, flatten } from './helpers';

const DEFAULT_COLOR: Color = [0, 1, 0];
const ALLOWED_NODES = ['path', 'polyline', 'polygon'];

interface SvgOptions {
  x: number;
  y: number;
  file: Node;
  color?: Color;
  size?: number;
}

export class Svg extends Shape {
  x: number;
  y: number;
  size: number;
  file: Node;
  color: Color;
  private pathNodes: Node[] = [];

  constructor(options: SvgOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.file = options.file;
    this.color = options.color || DEFAULT_COLOR;
    this.size = options.size || 1;
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
    if (ALLOWED_NODES.includes(child.name)) {
      this.pathNodes.push(child);
    } else if (child.children) {
      child.children.forEach(this.nodeWalker);
    }
  };

  draw(resolution: number) {
    const viewBox = this.parseViewBox(String(this.file.attributes.viewBox));
    const aspectRatio = viewBox.width / viewBox.height;
    const width = viewBox.width / this.size;
    const height = (aspectRatio * viewBox.height) / this.size;

    this.pathNodes = [];
    this.nodeWalker(this.file);

    const points = this.pathNodes.map(_node => {
      const node = convertToPath(_node);
      return new Path({
        path: node.attributes.d as string,
        color: this.parseHexToRelativeColor(node.attributes.fill as string),
        x: this.x,
        y: this.y,
        width,
        height
      }).draw(resolution);
    });

    return flatten(points) as Point[];
  }
}

export function loadSvgFile(path: string) {
  const buffer = fs.readFileSync(path);
  const content = buffer.toString();
  return parse(content);
}

// Many SVG elements can be replaced to <path/>, which makes life easier for us.
function convertToPath(node: Node) {
  if (node.name === 'polyline' || node.name === 'polygon') {
    node.attributes.d = `M${node.attributes.points}`;
    if (node.name === 'polygon') node.attributes.d += 'z';
    node.name = 'path';
    node.attributes.points = '';
  }
  // TODO: implement line/circle/ellipse
  // very easy, see: https://github.com/svg/svgo/blob/master/plugins/convertShapeToPath.js#L67
  return node;
}
