declare module 'svg-arc-to-cubic-bezier' {
  interface ArcOptions {
    px: number;
    py: number;
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    xAxisRotation: number;
    largeArcFlag: 0 | 1;
    sweepFlag: 0 | 1;
  }

  interface Curve {
    x: number;
    y: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  function arcToBezier(options: ArcOptions): Curve[];

  export = arcToBezier;
}
