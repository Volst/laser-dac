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
  private dacNum: number = 0;
  private sendNextImmediate: boolean = false;
  private lastPoint?: Point;
  /*
  We could initialize lastPoint to the center to capture the initial startup jump
  but it doesn't seem that useful.
  {
    x: 0.5,
    y: 0.5,
    r: 0,
    g: 0,
    b: 0,
  };
   */

  private stats = {
    startTime: 0,
    secondsPerPoint: 0,
    msPerPoint: 0,
    microsecondsPerPoint: 0,
    maxTheoreticalAccel: 0,
    fixedFrameRate: {
      fps: 0,
      allottedFrameMs: 0,
      allottedFramePoints: 0,
      frameAllotmentPercentOfDeviceLimit: 0,
    },
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
    lastFrame: {
      points: 0,
      result: FrameResult.Empty,
      drawMs: 0,
      maxJumpX: 0,
      maxJumpY: 0,
      maxJump: 0,
      maxSpeed: 0,
      maxAccel: 0,
    },
    allFrames: {
      maxJumpX: 0,
      maxJumpY: 0,
      maxJump: 0,
      maxSpeed: 0,
      maxAccel: 0,
    }
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
    this.stats.msPerPoint = 1000 / pointsRate;
    this.stats.microsecondsPerPoint = 1000000 / pointsRate;

    // Going from 0 to 1 in a single point means a velocity of 1 Screen Unit (SU)
    // in secondsPerPoint amount of time. secondsPerPoint is  1 / pointsRate seconds,
    // so 1 / (1 / pointsRate) is just pointsRate pointsRate SU/s.
    //
    // Max acceleration would be going across the screen from 0 to 1 in a
    // single point and then back to 0 on the next point. That's a change in
    // velocity of 2 * pointsRate SU/s in one secondsPerPoint
    // amount of time, measured in SU/s/s.
    //
    // But SU/s/s isn't that useful of a measurement since that acceleration only
    // applies for the duration of a single point, which is usually in microseconds (us).
    // So let's keep the speed in SU/s but make acceleration in SU/s/us
    this.stats.maxTheoreticalAccel = 2 * pointsRate / this.stats.microsecondsPerPoint;
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

    this.interval = setInterval(() => {
      const points = scene.points;
      const result = this.sendFrame(points, this.pointsRate);

      this.stats.lastFrame.points = points.length;
      this.stats.lastFrame.result = result;
      this.stats.lastFrame.drawMs = 1000 * points.length / this.pointsRate;
      this.stats.points[result] += points.length;
      ++this.stats.frames[result];

      this.recordContentStats(points);

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

  recordContentStats(framePoints: Point[]) {
    let maxJumpX = 0;
    let maxJumpY = 0;
    let maxJump = 0;
    let maxSpeed = 0;
    let maxAccel = 0;

    let lastJumpX = 0;
    let lastJumpY = 0;

    framePoints.forEach((point: Point) => {
      const lastPoint = this.lastPoint ?? point;
      const jumpX = point.x - lastPoint.x;
      const jumpXAbs = Math.abs(jumpX);

      const jumpY = point.y - lastPoint.y;
      const jumpYAbs = Math.abs(jumpY);

      const largerJump = Math.max(jumpXAbs, jumpYAbs);

      const largerSpeed = largerJump / this.stats.secondsPerPoint;

      const jumpDiffX = Math.abs(jumpX - lastJumpX);
      const jumpDiffY = Math.abs(jumpY - lastJumpY);
      const largerJumpDiff = Math.max(jumpDiffX, jumpDiffY);

      // Acceleration is mearued here in Screen Units per second per microsecond (SU/s/us).
      const speedChange = largerJumpDiff / this.stats.secondsPerPoint;
      const accel = speedChange / this.stats.microsecondsPerPoint;

      maxJumpX = Math.max(maxJumpX, jumpXAbs);
      maxJumpY = Math.max(maxJumpY, jumpYAbs);
      maxJump = Math.max(maxJump, largerJump);
      maxSpeed = Math.max(maxSpeed, largerSpeed);
      maxAccel = Math.max(maxAccel, accel);

      lastJumpX = jumpX;
      lastJumpY = jumpY;
      this.lastPoint = point;
    });

    this.stats.lastFrame.maxJumpX = maxJumpX;
    this.stats.lastFrame.maxJumpY = maxJumpY;
    this.stats.lastFrame.maxJump = maxJump;
    this.stats.lastFrame.maxSpeed = maxSpeed;
    this.stats.lastFrame.maxAccel = maxAccel;

    this.stats.allFrames.maxJumpX = Math.max(this.stats.allFrames.maxJumpX, maxJumpX);
    this.stats.allFrames.maxJumpY = Math.max(this.stats.allFrames.maxJumpY, maxJumpY);
    this.stats.allFrames.maxJump = Math.max(this.stats.allFrames.maxJump, maxJump);
    this.stats.allFrames.maxSpeed = Math.max(this.stats.allFrames.maxSpeed, maxSpeed);
    this.stats.allFrames.maxAccel = Math.max(this.stats.allFrames.maxAccel, maxAccel);
  }

  getStats(): Object {
    return {
      calculated: this.calculateStats(),
      ...this.stats
    };
  }
}
