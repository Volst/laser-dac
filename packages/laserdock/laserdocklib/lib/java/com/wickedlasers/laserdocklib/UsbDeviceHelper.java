package com.wickedlasers.laserdocklib;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbManager;
import android.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * USB android Helper for laserdock library
 */
public class UsbDeviceHelper {

    private static String TAG = "laserdocklib_UsbDeviceHelper";

    private static final String ACTION_USB_PERMISSION =
            "com.wickedlasers.laserdock.USB_PERMISSION";

   private static boolean m_isRequestingPermission = false;

    private static final BroadcastReceiver mUsbReceiver = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (ACTION_USB_PERMISSION.equals(action)) {
                synchronized (this) {
                    m_isRequestingPermission = false;

                    UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                    if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                        Log.d(TAG, "permission granted for device " + device);
                    } else {
                        Log.d(TAG, "permission denied for device " + device);
                    }
                }
            }
        }

    };

    public static UsbDevice[] getLaserdockDevices(Context context) {
        List<UsbDevice> devices = new ArrayList<UsbDevice>();

        // TODO it would be better to call it once from some init() method
        // register broadcast receiver
        context.registerReceiver(mUsbReceiver, new IntentFilter(ACTION_USB_PERMISSION));

        // get all devices
        UsbManager manager = (UsbManager) context.getSystemService(Context.USB_SERVICE);
        HashMap<String, UsbDevice> deviceMap = manager.getDeviceList();

        // filter for laserdock only
        for (UsbDevice device : deviceMap.values()) {
            if(isLaserdockDevice(device)) {
                devices.add(device);
            }
        }

        return devices.toArray(new UsbDevice[devices.size()]);
    }

    public static int openDevice(Context context, UsbDevice device) {
        UsbManager manager = (UsbManager) context.getSystemService(Context.USB_SERVICE);
        // check permission
        if (manager.hasPermission(device)) {
            // ok, open
            return doOpenDevice(context, device);
        } else {
            if(m_isRequestingPermission) {
                return -1;
            }

            // request permission
            PendingIntent pi = PendingIntent.getBroadcast(context, 0, new Intent(
                    ACTION_USB_PERMISSION), 0);
            manager.requestPermission(device, pi);
            m_isRequestingPermission = true;
            return -1;
        }
    }


    private static int doOpenDevice(Context context, UsbDevice device) {
        UsbManager manager = (UsbManager) context.getSystemService(Context.USB_SERVICE);
        try {
            UsbDeviceConnection connection = manager.openDevice(device);
            Log.d(TAG, "device was opened, fd:" + connection.getFileDescriptor());
            return connection.getFileDescriptor();
        } catch (SecurityException exc) {
            // should never happen because we should have access at this point
            exc.printStackTrace();
        }

        return -1;
    }

    private static boolean isLaserdockDevice(UsbDevice device) {
        int LASERDOCK_VIN = 0x1fc9;
        int LASERDOCK_PIN = 0x04d8;
        return device.getProductId() == LASERDOCK_PIN && device.getVendorId() == LASERDOCK_VIN;
    }
}