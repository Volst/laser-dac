# set Android ABI
# You should manually remove build dir and reopen CMake project from scratch after change this value
if(NOT DEFINED ANDROID_ABI)
    set(ANDROID_ABI "x86") # currently "x86" or "armeabi-v7a" values supported
endif()

# Android SDK
set(QT_ANDROID_SDK_ROOT /Users/ncuxer/Dev/android/sdk)
# Android NDK
set(ANDROID_NDK /Users/ncuxer/Dev/android/sdk/ndk-bundle)
# Ant
set(QT_ANDROID_ANT /opt/local/bin/ant)

# Platform specific variables
if(ANDROID_ABI STREQUAL "armeabi-v7a")
    # Qt
    set(QTDIR "/Users/ncuxer/Dev/Qt/5.7/android_armv7")
    set(CMAKE_PREFIX_PATH "${QTDIR}/lib/cmake")
elseif(ANDROID_ABI STREQUAL "x86")
    # Qt
    set(QTDIR "/Users/ncuxer/Dev/Qt/5.7/android_x86")
    set(CMAKE_PREFIX_PATH "${QTDIR}/lib/cmake")
endif()