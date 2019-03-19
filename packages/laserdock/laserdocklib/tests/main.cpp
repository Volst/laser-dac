#include <iostream>
#include <string>
#include <cstdio>

#include "lib/LaserdockDevice.h"
#include "lib/LaserdockDeviceManager.h"

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
    LaserdockDevice * device =  lddmanager.get_next_available_device();
    
    cout << "Device Status:" << device->status() << endl;
    print_uint32("Firmware major version", device, &LaserdockDevice::version_major_number);
    print_uint32("Firmware minor version", device, &LaserdockDevice::version_minor_number);
    print_uint32("Max Dac Rate", device, &LaserdockDevice::max_dac_rate);
    print_uint32("Min Dac Value", device, &LaserdockDevice::min_dac_value);
    print_uint32("Max Dac Value", device, &LaserdockDevice::max_dac_value);
    device->set_dac_rate(1000);
    print_uint32("Current Dac Rate", device, &LaserdockDevice::dac_rate);
    device->set_dac_rate(30000);
    print_uint32("Current Dac Rate", device, &LaserdockDevice::dac_rate);

    print_uint32("Sample Element Count", device, &LaserdockDevice::sample_element_count);
    print_uint32("ISO packket sample count", device, &LaserdockDevice::iso_packet_sample_count);
    print_uint32("Bulky packet sample count", device, &LaserdockDevice::bulk_packet_sample_count);
    print_uint32("Ringbuffer sample count", device, &LaserdockDevice::ringbuffer_sample_count);
    print_uint32("Ringbuffer empty sample count", device, &LaserdockDevice::ringbuffer_empty_sample_count);

    cout << "Clearing ringbuffer: " << device->clear_ringbuffer() << endl;
    bool enabled = false ;

    if(!device->enable_output()){
        cout << "Failed enabling output state" << endl;
    }

    if(!device->get_output(&enabled)){
        cout << "Failed reading output state" << endl;
    } else
    {
        cout << "Output Enabled/Disabled: " << enabled << endl;
    }

    if(!device->disable_output()){
        cout << "Failed disabling output state" << endl;
    }

    if(!device->get_output(&enabled)){
        cout << "Failed reading output state" << endl;
    } else
    {
        cout << "Output Enabled/Disabled: " << enabled << endl;
    }

	getchar();

    return 0;
}