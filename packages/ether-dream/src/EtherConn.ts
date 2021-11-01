import * as net from 'net';
import { parseStandardResponse } from './parse';
import {
  writeUnsignedInt16,
  writeUnsignedInt32,
  writeSignedInt16,
} from './write';

const STANDARD_RESPONSE_SIZE = 22;

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
export type StreamSourceFn = (
  numpoints: number,
  pointcallback: (points: IPoint[]) => void
) => void;
type FrameSourceFn = (callback: (points: IPoint[]) => void) => void;
type NoOpFn = () => void;

export class EtherConn {
  client?: net.Socket;
  inputqueue: number[] = [];
  inputhandlerqueue: { size: number; callback: HandlerCallbackFn }[] = [];
  timer = 0;
  acks = 0;
  fullness = 0;
  points_in_buffer = 0;
  playback_state = 0;
  playsent = false;
  beginsent = false;
  preparesent = false;
  valid = true;
  rate?: number;
  streamSource?: StreamSourceFn;
  frameSource?: FrameSourceFn;
  frameBuffer?: IPoint[];
  ip?: string;
  port?: number;

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
          //'connect' listener
          console.log('SOCKET CONNECT: client connected');
          // self.sendPing(function() {
          //	callback(true);
          // });

          self.waitForResponse(STANDARD_RESPONSE_SIZE, function (data) {
            const st = parseStandardResponse(data);
            // console.log('got connect response', st);
            self.handleStandardResponse(st);
            resolve(true);
          });

          // self._popqueue();
          self._popinputqueue();
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

  waitForResponse(size: number, callback: HandlerCallbackFn) {
    // console.log('Setting up responder for ' + size + ' bytes...');
    this.inputhandlerqueue.push({ size, callback });
    this._popinputqueue();
  }

  sendPrepare(callback: NoOpFn) {
    // console.log('send prepare command');
    const _this = this;
    const cmd = 'p';
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function (data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      _this.preparesent = true;
      callback();
    });
  }

  handleStandardResponse(data: pstdReturnType) {
    this.fullness = data.status.buffer_fullness;
    this.playback_state = data.status.playback_state;
    this.valid = data.response == 'a';
    if (data.status.playback_flags == 2) {
      console.error('Laser buffer underrun.');
      // buffer underrun flagged.
      this.beginsent = false;
    }
  }

  sendBegin(rate: number, callback: NoOpFn) {
    // console.log('send begin command');
    const _this = this;
    const lwm = 0;
    const cmd = 'b' + writeUnsignedInt16(lwm) + writeUnsignedInt32(rate);
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function (data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      _this.beginsent = true;
      callback();
    });
  }

  sendUpdate(rate: number, callback: NoOpFn) {
    // console.log('send update command');
    const _this = this;
    const lwm = 0;
    const cmd = 'u' + writeUnsignedInt16(lwm) + writeUnsignedInt32(rate);
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function (data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      _this.beginsent = true;
      callback();
    });
  }

  sendStop(callback: NoOpFn) {
    // console.log('send stop command');
    const _this = this;
    const cmd = 's';
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function (data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      callback();
    });
  }

  sendEmergencyStop(callback: NoOpFn) {
    const _this = this;
    const cmd = '\xFF';
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function (data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      callback();
    });
  }

  sendPing(callback: NoOpFn) {
    // console.log('send ping command');
    const _this = this;
    const cmd = '?';
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function (data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      callback();
    });
  }

  sendPoints(points: IPoint[], callback: NoOpFn) {
    // console.log('send points command, n=' + points.length);
    const _this = this;
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
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function (data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      if (_this.valid) {
        // console.log('points sent.');
        if (!_this.beginsent) {
          _this.sendBegin(_this.rate!, callback);
        } else {
          callback();
        }
      } else {
        // When we receive an invalid response, the Ether Dream seems to kinda crash so we need to make a new connection.
        // This is a big, big hack. Need to improve.
        _this.reconnect().then(() => {
          setTimeout(() => {
            _this.streamFrames();
          }, 100);
        });
        // throw new Error('Got invalid response from Ether Dream');
      }
    });
  }

  pollGotData(framedata: IPoint[]) {
    const _this = this;
    // console.log('Send ' + framedata.length + ' points to DAC');
    if (framedata.length > 0) {
      this.sendPoints(framedata, function () {
        setTimeout(function () {
          _this.pollStream();
        }, 0);
      });
    } else {
      setTimeout(function () {
        _this.pollStream();
      }, 0);
    }
  }

  pollStream() {
    const _this = this;
    if (this.playback_state == 0) {
      this.sendPrepare(function () {
        // prepare first.
        setTimeout(_this.pollStream.bind(_this), 0);
      });
    } else if (!this.valid) {
      setTimeout(function () {
        _this.sendPrepare(function () {
          _this.sendBegin(_this.rate!, function () {
            setTimeout(_this.pollStream.bind(_this), 0);
          });
        });
      }, 250);
    } else {
      const MAX = 1799; // 1799;
      const N = Math.max(0, MAX - this.fullness);
      // console.log('Asking for '+N+' items..');
      if (N > 50) {
        setTimeout(
          _this.streamSource!.bind(null, N, _this.pollGotData.bind(_this)),
          0
        );
      } else {
        this.sendPing(function () {
          setTimeout(_this.pollStream.bind(_this), 0);
        });
      }
    }
  }

  streamPoints(rate: number, pointSource: StreamSourceFn) {
    const _this = this;
    this.streamSource = pointSource;
    this.rate = rate;
    this.sendStop(function () {
      setTimeout(_this.pollStream.bind(_this), 0);
    });
  }

  streamFrames(rate?: number, frameSource?: FrameSourceFn) {
    const _this = this;
    if (rate) {
      this.rate = rate;
    }
    if (frameSource) {
      this.frameSource = frameSource;
    }
    this.frameBuffer = [];

    function innerStream(numpoints: number, pointcallback: Function) {
      if (_this.frameBuffer!.length < numpoints) {
        _this.frameSource!(function (points: IPoint[]) {
          for (let i = 0; i < points.length; i++) {
            _this.frameBuffer!.push(points[i]);
          }
          // get another frame if we need to...
          setTimeout(innerStream.bind(_this, numpoints, pointcallback), 0);
        });
      } else {
        const points = _this.frameBuffer!.splice(0, numpoints);
        pointcallback(points);
      }
    }

    this.streamPoints(this.rate!, innerStream);
  }

  close() {
    this.inputqueue = [];
    this.inputhandlerqueue = [];
    this.timer = 0;
    this.acks = 0;
    this.fullness = 0;
    this.points_in_buffer = 0;
    this.playback_state = 0;
    this.playsent = false;
    this.beginsent = false;
    this.preparesent = false;
    this.valid = true;
    if (this.client) {
      this.client.destroy();
      this.client = undefined;
    }
  }
}
