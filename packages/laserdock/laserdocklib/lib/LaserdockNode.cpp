#include "LaserdockNode.h"

int nodeInit() {
    LaserdockDeviceManager &lddmanager = LaserdockDeviceManager::getInstance();

    if (device && device->status() == LaserdockDevice::Status::INITIALIZED) {
      return 1;
    }
    return nodeForceInit();
}

int nodeForceInit() {
    LaserdockDeviceManager &lddmanager = LaserdockDeviceManager::getInstance();
    device = lddmanager.get_next_available_device();
    if (!device) {
        return ERROR_NOT_INITIALIZED;
    }
    return 1;
}

int nodeEnableOutput() {
    if (!device) {
      return ERROR_NOT_INITIALIZED;
    }
    if (device->enable_output()) {
      return 1;
    }
    // The Lasercube can get in a state where `device->status()` still returns initialized, even when the Lasercube is disconnected.
    // the `nodeInit()` code can only be called when the Lasercube is not yet connected,
    // so to workaround we just re-try connecting to the Lasercube if this fails.
    if (nodeForceInit()) {
      if (device->enable_output()) {
        return 1;
      }
    }
    return ERROR_NOT_INITIALIZED;
}

int nodeDisableOutput() {
    if (!device) {
        return ERROR_NOT_INITIALIZED;
    }
    return device->disable_output();
}

int nodeSetDacRate(uint32_t rate) {
    if (!device) {
        return ERROR_NOT_INITIALIZED;
    }
    return device->set_dac_rate(rate);
}

int nodeClearRingbuffer() {
    if (!device) {
        return ERROR_NOT_INITIALIZED;
    }
    return device->clear_ringbuffer();
}

int nodeSendSamples(LaserdockSample *samples, uint32_t count) {
    if (!device) {
        return ERROR_NOT_INITIALIZED;
    }
    return device->send_samples(samples, count);
}
