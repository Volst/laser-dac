const DEFAULT_POINTS_RATE = 30000;
const DEFAULT_FPS = 30;

const shutdownCallbacks: {(): void;}[] = [];

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
  protected pointsRate: number = 30000;

  abstract start(): Promise<boolean>;
  abstract stop(): void;
  abstract stream(scene: Scene, pointsRate: number, fps: number): void;
  // This is for any last-minute synchronous cleanup so the laser doesn't
  // stay on after the program stops.
  onShutdownSync(): void {};

  isSupported(): boolean {
    return true;
  }

  setPointsRate(pointsRate: number) {
    this.pointsRate = pointsRate;
  }

  getPointsRate(): number {
    return this.pointsRate;
  }

  getStats(): Object {
    return {};
  }
}

export class DAC {
  devices: Device[] = [];

  use(device: Device) {
    this.devices.push(device);
    shutdownCallbacks.push(device.onShutdownSync);
  }

  useAll(devices: Device[]) {
    devices.forEach((device) => this.use(device));
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

  setPointsRate(pointsRate: number) {
    this.devices.forEach((device) => device.setPointsRate(pointsRate));
  }

  getStats(): Object {
    const allDeviceStats = this.devices.reduce((stats, device) => {
      const deviceStats = device.getStats();
      if (deviceStats) {
        stats[device.constructor.name] = deviceStats;
      }
      return stats;
    }, {});

    return {
      devices: allDeviceStats
    };
  }
}

function exitHandler(options: any, exitCode: any) {
  if (options.cleanup) {
    console.info("Cleaning up");
    shutdownCallbacks.forEach((fn) => fn());
  }

  if (exitCode || exitCode === 0) {
    console.info(exitCode);
  }

  if (options.exit) {
    process.exit();
  }
}

// Based on an answer from
// https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
function gracefulShutdown() {
  // Prevent the program from closing instantly.
  process.stdin.resume();

  // Do something when app is closing.
  process.on('exit', exitHandler.bind(null, {cleanup: true}));

  // Catch ctrl+c event.
  process.on('SIGINT', exitHandler.bind(null, {exit: true}));

  process.on('SIGTERM', exitHandler.bind(null, {exit: true}));

  // Catch "kill pid" (for example: nodemon restart).
  process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
  process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));

  // Catch uncaught exceptions.
  process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
}

gracefulShutdown();
