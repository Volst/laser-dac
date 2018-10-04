import { MAX_VALUE } from './constants';

export function relativeToPosition(n: number) {
  return Math.floor(n * MAX_VALUE - MAX_VALUE / 2);
}

export function relativeToColor(color: number) {
  return Math.floor(MAX_VALUE * color);
}
