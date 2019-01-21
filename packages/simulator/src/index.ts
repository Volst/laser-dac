import { Server as WebSocketServer } from 'ws';
import { Point, Device, Scene } from '@laser-dac/core';
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
const BLANKING_AMOUNT = 24;

export class Simulator extends Device {
  server?: http.Server;
  wss?: WebSocketServer;

  start(): Promise<boolean> {
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

  stop() {
    if (this.server) {
      this.server.close();
    }
  }

  stream(scene: Scene, pointsRate: number = DEFAULT_POINTS_RATE) {
    let currentPointId = 0;
    let lastPoint: Point;
    const numpoints = REQUESTED_POINTS_COUNT;
    setInterval(() => {
      const pointsBuffer = scene.points;
      const frameHasChanged =
        lastPoint &&
        pointsBuffer[currentPointId] &&
        lastPoint !== pointsBuffer[currentPointId];

      // The Ether Dream device can only render a given number of points (numpoints), in practice max 1799.
      // So here we limit the points given to the max accepted, and then keep track of where we cut it off (currentPointId).
      // So when this function is invoked again, it starts rendering from that point.
      const streamPoints: Point[] = [];

      if (pointsBuffer.length) {
        // Add blanking points on new if current point has changed.
        if (frameHasChanged) {
          const { x, y } = pointsBuffer[currentPointId];
          const point = { x, y, r: 0, g: 0, b: 0 };
          for (let index = 0; index < BLANKING_AMOUNT; index++) {
            streamPoints.push(point);
          }
        }

        const drawPointsAmount = numpoints - streamPoints.length;
        for (var i = 0; i < drawPointsAmount; i++) {
          currentPointId++;
          currentPointId %= pointsBuffer.length;

          streamPoints.push(pointsBuffer[currentPointId]);
        }
      }
      lastPoint = streamPoints[streamPoints.length - 1];
      this.sendPointsToSimulator(streamPoints);
      this.sendPointInfoToSimulator(numpoints, pointsBuffer.length);
    }, STREAM_INTERVAL);
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
