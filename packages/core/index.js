var dgram = require('dgram');
var net = require('net');

var STANDARD_RESPONSE_SIZE = 22;
var DAC_CTRL_RATE_CHANGE = 0x8000;
var CALLBACK_DELAY = 1;

var parseUInt16 = function(c0, c1) {
  return c1 * 256 + c0;
};

var parseUInt32 = function(c0, c1, c2, c3) {
  return c3 * 256 * 256 * 256 + c2 * 256 * 256 + c1 * 256 + c0;
};

var parseStandardResponse = function(data) {
  var st = {
    // dac_response
    response: String.fromCharCode(data[0]),
    command: String.fromCharCode(data[1]),
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
  // console.log('parseStandardResponse', st);
  // console.log('response; fullness=' + st.status.buffer_fullness + ', response=' + st.response + ', command=' +st.command + ', playback_flags=' + st.status.playback_flags);
  st.success = st.response == 'a';
  st.str =
    'resp=' +
    st.response +
    ',fullness=' +
    st.status.buffer_fullness +
    ',raw=' +
    data;
  return st;
};

var EtherConn = function(ip) {
  var self = this;
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
  this._send = function(sendcommand, responsesize, sendcallback) {
    this.client.write(new Buffer(sendcommand, 'binary'));
    this._popinputqueue();
  };
  this._popinputqueue = function() {
    if (this.inputhandlerqueue.length > 0) {
      var handler = this.inputhandlerqueue[0];
      if (this.inputqueue.length >= handler.size) {
        // console.log('we got enough input bytes');
        var response = this.inputqueue.splice(0, handler.size);
        this.inputhandlerqueue.splice(0, 1);
        handler.callback(response);
      }
    }
  };
};

EtherConn.prototype.connect = function(ip, port, callback) {
  var self = this;

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
        var st = parseStandardResponse(data);
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
    for (var i = 0; i < data.length; i++) self.inputqueue.push(data[i]);
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
};

function writeUnsignedInt32(n) {
  n = Math.round(n);
  var a = (n >> 0) & 65535;
  var b = (n >> 16) & 65535;
  return writeUnsignedInt16(a) + writeUnsignedInt16(b);
}

function writeUnsignedInt16(n) {
  n = Math.round(n);
  if (n < 0) n = 0;
  if (n > 65535) n = 65535;
  var a = (n >> 0) & 255;
  var b = (n >> 8) & 255;
  return String.fromCharCode(a) + String.fromCharCode(b);
}

function writeSignedInt16(n) {
  n = Math.round(n);
  if (n < -32767) n = -32767;
  if (n > 32767) n = 32767;
  if (n < 0) n = 65535 + n;
  var a = (n >> 0) & 255;
  var b = (n >> 8) & 255;
  return String.fromCharCode(a) + String.fromCharCode(b);
}

EtherConn.prototype.waitForResponse = function(size, callback) {
  // console.log('Setting up responder for ' + size + ' bytes...');
  this.inputhandlerqueue.push({
    size: size,
    callback: callback
  });
  this._popinputqueue();
};

EtherConn.prototype.sendPrepare = function(callback) {
  // console.log('send prepare command');
  var _this = this;
  var cmd = 'p';
  this._send(cmd);
  this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
    var st = parseStandardResponse(data);
    _this.handleStandardResponse(st);
    _this.preparesent = true;
    callback();
  });
};

EtherConn.prototype.handleStandardResponse = function(data) {
  this.fullness = data.status.buffer_fullness;
  this.playback_state = data.status.playback_state;
  this.valid = data.response == 'a';
  if (data.status.playback_flags == 2) {
    console.error('Laser buffer underrun.');
    // buffer underrun flagged.
    this.beginsent = false;
  }
};

EtherConn.prototype.sendBegin = function(rate, callback) {
  // console.log('send begin command');
  var _this = this;
  var lwm = 0;
  var cmd = 'b' + writeUnsignedInt16(lwm) + writeUnsignedInt32(rate);
  this._send(cmd);
  this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
    var st = parseStandardResponse(data);
    _this.handleStandardResponse(st);
    _this.beginsent = true;
    callback();
  });
};

EtherConn.prototype.sendUpdate = function(rate, callback) {
  // console.log('send update command');
  var _this = this;
  var lwm = 0;
  var cmd = 'u' + writeUnsignedInt16(lwm) + writeUnsignedInt32(rate);
  this._send(cmd);
  this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
    var st = parseStandardResponse(data);
    _this.handleStandardResponse(st);
    _this.beginsent = true;
    callback();
  });
};

