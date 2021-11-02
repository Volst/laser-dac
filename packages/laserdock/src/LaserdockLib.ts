import * as path from 'path';
import * as ffi from 'ffi-napi';
import * as ref from 'ref-napi';

const ArrayType = require('ref-array-di')(ref);
const Struct = require('ref-struct-di')(ref);

const LaserdockPoint = Struct({
  rg: 'uint16',
  b: 'uint16',
  x: 'uint16',
  y: 'uint16',
});

const LaserdockPointArray = ArrayType(LaserdockPoint);

// Windows 32-bit is not supported currently
const libPath = path
  .join(__dirname, '../sdk/liblaserdocklib')
  // Super super dirty hack to make this work with Electron; native dependencies
  // dont'get placed inside the "app.asar" bundle, but instead get placed in a separate directory called "app.asar.unpacked"
  .replace('app.asar', 'app.asar.unpacked');

const LaserdockLib = ffi.Library(libPath, {
  nodeInit: ['int', []],
  nodeEnableOutput: ['int', []],
  nodeDisableOutput: ['int', []],
  nodeSetDacRate: ['int', ['uint32']],
  nodeClearRingbuffer: ['int', []],
  nodeSendSamples: ['int', [LaserdockPointArray, 'uint32']],
});

export function init(): number {
  return LaserdockLib.nodeInit();
}

export function enableOutput(): number {
  return LaserdockLib.nodeEnableOutput();
}

export function disableOutput(): number {
  return LaserdockLib.nodeDisableOutput();
}

export function clearRingBuffer(): number {
  return LaserdockLib.nodeClearRingbuffer();
}

export function setDacRate(rate: number): number {
  return LaserdockLib.nodeSetDacRate(rate);
}

export function sendSamples(points: any[], numOfPoints: number): number {
  return LaserdockLib.nodeSendSamples(points, numOfPoints);
}

export interface IPoint {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  i?: number;
}
