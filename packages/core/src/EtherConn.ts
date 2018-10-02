import * as net from 'net';
import { parseStandardResponse } from './parse';
import {
  writeUnsignedInt16,
  writeUnsignedInt32,
  writeSignedInt16
} from './write';

const STANDARD_RESPONSE_SIZE = 22;

export class EtherConn {
  client?: net.Socket;
  inputqueue: any[] = [];
  inputhandlerqueue: { size: number; callback: Function }[] = [];
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
  // TODO: add more exact typing
  streamSource?: Function;
  frameSource?: Function;
  frameBuffer?: any[];

  _send(sendcommand) {
    this.client!.write(new Buffer(sendcommand, 'binary'));
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

  connect(ip, port, callback) {
    const self = this;

    console.log('SOCKET: Connecting to ' + ip + ':' + port + ' ...');

    this.client = net.connect(
      {
        host: ip,
        port: port
      },
      function() {
        //'connect' listener
        console.log('SOCKET CONNECT: client connected');
        // self.sendPing(function() {
        //	callback(true);
        // });

        self.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
          const st = parseStandardResponse(data);
          // console.log('got connect response', st);
          self.handleStandardResponse(st);
          callback(true);
        });

        // self._popqueue();
        self._popinputqueue();
      }
    );

    this.client.on('data', function(data) {
      // console.log('SOCKET got ' + data.length + ' bytes');
      // console.log('SOCKET DATA:', data.toString(), data.length, self.currentcommand);
      // console.log('\n\n');
      for (let i = 0; i < data.length; i++) self.inputqueue.push(data[i]);
      setTimeout(function() {
        self._popinputqueue();
      }, 0);
    });

    this.client.on('error', function(data) {
      console.log('SOCKET ERROR:', data.toString());
      setTimeout(function() {
        callback(false);
      }, 0);
    });

    this.client.on('end', function() {
      console.log('SOCKET END: client disconnected');
    });
  }

  waitForResponse(size, callback) {
    // console.log('Setting up responder for ' + size + ' bytes...');
    this.inputhandlerqueue.push({
      size: size,
      callback: callback
    });
    this._popinputqueue();
  }

  sendPrepare(callback) {
    // console.log('send prepare command');
    const _this = this;
    const cmd = 'p';
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      _this.preparesent = true;
      callback();
    });
  }

  handleStandardResponse(data) {
    this.fullness = data.status.buffer_fullness;
    this.playback_state = data.status.playback_state;
    this.valid = data.response == 'a';
    if (data.status.playback_flags == 2) {
      console.error('Laser buffer underrun.');
      // buffer underrun flagged.
      this.beginsent = false;
    }
  }

  sendBegin(rate, callback) {
    // console.log('send begin command');
    const _this = this;
    const lwm = 0;
    const cmd = 'b' + writeUnsignedInt16(lwm) + writeUnsignedInt32(rate);
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      _this.beginsent = true;
      callback();
    });
  }

  sendUpdate(rate, callback) {
    // console.log('send update command');
    const _this = this;
    const lwm = 0;
    const cmd = 'u' + writeUnsignedInt16(lwm) + writeUnsignedInt32(rate);
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      _this.beginsent = true;
      callback();
    });
  }

  sendStop(callback) {
    // console.log('send stop command');
    const _this = this;
    const cmd = 's';
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      callback();
    });
  }

  sendEmergencyStop(callback) {
    const _this = this;
    const cmd = '\xFF';
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      callback();
    });
  }

  sendPing(callback) {
    // console.log('send ping command');
    const _this = this;
    const cmd = '?';
    this._send(cmd);
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      callback();
    });
  }

  sendPoints(points, callback) {
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
    this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
      const st = parseStandardResponse(data);
      _this.handleStandardResponse(st);
      if (_this.valid) {
        // console.log('points sent.');
        if (!_this.beginsent) {
          _this.sendBegin(_this.rate, callback);
        } else {
          callback();
        }
      } else {
        callback();
      }
    });
  }

  pollGotData(framedata) {
    const _this = this;
    // console.log('Send ' + framedata.length + ' points to DAC');
    if (framedata.length > 0) {
      this.sendPoints(framedata, function() {
        setTimeout(function() {
          _this.pollStream();
        }, 0);
      });
    } else {
      setTimeout(function() {
        _this.pollStream();
      }, 0);
    }
  }

  pollStream() {
    const _this = this;
    if (this.playback_state == 0) {
      this.sendPrepare(function() {
        // prepare first.
        setTimeout(_this.pollStream.bind(_this), 0);
      });
    } else if (!this.valid) {
      setTimeout(function() {
        _this.sendPrepare(function() {
          _this.sendBegin(_this.rate, function() {
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
        this.sendPing(function() {
          setTimeout(_this.pollStream.bind(_this), 0);
        });
      }
    }
  }

  streamPoints(rate, pointSource) {
    const _this = this;
    this.streamSource = pointSource;
    this.rate = rate;
    this.sendStop(function() {
      setTimeout(_this.pollStream.bind(_this), 0);
    });
  }

  streamFrames(rate, frameSource) {
    const _this = this;
    this.frameSource = frameSource;
    this.frameBuffer = [];

    function innerStream(numpoints, pointcallback) {
      if (_this.frameBuffer!.length < numpoints) {
        _this.frameSource!(function(points) {
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

    this.streamPoints(rate, innerStream);
  }

  close() {
    if (this.client) {
      this.client.destroy();
      this.client = undefined;
    }
  }
}
