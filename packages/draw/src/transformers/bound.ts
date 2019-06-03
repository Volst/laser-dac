import { Point } from '../Point';

interface BoundTransformerOptions {
  lowestX?: number;
  lowestY?: number;
  highestX?: number;
  highestY?: number;
}

function boundValue(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

// Bound values to a specific X-Y range. Can be used for safe zones e.g.
export function bound(options: BoundTransformerOptions) {
  const lowestX: number = options.lowestX || 0.0;
  const lowestY: number = options.lowestY || 0.0;
  const highestX: number = options.highestX || 1.0;
  const highestY: number = options.highestY || 1.0;

  return function(points: Point[]) {
    return points.map(function(point: Point): Point {
      if (
        point.x > lowestX &&
        point.x < highestX &&
        point.y > lowestY &&
        point.y < highestY
      ) {
        return point;
      }

      // Replace out of bound points with blanking points at the edge position.
      // TODO: Very crude algorithm. Can cause some position/color issues when
      //       used at low resolutions.
      return new Point(
        boundValue(lowestX, highestX, point.x),
        boundValue(lowestY, highestY, point.y),
        [0, 0, 0]
      );
    });
  };
}
