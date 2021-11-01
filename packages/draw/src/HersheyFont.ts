import * as fs from 'fs';
import { Shape } from './Shape';
import { Color, Point } from './Point';
import { Path } from './Path';

interface HersheyCharacter {
  leftPos: number;
  rightPos: number;
  vertexCount: number;
  vertices: string[];
}

interface HersheyFontOptions {
  x: number;
  y: number;
  font: HersheyCharacter[];
  charWidth: number;
  spacingFactor?: number;
  text: string;
  color: Color;
}

// Render text using hershey font
export class HersheyFont implements Shape {
  private readonly font: HersheyCharacter[];
  private readonly charWidth: number;
  private readonly spacingFactor: number;
  private readonly x: number;
  private readonly y: number;
  private readonly text: string;
  private readonly color: Color;

  constructor(options: HersheyFontOptions) {
    this.x = options.x;
    this.y = options.y;
    this.font = options.font;
    this.charWidth = options.charWidth;
    this.spacingFactor = options.spacingFactor || 1.0;
    this.text = options.text;
    this.color = options.color;
  }

  draw(resolution: number): Point[] {
    const paths: string[] = [];
    let xpos = 0;

    for (let i = 0; i < this.text.length; i++) {
      const characterIndex = this.text.charCodeAt(i) - 32;
      if (characterIndex < 0 || characterIndex >= this.font.length) {
        continue;
      }

      paths.push(
        convertHersheyToPath(
          this.font[characterIndex],
          xpos - this.font[characterIndex].leftPos,
          5,
          this.charWidth / 10
        )
      );
      xpos +=
        (this.font[characterIndex].rightPos -
          this.font[characterIndex].leftPos) *
        this.spacingFactor;
    }

    if (paths.length === 0) {
      return [];
    }

    return new Path({
      x: this.x,
      y: this.y,
      color: this.color,
      path: paths.join(' '),
    }).draw(resolution);
  }
}

// Load Hershey .jhf file. See https://emergent.unpythonic.net/software/hershey for source files
// futural.jhf is a good candidate as it is a single stroke sans-serif font
export function loadHersheyFont(path: string): HersheyCharacter[] {
  const fontFile = fs.readFileSync(path, 'binary');
  const characters: HersheyCharacter[] = [];

  let readPos = 0;

  function readNextCharacter(): HersheyCharacter {
    // 0-4 number (not used)
    // 5-7 number of vertices
    // 8   left pos
    // 9   right pos
    // 10- vertices
    // newline
    const vertexCount: number = Number.parseInt(
      fontFile.substr(readPos + 5, 3),
      10
    );
    const leftPos: number = hersheyCharToNumber(fontFile.charAt(readPos + 8));
    const rightPos: number = hersheyCharToNumber(fontFile.charAt(readPos + 9));
    const vertices: string[] = [];

    readPos += 10;
    while (vertices.length < vertexCount - 1) {
      let vertex = '';
      for (let i = 0; i < 2; i++) {
        while (fontFile.charAt(readPos) === '\n') {
          readPos++;
        }
        vertex += fontFile.charAt(readPos);
        readPos++;
      }
      vertices.push(vertex);
    }

    readPos++;

    return {
      leftPos,
      rightPos,
      vertexCount,
      vertices,
    };
  }

  while (readPos < fontFile.length) {
    characters.push(readNextCharacter());
  }

  return characters;
}

function hersheyCharToNumber(char: string): number {
  return char.charCodeAt(0) - 'R'.charCodeAt(0);
}

function convertHersheyToPath(
  character: HersheyCharacter,
  x: number,
  y: number,
  scale: number
): string {
  const pathElements = [];
  let nextIsMove = true;

  for (let i = 0; i < character.vertices.length; i++) {
    const vertice = character.vertices[i];
    if (vertice === ' R') {
      nextIsMove = true;
      continue;
    }

    const vertexX = (x + hersheyCharToNumber(vertice.charAt(0))) * scale;
    const vertexY = (y + hersheyCharToNumber(vertice.charAt(1))) * scale;

    pathElements.push(`${nextIsMove ? 'M' : 'L'} ${vertexX},${vertexY}`);
    nextIsMove = false;
  }

  return pathElements.join(' ');
}
