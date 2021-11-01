import * as fs from 'fs';
import { Shape } from './Shape';
import { parse, Node } from 'svg-parser';
import { Path } from './Path';
import { Color, Point } from './Point';
import { hexToRgb, flatten } from './helpers';
import { BLANKING_AMOUNT, MAX_WAIT_AMOUNT } from './constants';

const DEFAULT_COLOR: Color = [0, 1, 0];
const ALLOWED_NODES = ['path', 'polyline', 'polygon', 'rect', 'line'];

interface SvgOptions {
  x: number;
  y: number;
  file: Node;
  color?: Color;
  size?: number;
  waitAmount?: number;
  blankingAmount?: number;
}

export class Svg extends Shape {
  x: number;
  y: number;
  size: number;
  file: Node;
  color: Color;
  waitAmount: number;
  blankingAmount: number;
  private pathNodes: Node[] = [];

  constructor(options: SvgOptions) {
    super();
    this.x = options.x;
    this.y = options.y;
    this.file = options.file;
    this.color = options.color || DEFAULT_COLOR;
    this.size = options.size || 1;
    this.waitAmount = options.waitAmount || MAX_WAIT_AMOUNT;
    this.blankingAmount = options.blankingAmount || BLANKING_AMOUNT;
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
      height: parseFloat(values[3]),
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

    const points = this.pathNodes.map((_node) => {
      const node = convertToPath(_node);
      const color = node.attributes.stroke || node.attributes.fill;
      return new Path({
        path: node.attributes.d as string,
        color: this.parseHexToRelativeColor(color as string),
        x: this.x,
        y: this.y,
        width,
        height,
        waitAmount: this.waitAmount,
        blankingAmount: this.blankingAmount,
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
  } else if (node.name === 'rect') {
    const x = +node.attributes.x;
    const y = +node.attributes.y;
    const width = +node.attributes.width;
    const height = +node.attributes.height;

    // TODO: this only works when the "px" postfix is not used
    // TODO: Calculate sizes from % and non-px units if possible.
    if (isNaN(x - y + width - height)) return node;

    node.name = 'path';
    node.attributes.d = `M${x} ${y}H${x + width}V${y + height}H${x}z`;
    node.attributes.x = '';
    node.attributes.y = '';
    node.attributes.width = '';
    node.attributes.height = '';
  } else if (node.name === 'line') {
    const x1 = +node.attributes.x1;
    const y1 = +node.attributes.y1;
    const x2 = +node.attributes.x2;
    const y2 = +node.attributes.y2;
    if (isNaN(x1 - y1 + x2 - y2)) return node;
    node.name = 'path';
    node.attributes.d = `M${x1} ${y1}L${x2} ${y2}`;
    node.attributes.x1 = '';
    node.attributes.y1 = '';
    node.attributes.x2 = '';
    node.attributes.y2 = '';
  }
  // TODO: implement circle/ellipse
  // very easy, see: https://github.com/svg/svgo/blob/master/plugins/convertShapeToPath.js#L67
  return node;
}
