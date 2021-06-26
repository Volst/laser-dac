import * as dgram from 'dgram';
import { Device } from '@laser-dac/core';
import { IPoint, LasercubeScanner } from './LasercubeScanner';

const DEFAULT_POINTS_RATE = 30000;

export class LasercubeWifi extends Device {
  static cmdPort = 45457;
  static dataPort = 45458;

  private cmdSocket = dgram.createSocket('udp4');
  private dataSocket = dgram.createSocket('udp4');

  scanner?: LasercubeScanner;

  async search() {
    this.scanner = new LasercubeScanner(this.cmdSocket, this.dataSocket);
    const device = await this.scanner.search();

    console.log('Search done', !!device);

    return device;
  }

  async start() {
    this.startSockets();
    const device = await this.search();
    if (!device) {
      return false;
    }
    console.log('Started with device');
    // const conn = await EtherDream.connect(device.ip, device.port);
    // if (conn) {
    //   this.connection = conn;
    //   return true;
    // }
    return false;
  }

  stop() {
    if (this.scanner) {
      this.scanner.stop();
    }
    this.stopSockets();
  }

  private startSockets() {
    this.cmdSocket.on('error', (err) => {
      console.log('cmdSocket error', err);
      this.cmdSocket.close();
    });

    this.cmdSocket.bind(LasercubeWifi.cmdPort, undefined, () => {
      this.cmdSocket.setBroadcast(true);
    });

    this.dataSocket.on('error', (err) => {
      console.log('dataSocket error', err);
      this.dataSocket.close();
    });

    this.dataSocket.bind(LasercubeWifi.dataPort);
  }

  private stopSockets() {
    this.cmdSocket.close();
    this.dataSocket.close();
  }

  // private convertPoint(p: IPoint) {
  // return {
  //   x: relativeToPosition(p.x),
  //   y: relativeToPosition(p.y),
  //   r: relativeToColor(p.r),
  //   g: relativeToColor(p.g),
  //   b: relativeToColor(p.b),
  // };
  // }

  stream(
    scene: { points: IPoint[] },
    pointsRate: number = DEFAULT_POINTS_RATE
  ) {
    // if (!this.connection) {
    //   throw new Error(
    //     'No active connection to the Ether Dream, call start() first'
    //   );
    // }
    // this.connection.streamFrames(pointsRate, (callback) => {
    //   const points = scene.points.map(this.convertPoint);
    //   callback(points);
    // });
  }
}
