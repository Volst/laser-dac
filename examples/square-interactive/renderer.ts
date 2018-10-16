import { Simulator } from '@ether-dream/simulator';
import { Scene, Rect } from '@ether-dream/draw';

const FRAME_RATE = 15;
const POINTS_RATE = 30000;

interface IClient {
  x: number;
  y: number;
  id: string;
}

export class Renderer {
  activeClients: IClient[] = [];
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

  async start() {
    const simulator = new Simulator();
    await simulator.start({ device: !!process.env.DEVICE });

    let scene = new Scene();
    const self = this;
    function updateDots() {
      scene = new Scene();

      const width = 0.2;
      const height = 0.2;

      self.activeClients.forEach((client, i) => {
        const rect = new Rect({
          // Super ugly hack to make the first client a green box, second a red box and third a blue box.
          color: [i === 1 ? 1 : 0, i === 0 ? 1 : 0, i > 1 ? 1 : 0],
          x: client.x,
          y: client.y,
          width,
          height
        });

        scene.add(rect);
      });

      if (!self.activeClients.length) {
        const rect = new Rect({
          color: [0, 0, 1],
          x: 0.45,
          y: 0.45,
          width: 0.1,
          height: 0.1
        });
        scene.add(rect);
      }
    }

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

    setInterval(updateDots, FRAME_RATE);
  }
}
