import { Path } from '../Path';

test('draw a cross', () => {
  const cross = new Path({
    path:
      'M0.2 0.2 h0.1 v0.1 h0.1 v0.1 h-0.1 v0.1 h-0.1 v-0.1 h-0.1 v-0.1 h0.1 z',
    color: [0, 1, 0],
    x: 0,
    y: 0
  });
  expect(cross.draw(10)).toMatchSnapshot();
});

test('draw a triangle', () => {
  const triangle = new Path({
    path: 'M0.67 0 l0.33 0.88 L1 0.88 Z',
    color: [0, 1, 0],
    x: 0,
    y: 0
  });
  expect(triangle.draw(10)).toMatchSnapshot();
});

// TODO: draw something with an x,y offset
