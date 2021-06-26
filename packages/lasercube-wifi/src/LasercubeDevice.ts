import * as dgram from 'dgram';
import * as struct from 'python-struct';
import { LasercubeWifi } from '.';
import { Command, DeviceInfo } from './data';

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

export class LasercubeDevice {
  address: string;
  cmdSocket: dgram.Socket;
  dataSocket: dgram.Socket;

  running = true;
  // TODO: get up to date buffer info from lasercube
  remoteBufFree = 0;
  info: DeviceInfo | null = null;
  dacRate = 30000; // TODO verify this

  constructor(
    address: string,
    cmdSocket: dgram.Socket,
    dataSocket: dgram.Socket
  ) {
    this.address = address;
    this.cmdSocket = cmdSocket;
    this.dataSocket = dataSocket;

    cmdSocket.on('message', this.handleCmdMessage);
    dataSocket.on('message', this.handleDataMessage);

    // TODO: this is temp
    this.start();
  }

  handleCmdMessage(msg: Buffer, rinfo: dgram.RemoteInfo) {
    console.log('device: received cmd msg', msg, rinfo);
    if (msg[0] === Command.GetFullInfo) {
      const fields = struct.unpack('<xxBB?5xIIxHHBBB11xB26x', msg);
      this.info = {
        outputEnabled: fields[2] as boolean,
        dacRate: fields[3] as number,
        maxDacRate: fields[4] as number,
        rxBufferFree: fields[5] as number,
        rxBufferSize: fields[6] as number,
        batteryPercent: fields[7] as number,
        temperature: fields[8] as number,
      };
      this.remoteBufFree = this.info.rxBufferFree;
      console.log('info', this.info);
    } else if (msg[0] === Command.GetRingBufferEmptySampleCount) {
      console.log(
        'ring buffer empty sample count',
        msg,
        '--',
        struct.unpack('<xxH', msg)[0]
      );
      this.remoteBufFree = struct.unpack('<xxH', msg)[0] as number;
    }
  }

  handleDataMessage(msg: Buffer, rinfo: dgram.RemoteInfo) {
    // console.log('device: received data msg', msg, rinfo);
  }

  close() {
    this.running = false;
    this.sendCommand(Command.EnableBufferSizeResponseOnData, 0x0);
    this.sendCommand(Command.SetOutput, 0x0);
    this.cmdSocket.off('message', this.handleCmdMessage);
    this.dataSocket.off('message', this.handleDataMessage);
  }

  private sendCommand(cmd: Command, value: number) {
    const msg = Buffer.from([cmd, value]);
    this.cmdSocket.send(msg, LasercubeWifi.cmdPort, this.address);
    // TODO: the Python code sends it 2 times, should we also?
    this.cmdSocket.send(msg, LasercubeWifi.cmdPort, this.address);
  }

  currentFrame: any[] | null = null;
  // How many messages were sent to the data socket (needs to be sequential)
  messageNum = 0;
  // How many frames were sent to the data socket
  frameNum = 0;

  start() {
    this.sendCommand(Command.EnableBufferSizeResponseOnData, 0x1);
    this.sendCommand(Command.SetOutput, 0x1);

    this.messageNum = 0;
    this.frameNum = 0;
    this.currentFrame = null;
    this.run();
  }

  run = async () => {
    if (!this.running) return;

    this.currentFrame = this.generateFrame();

    while (this.currentFrame.length > 0) {
      // If the remote buffer is already partially full, wait a bit.
      // When to wait determines your latency/stability tradeoff. The
      // more of the buffer you use, the more easily you'll deal with
      // network hiccups slowness but the farther you'll be scheduling
      // stuff ahead of real time. On my LaserCube, the buffer is 6000
      // points and 5000 (i.e. only trying to use the first 1000 slots
      // in the buffer) was chosen through trial and error as
      // providing good stable output but keeping latency around
      // 1/30s. Could definitely be adjusted, and should really be
      // based on self.info.rx_buffer_size. In any case, this block
      // regulates how fast we're sending points.
      if (this.remoteBufFree < 5000) {
        await delay(1000 / this.dacRate);
        this.remoteBufFree += 100;
      }
      const firstMsg = Buffer.from([
        Command.SampleData,
        0x00,
        this.messageNum % 0xff,
        this.frameNum % 0xff,
      ]);
      // Limiting to 140 points per message keeps messages under 1500
      // bytes, which is a common network MTU.
      const firstPoints = this.currentFrame.splice(0, 140);
      const msg = Buffer.concat([firstMsg, ...firstPoints]);
      this.dataSocket.send(msg, LasercubeWifi.dataPort, this.address);

      this.messageNum += 1;
    }
    this.frameNum += 1;

    // TODO maybe delay is not necessary
    await delay(0);
    this.run();
  };

  generateFrame() {
    const frame = [];
    for (let i = 0; i < 256; i++) {
      const p = i / 256;
      const seconds = Math.round(new Date().getTime() / 1000);
      frame.push(
        struct.pack(
          '<HHHHH',
          Math.round(
            ((Math.sin(p * Math.PI * 2) *
              (0.8 + Math.sin(p * 10 * Math.PI * 2 + seconds) * 0.1) *
              0.7) /
              2 +
              0.5) *
              0xfff
          ),
          Math.round(
            ((Math.cos(p * Math.PI * 2) *
              (0.8 + Math.sin(p * 10 * Math.PI * 2 + seconds) * 0.1) *
              0.7) /
              2 +
              0.5) *
              0xfff
          ),
          Math.round(
            Math.pow(Math.sin((p + seconds * 1) * (Math.PI * 4)) / 2 + 0.5, 1) *
              0x20f
          ),
          Math.round(
            Math.pow(Math.sin((p + seconds * 2) * (Math.PI * 4)) / 2 + 0.5, 1) *
              0x0ff
          ),
          Math.round(
            Math.pow(Math.sin((p + seconds * 3) * (Math.PI * 4)) / 2 + 0.5, 1) *
              0x080
          )
        )
      );
    }
    return frame;
  }

  // generateFrame(p: IPoint) {
  //   const x = p.x * 0xfff;
  //   const y = p.x * 0xfff;
  //   const r = p.r * 0x20f;
  //   const g = p.g * 0x0ff;
  //   const b = p.b * 0x080;
  //   // TODO what is the maximum value for each?
  //   struct.pack('<HHHHH', x, y, r, g, b);
  //   return [];
  // }
}