EtherConn.prototype.sendStop = function(callback) {
  // console.log('send stop command');
  var _this = this;
  var cmd = 's';
  this._send(cmd);
  this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
    var st = parseStandardResponse(data);
    _this.handleStandardResponse(st);
    callback();
  });
};

EtherConn.prototype.sendEmergencyStop = function(callback) {
  var _this = this;
  var cmd = '\xFF';
  this._send(cmd);
  this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
    var st = parseStandardResponse(data);
    _this.handleStandardResponse(st);
    callback();
  });
};

EtherConn.prototype.sendPing = function(callback) {
  // console.log('send ping command');
  var _this = this;
  var cmd = '?';
  this._send(cmd);
  this.waitForResponse(STANDARD_RESPONSE_SIZE, function(data) {
    var st = parseStandardResponse(data);
    _this.handleStandardResponse(st);
    callback();
  });
};

EtherConn.prototype.sendPoints = function(points, callback) {
  // console.log('send points command, n=' + points.length);
  var _this = this;
  var batch = points.length;
  cmd = 'd' + writeUnsignedInt16(batch);
  for (var i = 0; i < batch; i++) {
    var p = points[i];
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
    var st = parseStandardResponse(data);
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
};

EtherConn.prototype.pollGotData = function(framedata) {
  var _this = this;
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
};

EtherConn.prototype.pollStream = function() {
  var _this = this;
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
    var MAX = 1799; // 1799;
    var N = Math.max(0, MAX - this.fullness);
    // console.log('Asking for '+N+' items..');
    if (N > 50) {
      setTimeout(
        _this.streamSource.bind(null, N, _this.pollGotData.bind(_this)),
        0
      );
    } else {
      this.sendPing(function() {
        setTimeout(_this.pollStream.bind(_this), 0);
      });
    }
  }
};

EtherConn.prototype.streamPoints = function(rate, pointSource) {
  var _this = this;
  this.streamSource = pointSource;
  this.rate = rate;
  this.sendStop(function() {
    setTimeout(_this.pollStream.bind(_this), 0);
  });
};

EtherConn.prototype.streamFrames = function(rate, frameSource) {
  var _this = this;
  this.frameSource = frameSource;
  this.frameBuffer = [];

  function innerStream(numpoints, pointcallback) {
    if (_this.frameBuffer.length < numpoints) {
      _this.frameSource(function(points) {
        for (var i = 0; i < points.length; i++) {
          _this.frameBuffer.push(points[i]);
        }
        // get another frame if we need to...
        setTimeout(innerStream.bind(_this, numpoints, pointcallback), 0);
      });
    } else {
      var points = _this.frameBuffer.splice(0, numpoints);
      pointcallback(points);
    }
  }

  this.streamPoints(rate, innerStream);
};

EtherConn.prototype.close = function() {
  if (this.client) {
    this.client.close();
  }
};

var EtherDream = {};

EtherDream._find = function(limit, timeout, callback) {
  var ips = [];
  var all = [];

  var server = dgram.createSocket('udp4');

  var timeouttimer = setTimeout(function() {
    server.close();
    callback(all);
  }, timeout);

  server.on('message', function(msg, rinfo) {
    var ip = rinfo.address;
    if (ips.indexOf(ip) != -1) return;
    ips.push(ip);

    var twohex = function(n) {
      var s = n.toString(16);
      if (s.length == 1) s = '0' + s;
      return s;
    };

    var name =
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

    all.push({
      ip: ip,
      port: 7765,
      name: name,
      hw_revision: msg[6],
      sw_revision: msg[7]
    });

    if (all.length >= limit) {
      server.close();
      clearTimeout(timeouttimer);
      callback(all);
    }
  });

  server.bind(7654);

  // wait two seconds for data to come back...
};

EtherDream.find = function(callback) {
  this._find(99, 2000, callback);
};

EtherDream.findFirst = function(callback) {
  this._find(1, 4000, callback);
};

EtherDream.connect = function(ip, port, callback) {
  var conn = new EtherConn();
  conn.connect(
    ip,
    port,
    function(success) {
      callback(success ? conn : null);
    }
  );
};

exports.EtherDream = EtherDream;
