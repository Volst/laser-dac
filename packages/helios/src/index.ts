import { Device } from '@laser-dac/core';
import * as heliosLib from './HeliosLib';
import { relativeToPosition, relativeToColor } from './convert';

const DEFAULT_POINTS_RATE = 30000;

const FPS = 30;

export class Helios extends Device {
  private interval?: NodeJS.Timer;

  async start() {
    this.stop();
    return !!heliosLib.openDevices();
  }

  stop() {
    heliosLib.closeDevices();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private convertPoint(p: heliosLib.IPoint) {
    return {
      x: relativeToPosition(p.x),
      y: relativeToPosition(p.y),
      r: relativeToColor(p.r),
      g: relativeToColor(p.g),
      b: relativeToColor(p.b)
    };
  }

  stream(
    scene: { points: heliosLib.IPoint[] },
    pointsRate: number = DEFAULT_POINTS_RATE
  ) {
    this.interval = setInterval(() => {
      if (!scene.points.length) {
        return;
      }
      if (heliosLib.getStatus(0) !== 1) {
        return;
      }
      const points = scene.points.map(this.convertPoint);
      heliosLib.writeFrame(0, pointsRate, 0, points, points.length);
    }, 1000 / FPS);
  }
}
