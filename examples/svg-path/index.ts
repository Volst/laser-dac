import { DAC } from '@laser-dac/core';
import { getDevices } from '@laser-dac/device-selector';
import { Scene, Svg, loadSvgFile } from '@laser-dac/draw';
import * as path from 'path';

const logoFile = loadSvgFile(path.resolve(__dirname, './logo.svg'));

(async () => {
  const dac = new DAC();
  dac.useAll(await getDevices());

  await dac.start();

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
  dac.stream(scene);
})();
