import { Simulator } from '@laser-dac/simulator';
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
  const simulator = new Simulator();
  await simulator.start({ device: !!process.env.DEVICE });

  const scene = new Scene();
  function renderFrame() {
    scene.add(textAnimation);
  }

  scene.start(renderFrame);
  simulator.stream(scene, 20000);
})();
