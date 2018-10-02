var SectionTypes = {
  THREE_DIMENSIONAL: 0,
  TWO_DIMENSIONAL: 1,
  COLOR_TABLE: 2,
  TRUECOLOR_TABLE: 3,
  UNKNOWN: 99
};

var Point = function() {
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.r = 0;
  this.g = 0;
  this.b = 0;
};

var Color = function() {
  this.r = 0;
  this.g = 0;
  this.b = 0;
};

var Section = function() {
  this.type = SectionTypes.UNKNOWN;
  this.name = ''; // palette name or frame name
  this.company = '';
  this.index = 0; // palette number or frame number
  this.points = []; // points contains x,y,z,color,blanking and last fields
  this.head = 0;
  this.total = 0;
  this.colors = []; // colors contains r,g,b values
};

var File = function() {
  this.sections = [];
};

var BlankingBit = 1 << 14;
var LastBit = 1 << 15;

module.exports = {
  Point,
  Color,
  SectionTypes,
  Section,
  File,
  BlankingBit,
  LastBit
};
