# @laser-dac/beyond

This package makes Laser DAC compatible with the [Pangolin Beyond software](https://pangolin.com/pages/beyond).

**Package is not finished yet.**

Pangolin does not provide any way to talk to a Pangolin FB3 or FB4 directly, so this means you need to run Pangolin Beyond on the same PC as well. This also means it **only works on Windows**.

```
yarn add @laser-dac/beyond
npm i @laser-dac/beyond
```

## Usage

```js
import { DAC } from '@laser-dac/core';
import { Beyond } from '@laser-dac/beyond';

const dac = new DAC();
dac.use(new Beyond());
const started = await dac.start();
if (started) {
  const pps = 30000; // points per second
  const fps = 120; // frames per second
  // draw a horizontal red line from left to right in the center
  // @laser-dac/draw can help you with drawing points!
  const scene = {
    points: [
      { x: 0.1, y: 0.5, r: 1, g: 0, b: 0 },
      { x: 0.9, y: 0.5, r: 1, g: 0, b: 0 },
    ],
  };
  dac.stream(scene, pps, fps);
}
```

See for more usage info and examples the [Laser DAC project on GitHub](https://github.com/Volst/laser-dac).
