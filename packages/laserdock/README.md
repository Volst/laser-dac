# @laser-dac/laserdock

This package makes Laser DAC compatible with the Laserdock. Currently macOS + Windows only.

Only works for the USB version of the Laserdock / Lasercube (1W and 2W)! See also [Lasercube WiFi DAC](../lasercube-wifi).

```
yarn add @laser-dac/laserdock
npm i @laser-dac/laserdock
```

## Usage

```js
import { DAC } from '@laser-dac/core';
import { Laserdock } from '@laser-dac/laserdock';

const dac = new DAC();
dac.use(new Laserdock());
const started = await dac.start();
if (started) {
  const pps = 30000; // points per second
  // draw a horizontal red line from left to right in the center
  // @laser-dac/draw can help you with drawing points!
  const scene = {
    points: [
      { x: 0.1, y: 0.5, r: 1, g: 0, b: 0 },
      { x: 0.9, y: 0.5, r: 1, g: 0, b: 0 },
    ],
  };
  dac.stream(scene, pps);
}
```

See for more usage info and examples the [Laser DAC project on GitHub](https://github.com/Volst/laser-dac).
