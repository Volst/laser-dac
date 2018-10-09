import { Simulator } from '@ether-dream/simulator';
import { Scene, Svg, loadSvgFile } from '@ether-dream/draw';
import * as path from 'path';

const FRAME_RATE = 15;
const POINTS_RATE = 30000;

const logoFile = loadSvgFile(path.resolve(__dirname, './logo.svg'));

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
    const logo = new Svg({
      file: logoFile,
      x: 0,
      y: 0
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
