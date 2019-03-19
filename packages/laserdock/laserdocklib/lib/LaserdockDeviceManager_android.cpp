#include "LaserdockDeviceManager.h"
#include "LaserdockDeviceManager_p.h"

#include <cstdio>
#include <vector>

#include <jni.h>

#include <QtDebug>
#include <QtAndroid>
#include <QAndroidJniEnvironment>
#include <QAndroidJniObject>

#include "libusb/libusb.h"

#include "JavaUsbDeviceHelper.h"
#include "LaserdockDevice.h"

std::vector<std::unique_ptr<LaserdockDevice> > LaserdockDeviceManagerPrivate::get_devices() {
    std::vector<std::unique_ptr<LaserdockDevice>> laserdockDevices;

    // get laserdock devices
    QAndroidJniObject usbDevicesJni = JavaUsbDeviceHelper::getInstance()->getLaserdockDevices();;
    jobjectArray objectArray = usbDevicesJni.object<jobjectArray>();

    QAndroidJniEnvironment qjniEnv;
    int length = qjniEnv->GetArrayLength(objectArray);
    for(int i = 0; i < length; i++) {
        jobject jobj = qjniEnv->GetObjectArrayElement(objectArray, i);
        // get device name
        QAndroidJniObject qObj(jobj);
        QAndroidJniObject jDeviceName = qObj.callObjectMethod("getDeviceName", "()Ljava/lang/String;");

        qDebug() << "Found device" << jDeviceName.toString();

        // call special version of libusb get device
        libusb_device *usb_device = libusb_get_device2(m_libusb_ctx,  jDeviceName.toString().toLatin1().constData());
        std::unique_ptr<LaserdockDevice> d(new LaserdockDevice(usb_device, jobj));
        if(d->status() == LaserdockDevice::Status::INITIALIZED)
            laserdockDevices.push_back(std::move(d));
    }
    return laserdockDevices;
}
