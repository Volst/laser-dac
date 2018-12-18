import { Simulator } from '@ether-dream/simulator';
import { Scene, Svg, loadSvgFile } from '@ether-dream/draw';
import * as path from 'path';

const logoFile = loadSvgFile(path.resolve(__dirname, './logo.svg'));

(async () => {
  const simulator = new Simulator();
  await simulator.start({ device: !!process.env.DEVICE });

  const scene = new Scene({
    resolution: 150
  });

  const logo = new Svg({
    file: logoFile,
    x: 0,
    y: 0.3,
    size: 0.6
  });

  function renderFrame() {
    scene.add(logo);
  }

  scene.start(renderFrame);
  simulator.stream(scene);
})();
