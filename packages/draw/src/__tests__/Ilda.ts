import { Ilda, loadIldaFile } from '../Ilda';
import * as path from 'path';

test('draw a boeing', () => {
  const boeing = loadIldaFile(path.resolve(__dirname, './boeing.ild'));
  const ilda = new Ilda({
    file: boeing,
    frame: 0
  });
  const points = ilda.draw();
  expect(points).toMatchSnapshot();
});

test('draw a boeing with offset', () => {
  const boeing = loadIldaFile(path.resolve(__dirname, './boeing.ild'));
  const ilda = new Ilda({
    file: boeing,
    frame: 0,
    x: 0.1,
    y: 0.3
  });
  const points = ilda.draw();
  expect(points).toMatchSnapshot();
});
