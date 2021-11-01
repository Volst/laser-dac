import { Device } from '@laser-dac/core';
import * as heliosLib from './HeliosLib';
import { relativeToPosition, relativeToColor } from './convert';

// This controls the intensity signal of points written to the DAC.
// For many laser projectors this won't make a difference, but some projectors map this to the shutter so the laser won't turn on if we don't pass the max value.
const INTENSITY = 255;
const MAX_POINTS = 4094;

export class Helios extends Device {
  private interval?: NodeJS.Timer;

  async start() {
    this.stop();
    const devices = heliosLib.openDevices();
    if (devices) {
      heliosLib.setShutter(0, true);
      return true;
    }
    return false;
  }

  stop() {
    heliosLib.setShutter(0, false);
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
      b: relativeToColor(p.b),
      i: INTENSITY,
    };
  }

  stream(
    scene: { points: heliosLib.IPoint[] },
    pointsRate: number,
    fps: number
  ) {
    this.interval = setInterval(() => {
      if (!scene.points.length) {
        return;
      }
      if (heliosLib.getStatus(0) !== 1) {
        return;
      }
      const points = scene.points.map(this.convertPoint).slice(0, MAX_POINTS);
      heliosLib.writeFrame(0, pointsRate, 0, points, points.length);
    }, 1000 / fps);
  }
}
