import * as dgram from 'dgram';
import { LasercubeWifi } from '.';
import { Command } from './data';
import { LasercubeDevice } from './LasercubeDevice';

export interface IPoint {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
}

export class LasercubeScanner {
  cmdSocket: dgram.Socket;
  dataSocket: dgram.Socket;

  constructor(cmdSocket: dgram.Socket, dataSocket: dgram.Socket) {
    this.cmdSocket = cmdSocket;
    this.dataSocket = dataSocket;
  }

  listenerFunction?: (msg: Buffer, rinfo: dgram.RemoteInfo) => void;

  async search(timeout: number): Promise<LasercubeDevice | null> {
    return new Promise((resolve) => {
      const timeoutTimer = setTimeout(() => {
        this.stop();
        resolve(null);
      }, timeout);
      this.listenerFunction = (msg, rinfo) => {
        if (msg[0] === Command.GetFullInfo && msg.length > 1) {
          clearTimeout(timeoutTimer);
          this.stop();
          const device = new LasercubeDevice(
            rinfo.address,
            this.cmdSocket,
            this.dataSocket
          );
          device.handleCmdMessage(msg, rinfo);
          resolve(device);
        }
      };
      this.cmdSocket.on('message', this.listenerFunction);

      // All lasers in the network will respond to this message by sending their full information
      this.sendFullInfoMsg();
    });
  }

  /**
   * Send a message asking for all the information about the laser
   */
  sendFullInfoMsg() {
    const msg = Buffer.from([Command.GetFullInfo]);
    this.cmdSocket.send(msg, LasercubeWifi.cmdPort, '255.255.255.255');
  }

  stop() {
    if (this.listenerFunction) {
      this.cmdSocket.off('message', this.listenerFunction);
    }
  }
}
