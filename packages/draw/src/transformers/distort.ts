import { Point } from '../Point';
import changePerspective, { QuadPoints } from 'change-perspective';

const minimumPosition = 0;
const maximumPosition = 1;

// These values may seem weird but it's just all the max corner coordinates clockwise.
const SOURCE_CORNERS: QuadPoints = [
  minimumPosition,
  minimumPosition,
  maximumPosition,
  minimumPosition,
  maximumPosition,
  maximumPosition,
  minimumPosition,
  maximumPosition,
];

interface Coordinates {
  x: number;
  y: number;
}

export function distort(
  topLeft: Coordinates,
  topRight: Coordinates,
  bottomRight: Coordinates,
  bottomLeft: Coordinates
) {
  return function (points: Point[]) {
    const destinationCorners: QuadPoints = [
      topLeft.x,
      topLeft.y,
      topRight.x,
      topRight.y,
      bottomRight.x,
      bottomRight.y,
      bottomLeft.x,
      bottomLeft.y,
    ];
    const perspective = changePerspective(SOURCE_CORNERS, destinationCorners);

    return points.map((point) => {
      const coordinates = perspective(point.x, point.y);
      point.x = coordinates[0];
      point.y = coordinates[1];
      return point;
    });
  };
}
