const DEFAULT_POINTS_RATE = 30000;

export interface IPoint {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
}

export class DAC {
  // TODO dont use any
  devices: any[] = [];

  use(device: any) {
    this.devices.push(device);
  }

  async start() {
    for (const device of this.devices) {
      await device.start();
    }
  }

  stream(
    scene: { points: IPoint[] },
    pointsRate: number = DEFAULT_POINTS_RATE
  ) {
    for (const device of this.devices) {
      device.stream(scene, pointsRate);
    }
  }
}
