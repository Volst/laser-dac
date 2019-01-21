# Ether Dream Tools

[![CircleCI branch](https://img.shields.io/circleci/project/github/Volst/laser-dac/master.svg)](https://circleci.com/gh/Volst/laser-dac)

This is a collection of unofficial tools that contains everything you need to get started with programming on the [Ether Dream](https://ether-dream.com/); a high-performance laser DAC.

Our goal is to make it as easy as possible to develop **interactive laser drawings**. Laser drawing software has existed for years, but making it interactive (e.g. creating a basic webapp using websockets to allow someone to control your laser) is something different!

The tools use Node.js and are published on npm under the `@laser-dac` scope.

**Currently this is in early development.**

The tools consist of three packages. Click on the title for more information.

## [`@laser-dac/core`](./packages/core)

This package takes care of the communication to the Ether Dream device. It can establish a connection to the Ether Dream and stream points to it.

## [`@laser-dac/simulator`](./packages/simulator)

This package can simulate the Ether Dream device so you can develop without having the physical device. You also don't need to have a laser! It has a web-based simulator for the laser.

## [`@laser-dac/draw`](./packages/draw)

This package makes it easy for you to make laser drawings using programming. It can also import ILDA files used by professional laser tools.

## [Examples](./examples)

We also have some [_examples_](./examples) that should help you get started.
