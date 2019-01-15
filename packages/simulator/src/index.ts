import {
  EtherDream,
  EtherConn,
  StreamSourceFn,
  IPoint,
  IDevice
} from '@ether-dream/core';
import { Server as WebSocketServer } from 'ws';
import { throttle } from './helpers';
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

  async searchDevices() {
    const manualAddress = process.env.ETHER_ADDRESS;
    if (manualAddress) {
      console.log('Manual EtherDream address given,', manualAddress);
      const [ip, port] = manualAddress.split(':');
      return { ip, port: parseInt(port) } as IDevice;
    } else {
      console.log('Looking for EtherDream hosts...');
      const devices = await EtherDream.findFirst();
      if (!devices.length) {
        throw new Error('No Etherdream device found on network.');
      }
      return devices[0];
    }
  }

  async startDevice() {
    const device = await this.searchDevices();
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
          this.sendPointsToSimulator(streamPoints);
        });
      }, STREAM_INTERVAL);
    } else {
      this.deviceConn.streamPoints(rate, (numpoints, callback) => {
        pointSource(numpoints, streamPoints => {
          callback(streamPoints);
          this.sendPointsToSimulator(streamPoints);
        });
      });
    }
  }

  stream(
    scene: { points: IPoint[] },
    pointsRate: number = DEFAULT_POINTS_RATE
  ) {
    let currentPointId = 0;
    let lastPoint: IPoint;
    this.streamPoints(pointsRate, (numpoints, callback) => {
      const pointsBuffer = scene.points;
      // The Ether Dream device can only render a given number of points (numpoints), in practice max 1799.
      // So here we limit the points given to the max accepted, and then keep track of where we cut it off (currentPointId).
      // So when this function is invoked again, it starts rendering from that point.
      const streamPoints: IPoint[] = [];

      if (pointsBuffer.length) {
        // Add blanking point if current point has changed.
        if (
          lastPoint &&
          pointsBuffer[currentPointId] &&
          lastPoint !== pointsBuffer[currentPointId]
        ) {
          const point = pointsBuffer[currentPointId];
          point.r = 0;
          point.g = 0;
          point.b = 0;
          streamPoints.push(point);
        }

        for (var i = 0; i < numpoints; i++) {
          currentPointId++;
          currentPointId %= pointsBuffer.length;

          streamPoints.push(pointsBuffer[currentPointId]);
        }
      }
      lastPoint = streamPoints[streamPoints.length - 1];
      this.sendPointInfoToSimulator(numpoints, pointsBuffer.length);
      callback(streamPoints);
    });
  }

  private sendToSimulator(data: any) {
    this.wss!.clients.forEach(client => {
      client.send(JSON.stringify(data), function() {
        // Ignore errors for now
      });
    });
  }

  private sendPointsToSimulator(data: any[]) {
    this.sendToSimulator({ type: 'POINTS', data });
  }

  // This method is called soo often, so throttle it!
  private sendPointInfoToSimulator = throttle(
    (numpoints: number, totalPoints: number) => {
      this.sendToSimulator({
        type: 'POINTS_INFO',
        data: { numpoints, totalPoints }
      });
    },
    400
  );
}
