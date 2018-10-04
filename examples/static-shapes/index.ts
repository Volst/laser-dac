import { Simulator } from '@ether-dream/simulator';
import { DrawingContext } from '@ether-dream/draw';

const FRAME_RATE = 15;
const POINTS_RATE = 30000;

(async () => {
  const simulator = new Simulator();
  await simulator.start({ device: process.argv.includes('--device') });

  let ctx = new DrawingContext();
  function updateDots() {
    ctx = new DrawingContext();

    // Triangle
    ctx.color(0, 1, 0);
    ctx.moveTo(0.1, 0.1);
    ctx.lineTo(0.305, 0.1);
    ctx.lineTo(0.2, 0.3);
    ctx.lineTo(0.1, 0.1);

    // Rectangle
    ctx.color(1, 0, 0);
    ctx.rect(0.5, 0.5, 0.2, 0.2);

    // Circle
    // Just kidding, still have to fix that.
  }

  let currentPointId = 0;

  simulator.streamPoints(POINTS_RATE, (numpoints, callback) => {
    const streamPoints = [];
    const pointsBuffer = ctx.points;

    if (pointsBuffer.length) {
      for (var i = 0; i < numpoints; i++) {
        currentPointId++;
        currentPointId %= pointsBuffer.length;

        streamPoints.push(pointsBuffer[currentPointId]);
      }
    }

    console.log('Render', streamPoints.length, numpoints);
    callback(streamPoints);
  });

  setInterval(updateDots, FRAME_RATE);
})();
