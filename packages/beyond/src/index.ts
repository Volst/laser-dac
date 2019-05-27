import { Device } from '@laser-dac/core';
import * as beyondLib from './BeyondLib';
import { relativeToPosition, relativeToColor } from './convert';

const ZONE_NUMBER = 1;
const ZONE_NAME = `Laserdac Demo Z${ZONE_NUMBER}`;

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

  stream(
    scene: { points: beyondLib.IPoint[] },
    pointsRate: number,
    fps: number
  ) {
    // Scan rate is a relative value, percents of defalt sample rate. 100 means 100% of default projector sample rate. If value of ARate is negative, this this is sample rate. Sorry, a bit tricky, the idea is use one variable for two possible options. So, of value is negative then it is sample rate. If you want 30K, then value should be -30000 (minus thirty k). Sample rate means - points per second.
    pointsRate = 100;
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
    }, 1000 / fps);
  }
}
