import * as path from 'path';
import * as ffi from 'ffi-napi';
import * as ref from 'ref-napi';

const ArrayType = require('ref-array-di')(ref);
const Struct = require('ref-struct-di')(ref);

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
  x: 'int',
  y: 'int',
  r: 'ushort',
  g: 'ushort',
  b: 'ushort',
  i: 'ushort',
  deepblue: 'ushort',
  yellow: 'ushort',
  cyan: 'ushort',
  user4: 'ushort',
});

const EasylasePointArray = ArrayType(EasylasePoint);

const libPath = path
  .join(__dirname, '../sdk/jmlaser')
  // Super super dirty hack to make this work with Electron; native dependencies
  // dont'get placed inside the "app.asar" bundle, but instead get placed in a separate directory called "app.asar.unpacked"
  .replace('app.asar', 'app.asar.unpacked');

const EasylaseLib = ffi.Library(libPath, {
  jmLaserEnumerateDevices: ['int', []],
  jmLaserStopOutput: ['int', ['int']],
  jmLaserCloseDevice: ['int', ['int']],
  jmLaserStartOutput: ['int', ['int']],
  jmLaserOpenDevice: ['int', ['char*']],
  jmLaserGetDeviceListEntry: ['int', ['uint', 'char*', 'uint']],
  jmLaserGetDeviceListEntryLength: ['int', ['uint']],
  jmLaserIsDeviceReady: ['int', ['int']],
  jmLaserWriteFrame: [
    'int',
    ['int', EasylasePointArray, 'uint', 'uint', 'uint'],
  ],
});

export function enumerateDevices(): number {
  return EasylaseLib.jmLaserEnumerateDevices();
}

export function stopOutput(handle: number): number {
  return EasylaseLib.jmLaserStopOutput(handle);
}

export function closeDevice(handle: number): number {
  return EasylaseLib.jmLaserCloseDevice(handle);
}

export function startOutput(handle: number): number {
  return EasylaseLib.jmLaserStartOutput(handle);
}

export function openDevice(deviceNameBuf: Buffer): number {
  // console.log('open device', deviceNameBuf);
  // const buf = new Buffer(deviceName.length);
  // buf.write(deviceName)
  return EasylaseLib.jmLaserOpenDevice(deviceNameBuf);
}

export function getDeviceListEntry(index: number): Buffer {
  const length = EasylaseLib.jmLaserGetDeviceListEntryLength(index);
  const buf = Buffer.alloc(length);
  (buf as any).type = ref.types.char;
  EasylaseLib.jmLaserGetDeviceListEntry(index, buf as any, length);
  // We pass the buffer right through to `openDevice()`,
  // but if you ever need to actually read the deviceName:
  // const deviceName = buf.toString('utf8');
  return buf;
}

export function isDeviceReady(handle: number): number {
  return EasylaseLib.jmLaserIsDeviceReady(handle);
}

export function writeFrame(
  handle: number,
  points: IPoint[],
  numOfPoints: number,
  speed: number,
  repetitions: number
): number {
  return EasylaseLib.jmLaserWriteFrame(
    handle,
    points,
    numOfPoints,
    speed,
    repetitions
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
