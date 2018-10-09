import { Simulator } from '@ether-dream/simulator';
import { Scene, Path } from '@ether-dream/draw';

const FRAME_RATE = 15;
const POINTS_RATE = 30000;

(async () => {
  const simulator = new Simulator();
  await simulator.start({ device: !!process.env.DEVICE });

  let scene = new Scene();
  function updateDots() {
    scene = new Scene({
      resolution: 500
    });

    // Should draw the Volst logo.
    // This is just the <path /> copy pasted from a SVG file.
    const logo = new Path({
      path: 'M 0.083333333,0.25 Q 0.1666667,0.5 0.25,0.33333 T 0.5,0.5',
      color: [0, 1, 0]
    });
    scene.add(logo);

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
