import { DAC } from '@laser-dac/core';
import { Simulator } from '@laser-dac/simulator';
import { Helios } from '@laser-dac/helios';
import { Scene, Rect, Path, Line } from '@laser-dac/draw';

(async () => {
  const dac = new DAC();
  dac.use(new Simulator());
  if (process.env.DEVICE) {
    dac.use(new Helios());
  }
  await dac.start();

  const scene = new Scene({
    resolution: 500,
  });
  function renderFrame() {
    // Triangle
    // const triangle = new Path({
    //   path: 'M0.67 0 l0.33 0.88 L1 0.88 Z',
    //   color: [0, 1, 0],
    //   x: 0,
    //   y: 0
    // });
    // scene.add(triangle);

    // Should draw this cross: https://codepen.io/chrisnager/pen/armzk
    const cross = new Path({
      path: 'M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z',
      color: [0, 1, 0],
      width: 5,
      height: 5,
    });
    scene.add(cross);

    const smile = new Path({
      path: 'M0.5,0.8c0,0,0,0.1,0.1,0.1c0.1,0,0.1-0.1,0.1-0.1',
      color: [0, 1, 1],
    });
    scene.add(smile);

    // Rectangle
    const rect = new Rect({
      width: 0.2,
      height: 0.2,
      x: 0.5,
      y: 0.5,
      color: [1, 0, 0],
    });
    scene.add(rect);

    // Line
    const line = new Line({
      from: {
        x: 0.7,
        y: 0.1,
      },
      to: {
        x: 0.9,
        y: 0.3,
      },
      color: [1, 1, 1],
      blankBefore: true,
      blankAfter: true,
    });
    scene.add(line);

    // Circle
    // Just kidding, still have to fix that.
  }

  scene.start(renderFrame);
  dac.stream(scene);
})();
