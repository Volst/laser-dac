import * as dgram from 'dgram';
import * as struct from 'python-struct';
import { LasercubeWifi } from '.';
import { Command, DeviceInfo } from './data';

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

type BufferFrame = Buffer[];
type StreamFrameCallback = () => BufferFrame;

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

  stop() {
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

  // How many messages were sent to the data socket (needs to be sequential)
  messageNum = 0;
  // How many frames were sent to the data socket
  frameNum = 0;

  start() {
    this.cmdSocket.on('message', this.handleCmdMessage);
    this.dataSocket.on('message', this.handleDataMessage);

    this.sendCommand(Command.EnableBufferSizeResponseOnData, 0x1);
    this.sendCommand(Command.SetOutput, 0x1);

    this.messageNum = 0;
    this.frameNum = 0;
    this.streamCallback = null;
    this.run();
  }

  streamFrames(callback: StreamFrameCallback) {
    this.streamCallback = callback;
  }

  streamCallback: StreamFrameCallback | null = null;

  run = async () => {
    if (!this.running) return;
    if (!this.streamCallback) {
      await delay(0);
      this.run();
      return;
    }
    const frame = this.streamCallback();

    while (frame.length > 0) {
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
      const firstPoints = frame.splice(0, 140);
      // TODO: see how this transpiles and see if it's fast enough
      const msg = Buffer.concat([firstMsg, ...firstPoints]);
      this.dataSocket.send(msg, LasercubeWifi.dataPort, this.address);

      this.messageNum += 1;
    }
    this.frameNum += 1;

    // TODO maybe delay is not necessary
    await delay(0);
    this.run();
  };
}
