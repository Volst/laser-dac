import { Device, Point } from '@laser-dac/core';
import * as easylaseLib from './EasylaseLib';
import { relativeToPosition, relativeToColor } from './convert';

export class Easylase extends Device {
  private interval?: NodeJS.Timer;

  async start() {
    this.stop();
    const cards = easylaseLib.getCardNum();

    return !!cards;
  }

  stop() {
    const cards = easylaseLib.getCardNum();
    // TODO is manual stop necessary?
    if (cards) {
      easylaseLib.stop(0);
    }
    easylaseLib.close();
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
      i: 255
    };
  }

  stream(scene: { points: Point[] }, pointsRate: number, fps: number) {
    this.interval = setInterval(() => {
      if (!scene.points.length) {
        return;
      }
      if (easylaseLib.getStatus(0) !== 1) {
        return;
      }
      const points = scene.points.map(this.convertPoint);
      easylaseLib.writeFrame(0, points, points.length, pointsRate);
    }, 1000 / fps);
  }
}
