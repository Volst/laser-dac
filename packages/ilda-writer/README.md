# ILDA Writer

This package can write an array of points to an [ILDA](http://ilda.com/) file (`.ild`). All ILDA formats are supported (0 to 5).

This is heavily inspired by [ilda.js](https://github.com/possan/ilda.js), but this tool only works in the browser and we wanted to be able to use it in both Nodejs and the browser.

To convert an ILDA file to a JSON array of points, see its counterpart [ilda-reader](https://github.com/Volst/laser-dac/tree/master/packages/ilda-reader).

## Install

```
npm install @laser-dac/ilda-writer
```

## Usage

For a full example see `./test.json` and `./test.ts` in the repository.

```js
import { toByteArray } from '@laser-dac/ilda-writer';
import { writeFileSync } from 'fs';

const sections = [
  {
    type: 0, // see `SectionTypes` in src/file.ts
    colors: [], // optional, can contain { r: 0, g: 0, b: 0 }
    company: 'Volst', // optional
    head: 0, // optional
    points: [
      {
        blanking: false,
        color: 0,
        x: -4214,
        y: 2011,
        z: 0,
      },
    ],
  },
];

const byteArray = toByteArray(sections);

const b = new Buffer(byteArray);
writeFileSync('test.ild', b);
```

Or with ILDA format 5:

```js
import { toByteArray } from '@laser-dac/ilda-writer';
import { writeFileSync } from 'fs';

const sections = [
  {
    type: 5,
    points: [
      {
        blanking: false,
        x: -4214,
        y: 2011,
        r: 255,
        g: 0,
        b: 0,
      },
    ],
  },
];

const byteArray = toByteArray(sections);

const b = new Buffer(byteArray);
writeFileSync('test.ild', b);
```
