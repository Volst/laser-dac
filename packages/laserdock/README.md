# @laser-dac/laserdock

This package will make Laser DAC compatible with the Laserdock.

Currently we're unsure if it works because we don't have a Laserdock DAC or laser, so we need someone to test it.

To test it, you need the following:

- macOS, since we haven't compiled the binaries yet on Windows
- Node, version 8 or later is fine
- npm
- XCode Command Line Tools, see [this guide](https://github.com/nodejs/node-gyp#on-macos)
- Laserdock DAC connected with USB

Then, you can run:

```
node test.js
```

This should start the connection. It should draw a simple line on the screen with a white color.
