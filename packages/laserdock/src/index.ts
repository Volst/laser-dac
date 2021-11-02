import { Device } from '@laser-dac/core';
import * as laserdockLib from './LaserdockLib';
import {
  relativeToPosition,
  relativeToRedGreen,
  relativeToBlue,
} from './convert';

const MAX_POINTS = 4095;

export class Laserdock extends Device {
  private interval?: NodeJS.Timeout;

  async start() {
    this.stop();

    const status = laserdockLib.init();
    if (status < 1) {
      return false;
    }

    const output = laserdockLib.enableOutput();
    laserdockLib.clearRingBuffer();
    return !!output;
  }

  stop() {
    laserdockLib.disableOutput();
    if (this.interval) {
      clearTimeout(this.interval);
    }
  }

  private convertPoint(p: laserdockLib.IPoint) {
    return {
      x: relativeToPosition(p.x),
      y: relativeToPosition(1 - p.y),
      rg: relativeToRedGreen(p.r, p.g),
      b: relativeToBlue(p.b),
    };
  }

  stream(
    scene: { points: laserdockLib.IPoint[] },
    pointsRate: number,
    fps: number
  ) {
    laserdockLib.setDacRate(pointsRate);
    const callback = () => {
      const len = scene.points.length;
      this.interval = setTimeout(callback, (len / pointsRate) * 1000);
      const points = scene.points.map(this.convertPoint).splice(0, MAX_POINTS);
      laserdockLib.sendSamples(points, len);
    };
    this.interval = setTimeout(callback, 0);
  }
}
