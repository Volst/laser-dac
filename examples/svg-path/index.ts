import { Simulator } from '@ether-dream/simulator';
import { Scene, Svg, loadSvgFile } from '@ether-dream/draw/src';
import * as path from 'path';

const POINTS_RATE = 30000;

const logoFile = loadSvgFile(path.resolve(__dirname, './logo.svg'));

(async () => {
  const simulator = new Simulator();
  await simulator.start({ device: !!process.env.DEVICE });

  const scene = new Scene({
    resolution: 500
  });

  const logo = new Svg({
    file: logoFile,
    x: 0,
    y: 0.3
  });
  scene.add(logo);

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
})();
