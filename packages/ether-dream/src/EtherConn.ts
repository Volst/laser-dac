import * as net from 'net';
import { parseStandardResponse } from './parse';
import {
  writeUnsignedInt16,
  writeUnsignedInt32,
  writeSignedInt16,
} from './write';

const STANDARD_RESPONSE_SIZE = 22;
const PLAYBACK_IDLE = 0;
const LIGHT_ENGINE_READY = 0;
const LIGHT_ENGINE_ESTOP = 3;

type HandlerCallbackFn = (data: number[]) => void;
type pstdReturnType = ReturnType<typeof parseStandardResponse>;

export interface IPoint {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  // TODO: have yet to find out what these four properties are. In our tests they are always undefined
  // https://github.com/j4cbo/j4cDAC/blob/e592ebcb7c9b6fb521be2005f4b85de54bc04f0f/common/protocol.h
  control?: number;
  i?: number;
  u1?: number;
  u2?: number;
}
export type StreamFrameCallback = () => IPoint[];

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

export class EtherConn {
  client?: net.Socket;
  inputqueue: number[] = [];
  inputhandlerqueue: { size: number; callback: HandlerCallbackFn }[] = [];
  fullness = 0;
  playbackState = PLAYBACK_IDLE;
  lightEngineState = 0;
  beginSent = false;
  prepareSent = false;
  valid = true;
  rate?: number;
  streamCallback?: StreamFrameCallback;
  running = false;
  ip?: string;
  port?: number;

  // Maximum points to fill buffer with
  // https://github.com/sebleedelisle/ofxLaser/blob/42d733489947c95cc83505f5708e89309f7d856f/src/dacs/ofxLaserDacEtherdream.cpp#L37
  dacBufferSize = 1200;

  _send(sendcommand: string) {
    this.client!.write(Buffer.from(sendcommand, 'binary'));
    this._popinputqueue();
  }

  _popinputqueue() {
    if (this.inputhandlerqueue.length > 0) {
      const handler = this.inputhandlerqueue[0];
      if (this.inputqueue.length >= handler.size) {
        // console.log('we got enough input bytes');
        const response = this.inputqueue.splice(0, handler.size);
        this.inputhandlerqueue.splice(0, 1);
        handler.callback(response);
      }
    }
  }

  connect(ip: string, port: number) {
    this.ip = ip;
    this.port = port;
    const self = this;

    console.log('SOCKET: Connecting to ' + ip + ':' + port + ' ...');

    return new Promise((resolve, reject) => {
      this.client = net.connect(
        {
          host: ip,
          port: port,
        },
        function () {
          console.log('SOCKET CONNECT: client connected');
          // self.sendPing(function() {
          //	callback(true);
          // });

          self.waitForResponse().then(() => {
            resolve(true);
          });

          self._popinputqueue();

          self.running = true;
          self.run();
        }
      );

      this.client.on('data', function (data) {
        // console.log('SOCKET got ' + data.length + ' bytes');
        // console.log('SOCKET DATA:', data.toString(), data.length, self.currentcommand);
        // console.log('\n\n');
        for (let i = 0; i < data.length; i++) {
          self.inputqueue.push(data[i]);
        }
        setTimeout(function () {
          self._popinputqueue();
        }, 0);
      });

      this.client.on('error', function (data) {
        console.log('SOCKET ERROR:', data.toString());
        setTimeout(function () {
          resolve(false);
        }, 0);
      });

      this.client.on('end', function () {
        console.log('SOCKET END: client disconnected');
      });
    });
  }

  reconnect() {
    if (!this.ip || !this.port) {
      throw new Error('Connect before attemping a reconnect');
    }
    this.close();
    return this.connect(this.ip, this.port);
  }

  waitForResponse(size = STANDARD_RESPONSE_SIZE): Promise<number[]> {
    return new Promise((resolve) => {
      // console.log('Setting up responder for ' + size + ' bytes...');
      const callback = (data: number[]) => {
        const st = parseStandardResponse(data);
        this.handleStandardResponse(st);
        resolve(data);
      };
      this.inputhandlerqueue.push({ size, callback });
      this._popinputqueue();
    });
  }

  async sendPrepare() {
    // console.log('send prepare command');
    this._send('p');
    await this.waitForResponse();
    this.prepareSent = true;
  }

