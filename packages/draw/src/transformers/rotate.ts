import { Point } from '../Point';
import { isBlankingPoint } from '../helpers';

function rotateXY(
  cx: number,
  cy: number,
  x: number,
  y: number,
  angle: number
): [number, number] {
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const nx = cos * (x - cx) + sin * (y - cy) + cx;
  const ny = cos * (y - cy) - sin * (x - cx) + cy;
  return [nx, ny];
}

function finderCenterPoint(points: Point[]): [number, number] {
  let lowestX = 0;
  let lowestY = 0;
  let highestX = 0;
  let highestY = 0;

  // I'm 100% sure there is a better, faster and shorter way to do this.
  points.forEach((point) => {
    if (!isBlankingPoint(point)) {
      if (point.x < lowestX) {
        lowestX = point.x;
      }
      if (point.y < lowestY) {
        lowestY = point.y;
      }
      if (point.x > highestX) {
        highestX = point.x;
      }
      if (point.y > highestY) {
        highestY = point.y;
      }
    }
  });
  const centerX = (lowestX + highestX) / 2;
  const centerY = (lowestY + highestY) / 2;
  return [centerX, centerY];
}

export function rotate(angle: number, pivotPoint?: [number, number]) {
  return function (points: Point[]) {
    const pivot = pivotPoint ? pivotPoint : finderCenterPoint(points);
    const pivotX = pivot[0];
    const pivotY = pivot[1];
    return points.map((point) => {
      // Would love to use `const [pivotX, pivotY]` but this has negative perf implications with V8
      const newPoints = rotateXY(pivotX, pivotY, point.x, point.y, angle);
      point.x = newPoints[0];
      point.y = newPoints[1];
      return point;
    });
  };
}
