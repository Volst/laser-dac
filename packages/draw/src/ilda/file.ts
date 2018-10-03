export const SectionTypes = {
  THREE_DIMENSIONAL: 0,
  TWO_DIMENSIONAL: 1,
  COLOR_TABLE: 2,
  TRUECOLOR_TABLE: 3,
  UNKNOWN: 99
};

export class Point {
  x = 0;
  y = 0;
  z = 0;
  r = 0;
  g = 0;
  b = 0;
}

export class Color {
  r = 0;
  g = 0;
  b = 0;
}

export class Section {
  type = SectionTypes.UNKNOWN;
  name = ''; // palette name or frame name
  company = '';
  index = 0; // palette number or frame number
  points: Point[] = []; // points contains x,y,z,color,blanking and last fields
  head = 0;
  total = 0;
  colors: Color[] = []; // colors contains r,g,b values
}

export class File {
  sections: Section[] = [];
}

export const BlankingBit = 1 << 14;
export const LastBit = 1 << 15;
