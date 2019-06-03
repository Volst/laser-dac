import { Point } from '../Point';

type TransformFn = (points: Point[]) => Point[];

// Compositor allows combining multiple transformers
export function compositor(transformers: TransformFn[]): TransformFn {
  return function(points: Point[]): Point[] {
    let transformedPoints: Point[] = points;

    transformers.forEach(function(transformer) {
      transformedPoints = transformer(transformedPoints);
    });

    return transformedPoints;
  };
}
