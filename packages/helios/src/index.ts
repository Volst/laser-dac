import { Device, Point } from '@laser-dac/core';
import * as heliosLib from './HeliosLib';
import { relativeToX, relativeToY, relativeToColor } from './convert';

enum FrameResult {
  Success = 'Success',
  NotReady = 'Not Ready',
  Fail = 'Fail',
  Empty = 'Empty'
}

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

  onShutdownSync() {
    heliosLib.closeDevices();
  }

  private convertPoint(p: Point): heliosLib.IPoint {
    return {
      x: relativeToX(p.x),
      y: relativeToY(p.y),
      r: relativeToColor(p.r),
      g: relativeToColor(p.g),
      b: relativeToColor(p.b),
      i: INTENSITY
    };
  }

  sendFrame(points: Point[], pointsRate: number): FrameResult {
    if (!points.length) {
      return FrameResult.Empty;
    }

    if (heliosLib.getStatus(0) !== 1) {
      return FrameResult.NotReady;
    }

    const limitedPoints = points.length > MAX_POINTS ? points.slice(0, MAX_POINTS) : points;
    const converted = limitedPoints.map(this.convertPoint);
    const success = heliosLib.writeFrame(0, pointsRate, 0, converted, converted.length);
    return success === 1 ? FrameResult.Success : FrameResult.Fail;
  }

  stream(
    scene: { points: Point[] },
    pointsRate: number,
    fps: number
  ) {
    const timePerFrame = Math.round(1000 / fps);
    this.interval = setInterval(() => {
      const points = scene.points;
      this.sendFrame(points, pointsRate);
    }, timePerFrame);
  }
}
