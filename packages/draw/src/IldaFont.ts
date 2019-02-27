import { Shape } from './Shape';
import { Ilda, File } from './Ilda';
import { flatten } from './helpers';
import { Point } from './Point';

type FontMapping = { [index: string]: number };

interface IldaFontOptions {
  text: string;
  x?: number;
  y?: number;
  size?: number;
  fontWidth?: number;
  file: File;
  mapping: FontMapping;
}

const DEFAULT_FONT_WIDTH = 0.2;

export class IldaFont extends Shape {
  text: string;
  x: number;
  y: number;
  size: number;
  file: File;
  fontWidth: number;
  mapping: FontMapping;

  constructor(options: IldaFontOptions) {
    super();
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.size = options.size || 1;
    this.text = options.text;
    this.file = options.file;
    this.mapping = options.mapping;

    this.fontWidth = options.fontWidth || DEFAULT_FONT_WIDTH;
  }

  draw() {
    const fontWidth = this.fontWidth * this.size;
    const chars = this.text.split('').map((char, i) => {
      const frame = this.mapping[char];
      return new Ilda({
        file: this.file,
        frame,
        y: this.y,
        size: this.size,
        x: this.x + i * fontWidth
      }).draw();
    });
    return flatten(chars) as Point[];
  }
}
