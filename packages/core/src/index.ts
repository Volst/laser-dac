const DEFAULT_POINTS_RATE = 30000;
const DEFAULT_FPS = 30;

export interface Point {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
}

export interface Scene {
  points: Point[];
}

export abstract class Device {
  abstract start(): Promise<boolean>;
  abstract stop(): void;
  abstract stream(scene: Scene, pointsRate: number, fps: number): void;
}

export class DAC {
  devices: Device[] = [];

  use(device: Device) {
    this.devices.push(device);
  }

  remove(device: Device) {
    const index = this.devices.indexOf(device);
    if (index) {
      this.devices.splice(index, 1);
    }
  }

  removeAll() {
    this.devices = [];
  }

  async start() {
    for (const device of this.devices) {
      const success = await device.start();
      if (!success) {
        return false;
      }
    }
    return true;
  }

  async stop() {
    for (const device of this.devices) {
      await device.stop();
    }
  }

  stream(scene: Scene, pointsRate = DEFAULT_POINTS_RATE, fps = DEFAULT_FPS) {
    for (const device of this.devices) {
      device.stream(scene, pointsRate, fps);
    }
  }
}
