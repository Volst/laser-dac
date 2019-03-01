const path = require('path');
const Struct = require('ref-struct');
const ArrayType = require('ref-array');
const ffi = require('ffi');
const originalPoints = require('./test-points.json');

const LaserdockPoint = Struct({
  rg: 'uint16',
  b: 'uint16',
  x: 'uint16',
  y: 'uint16'
});

const LaserdockPointArray = ArrayType(LaserdockPoint);

// Windows 32-bit is not supported currently
const libPath = path
  .join(__dirname, './sdk/liblaserdock')
  // Super super dirty hack to make this work with Electron; native dependencies
  // dont'get placed inside the "app.asar" bundle, but instead get placed in a separate directory called "app.asar.unpacked"
  .replace('app.asar', 'app.asar.unpacked');

const LaserdockLib = ffi.Library(libPath, {
  nodeInit: ['int', []],
  nodeEnableOutput: ['int', []],
  nodeDisableOutput: ['int', []],
  nodeSetDacRate: ['int', ['uint32']],
  nodeClearRingbuffer: ['int', []],
  nodeSendSamples: ['int', [LaserdockPointArray, 'uint32']]
});

const init = LaserdockLib.nodeInit();

console.log('initialized device', init);

const enabled = LaserdockLib.nodeEnableOutput();

console.log('enabled', enabled);

const rate = LaserdockLib.nodeSetDacRate(30000);

console.log('rate', rate);

const cleared = LaserdockLib.nodeClearRingbuffer();

console.log('Ringbuffer cleared', cleared);

const points = originalPoints.map(p => {
  // Original rgb values are from a scale to 0-1
  const r = Math.floor(p.r * 255);
  const g = Math.floor(p.g * 255);
  const b = Math.floor(p.b * 255);
  // Original xy values are from scale 0-1 where x=0 means left and x=1 right,
  // but I don't know what the final values should be?
  const x = Math.floor(p.x * 65536);
  const y = Math.floor(p.y * 65536);
  return {
    rg: (r << 8) | g,
    b: b << 8,
    x: x,
    y: y
  };
});

setInterval(() => {
  const sent = LaserdockLib.nodeSendSamples(points, points.length);
  console.log('Samples sent', sent);
}, 1000 / 30);
