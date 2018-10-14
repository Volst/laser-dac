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

test('draw two shapes on the scene', () => {
  const scene = new Scene();
  const shapeA = new MyShape({ x: 0.1, y: 0.1 });
  const shapeB = new MyShape({ x: 0.5, y: 0.5 });
  scene.add(shapeA, shapeB);

  expect(scene.points).toMatchSnapshot();
});
