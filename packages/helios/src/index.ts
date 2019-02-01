import { Device } from '@laser-dac/core';
import * as heliosLib from './HeliosLib';

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

  stream(scene: { points: any[] }, pointsRate: number = DEFAULT_POINTS_RATE) {
    this.interval = setInterval(() => {
      if (!scene.points.length) {
        return;
      }
      if (heliosLib.getStatus(0) !== 1) {
        return;
      }
      heliosLib.writeFrame(0, pointsRate, 0, scene.points, scene.points.length);
    }, 1000 / FPS);
  }
}
