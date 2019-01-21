import { DAC } from '@laser-dac/core';
import { Simulator } from '@laser-dac/simulator';
import { EtherDream } from '@laser-dac/ether-dream';
import { Scene, IldaFont, loadIldaFile, Timeline } from '@laser-dac/draw';
import * as path from 'path';
import * as mapping from './fontMap.json';

const fontFile = loadIldaFile(path.resolve(__dirname, './font.ild'));

function renderText(text: string) {
  return () =>
    new IldaFont({
      file: fontFile,
      mapping,
      text,
      x: 0,
      size: 0.5,
      fontWidth: 0.3
    });
}

const textAnimation = new Timeline({
  loop: true,
  items: [
    {
      duration: 2000,
      render: renderText('Play')
    },
    {
      duration: 2000,
      render: renderText('This')
    },
    {
      duration: 2000,
      render: renderText('Game')
    }
  ]
});

(async () => {
  const dac = new DAC();
  dac.use(new Simulator());
  if (process.env.DEVICE) {
    dac.use(new EtherDream());
  }
  await dac.start();

  const scene = new Scene();
  function renderFrame() {
    scene.add(textAnimation);
  }

  scene.start(renderFrame);
  dac.stream(scene, 20000);
})();
