import { Simulator } from '@ether-dream/simulator';
import { Scene, Rect, loadIldaFile, Ilda } from '@ether-dream/draw';
import * as path from 'path';

const POINTS_RATE = 30000;
const horseFile = loadIldaFile(path.resolve(__dirname, './horse.ild'));
const boomFile = loadIldaFile(path.resolve(__dirname, './boom.ild'));

interface IClient {
  x: number;
  y: number;
  id: string;
}

export class Renderer {
  activeClients: IClient[] = [];
  isPressed = false;

  constructor() {
    this.start();
  }

  updateClientPosition(id: string, x: number, y: number) {
    const client = this.activeClients.find(client => client.id === id);
    if (client) {
      client.x = x;
      client.y = y;
    } else {
      this.activeClients.push({
        id,
        x,
        y
      });
    }
  }

  removeClient(id: string) {
    const index = this.activeClients.findIndex(client => client.id === id);
    if (index >= 0) {
      this.activeClients.splice(index, 1);
    }
  }

  triggerPress() {
    this.isPressed = true;
  }

  async start() {
    const simulator = new Simulator();
    await simulator.start({ device: !!process.env.DEVICE });

    const scene = new Scene();
    const self = this;
    let horseFrame = 0;
    let boomFrame = 0;
    function renderFrame() {
      self.activeClients.forEach((client, i) => {
        const rect = new Rect({
          // Super ugly hack to make the first client a green box, second a red box and third a blue box.
          color: [1, 0, 0],
          x: client.x,
          y: client.y,
          width: 0.1,
          height: 0.1
        });

        scene.add(rect);
      });

      const horse = new Ilda({
        file: horseFile,
        frame: horseFrame
      });
      scene.add(horse);
      horseFrame += 1;
      horseFrame %= horseFile.sections.length;

      if (self.isPressed) {
        const boom = new Ilda({
          file: boomFile,
          frame: boomFrame
        });
        scene.add(boom);
        if (boomFrame > boomFile.sections.length - 2) {
          boomFrame = 0;
          self.isPressed = false;
        } else {
          boomFrame += 1;
        }
      }
    }

    scene.start(renderFrame);

    let currentPointId = 0;

    simulator.streamPoints(POINTS_RATE, (numpoints, callback) => {
      const streamPoints = [];
      const pointsBuffer = scene.points;

      if (pointsBuffer.length) {
        for (var i = 0; i < numpoints; i++) {
          currentPointId++;
          currentPointId %= pointsBuffer.length;

          streamPoints.push(pointsBuffer[currentPointId]);
        }
      }

      // console.log(
      //   'Render',
      //   streamPoints.length,
      //   numpoints,
      //   pointsBuffer.length
      // );
      callback(streamPoints);
    });
  }
}
