import * as dgram from 'dgram';
import * as net from 'net';

const STANDARD_RESPONSE_SIZE = 22;

function parseUInt16(c0, c1) {
  return c1 * 256 + c0;
}

function parseUInt32(c0, c1, c2, c3) {
  return c3 * 256 * 256 * 256 + c2 * 256 * 256 + c1 * 256 + c0;
}

function parseStandardResponse(data) {
  var st = {
    // dac_response
    response: String.fromCharCode(data[0]),
    command: String.fromCharCode(data[1]),
    success: st.response == 'a',
    str:
      'resp=' +
      st.response +
      ',fullness=' +
      st.status.buffer_fullness +
      ',raw=' +
      data,
    // dac_status
    status: {
      protocol: data[2],
      light_engine_state: data[3],
      playback_state: data[4],
      source: data[5],
      light_engine_flags: parseUInt16(data[6], data[7]),
      playback_flags: parseUInt16(data[8], data[9]),
      source_flags: parseUInt16(data[10], data[11]),
      buffer_fullness: parseUInt16(data[12], data[13]),
      point_rate: parseUInt32(data[14], data[15], data[16], data[17]),
      point_count: parseUInt32(data[18], data[19], data[20], data[21])
    }
  };
  return st;
}

class EtherConn {
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

function writeUnsignedInt32(n) {
  n = Math.round(n);
  const a = (n >> 0) & 65535;
  const b = (n >> 16) & 65535;
  return writeUnsignedInt16(a) + writeUnsignedInt16(b);
}

function writeUnsignedInt16(n) {
  n = Math.round(n);
  if (n < 0) n = 0;
  if (n > 65535) n = 65535;
  const a = (n >> 0) & 255;
  const b = (n >> 8) & 255;
  return String.fromCharCode(a) + String.fromCharCode(b);
}

function writeSignedInt16(n) {
  n = Math.round(n);
  if (n < -32767) n = -32767;
  if (n > 32767) n = 32767;
  if (n < 0) n = 65535 + n;
  const a = (n >> 0) & 255;
  const b = (n >> 8) & 255;
  return String.fromCharCode(a) + String.fromCharCode(b);
}

// TODO: typings
function twohex(n) {
  let s = n.toString(16);
  if (s.length == 1) s = '0' + s;
  return s;
}

interface IDevice {
  ip: string;
  port: number;
  name: string;
  hw_revision: number;
  sw_revision: number;
}

export class EtherDream {
  static _find = function(limit, timeout, callback) {
    const ips: string[] = [];
    const devices: IDevice[] = [];

    const server = dgram.createSocket('udp4');

    const timeouttimer = setTimeout(function() {
      server.close();
      callback(devices);
    }, timeout);

    server.on('message', function(msg, rinfo) {
      const ip = rinfo.address;
      if (ips.indexOf(ip) != -1) return;
      ips.push(ip);

      const name =
        'EtherDream @ ' +
        twohex(msg[0]) +
        ':' +
        twohex(msg[1]) +
        ':' +
        twohex(msg[2]) +
        ':' +
        twohex(msg[3]) +
        ':' +
        twohex(msg[4]) +
        ':' +
        twohex(msg[5]);

      devices.push({
        ip: ip,
        port: 7765,
        name: name,
        hw_revision: msg[6],
        sw_revision: msg[7]
      });

      if (devices.length >= limit) {
        server.close();
        clearTimeout(timeouttimer);
        callback(devices);
      }
    });

    server.bind(7654);

    // wait two seconds for data to come back...
  };

  static find = function(callback) {
    EtherDream._find(99, 2000, callback);
  };

  static findFirst = function(callback) {
    EtherDream._find(1, 4000, callback);
  };

  static connect = function(ip, port, callback) {
    const conn = new EtherConn();
    conn.connect(
      ip,
      port,
      function(success) {
        callback(success ? conn : null);
      }
    );
  };
}
