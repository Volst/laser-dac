import { Simulator } from '@ether-dream/simulator';
import { Scene, Svg, loadSvgFile, distort } from '@ether-dream/draw';
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
    y: 0.3
  });

  function renderFrame() {
    const random = new Date().getMilliseconds() / 1000 / 4;
    scene.add(
      logo,
      distort(
        { x: random, y: 0.1 },
        { x: 0.9, y: 0.1 },
        { x: 0.9, y: 0.9 },
        { x: 0.2 - random, y: random + 0.5 }
      )
    );
  }

  scene.start(renderFrame);
  simulator.stream(scene);
})();
