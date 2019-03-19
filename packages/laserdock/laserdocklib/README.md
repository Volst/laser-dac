# laserdocklib

client library to connect to laserdock

**Original source code: https://github.com/Wickedlasers/laserdocklib. This was modified to add a few methods to make using it in Node.js easier.**

This library has three targets

1. laserdocklib -> library target
2. laserdocktest -> simple test and printing of key parameters of laserdock
3. laserdockcircle -> shows a white circle, demonstrating sending data into laserdock

Tested under OS X 10.11 and comes with libusb 1.0 dylib.

# How to build for Android:

1.

```
$ cp dist.local.cmake local.cmake
$ cp dist.local.android.cmake local.android.cmake
```

2. Setup correct pathes in android.local.cmake

3. Set BUILD_ANDROID ON in local.cmake and choose ABI with ANDROID_ABI in local.android.cmake
