import { DAC } from '@laser-dac/core';
import { Simulator } from '@laser-dac/simulator';
import { EtherDream } from '@laser-dac/ether-dream';
import { Scene, Rect } from '@laser-dac/draw';
import { Ball } from './Ball';

const NUMBER_OF_BALLS = 4;

(async () => {
  const dac = new DAC();
  dac.use(new Simulator());
  if (process.env.DEVICE) {
    dac.use(new EtherDream());
  }
  await dac.start();

  const balls: Ball[] = [];
  for (let i = 0; i < NUMBER_OF_BALLS; i++) {
    balls.push(
      new Ball({
        x: 0.5,
        y: 0.5,
        radius: Math.random() / 5 + 0.05
      })
    );
  }

  const scene = new Scene({
    resolution: 70
  });
  function renderFrame() {
    const bounds = new Rect({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      color: [0, 1, 0]
    });
    scene.add(bounds);

    balls.forEach(ball => {
      ball.update();
      scene.add(ball.draw());
    });
  }

  scene.start(renderFrame);
  dac.stream(scene);
})();
