# @laser-dac/device-selector

This package is an easy adapter for multiple devices.

```
yarn add @laser-dac/device-selector
npm i @laser-dac/device-selector
```

## Usage

```js
import { DAC } from '@laser-dac/core';
import { getDevices } from '@laser-dac/device-selector';

const dac = new DAC();
// Automatically select a supported device and a Simulator.
dac.useAll(await getDevices());
const started = await dac.start();
if (started) {
  const pps = 30000; // points per second
  const fps = 120; // frames per second
  // draw a horizontal red line from left to right in the center
  // @laser-dac/draw can help you with drawing points!
  const scene = {
    points: [
      { x: 0.1, y: 0.5, r: 1, g: 0, b: 0 },
      { x: 0.9, y: 0.5, r: 1, g: 0, b: 0 }
    ]
  };
  dac.stream(scene, pps, fps);
}
```

See for more usage info and examples the [Laser DAC project on GitHub](https://github.com/Volst/laser-dac).
