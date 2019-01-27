# ILDA Writer

This package can write an array of points to an [ILDA](http://ilda.com/) file (`.ild`).

For a full example see `./test.json` and `./test.ts` in the repository.

This is heavily inspired by [ilda.js](https://github.com/possan/ilda.js), but since the tool only worked in the browser

## Usage

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
        z: 0
      }
    ]
  }
];

const byteArray = toByteArray(sections);

const b = new Buffer(byteArray);
writeFileSync('test.ild', b);
```
