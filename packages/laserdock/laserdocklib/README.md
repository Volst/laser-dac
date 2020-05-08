# laserdocklib

client library to connect to laserdock

**Original source code: https://github.com/Wickedlasers/laserdocklib. This was modified to add a few methods to make using it in Node.js easier.**

This library has three targets

1. laserdocklib -> library target
2. laserdocktest -> simple test and printing of key parameters of laserdock
3. laserdockcircle -> shows a white circle, demonstrating sending data into laserdock

Tested under OS X 10.11 and comes with libusb 1.0 dylib.

# How to build

```
rm -rf build && mkdir build && cd build
cmake .. # for windows: cmake .. -G "Visual Studio 15 2017 Win64"
make # or for windows: cmake --build . --target ALL_BUILD --config Release
```

## On Mac

Download libusb-1.0.dylib from somewhere or compile it yourself and put it in `./lib/libusb/libusb-1.0.dylib`.

## On Windows

In theory you should be able to download libusb-1.0.lib and `./lib/libusb/libusb-1.0.lib` be done with it, but this got me all kinds of errors.
I recompiled libusb by cloning the libusb repo and opening `./msvc/libusb_static_2017.vcxproj` with VS 2017. I build the solution with x64 and debug settings; if build with release settings it needs a separate libusb file which I don't want.

# How to build for Android:

1.

```
$ cp dist.local.cmake local.cmake
$ cp dist.local.android.cmake local.android.cmake
```

2. Setup correct pathes in android.local.cmake

3. Set BUILD_ANDROID ON in local.cmake and choose ABI with ANDROID_ABI in local.android.cmake
