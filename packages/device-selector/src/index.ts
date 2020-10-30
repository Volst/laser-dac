import { Device } from '@laser-dac/core';

import { Simulator } from '@laser-dac/simulator';

import { Beyond } from '@laser-dac/beyond';
import { Easylase } from '@laser-dac/easylase';
import { EtherDream } from '@laser-dac/ether-dream';
import { Helios } from '@laser-dac/helios';
import { Laserdock } from '@laser-dac/laserdock';

const apis: Record<string, {new (): Device}> = {
  helios: Helios,
  laserdock: Laserdock,
  beyond: Beyond,
  easylase: Easylase,
  'ether-dream': EtherDream // This one is a bit slower to check.
};

// Get the first DAC that works.
export async function autoSelect(): Promise<Device|null> {
  console.log("Searching for DAC in " + Object.keys(apis).join(', '));
  for (const api in apis) {
    const dac = new apis[api]();
    if (await dac.start()) {
      console.log("Auto Selected DAC " + api);
      await dac.stop();
      return dac;
    }
  }
  console.log("No DAC found");
  return null;
}

// Get a Simulator and the first autodetected device.
// TODO: Get multiple devices instead of just the first?
export async function getDevices(): Promise<Device[]> {
  const devices: Device[] = [new Simulator()];
  const requestedDevice = process.env.DEVICE;

  if (requestedDevice) {
    if (requestedDevice in apis) {
      devices.push(new apis[requestedDevice]());
    } else {
      const autoSelected = await autoSelect();
      if (autoSelected) {
        devices.push(autoSelected);
      }
    }
  }

  return devices;
}
