import { toByteArray } from './src';
import * as fs from 'fs';

const data = fs.readFileSync('./test.json', 'utf8');
const json = JSON.parse(data);

const byteArray = toByteArray(json);

const b = new Buffer(byteArray);
fs.writeFileSync('test.ild', b);
