import { Point } from '../Point';
import { relativeToPosition } from '../helpers';
const PerspectiveTransform = require('perspective-transform');

const minimumPosition = relativeToPosition(0);
const maximumPosition = relativeToPosition(1);

// These values may seem weird but it's just all the max corner coordinates clockwise.
const SOURCE_CORNERS = [
  minimumPosition,
  minimumPosition,
  maximumPosition,
  minimumPosition,
  maximumPosition,
  maximumPosition,
  minimumPosition,
  maximumPosition
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
  return function(points: Point[]) {
    const destinationCorners = [
      topLeft.x,
      topLeft.y,
      topRight.x,
      topRight.y,
      bottomRight.x,
      bottomRight.y,
      bottomLeft.x,
      bottomLeft.y
    ];
    const perspective = PerspectiveTransform(
      SOURCE_CORNERS,
      destinationCorners
    );

    return points.map(point => {
      const coordinates = perspective.transform(point.x, point.y);
      point.x = relativeToPosition(coordinates[0]);
      point.y = relativeToPosition(coordinates[1]);
      return point;
    });
  };
}
