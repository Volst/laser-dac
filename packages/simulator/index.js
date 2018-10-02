const EtherDream = require('node-etherdream');
const WebSocketServer = require('ws').Server;
const express = require('express');
const path = require('path');
const http = require('http');

// When there is no real device, we fake an interval.
// We've measured how fast the real device streams, which was 4ms.
const STREAM_INTERVAL = 4;
// How many points are drawn at the same time.
// Increasing the number leads to a more stable image with less flickering.
// Only used for the simulator!
const REQUESTED_POINTS_COUNT = 500;
const PORT = 8080;

class Simulator {
  constructor() {
    this.server = null;
    this.wss = null;
    this.deviceConn = null;
  }

  async start(opts = {}) {
    if (opts.device) {
      await this.startDevice();
    }
    await this.startSimulator();
  }

  startSimulator() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer();
      const app = express();
      app.use(express.static(path.join(__dirname, '/public')));
      this.wss = new WebSocketServer({ server: this.server });

      this.server.on('request', app);
      this.server.listen(PORT, function() {
        console.log(`Started simulator on http://localhost:${PORT}`);
        resolve(true);
      });
    });
  }

  stopSimulator() {
    if (this.server) {
      this.server.close();
    }
  }

  startDevice() {
    const self = this;
    return new Promise((resolve, reject) => {
      console.log('Looking for EtherDream hosts...');
      EtherDream.findFirst(function(devices) {
        if (!devices.length) {
          throw new Error('No Etherdream device found on network.');
        }
        const device = devices[0];
        EtherDream.connect(
          device.ip,
          device.port,
          conn => {
            if (!conn) {
              throw new Error(
                `Could not connect to device on ${device.ip}:${device.port}`
              );
            }
            self.deviceConn = conn;
            resolve(true);
          }
        );
      });
    });
  }

  streamPoints(rate, pointSource) {
    if (!this.deviceConn) {
      setInterval(() => {
        pointSource(REQUESTED_POINTS_COUNT, streamPoints => {
          this._updateSimulator(streamPoints);
        });
      }, STREAM_INTERVAL);
    } else {
      this.deviceConn.streamPoints(rate, (numpoints, callback) => {
        pointSource(numpoints, streamPoints => {
          callback(streamPoints);
          this._updateSimulator(streamPoints);
        });
      });
    }
  }

  _updateSimulator(data) {
    this.wss.clients.forEach(client => {
      client.send(JSON.stringify(data), function() {
        // Ignore errors for now
      });
    });
  }
}

module.exports = Simulator;
