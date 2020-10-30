import { DAC } from '@laser-dac/core';
import { getDevices } from '@laser-dac/device-selector';
import { Scene, HersheyFont, loadHersheyFont, Timeline } from '@laser-dac/draw';
import * as path from 'path';

const font = loadHersheyFont(path.resolve(__dirname, './futural.jhf'));

function renderText(text: string) {
  return () =>
    new HersheyFont({
      font,
      text,
      x: 0.1,
      y: 0.4,
      color: [1, 0, 0],
      charWidth: 0.08
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
  dac.useAll(await getDevices());
  await dac.start();

  const scene = new Scene();
  function renderFrame() {
    scene.add(textAnimation);
  }

  scene.start(renderFrame);
  dac.stream(scene, 20000);
})();
