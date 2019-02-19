import * as path from 'path';
import * as Struct from 'ref-struct';
import * as ArrayType from 'ref-array';
import * as ffi from 'ffi';
import * as ref from 'ref';

// X,Y,Z - 32 bit float point value. Standard "single". The coordinate system is -32K...+32K. Please fit your data in the range.
// Color - 32 bit integer number. Color is 24bit RGB, standard encoding in windows format. Red bytes comes low (00..FF), Green after that, Blue the most signification. It exactly as in GDI.
// RepCount -  usigned byte. Repeat counter of the point. 0 - no repeats. 1 - one repeat and so on. - usigned byte.
// Focus - usigned byte. Now it unused
// Status - flags, now leave it zero.
// Zero - usigned byte. leave it zero.

const BeyondPoint = Struct({
  x: 'float',
  y: 'float',
  z: 'float',
  pointColor: 'int',
  repCount: 'uchar',
  focus: 'uchar',
  status: 'uchar',
  zero: 'uchar'
});

const BeyondPointArray = ArrayType(BeyondPoint);
const ZoneIndiceArray = ArrayType(ref.types.int);

// Windows 32-bit is not supported currently
const libPath = path
  .join(__dirname, '../sdk/BEYONDIO')
  // Super super dirty hack to make this work with Electron; native dependencies
  // dont'get placed inside the "app.asar" bundle, but instead get placed in a separate directory called "app.asar.unpacked"
  .replace('app.asar', 'app.asar.unpacked');

const BeyondLib = ffi.Library(libPath, {
  ldbCreate: ['int', []],
  ldbDestroy: ['int', []],
  ldbBeyondExeReady: ['int', []],
  // Params: char* imageName, int numPointsInFrame, void* firstPoint, void* zoneArrayPtr, int scanRate
  ldbSendFrameToImage: [
    'int',
    ['char', 'int', BeyondPointArray, ZoneIndiceArray, 'int']
  ],
  ldbCreateZoneImage: ['int', ['int', 'uchar']]
});

export function ldbCreate(): number {
  return BeyondLib.ldbCreate();
}

export function ldbDestroy(): number {
  return BeyondLib.ldbDestroy();
}

export function ldbBeyondExeReady(): number {
  return BeyondLib.ldbBeyondExeReady();
}

export function ldbCreateZoneImage(zoneIndex: number, name: string): number {
  return BeyondLib.ldbCreateZoneImage(zoneIndex, name);
}

export function ldbSendFrameToImage(
  imageName: string,
  numPoints: number,
  points: any[],
  zones: number[],
  scanRate: number
): number {
  return BeyondLib.ldbSendFrameToImage(
    imageName,
    numPoints,
    points,
    zones,
    scanRate
  );
}

export interface IPoint {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
}
