import { Device } from '@laser-dac/core';
import * as beyondLib from './BeyondLib';
import { relativeToPosition, relativeToColor } from './convert';

const DEFAULT_POINTS_RATE = 30000;
const ZONE_NUMBER = 0;
const ZONE_NAME = `Laser Dac Demo Z${ZONE_NUMBER}`;

const FPS = 30;

export class Beyond extends Device {
  private interval?: NodeJS.Timer;

  async start() {
    this.stop();
    const created = beyondLib.ldbCreate();
    console.log('created', created);
    const ready = beyondLib.ldbBeyondExeReady();
    console.log('Beyond exe ready', beyondLib.ldbBeyondExeStarted(), ready);
    console.log('Zone count', beyondLib.ldbGetZoneCount());

    if (ready === 1) {
      const zone = beyondLib.ldbCreateZoneImage(ZONE_NUMBER, ZONE_NAME);
      console.log('zone created', zone);
      return true;
    }
    return false;
  }

  stop() {
    beyondLib.ldbDestroy();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private convertPoint(p: beyondLib.IPoint) {
    return {
      X: relativeToPosition(p.x),
      Y: relativeToPosition(p.y),
      Z: 0,
      Color: relativeToColor(p.r, p.g, p.b),
      RepCount: 0,
      Focus: 0,
      Status: 0,
      Zero: 0
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
      const zones = Array(255).fill(0);
      zones[0] = ZONE_NUMBER;
      const res = beyondLib.ldbSendFrameToImage(
        ZONE_NAME,
        points.length,
        points,
        zones,
        pointsRate
      );
      console.log('res', res);
    }, 1000 / FPS);
  }
}
