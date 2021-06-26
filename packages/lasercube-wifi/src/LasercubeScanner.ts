import * as dgram from 'dgram';
import { LasercubeWifi } from '.';
import { LasercubeDevice } from './LasercubeDevice';

export interface IPoint {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
}

const CMD_GET_FULL_INFO = 0x77;
// const CMD_ENABLE_BUFFER_SIZE_RESPONSE_ON_DATA = 0x78
// const CMD_SET_OUTPUT = 0x80
// const CMD_GET_RINGBUFFER_EMPTY_SAMPLE_COUNT = 0x8a
// const CMD_SAMPLE_DATA = 0xa9

export class LasercubeScanner {
  cmdSocket: dgram.Socket;
  dataSocket: dgram.Socket;

  constructor(cmdSocket: dgram.Socket, dataSocket: dgram.Socket) {
    this.cmdSocket = cmdSocket;
    this.dataSocket = dataSocket;
  }

  async search(): Promise<LasercubeDevice> {
    // TODO: add timeout
    return new Promise((resolve) => {
      this.cmdSocket.on('message', (msg, rinfo) => {
        console.log('scanner: received cmd message', msg, rinfo);
        if (msg[0] === CMD_GET_FULL_INFO && msg.length > 1) {
          this.stop();
          const device = new LasercubeDevice(
            rinfo.address,
            this.cmdSocket,
            this.dataSocket
          );
          device.handleCmdMessage(msg, rinfo);
          resolve(device);
        }
      });

      this.sendFullInfoMsg();
    });
  }

  /**
   * Send a message asking for all the information about the laser
   */
  sendFullInfoMsg() {
    const msg = Buffer.from([CMD_GET_FULL_INFO]);
    this.cmdSocket.send(msg, LasercubeWifi.cmdPort, '255.255.255.255');
  }

  stop() {
    // TODO
    // this.cmdSocket.off('message', this.handleCmdMessage)
  }
}
