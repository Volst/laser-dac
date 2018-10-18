import {
  EtherDream,
  EtherConn,
  StreamSourceFn,
  IPoint
} from '@ether-dream/core';
import { Server as WebSocketServer } from 'ws';
import * as express from 'express';
import * as path from 'path';
import * as http from 'http';

// When there is no real device, we fake an interval.
// We've measured how fast the real device streams, which was 4ms.
const STREAM_INTERVAL = 4;
// How many points are drawn at the same time.
// Increasing the number leads to a more stable image with less flickering.
// Only used for the simulator!
const REQUESTED_POINTS_COUNT = 500;
const PORT = 8080;
const DEFAULT_POINTS_RATE = 30000;

export class Simulator {
  server?: http.Server;
  wss?: WebSocketServer;
  deviceConn?: EtherConn;

  async start(opts: { device?: boolean } = {}) {
    if (opts.device) {
      await this.startDevice();
    }
    await this.startSimulator();
  }

  startSimulator() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer();
      const app = express();
      app.use(express.static(path.join(__dirname, '..', 'public')));
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

  async startDevice() {
    console.log('Looking for EtherDream hosts...');
    const devices = await EtherDream.findFirst();
    if (!devices.length) {
      throw new Error('No Etherdream device found on network.');
    }
    const device = devices[0];
    const conn = await EtherDream.connect(
      device.ip,
      device.port
    );
    if (!conn) {
      throw new Error(
        `Could not connect to device on ${device.ip}:${device.port}`
      );
    }
    this.deviceConn = conn;
  }

  streamPoints(rate: number, pointSource: StreamSourceFn) {
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

  stream(
    scene: { points: IPoint[] },
    pointsRate: number = DEFAULT_POINTS_RATE
  ) {
    let currentPointId = 0;
    this.streamPoints(pointsRate, (numpoints, callback) => {
      const pointsBuffer = scene.points;
      // The Ether Dream device can only render a given number of points (numpoints), in practice max 1799.
      // So here we limit the points given to the max accepted, and then keep track of where we cut it off (currentPointId).
      // So when this function is invoked again, it starts rendering from that point.
      const streamPoints: IPoint[] = [];

      if (pointsBuffer.length) {
        for (var i = 0; i < numpoints; i++) {
          currentPointId++;
          currentPointId %= pointsBuffer.length;

          streamPoints.push(pointsBuffer[currentPointId]);
        }
      }
      // console.log('Render', streamPoints.length, numpoints);
      callback(streamPoints);
    });
  }

  _updateSimulator(data: any[]) {
    this.wss!.clients.forEach(client => {
      client.send(JSON.stringify(data), function() {
        // Ignore errors for now
      });
    });
  }
}
