import { DAC } from '@laser-dac/core';
import { Simulator } from '@laser-dac/simulator';
import { EtherDream } from '@laser-dac/ether-dream';
import { Scene, Ilda, loadIldaFile } from '@laser-dac/draw';
import * as path from 'path';

const boeing = loadIldaFile(path.resolve(__dirname, './boeing.ild'));

(async () => {
  const dac = new DAC();
  dac.use(new Simulator());
  if (process.env.DEVICE) {
    dac.use(new EtherDream());
  }
  await dac.start();

  const scene = new Scene();
  let frame = 0;
  function renderFrame() {
    const ilda = new Ilda({
      file: boeing,
      frame,
      x: 0,
      y: 0,
    });

    scene.add(ilda);

    frame += 1;
    frame %= boeing.sections.length;
  }

  scene.start(renderFrame);
  dac.stream(scene);
})();
