import { DAC } from '@laser-dac/core';
import { Simulator } from '@laser-dac/simulator';
import { EtherDream } from '@laser-dac/ether-dream';
import { Scene, Rect } from '@laser-dac/draw';
import { Player } from './Player';
import { Ball } from './Ball';

export const AREA_WIDTH = 0.1;
export const AREA_HEIGHT = 0.2;

export class Renderer {
  playerTop = new Player({
    position: 'top',
    isUser: false,
  });
  playerBottom = new Player({
    position: 'bottom',
    isUser: true,
  });
  constructor() {
    this.start();
  }

  updateBottomPosition(direction: 'left' | 'right') {
    this.playerBottom.move(direction);
  }

  async start() {
    const dac = new DAC();
    dac.use(new Simulator());
    if (process.env.DEVICE) {
      dac.use(new EtherDream());
    }
    await dac.start();

    const ball = new Ball({
      players: {
        top: this.playerTop,
        bottom: this.playerBottom,
      },
    });
    const scene = new Scene({ resolution: 600 });
    const self = this;
    function renderFrame() {
      self.playerTop.update();
      self.playerBottom.update();
      ball.update();

      const boudingRect = new Rect({
        width: AREA_WIDTH,
        height: AREA_HEIGHT,
        x: 0.5 - AREA_WIDTH / 2,
        y: 0.5 - AREA_HEIGHT / 2,
        color: [0, 1, 0],
      });
      scene.add(boudingRect);

      scene.add(self.playerTop.draw());
      scene.add(self.playerBottom.draw());
      scene.add(ball.draw());
    }

    scene.start(renderFrame, 100);
    dac.stream(scene);
  }
}
