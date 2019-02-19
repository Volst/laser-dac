import { Device } from '@laser-dac/core';
import * as beyondLib from './BeyondLib';
import { relativeToPosition } from './convert';

const DEFAULT_POINTS_RATE = 30000;

const FPS = 30;

export class Beyond extends Device {
  private interval?: NodeJS.Timer;

  async start() {
    this.stop();
    const created = beyondLib.ldbCreate();
    console.log('created', created);
    const ready = beyondLib.ldbBeyondExeReady();
    console.log('Beyond exe ready', ready);
    const zone = beyondLib.ldbCreateZoneImage(0, 'output0');
    console.log('zone created', zone);
    return !!ready;
  }

  stop() {
    beyondLib.ldbDestroy();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private convertPoint(p: beyondLib.IPoint) {
    return {
      x: relativeToPosition(p.x),
      y: relativeToPosition(p.y)
      // r: relativeToColor(p.r),
      // g: relativeToColor(p.g),
      // b: relativeToColor(p.b)
    };
  }

  stream(
    scene: { points: beyondLib.IPoint[] },
    pointsRate: number = DEFAULT_POINTS_RATE
  ) {
    this.interval = setInterval(() => {
      if (!scene.points.length) {
        return;
      }
      const points = scene.points.map(this.convertPoint);
      beyondLib.ldbSendFrameToImage(
        'output0',
        points.length,
        points,
        [0],
        pointsRate
      );
    }, 1000 / FPS);
  }
}
