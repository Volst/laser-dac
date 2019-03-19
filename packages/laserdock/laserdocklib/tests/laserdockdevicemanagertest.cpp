#include <string>
#include <iostream>

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

    lddmanager.print_laserdock_devices();
    LaserdockDevice * device =  lddmanager.get_next_available_device();

    if(device == NULL) {
        cout << "Error finding any available device!!" << endl;
        return 1;
    }

    cout << "Device Status:" << device->status() << endl;
    print_uint32("Firmware major version", device, &LaserdockDevice::version_major_number);
    print_uint32("Firmware minor version", device, &LaserdockDevice::version_minor_number);

    //getchar();
    return 0;
}