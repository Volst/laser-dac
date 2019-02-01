const { Library, StructType, ArrayType } = require('fastcall');

const HeliosLib = new Library('../sdk/libHeliosDACAPI.dylib', {});

HeliosLib.function('int OpenDevices()');
HeliosLib.function('int GetStatus(int dacNum)');
HeliosLib.function('void CloseDevices()');
HeliosLib.struct(
  'struct HeliosPoint { uint16 x; uint16 y; uint8 r; uint8 g; uint8 b; uint8 i }'
);
HeliosLib.function(
  'int WriteFrame(uint dacNum, int pps, uint8 flags, HeliosPoint* points, int numOfPoints)'
);

const numDevices = HeliosLib.interface.OpenDevices();

console.log('Found', numDevices, 'dacs');

if (numDevices) {
  const ready = HeliosLib.interface.GetStatus(0);
  console.log('Device status: ', ready);
}

const points = [
  {
    x: 262,
    y: 1502,
    r: 255,
    g: 255,
    b: 255,
    i: 255
  },
  {
    x: 262,
    y: 1502,
    r: 255,
    g: 255,
    b: 255,
    i: 255
  }
];

// HELIOS_EXPORT int WriteFrame(unsigned int dacNum, int pps, std::uint8_t flags, HeliosPoint* points, int numOfPoints);
setInterval(() => {
  // const b = new stArray(points.map(p => new HeliosPoint(p)));
  const succ = HeliosLib.interface.WriteFrame(0, 10000, 0, points, 2);
  console.log('succ', succ);
}, 50);

// HeliosLib.CloseDevices();
