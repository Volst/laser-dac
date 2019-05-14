# Laser DAC

[![CircleCI branch](https://img.shields.io/circleci/project/github/Volst/laser-dac/master.svg)](https://circleci.com/gh/Volst/laser-dac)

This is a collection of tools that contain everything you need to get started with programming on a laser DAC like the [Ether Dream](https://ether-dream.com/) or [Helios](http://pages.bitlasers.com/helios/), with support for more DACs coming. We also have a good laser simulator so you can develop without looking to the intense lights of a laser.

Our goal is to make it as easy as possible to develop **interactive laser drawings**. Laser drawing software has existed for years, but making it interactive (e.g. creating a basic webapp using websockets to allow someone to control your laser) is something different!

The tools use Node.js and are published on npm under the `@laser-dac` scope.

**Currently this is in early development.**

The tools consist of a couple of packages. Click on the title for more information.

## [`@laser-dac/core`](./packages/core)

This package allows you to easily configure everything, but it does nothing on it's own.

## [`@laser-dac/ether-dream`](./packages/ether-dream)

This package takes care of the communication to the [Ether Dream DAC](https://ether-dream.com/). It can establish a connection to the Ether Dream and stream points to it.

## [`@laser-dac/helios`](./packages/helios)

This package takes care of the communication to the [Helios DAC](http://pages.bitlasers.com/helios/).

## [`@laser-dac/laserdock`](./packages/laserdock)

This package takes care of the communication to the [Laserdock](https://www.wickedlasers.com/laserdock).

## [`@laser-dac/beyond`](./packages/beyond)

This package takes care of communication to [Pangolin Beyond software](https://pangolin.com/pages/beyond). **This isn't finished yet!**

## [`@laser-dac/easylase`](./packages/easylase)

This package takes care of communication to [Easylase](http://www.jmlaser.com/EasyLase_D.htm). **This isn't finished yet!**

## [`@laser-dac/simulator`](./packages/simulator)

This package can simulate a physical laser DAC so you can develop without having a laser or DAC at all. It has a web-based simulator for the laser, that also tries its best to mimick the limitations of the laser.

## [`@laser-dac/draw`](./packages/draw)

This package makes it easy for you to make laser drawings using programming. It can also import ILDA files used by professional laser tools.

## [`@laser-dac/ilda-reader`](./packages/ilda-reader)

This package can read ILDA (.ild) files and convert them to a JSON array of points.

## [`@laser-dac/ilda-writer`](./packages/ilda-writer)

This package can write a JSON array of points to an ILDA (.ild) file.

## [Examples](./examples)

We also have some [_examples_](./examples) that should help you get started.
