import * as dgram from 'dgram';
import { Device } from '@laser-dac/core';
import { IPoint, LasercubeScanner } from './LasercubeScanner';
import {
  relativeToColorBlue,
  relativeToColorGreen,
  relativeToColorRed,
  relativeToPosition,
} from './convert';
import * as struct from 'python-struct';
import { LasercubeDevice } from './LasercubeDevice';

const DEFAULT_POINTS_RATE = 30000;

export class LasercubeWifi extends Device {
  static cmdPort = 45457;
  static dataPort = 45458;

  private cmdSocket = dgram.createSocket('udp4');
  private dataSocket = dgram.createSocket('udp4');

  scanner?: LasercubeScanner;
  device?: LasercubeDevice;

  async search() {
    this.scanner = new LasercubeScanner(this.cmdSocket, this.dataSocket);
    return await this.scanner.search(4000);
  }

  async start() {
    this.startSockets();
    const device = await this.search();
    if (!device) {
      return false;
    }

    this.device = device;
    this.device.start();
    return true;
  }

  stop() {
    if (this.scanner) {
      this.scanner.stop();
    }
    if (this.device) {
      this.device.stop();
    }
    this.stopSockets();
  }

  private startSockets() {
    this.cmdSocket.on('error', (err) => {
      console.error('Lasercube WiFi cmd socket error:', err);
      this.stop();
    });

    this.cmdSocket.bind(LasercubeWifi.cmdPort, undefined, () => {
      this.cmdSocket.setBroadcast(true);
    });

    this.dataSocket.on('error', (err) => {
      console.error('Lasercube WiFi data socket error:', err);
      this.stop();
    });

    this.dataSocket.bind(LasercubeWifi.dataPort);
  }

  private stopSockets() {
    try {
      this.cmdSocket.close();
      this.dataSocket.close();
      // Ignore errors about socket already being closed
    } catch {}
  }

  private convertPoint(p: IPoint) {
    const x = relativeToPosition(p.x);
    const y = relativeToPosition(p.y);
    const r = relativeToColorRed(p.r);
    const g = relativeToColorGreen(p.g);
    const b = relativeToColorBlue(p.b);

    // Pack it into a C++ compatible binary struct
    return struct.pack('<HHHHH', x, y, r, g, b);
  }

  stream(
    scene: { points: IPoint[] },
    pointsRate: number = DEFAULT_POINTS_RATE
  ) {
    if (!this.device) {
      console.error('No device found while streaming');
      return;
    }

    this.device.streamFrames(pointsRate, () => {
      const points = scene.points.map(this.convertPoint);
      return points;
    });
  }
}
