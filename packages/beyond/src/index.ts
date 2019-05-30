import { Device, Point } from '@laser-dac/core';
import * as beyondLib from './BeyondLib';
import { relativeToPosition, relativeToColor } from './convert';

const ZONE_NUMBER = 1;
const ZONE_NAME = `Laserdac Demo Z${ZONE_NUMBER}`;
const ZONES = Array(255).fill(0);
ZONES[0] = ZONE_NUMBER;
const ZONE_REF = beyondLib.getZoneRef(ZONES);

export class Beyond extends Device {
  private interval?: NodeJS.Timer;

  async start() {
    this.stop();
    beyondLib.ldbCreate();
    const ready = beyondLib.ldbBeyondExeReady();

    if (ready === 1) {
      return !!beyondLib.ldbCreateZoneImage(ZONE_NUMBER, ZONE_NAME);
    }
    return false;
  }

  stop() {
    beyondLib.ldbDestroy();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private convertPoint(p: Point) {
    return {
      x: relativeToPosition(p.x),
      y: relativeToPosition(p.y),
      z: 0,
      pointColor: relativeToColor(p.r, p.g, p.b),
      repCount: 0,
      focus: 0,
      status: 0,
      zero: 0
    };
  }

  stream(scene: { points: Point[] }, pointsRate: number, fps: number) {
    this.interval = setInterval(() => {
      if (!scene.points.length) {
        return;
      }
      const points = scene.points.map(this.convertPoint);
      beyondLib.ldbSendFrameToImage(
        ZONE_NAME,
        points.length,
        points,
        ZONE_REF,
        pointsRate
      );
    }, 1000 / fps);
  }
}
