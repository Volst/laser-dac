import { Simulator } from '@ether-dream/simulator';
import { Scene, Rect, Path } from '@ether-dream/draw';

const FRAME_RATE = 15;
const POINTS_RATE = 30000;

(async () => {
  const simulator = new Simulator();
  await simulator.start({ device: process.argv.includes('--device') });

  let scene = new Scene();
  function updateDots() {
    scene = new Scene();

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
      path:
        'M0.2 0.2 h0.1 v0.1 h0.1 v0.1 h-0.1 v0.1 h-0.1 v-0.1 h-0.1 v-0.1 h0.1 z',
      color: [0, 1, 0],
      x: 0,
      y: 0
    });

    scene.add(cross);

    // const weird = new Path({
    //   path: 'M 0,0.0 L 0.5,0.5 l 0.125,0 Z',
    //   color: [0, 1, 0],
    //   x: 0,
    //   y: 0
    // });

    // scene.add(weird);

    // Rectangle
    const rect = new Rect({
      width: 0.2,
      height: 0.2,
      x: 0.4,
      y: 0.4,
      color: [1, 0, 0]
    });

    scene.add(rect);

    // Circle
    // Just kidding, still have to fix that.
  }

  let currentPointId = 0;

  simulator.streamPoints(POINTS_RATE, (numpoints, callback) => {
    const streamPoints = [];
    const pointsBuffer = scene.points;

    if (pointsBuffer.length) {
      for (var i = 0; i < numpoints; i++) {
        currentPointId++;
        currentPointId %= pointsBuffer.length;

        streamPoints.push(pointsBuffer[currentPointId]);
      }
    }
    callback(streamPoints);
  });

  setInterval(updateDots, FRAME_RATE);
})();
