export interface IPoint {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
}

export interface DeviceInfo {
  outputEnabled: boolean;
  dacRate: number;
  maxDacRate: number;
  rxBufferFree: number;
  rxBufferSize: number;
  batteryPercent: number;
  temperature: number;
}

// Possible commands to send or receive to the LaserCube
export enum Command {
  GetFullInfo = 0x77,
  EnableBufferSizeResponseOnData = 0x78,
  SetOutput = 0x80,
  GetRingBufferEmptySampleCount = 0x8a,
  SampleData = 0xa9,
}
