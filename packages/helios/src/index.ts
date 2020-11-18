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
  private interval?: NodeJS.Timeout;
  private statsInterval?: NodeJS.Timeout;

  private stats = {
    startTime: 0,
    expectedFrameMs: 0,
    maxFramePoints: 0,
    pps: 0,
    fps: 0,
    points: {
      [FrameResult.Success]: 0,
      [FrameResult.NotReady]: 0,
      [FrameResult.Fail]: 0,
      [FrameResult.Empty]: 0, // Should always be 0.
    },
    frames: {
      [FrameResult.Success]: 0,
      [FrameResult.NotReady]: 0,
      [FrameResult.Fail]: 0,
      [FrameResult.Empty]: 0,
    },
  };

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
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
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
    const success = heliosLib.writeFrame(0, pointsRate,
     heliosLib.FrameMode.QueueLoop, converted, converted.length);
    return success === 1 ? FrameResult.Success : FrameResult.Fail;
  }

  stream(
    scene: { points: Point[] },
    pointsRate: number,
    fps: number
  ) {
    const frameTime = this.stats.expectedFrameMs = Math.round(1000 / fps);
    this.stats.maxFramePoints = Math.round(pointsRate / fps);
    console.log(`Streaming at ${pointsRate} pps, ${fps} fps`);
    console.log(`${frameTime}ms per frame, ${this.stats.maxFramePoints} points per frame`);

    this.stats.fps = fps;
    this.stats.pps = pointsRate;
    this.stats.startTime = Date.now();

    this.statsInterval = setInterval(() => { this.printStats(); }, 2000);

    this.interval = setInterval(() => {
      const points = scene.points;
      const result = this.sendFrame(points, pointsRate);

      this.stats.points[result] += points.length;
      ++this.stats.frames[result];

      switch (result) {
        case FrameResult.Fail:
          console.error("Helios failed sending a frame");
          break;
        case FrameResult.NotReady:
          console.error("Helios not ready.");
          break;
      }
    }, frameTime);
  }

  private calculateStats() {
    const duration = (Date.now() - this.stats.startTime) / 1000;
    const successPps = Math.round(this.stats.points[FrameResult.Success] / duration);
    const attemptedPoints = this.stats.points[FrameResult.Success] +
      this.stats.points[FrameResult.NotReady] +
      this.stats.points[FrameResult.Fail];

    const attemptedPps = Math.round(attemptedPoints / duration);
    const successPpsRatio = successPps / this.stats.pps;
    const attemptedPpsRatio = attemptedPps / this.stats.pps;

    const avgFramePoints = Math.round(this.stats.points[FrameResult.Success] /
      this.stats.frames[FrameResult.Success]);

    const avgNominalFrameMs = Math.round(1000 * avgFramePoints / this.stats.pps);

    const totalFrames = this.stats.frames[FrameResult.Success] +
      this.stats.frames[FrameResult.NotReady] +
      this.stats.frames[FrameResult.Fail] +
      this.stats.frames[FrameResult.Empty];

    const notReadyRatio = this.stats.frames[FrameResult.NotReady] / totalFrames;

    return {
      duration,
      successPps,
      attemptedPps,
      successPpsRatio,
      attemptedPpsRatio,
      avgFramePoints,
      avgNominalFrameMs,
      notReadyRatio,
    }
  }

  private printStats() {
    const calc = this.calculateStats();
    const duration = Math.round(calc.duration);
    const successPercent = Math.round(100 * calc.successPpsRatio);
    const attemptedPercent = Math.round(100 * calc.attemptedPpsRatio);
    const notReadyPercent = Math.round(100 * calc.notReadyRatio);

    console.log(`${duration} ` +
      `Success: ${calc.successPps} pps (${successPercent}% max), ` +
      `Attempted: ${calc.attemptedPps} pps (${attemptedPercent}% max), ` +
      `Avg ${calc.avgFramePoints}p (${calc.avgNominalFrameMs}ms) per frame, ` +
      `Unready Frames: ${notReadyPercent}%`);
  }
}
