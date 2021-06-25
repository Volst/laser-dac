import * as dgram from 'dgram';
import { Device } from '@laser-dac/core';
import { IPoint } from './LasercubeConnection';

const DEFAULT_POINTS_RATE = 30000;

type IDevice = {
  ip: string;
  serialNumber: string;
};

const CMD_GET_FULL_INFO = 0x77;
// const CMD_ENABLE_BUFFER_SIZE_RESPONSE_ON_DATA = 0x78
// const CMD_SET_OUTPUT = 0x80
// const CMD_GET_RINGBUFFER_EMPTY_SAMPLE_COUNT = 0x8a
// const CMD_SAMPLE_DATA = 0xa9

export class LasercubeWifi extends Device {
  static cmdPort = 45457;
  static dataPort = 45458;

  // connection?: EtherConn;

  find(limit: number, timeout: number): Promise<IDevice[]> {
    const ips: string[] = [];
    const devices: IDevice[] = [];

    const cmdSocket = dgram.createSocket('udp4');
    const dataSocket = dgram.createSocket('udp4');

    return new Promise((resolve) => {
      const timeouttimer = setTimeout(function () {
        cmdSocket.close();
        dataSocket.close();
        resolve(devices);
      }, timeout);

      cmdSocket.on('message', function (msg, rinfo) {
        console.log('received msg', msg, rinfo);
        const ip = rinfo.address;
        if (ips.indexOf(ip) != -1) return;
        ips.push(ip);

        devices.push({
          ip: ip,
          serialNumber: 'xxx',
        });

        if (devices.length >= limit) {
          cmdSocket.close();
          clearTimeout(timeouttimer);
          resolve(devices);
        }
      });

      cmdSocket.on('error', (err) => {
        console.log('cmdSocket error', err);
        cmdSocket.close();
        clearTimeout(timeouttimer);
        resolve(devices);
      });

      cmdSocket.on('listening', function () {
        const address = cmdSocket.address();
        console.log(
          'cmdSocket listening ' + address.address + ':' + address.port
        );
      });

      cmdSocket.bind(LasercubeWifi.cmdPort, undefined, function () {
        cmdSocket.setBroadcast(true);
      });

      // Data socket
      dataSocket.on('message', function (msg, rinfo) {
        console.log('received msg', msg, rinfo);
        const ip = rinfo.address;
        if (ips.indexOf(ip) != -1) return;
        ips.push(ip);

        devices.push({
          ip: ip,
          serialNumber: 'xxx',
        });

        if (devices.length >= limit) {
          dataSocket.close();
          clearTimeout(timeouttimer);
          resolve(devices);
        }
      });

      dataSocket.on('error', (err) => {
        console.log('dataSocket error', err);
        dataSocket.close();
        clearTimeout(timeouttimer);
        resolve(devices);
      });

      dataSocket.on('listening', function () {
        const address = dataSocket.address();
        console.log(
          'dataSocket listening ' + address.address + ':' + address.port
        );
      });

      dataSocket.bind(LasercubeWifi.dataPort, undefined, function () {});

      setTimeout(() => {
        const msg = Buffer.from([CMD_GET_FULL_INFO]);
        cmdSocket.send(
          msg,
          LasercubeWifi.cmdPort,
          '255.255.255.255',
          (a, b) => {
            console.log('callback', a, b);
          }
        );
      }, 1000);

      // wait two seconds for data to come back...
    });
  }

  async search() {
    const device = await this.find(1, 10000);

    console.log('Search done', device);

    return device;
  }

  async start() {
    const device = await this.search();
    if (!device) {
      return false;
    }
    // const conn = await EtherDream.connect(device.ip, device.port);
    // if (conn) {
    //   this.connection = conn;
    //   return true;
    // }
    return false;
  }

  stop() {
    // if (this.connection) {
    //   this.connection.sendEmergencyStop(() => {
    //     if (this.connection) {
    //       this.connection.close();
    //     }
    //   });
    // }
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
