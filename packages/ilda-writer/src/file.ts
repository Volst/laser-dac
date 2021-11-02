export enum SectionTypes {
  THREE_DIMENSIONAL = 0,
  TWO_DIMENSIONAL = 1,
  COLOR_TABLE = 2,
  TRUECOLOR_TABLE = 3,
  TREE_DIMENSIONAL_TRUECOLOR = 4,
  TWO_DIMENSIONAL_TRUECOLOR = 5,
  UNKNOWN = 99,
}

export interface Point {
  x: number;
  y: number;
  z?: number;
  blanking: boolean;
  color?: number;
  r?: number;
  g?: number;
  b?: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Section {
  type: SectionTypes;
  name: string; // palette name or frame name
  company?: string;
  points: Point[]; // points contains x,y,z,color,blanking and last fields
  head?: number;
  total?: number;
  colors?: Color[]; // colors contains r,g,b values
}

export const BlankingBit = Math.pow(2, 14);
export const LastBit = Math.pow(2, 15);
