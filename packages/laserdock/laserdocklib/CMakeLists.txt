cmake_minimum_required(VERSION 3.5)

include(local.cmake OPTIONAL)

# Android toolchain: should be before project() call
if(BUILD_ANDROID)
    # setup Android toolchain
    set(CMAKE_TOOLCHAIN_FILE qt-android-cmake/toolchain/android.toolchain.cmake)
endif()

project(laserdocklib)

# C++11
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# OS X min deployment
if(APPLE)
    set(CMAKE_OSX_DEPLOYMENT_TARGET "10.8")
    set(CMAKE_CXX_FLAGS "-stdlib=libc++")
endif()

add_subdirectory(lib)
add_subdirectory(tests)

# Android APK test package
if (ANDROID)
    include(qt-android-cmake/AddQtAndroidApk.cmake)
    add_qt_android_apk(laserdocklibcircle_apk laserdocklibcircle
        JAVA_SOURCES ${CMAKE_CURRENT_SOURCE_DIR}/lib/java
        PACKAGE_NAME "com.wickedlasers.laserdocklibcircle"
        DEPENDS laserdocklib
        DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/lib/libusb/android-${ANDROID_ARCH_NAME}/libusb1.0.so
        INSTALL
        )
endif()
