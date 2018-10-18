import { Simulator } from '@ether-dream/simulator';
import { Scene, Ilda, loadIldaFile } from '@ether-dream/draw';
import * as path from 'path';

const POINTS_RATE = 30000;

const boeing = loadIldaFile(path.resolve(__dirname, './boeing.ild'));

(async () => {
  const simulator = new Simulator();
  await simulator.start({ device: !!process.env.DEVICE });

  const scene = new Scene();
  let frame = 0;
  function renderFrame() {
    const ilda = new Ilda({
      file: boeing,
      frame,
      x: 0,
      y: 0
    });

    scene.add(ilda);

    frame += 1;
    frame %= boeing.sections.length;
  }

  scene.start(renderFrame);

  let currentPointId = 0;
  simulator.streamPoints(POINTS_RATE, (numpoints, callback) => {
    // The Ether Dream device can only render a given number of points (numpoints), in practice at max 1799.
    //
    const streamPoints = [];
    const pointsBuffer = scene.points;

    if (pointsBuffer.length) {
      for (var i = 0; i < numpoints; i++) {
        currentPointId++;
        currentPointId %= pointsBuffer.length;

        streamPoints.push(pointsBuffer[currentPointId]);
      }
    }

    // console.log('Render', streamPoints.length, numpoints);
    callback(streamPoints);
  });
})();
