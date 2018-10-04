import { Simulator } from '@ether-dream/simulator';
import { Scene, Rect } from '@ether-dream/draw';

const FRAME_RATE = 15;
const POINTS_RATE = 30000;

(async () => {
  const simulator = new Simulator();
  await simulator.start({ device: process.argv.includes('--device') });

  let scene = new Scene();
  function updateDots() {
    scene = new Scene();

    // Rectangle
    const rect = new Rect({
      width: 0.2,
      height: 0.2,
      x: 0.5,
      y: 0.5,
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
