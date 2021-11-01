import * as path from 'path';
import * as ffi from 'ffi-napi';
import * as ref from 'ref-napi';

const ArrayType = require('ref-array-di')(ref);
const Struct = require('ref-struct-di')(ref);

const BeyondPoint = Struct({
  x: 'float',
  y: 'float',
  z: 'float',
  pointColor: 'int',
  repCount: 'uchar',
  focus: 'uchar',
  status: 'uchar',
  zero: 'uchar',
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
  ldbBeyondExeStarted: ['int', []],
  // Params: char* imageName, int numPointsInFrame, void* firstPoint, void* zoneArrayPtr, int scanRate
  ldbSendFrameToImage: [
    'int',
    ['string', 'int', BeyondPointArray, ZoneIndiceArray, 'int'],
  ],
  ldbCreateZoneImage: ['int', ['int', 'string']],
  ldbDeleteZoneImage: ['int', ['string']],
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

export function ldbBeyondExeStarted(): number {
  return BeyondLib.ldbBeyondExeStarted();
}

export function ldbCreateZoneImage(zoneIndex: number, name: string): number {
  return BeyondLib.ldbCreateZoneImage(zoneIndex, name);
}

export function ldbDeleteZoneImage(name: string): number {
  return BeyondLib.ldbDeleteZoneImage(name);
}

export function getZoneRef(zones: number[]): any {
  return new ZoneIndiceArray(zones);
}

export function ldbSendFrameToImage(
  imageName: string,
  numPoints: number,
  points: IPoint[],
  zoneRef: any,
  scanRate: number
): number {
  const rPoints = new BeyondPointArray(points as any);
  return BeyondLib.ldbSendFrameToImage(
    imageName,
    numPoints,
    (rPoints[0] as any).ref(),
    zoneRef[0],
    scanRate
  );
}

export interface IPoint {
  x: number;
  y: number;
  z: number;
  pointColor: number;
  repCount: number;
  focus: number;
  status: number;
  zero: number;
}
