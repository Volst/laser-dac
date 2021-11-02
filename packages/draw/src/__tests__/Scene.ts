import { Scene } from '../Scene';
import { Shape } from '../Shape';
import { Point } from '../Point';

class MyShape extends Shape {
  x: number;
  y: number;
  constructor(options: { x: number; y: number }) {
    super();
    this.x = options.x;
    this.y = options.y;
  }
  draw() {
    return [new Point(this.x, this.y), new Point(this.x + 0.1, this.y + 0.1)];
  }
}

test('draw a shape on the scene', () => {
  const scene = new Scene();
  const shapeA = new MyShape({ x: 0.1, y: 0.1 });
  scene.add(shapeA);

  expect(scene.points).toMatchSnapshot();
});

function transformer(points: Point[]) {
  points.forEach((point) => (point.x += 10));
  return points;
}

test('draw a shape and use a transformer', () => {
  const scene = new Scene();
  const shapeA = new MyShape({ x: 0.1, y: 0.1 });
  scene.add(shapeA, transformer);

  expect(scene.points).toMatchSnapshot();
});
