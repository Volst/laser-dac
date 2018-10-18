import { Simulator } from '@ether-dream/simulator';
import { Scene, Ilda, loadIldaFile } from '@ether-dream/draw';
import * as path from 'path';

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
  simulator.stream(scene);
})();
