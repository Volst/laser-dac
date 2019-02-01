import { Device } from '@laser-dac/core';
import { HeliosLib } from './HeliosLib';
import { promisify } from 'util';

const delay = promisify((a: number, f: any) => setTimeout(f, a));

const DEFAULT_POINTS_RATE = 30000;

export class Helios extends Device {
  private interval?: NodeJS.Timer;

  async start() {
    this.stop();
    const numDevices = HeliosLib.OpenDevices();
    if (numDevices) {
      let status = HeliosLib.GetStatus(0);
      if (status !== 1) {
        await delay(2000);
        status = HeliosLib.GetStatus(0);
      }
      if (status === 1) {
        return true;
      }
    }
    return false;
  }

  stop() {
    HeliosLib.CloseDevices();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  stream(scene: { points: any[] }, pointsRate: number = DEFAULT_POINTS_RATE) {
    this.interval = setInterval(() => {
      if (!scene.points.length) {
        return;
      }
      const success = HeliosLib.WriteFrame(
        0,
        pointsRate,
        0,
        scene.points,
        scene.points.length
      );
      console.log('writing5?', success);
    }, 100);
  }
}
