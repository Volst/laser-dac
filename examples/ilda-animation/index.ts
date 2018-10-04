import { Simulator } from '@ether-dream/simulator';
import { Scene, Ilda, loadIldaFile } from '@ether-dream/draw';
import * as path from 'path';

const FRAME_RATE = 15;
const POINTS_RATE = 30000;

const boeing = loadIldaFile(path.resolve(__dirname, './boeing.ild'));

(async () => {
  const simulator = new Simulator();
  await simulator.start({ device: process.argv.includes('--device') });

  let scene = new Scene();
  let frame = 0;
  function updateDots() {
    scene = new Scene();

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

    // console.log('Render', streamPoints.length, numpoints);
    callback(streamPoints);
  });

  setInterval(updateDots, FRAME_RATE);
})();
