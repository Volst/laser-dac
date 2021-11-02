import { Device, Point } from '@laser-dac/core';
import * as easylaseLib from './EasylaseLib';
import { relativeToPosition, relativeToColor } from './convert';

export class Easylase extends Device {
  private interval?: NodeJS.Timer;
  deviceHandle?: number;

  async start() {
    this.stop();
    const cards = easylaseLib.enumerateDevices();
    if (cards) {
      const deviceName = easylaseLib.getDeviceListEntry(cards - 1);
      const handle = easylaseLib.openDevice(deviceName);
      if (handle >= 0) {
        this.deviceHandle = handle;
        const status = easylaseLib.startOutput(this.deviceHandle);
        return status === 0;
      }
    }
    return false;
  }

  stop() {
    if (this.deviceHandle != null) {
      easylaseLib.stopOutput(this.deviceHandle);
      easylaseLib.closeDevice(this.deviceHandle);
      this.deviceHandle = undefined;
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private convertPoint(p: Point) {
    return {
      x: relativeToPosition(p.x),
      y: relativeToPosition(p.y),
      r: relativeToColor(p.r),
      g: relativeToColor(p.g),
      b: relativeToColor(p.b),
      i: 255,
      deepblue: 0,
      yellow: 0,
      cyan: 0,
      user4: 0,
    };
  }

  stream(scene: { points: Point[] }, pointsRate: number, fps: number) {
    this.interval = setInterval(() => {
      if (!scene.points.length) {
        return;
      }
      if (this.deviceHandle == null) return;
      const ready = easylaseLib.isDeviceReady(this.deviceHandle);
      if (ready !== 1) {
        return;
      }
      const points = scene.points.map(this.convertPoint);
      easylaseLib.writeFrame(
        this.deviceHandle,
        points,
        points.length,
        pointsRate,
        0
      );
    }, 1000 / fps);
  }
}
