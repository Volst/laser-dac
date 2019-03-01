import { Device } from '@laser-dac/core';
import * as laserdockLib from './LaserdockLib';
import {
  relativeToPosition,
  relativeToRedGreen,
  relativeToBlue
} from './convert';

const DEFAULT_POINTS_RATE = 30000;

const FPS = 30;

export class Laserdock extends Device {
  private interval?: NodeJS.Timer;

  async start() {
    this.stop();
    laserdockLib.init();
    laserdockLib.clearRingBuffer();
    return !!laserdockLib.enableOutput();
  }

  stop() {
    laserdockLib.disableOutput();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private convertPoint(p: laserdockLib.IPoint) {
    return {
      x: relativeToPosition(p.x),
      y: relativeToPosition(p.y),
      r: relativeToRedGreen(p.r, p.g),
      b: relativeToBlue(p.b)
    };
  }

  stream(
    scene: { points: laserdockLib.IPoint[] },
    pointsRate: number = DEFAULT_POINTS_RATE
  ) {
    laserdockLib.setDacRate(pointsRate);
    this.interval = setInterval(() => {
      if (!scene.points.length) {
        return;
      }
      const points = scene.points.map(this.convertPoint);
      laserdockLib.sendSamples(points, points.length);
    }, 1000 / FPS);
  }
}
