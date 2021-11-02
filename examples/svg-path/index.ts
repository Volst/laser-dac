import { DAC } from '@laser-dac/core';
import { Simulator } from '@laser-dac/simulator';
import { EtherDream } from '@laser-dac/ether-dream';
import { Scene, Svg, loadSvgFile } from '@laser-dac/draw';
import * as path from 'path';

const logoFile = loadSvgFile(path.resolve(__dirname, './logo.svg'));

(async () => {
  const dac = new DAC();
  dac.use(new Simulator());
  if (process.env.DEVICE) {
    dac.use(new EtherDream());
  }
  await dac.start();

  const scene = new Scene({
    resolution: 150,
  });

  const logo = new Svg({
    file: logoFile,
    x: 0,
    y: 0.3,
    size: 0.6,
  });

  function renderFrame() {
    scene.add(logo);
  }

  scene.start(renderFrame);
  dac.stream(scene);
})();
