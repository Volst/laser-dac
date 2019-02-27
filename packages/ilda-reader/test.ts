import { fromByteArray } from './src';
import * as fs from 'fs';

const buffer = fs.readFileSync('./test.ild');
const byteArray = Array.prototype.slice.call(buffer, 0) as number[];
const output = fromByteArray(byteArray);

console.log(output);
