set(LASERDOCKLIB_SOURCE_FILES
        LaserdockDevice.cpp
        LaserdockDevice.h
        LaserdockDevice_p.h
        LaserdockDeviceManager.cpp
        LaserdockDeviceManager.h
        LaserdockDeviceManager_p.h
        LaserdockNode.cpp
        LaserdockNode.h
        )

if(ANDROID)
    set(LASERDOCKLIB_SOURCE_FILES
        ${LASERDOCKLIB_SOURCE_FILES}
        java/com/wickedlasers/laserdocklib/UsbDeviceHelper.java
        JavaUsbDeviceHelper.cpp
        JavaUsbDeviceHelper.h
        LaserdockDeviceManager_android.cpp
        LaserdockDevice_android.cpp
        )
else()
    set(LASERDOCKLIB_SOURCE_FILES
        ${LASERDOCKLIB_SOURCE_FILES}
        LaserdockDeviceManager_desktop.cpp
        LaserdockDevice_desktop.cpp
        )
endif()

add_library(laserdocklib SHARED ${LASERDOCKLIB_SOURCE_FILES})

if(WIN32)
    set(LIBUSB ${CMAKE_CURRENT_SOURCE_DIR}/libusb/libusb-1.0.lib)
endif()

if(APPLE)
    file(GLOB_RECURSE LIBUSB
        ${CMAKE_CURRENT_SOURCE_DIR}/libusb/*.dylib
    )
endif()

if(UNIX AND NOT APPLE AND NOT ANDROID)
    set(LINUX TRUE)
endif()

if(LINUX)
    file(GLOB_RECURSE LIBUSB
        ${CMAKE_CURRENT_SOURCE_DIR}/libusb/*.so
    )
endif()

if(ANDROID)
    find_package(Qt5 5.7.0 CONFIG REQUIRED Core AndroidExtras)

    set(LIBUSB ${CMAKE_CURRENT_SOURCE_DIR}/libusb/android-${ANDROID_ARCH_NAME}/libusb1.0.so)
    set(QT_LIBRARIES Qt5::Core Qt5::AndroidExtras)
else()
    set(QT_LIBRARIES)
endif()

target_link_libraries(laserdocklib ${LIBUSB} ${QT_LIBRARIES})

