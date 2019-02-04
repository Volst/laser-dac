import * as os from 'os';
import * as path from 'path';
const { Library } = require('fastcall');

let libSubPath = '../sdk/libHeliosDacAPI.so';
if (os.platform() === 'darwin') {
  libSubPath = '../sdk/libHeliosDacAPI.dylib';
} else if (os.platform() === 'win32') {
  libSubPath = '../sdk/libHeliosDacAPI.dll';
}

const libPath = path.join(__dirname, libSubPath);

const HeliosLib = new Library(libPath);

HeliosLib.function('int OpenDevices()');
export function openDevices(): number {
  return HeliosLib.interface.OpenDevices();
}

HeliosLib.function('int GetStatus(int dacNum)');
export function getStatus(dacNum: number): number {
  return HeliosLib.interface.GetStatus(dacNum);
}

HeliosLib.function('void CloseDevices()');
export function closeDevices(): void {
  return HeliosLib.interface.CloseDevices();
}

HeliosLib.struct(
  'struct HeliosPoint { uint16 x; uint16 y; uint8 r; uint8 g; uint8 b; uint8 i }'
);
HeliosLib.array('HeliosPoint[] HeliosPoints');
HeliosLib.function(
  'int WriteFrame(uint dacNum, int pps, uint8 flags, HeliosPoints* points, int numOfPoints)'
);
export function writeFrame(
  dacNum: number,
  pps: number,
  flags: 0 | 1,
  points: any[],
  numOfPoints: number
): number {
  return HeliosLib.interface.WriteFrame(
    dacNum,
    pps,
    flags,
    points,
    numOfPoints
  );
}
