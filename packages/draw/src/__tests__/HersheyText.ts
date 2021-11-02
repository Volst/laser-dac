import { HersheyFont, loadHersheyFont } from '../HersheyFont';
import * as path from 'path';

test('draw a text with default spacing factor', () => {
  const font = loadHersheyFont(path.resolve(__dirname, './futural.jhf'));

  const hersheyFont = new HersheyFont({
    font: font,
    text: 'Test',
    x: 0.1,
    y: 0.4,
    color: [1, 0, 0],
    charWidth: 0.1,
  });

  const points = hersheyFont.draw(10);
  expect(points).toMatchSnapshot();
});

test('draw a text with modified spacing factor', () => {
  const font = loadHersheyFont(path.resolve(__dirname, './futural.jhf'));

  const hersheyFont = new HersheyFont({
    font: font,
    text: 'Test',
    x: 0.1,
    y: 0.4,
    color: [1, 0, 0],
    charWidth: 0.1,
    spacingFactor: 0.7,
  });

  const points = hersheyFont.draw(10);
  expect(points).toMatchSnapshot();
});
