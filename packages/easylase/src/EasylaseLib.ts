import * as path from 'path';
import * as Struct from 'ref-struct';
import * as ArrayType from 'ref-array';
import * as ffi from 'ffi';

/*
    typedef struct {
		unsigned short x;  // 2 Bytes  Value 0 - 4095  X-Coordinate
		unsigned short y;  // 2 Bytes  Value 0 - 4095  Y-coordinate
		unsigned char  r;  // 1 Byte   Value 0 - 255   Red
		unsigned char  g;  // 1 Byte   Value 0 - 255   Green
		unsigned char  b;  // 1 Byte   Value 0 - 255   Blue
		unsigned char  i;  // 1 Byte   Value 0 - 255   Intensity
	} __attribute__((packed)) EasyLaseData, *EasyLasePoint;
*/

const EasylasePoint = Struct({
  x: 'uint16',
  y: 'uint16',
  r: 'uint8',
  g: 'uint8',
  b: 'uint8',
  i: 'uint8'
});

const EasylasePointArray = ArrayType(EasylasePoint);

const libPath = path
  .join(__dirname, '../sdk/jmlaser')
  // Super super dirty hack to make this work with Electron; native dependencies
  // dont'get placed inside the "app.asar" bundle, but instead get placed in a separate directory called "app.asar.unpacked"
  .replace('app.asar', 'app.asar.unpacked');

const EasylaseLib = ffi.Library(libPath, {
  easyLaseGetCardNum: ['int', []],
  easyLaseStop: ['int', ['int']],
  easyLaseClose: ['int', []],
  easyLaseGetStatus: ['int', ['int']],
  easyLaseWriteFrame: ['int', ['int', EasylasePointArray, 'uint', 'uint']]
});

export function getCardNum(): number {
  return EasylaseLib.easyLaseGetCardNum();
}

export function stop(cardNumber: number): number {
  return EasylaseLib.easyLaseStop(cardNumber);
}

export function close(): number {
  return EasylaseLib.easyLaseClose();
}

export function getStatus(cardNumber: number): number {
  return EasylaseLib.easyLaseGetStatus(cardNumber);
}

export function writeFrame(
  cardNumber: number,
  points: IPoint[],
  numOfPoints: number,
  speed: number
): number {
  return EasylaseLib.easyLaseWriteFrame(
    cardNumber,
    points,
    numOfPoints * 8,
    numOfPoints,
    speed
  );
}

export interface IPoint {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  i: number;
}
