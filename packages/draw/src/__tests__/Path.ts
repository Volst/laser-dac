import { Path } from '../Path';

test('draw a cross', () => {
  const cross = new Path({
    path: 'M0.2 0.2 h0.1 v0.1 h0.1 v0.1 h-0.1 v0.1 h-0.1 v-0.1 h-0.1 v-0.1 h0.1 z',
    color: [0, 1, 0],
    x: 0,
    y: 0,
  });
  expect(cross.draw(10)).toMatchSnapshot();
});

test('draw a triangle', () => {
  const triangle = new Path({
    path: 'M0.67 0 l0.33 0.88 L1 0.88 Z',
    color: [0, 1, 0],
    x: 0,
    y: 0,
  });
  expect(triangle.draw(10)).toMatchSnapshot();
});

test('draw a triangle with x/y offset', () => {
  const triangle = new Path({
    path: 'M0.67 0 l0.33 0.88 L1 0.88 Z',
    color: [0, 1, 0],
    x: 0.1,
    y: 0.2,
  });
  expect(triangle.draw(10)).toMatchSnapshot();
});

test('draw a smile (curves)', () => {
  const smile = new Path({
    path: 'M0.5,0.8c0,0,0,0.1,0.1,0.1c0.1,0,0.1-0.1,0.1-0.1',
    color: [0, 1, 0],
    x: 0,
    y: 0,
  });
  expect(smile.draw(10)).toMatchSnapshot();
});

test('draw an arc', () => {
  const arc = new Path({
    path: 'M10 315L 110 215A 30 50 0 0 1 162.55 162.45L 172.55 152.45A 30 50 -45 0 1 215.1 109.9L 315 10',
    color: [0, 1, 0],
    width: 320,
    height: 320,
  });
  expect(arc.draw(10)).toMatchSnapshot();
});
