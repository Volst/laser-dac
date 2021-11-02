import { Rect } from '../Rect';

test('draw basic green rectangle', () => {
  const rect = new Rect({
    width: 0.5,
    height: 0.5,
    x: 0.2,
    y: 0.4,
    color: [0, 1, 0],
  });
  const points = rect.draw(10);
  expect(points).toMatchSnapshot();
});