  handleStandardResponse(data: pstdReturnType) {
    this.fullness = data.status.buffer_fullness;
    this.playbackState = data.status.playback_state;
    this.lightEngineState = data.status.light_engine_state;
    this.valid = data.response == 'a';
    if (data.status.playback_flags == 2) {
      console.error('Laser buffer underrun.');
      // buffer underrun flagged.
      this.beginSent = false;
    }
  }

  async sendBegin(rate: number) {
    if (!rate) {
      throw new Error('Call streamFrames(rate, callback) first');
    }
    console.log('send begin command');
    const lwm = 0;
    const cmd = 'b' + writeUnsignedInt16(lwm) + writeUnsignedInt32(rate);
    this._send(cmd);
    await this.waitForResponse();
    this.beginSent = true;
  }

  async sendUpdate(rate: number) {
    // console.log('send update command');
    const lwm = 0;
    const cmd = 'u' + writeUnsignedInt16(lwm) + writeUnsignedInt32(rate);
    this._send(cmd);
    await this.waitForResponse();
    this.beginSent = true;
  }

  async sendStop() {
    // console.log('send stop command');
    this._send('s');
    await this.waitForResponse();
  }

  async sendEmergencyStop() {
    this._send('\xFF');
    await this.waitForResponse();
  }

  async clearEmergencyStop() {
    this._send('c');
    await this.waitForResponse();
  }

  async sendPing() {
    // console.log('send ping command');
    this._send('?');
    await this.waitForResponse();
  }

  async sendPoints(points: IPoint[]) {
    // console.log('send points command, n=' + points.length);
    const batch = points.length;
    let cmd = 'd' + writeUnsignedInt16(batch);
    for (let i = 0; i < batch; i++) {
      const p = points[i];
      cmd += writeUnsignedInt16(p.control || 0);
      cmd += writeSignedInt16(p.x || 0);
      cmd += writeSignedInt16(p.y || 0);
      cmd += writeUnsignedInt16(p.r || 0);
      cmd += writeUnsignedInt16(p.g || 0);
      cmd += writeUnsignedInt16(p.b || 0);
      cmd += writeUnsignedInt16(p.i || 0);
      cmd += writeUnsignedInt16(p.u1 || 0);
      cmd += writeUnsignedInt16(p.u2 || 0);
    }
    this._send(cmd);
    const data = await this.waitForResponse();
    if (this.valid) {
      console.log('points sent.');
      if (!this.beginSent) {
        await this.sendBegin(this.rate!);
      }
    } else {
      console.warn('Got invalid response from Ether Dream', data);
      // When we receive an invalid response, the Ether Dream seems to kinda crash so we need to make a new connection.
      // This is a big, big hack. Need to improve.
      // _this.reconnect().then(() => {
      //   setTimeout(() => {
      //     _this.streamFrames();
      //   }, 100);
      // });
    }
  }

  streamFrames(rate?: number, callback?: StreamFrameCallback) {
    if (rate) {
      this.rate = rate;
    }
    if (callback) {
      this.streamCallback = callback;
    }
  }

  run = async () => {
    if (!this.running) return;
    if (!this.streamCallback) {
      await delay(0);
      this.run();
      return;
    }
    const frame = this.streamCallback();

    // If not yet playing, send the prepare command first
    if (!this.prepareSent && this.playbackState === PLAYBACK_IDLE) {
      await this.sendPrepare();
    }

    // Disable the emergency stop if enabled
    if (this.lightEngineState === LIGHT_ENGINE_ESTOP) {
      console.log('Disabling estop');
      await this.clearEmergencyStop();
    }

    let cap = Math.max(0, this.dacBufferSize - this.fullness);
    if (cap < 100) {
      await delay(5);
      cap += 150;
    }

    const points = frame.slice(0, cap);
    console.log('Asking for ' + cap + ' items.. sending:', points.length);
    await this.sendPoints(points);

    this.run();
  };

  close() {
    this.inputqueue = [];
    this.inputhandlerqueue = [];
    this.fullness = 0;
    this.playbackState = PLAYBACK_IDLE;
    this.lightEngineState = LIGHT_ENGINE_READY;
    this.beginSent = false;
    this.prepareSent = false;
    this.valid = true;
    this.running = false;
    // On purpose do not clear `streamCallback` so it is easy to reconnect

    if (this.client) {
      this.client.destroy();
      this.client = undefined;
    }
  }
}
