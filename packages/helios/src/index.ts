import { Device, Point } from '@laser-dac/core';
import * as heliosLib from './HeliosLib';
import { relativeToX, relativeToY, relativeToColor } from './convert';
import { Scene } from '@laser-dac/draw';

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
const MIN_PPS = 7;
const MAX_PPS = 65535;

export class Helios extends Device {
  private interval?: NodeJS.Timeout;
  private statsInterval?: NodeJS.Timeout;
  private dacNum: number = 0;
  private sendNextImmediate: boolean = false;

  private stats = {
    startTime: 0,
    microsecondsPerPoint: 0,
    fixedFrameRate: {
      fps: 0,
      allottedFrameMs: 0,
      allottedFramePoints: 0,
      frameAllotmentPercentOfDeviceLimit: 0,
    }
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
      heliosLib.setShutter(this.dacNum, true);
      return true;
    }
    return false;
  }

  stop() {
    heliosLib.setShutter(this.dacNum, false);
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

  setPointsRate(pointsRate: number) {
    // TODO: Make this throw?
    if (pointsRate > MAX_PPS) {
      console.error(`Helios cannot exceed ${MAX_PPS} pps (${pointsRate} requested)`);
      return;
    } else if (pointsRate < MIN_PPS) {
      console.error(`Helios cannot subsceed ${MIN_PPS} pps (${pointsRate} requested)`);
      return;
    }

    super.setPointsRate(pointsRate);
    this.sendNextImmediate = true;
    this.stats.secondsPerPoint = 1 / pointsRate;
    this.stats.microsecondsPerPoint = 1000000 * this.stats.secondsPerPoint;
  }

  sendFrame(points: Point[], pointsRate: number): FrameResult {
    if (!points.length) {
      return FrameResult.Empty;
    }

    if (!this.sendNextImmediate && heliosLib.getStatus(this.dacNum) !== 1) {
      return FrameResult.NotReady;
    }

    const frameMode = this.sendNextImmediate
      ? heliosLib.FrameMode.ImmediateSingle
      : heliosLib.FrameMode.QueueSingle;

    this.sendNextImmediate = false;

    const limitedPoints = points.length > MAX_POINTS ? points.slice(0, MAX_POINTS) : points;
    const converted = limitedPoints.map(this.convertPoint);
    const success = heliosLib.writeFrame(this.dacNum, pointsRate,
     frameMode, converted, converted.length);

    return success === 1 ? FrameResult.Success : FrameResult.Fail;
  }

  stream(
    scene: Scene,
    pointsRate: number,
    fps: number
  ) {
    this.setPointsRate(pointsRate);
    const frameTime = this.stats.fixedFrameRate.allottedFrameMs = Math.round(1000 / fps);
    const allottedFramePoints = this.stats.fixedFrameRate.allottedFramePoints = Math.round(pointsRate / fps);

    console.log(`Streaming at ${pointsRate} pps, ${fps} fps`);
    console.log(`${frameTime}ms per frame, ${allottedFramePoints} points per frame`);

    this.stats.fixedFrameRate.fps = fps;
    this.stats.fixedFrameRate.frameAllotmentPercentOfDeviceLimit =
     100 * allottedFramePoints / MAX_POINTS;
    this.stats.startTime = Date.now();

    this.statsInterval = setInterval(() => { this.printStats(); }, 2000);

    this.interval = setInterval(() => {
      const points = scene.points;
      const result = this.sendFrame(points, this.pointsRate);

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
    const successPpsPercentOfNominal = 100 * successPps / this.pointsRate;
    const attemptedPpsPercentOfNominal = 100 * attemptedPps / this.pointsRate;

    const avgFramePoints = Math.round(this.stats.points[FrameResult.Success] /
      this.stats.frames[FrameResult.Success]);

    const avgFrameDisplayMs = Math.round(1000 * avgFramePoints / this.pointsRate);
    const avgFrameAllotmentUtilization = 100 * avgFramePoints / this.stats.fixedFrameRate.allottedFramePoints;
    const avgFrameDeviceLimitUtilization = 100 * avgFramePoints / MAX_POINTS;

    const totalFrames = this.stats.frames[FrameResult.Success] +
      this.stats.frames[FrameResult.NotReady] +
      this.stats.frames[FrameResult.Fail] +
      this.stats.frames[FrameResult.Empty];

    const notReadyFramePercent = 100 * this.stats.frames[FrameResult.NotReady] / totalFrames;

    return {
      duration,
      successPps,
      attemptedPps,
      successPpsPercentOfNominal,
      attemptedPpsPercentOfNominal,
      avgFramePoints,
      avgFrameDisplayMs,
      avgFrameAllotmentUtilization,
      avgFrameDeviceLimitUtilization,
      notReadyFramePercent,
    }
  }

  getStats(): Object {
    return {
      calculated: this.calculateStats(),
      ...this.stats
    };
  }

  private printStats() {
    const calc = this.calculateStats();
    const duration = Math.round(calc.duration);
    const successPercent = Math.round(calc.successPpsPercentOfNominal);
    const attemptedPercent = Math.round(calc.attemptedPpsPercentOfNominal);
    const notReadyPercent = Math.round(calc.notReadyFramePercent);

    console.log(`${duration} ` +
      `Success: ${calc.successPps} pps (${successPercent}% max), ` +
      `Attempted: ${calc.attemptedPps} pps (${attemptedPercent}% max), ` +
      `Avg ${calc.avgFramePoints}p (${calc.avgFrameDisplayMs}ms) per frame, ` +
      `Unready Frames: ${notReadyPercent}%`);
  }
}
