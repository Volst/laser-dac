import { Point } from '../Point';

test('render blanking point', () => {
  const point = new Point(0.1, 0.2);
  expect(point).toEqual({
    r: 0,
    g: 0,
    b: 0,
    x: 0.1,
    y: 0.2,
  });
});

test('render green point', () => {
  const point = new Point(0, 0, [0, 1, 0]);
  expect(point).toEqual({
    r: 0,
    g: 1,
    b: 0,
    x: 0,
    y: 0,
  });
});

test('render red point', () => {
  const point = new Point(0, 0, [1, 0, 0]);
  expect(point).toEqual({
    r: 1,
    g: 0,
    b: 0,
    x: 0,
    y: 0,
  });
});

test('render blue point', () => {
  const point = new Point(0, 0, [0, 0, 1]);
  expect(point).toEqual({
    r: 0,
    g: 0,
    b: 1,
    x: 0,
    y: 0,
  });
});

test('render point in exactly the middle', () => {
  const point = new Point(0.5, 0.5);
  expect(point).toEqual({
    r: 0,
    g: 0,
    b: 0,
    x: 0.5,
    y: 0.5,
  });
});

test('render point in bottom right', () => {
  const point = new Point(1, 1);
  expect(point).toEqual({
    r: 0,
    g: 0,
    b: 0,
    x: 1,
    y: 1,
  });
});
