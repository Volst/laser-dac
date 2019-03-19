//
// Created by Guoping Huang on 8/8/16.
//

#ifndef LASERDOCKLIB_JAVAUSBDEVICEHELPER_H
#define LASERDOCKLIB_JAVAUSBDEVICEHELPER_H

#include <memory>

#include <jni.h>

class QAndroidJniObject;

class JavaUsbDeviceHelper {

public:
    static JavaUsbDeviceHelper *getInstance();

    QAndroidJniObject getLaserdockDevices();
    jint openDevice(jobject usbDevice);

private:
    explicit JavaUsbDeviceHelper();
    virtual ~JavaUsbDeviceHelper();
};

#endif //LASERDOCKLIB_JAVAUSBDEVICEHELPER_H
