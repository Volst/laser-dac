import { Simulator } from '@ether-dream/simulator';
import { Scene, Rect } from '@ether-dream/draw';
import { Player } from './Player';
import { Ball } from './Ball';

export const AREA_WIDTH = 0.1;
export const AREA_HEIGHT = 0.2;

(async () => {
  const simulator = new Simulator();
  await simulator.start({ device: !!process.env.DEVICE });

  const playerTop = new Player({
    position: 'top'
  });
  const playerBottom = new Player({
    position: 'bottom'
  });
  const ball = new Ball({
    players: {
      top: playerTop,
      bottom: playerBottom
    }
  });
  const scene = new Scene({
    resolution: 600
  });

  function renderFrame() {
    playerTop.update();
    playerBottom.update();
    ball.update();

    const boudingRect = new Rect({
      width: AREA_WIDTH,
      height: AREA_HEIGHT,
      x: 0.5 - AREA_WIDTH / 2,
      y: 0.5 - AREA_HEIGHT / 2,
      color: [0, 1, 0]
    });
    scene.add(boudingRect);

    scene.add(playerTop.draw());
    scene.add(playerBottom.draw());
    scene.add(ball.draw());
  }

  scene.start(renderFrame, 100);
  simulator.stream(scene);
})();
