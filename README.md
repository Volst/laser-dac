# Ether Dream Tools

[![CircleCI branch](https://img.shields.io/circleci/project/github/Volst/ether-dream-tools/master.svg)](https://circleci.com/gh/Volst/ether-dream-tools)

This is a collection of unofficial tools that contains everything you need to get started with programming on the [Ether Dream](https://ether-dream.com/); a high-performance laser DAC.

The tools use Node.js and are published on npm under the `@ether-dream` scope.

**Currently this is in early development.**

The tools consist of three packages. Click on the title for more information.

## [`@ether-dream/core`](./packages/core)

This package takes care of the communication to the Ether Dream device. It can establish a connection to the Ether Dream and stream points to it.

## [`@ether-dream/simulator`](./packages/simulator)

This package can simulate the Ether Dream device so you can develop without having the physical device. You also don't need to have a laser! It has a web-based simulator for the laser.

## [`@ether-dream/draw`](./packages/draw)

This package makes it easy for you to make laser drawings using programming. It can also import ILDA files used by professional laser tools.

## [Examples](./examples)

We also have some [_examples_](./examples) that should help you get started.
