# Laser DAC

[![CircleCI branch](https://img.shields.io/circleci/project/github/Volst/laser-dac/master.svg)](https://circleci.com/gh/Volst/laser-dac)

This is a collection of tools that contain everything you need to get started with programming on a laser DAC like the [Ether Dream](https://ether-dream.com/) or [Helios](http://pages.bitlasers.com/helios/), with support for more DACs coming. We also have a good laser simulator so you can develop without looking to the intense lights of a laser.

Our goal is to make it as easy as possible to develop **interactive laser drawings**. Laser drawing software has existed for years, but making it interactive (e.g. creating a basic webapp using websockets to allow someone to control your laser) is something different!

The tools use Node.js and are published on npm under the `@laser-dac` scope.

Documentation is still limited. This project is used in our modular synthesizer app, **[Modulaser](https://modulaser.app/)**.

The tools consist of a lot of small packages, so you don't get all the bloat from things you don't use. Click on the title for more information.

## Core packages

### [`@laser-dac/core`](./packages/core)

This package allows you to easily configure everything, but it does nothing on it's own.

### [`@laser-dac/draw`](./packages/draw)

This package makes it easy for you to make laser drawings using programming. It can also import ILDA files used by professional laser tools.

### [`@laser-dac/ilda-reader`](./packages/ilda-reader)

This package can read ILDA (.ild) files and convert them to a JSON array of points.

### [`@laser-dac/ilda-writer`](./packages/ilda-writer)

This package can write a JSON array of points to an ILDA (.ild) file.

## DAC packages

### [`@laser-dac/ether-dream`](./packages/ether-dream)

This package takes care of the communication to the [Ether Dream DAC](https://ether-dream.com/). It can establish a connection to the Ether Dream and stream points to it.

### [`@laser-dac/helios`](./packages/helios)

This package takes care of the communication to the [Helios DAC](http://pages.bitlasers.com/helios/).

### [`@laser-dac/laserdock`](./packages/laserdock)

This package takes care of the communication to the [Laserdock](https://www.laseros.com/item/dongle/) (USB version only).

### [`@laser-dac/lasercube-wifi`](./packages/lasercube-wifi)

This package takes care of the communication to the [LaserCube WiFi](https://www.laseros.com) (network version only).

### [`@laser-dac/beyond`](./packages/beyond)

This package takes care of communication to [Pangolin Beyond software](https://pangolin.com/pages/beyond) (Windows-only).

### [`@laser-dac/easylase`](./packages/easylase)

This package takes care of communication to [EasyLase](http://www.jmlaser.com/EasyLase_D.htm) and NetLase. Windows only!

### [`@laser-dac/simulator`](./packages/simulator)

This package can simulate a physical laser DAC so you can develop without having a laser or DAC at all. It has a web-based simulator for the laser, that also tries its best to mimick the limitations of the laser.

## [Examples](./examples)

We also have some [_examples_](./examples) that should help you get started.
