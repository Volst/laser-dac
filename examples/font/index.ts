import { Simulator } from '@ether-dream/simulator';
import { Scene, IldaFont, loadIldaFile } from '@ether-dream/draw';
import * as path from 'path';
import * as mapping from './fontMap.json';

const fontFile = loadIldaFile(path.resolve(__dirname, './font.ild'));

(async () => {
  const simulator = new Simulator();
  await simulator.start({ device: !!process.env.DEVICE });

  const scene = new Scene();

  function renderFrame() {
    const hey = new IldaFont({
      file: fontFile,
      mapping,
      text: 'Hey',
      x: 0,
      size: 1,
      fontWidth: 0.3
    });
    scene.add(hey);
  }

  scene.start(renderFrame);
  simulator.stream(scene, 20000);
})();
