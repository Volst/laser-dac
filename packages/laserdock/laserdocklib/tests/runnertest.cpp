#include <iostream>
#include <string>

#include "lib/LaserdockDeviceManager.h"
#include "lib/LaserdockDevice.h"

using namespace std;

typedef bool (LaserdockDevice::*ReadMethodPtr)(uint32_t *);

void print_uint32(string name, LaserdockDevice *d, ReadMethodPtr method){
    uint32_t count = 0;
    bool successful = (d->*method)(&count);

    if(!successful){
        cout << "Failed reading " << name << endl;
        return;
    }

    cout << name << ": " << count << endl;
}

int main() {
    LaserdockDeviceManager &lddmanager = LaserdockDeviceManager::getInstance();
    LaserdockDevice &d =  *lddmanager.get_next_available_device();

    print_uint32("Firmware major version", &d, &LaserdockDevice::version_major_number);
    print_uint32("Firmware minor version", &d, &LaserdockDevice::version_minor_number);
    d.set_dac_rate(30000);
    print_uint32("Current Dac Rate", &d, &LaserdockDevice::dac_rate);

    bool enabled = false ;

    if(!d.enable_output()){
        cout << "Failed enabling output state" << endl;
    }

    if(!d.get_output(&enabled)){
        cout << "Failed reading output state" << endl;
    } else
    {
        cout << "Output Enabled/Disabled: " << enabled << endl;
    }

    d.runner_mode_enable(1);
    d.runner_mode_enable(0);
    d.runner_mode_run(1);
    d.runner_mode_run(0);


    LaserdockSample * samples = (LaserdockSample*) calloc(sizeof(LaserdockSample), 7);
    memset(samples, 0xFF, sizeof(LaserdockSample) * 7);
    d.runner_mode_load(samples, 0, 7);
    return 0;
}