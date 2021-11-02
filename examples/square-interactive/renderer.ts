import { DAC } from '@laser-dac/core';
import { Simulator } from '@laser-dac/simulator';
import { EtherDream } from '@laser-dac/ether-dream';
import { Scene, Rect, loadIldaFile, Ilda } from '@laser-dac/draw';
import * as path from 'path';

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
    const client = this.activeClients.find((client) => client.id === id);
    if (client) {
      client.x = x;
      client.y = y;
    } else {
      this.activeClients.push({
        id,
        x,
        y,
      });
    }
  }

  removeClient(id: string) {
    const index = this.activeClients.findIndex((client) => client.id === id);
    if (index >= 0) {
      this.activeClients.splice(index, 1);
    }
  }

  triggerPress() {
    this.isPressed = true;
  }

  async start() {
    const dac = new DAC();
    dac.use(new Simulator());
    if (process.env.DEVICE) {
      dac.use(new EtherDream());
    }
    await dac.start();

    const scene = new Scene();
    const self = this;
    let horseFrame = 0;
    let boomFrame = 0;
    function renderFrame() {
      self.activeClients.forEach((client, i) => {
        const rect = new Rect({
          color: [1, 0, 0],
          x: client.x,
          y: client.y,
          width: 0.1,
          height: 0.1,
        });

        scene.add(rect);
      });

      const horse = new Ilda({
        file: horseFile,
        frame: horseFrame,
      });
      scene.add(horse);
      horseFrame += 1;
      horseFrame %= horseFile.sections.length;

      if (self.isPressed) {
        const boom = new Ilda({
          file: boomFile,
          frame: boomFrame,
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

    scene.start(renderFrame, 60);
    dac.stream(scene, 25000);
  }
}
