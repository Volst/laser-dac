#include "LaserdockNode.h"

int nodeInit() {
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
    return device->enable_output();
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