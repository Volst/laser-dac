const {
  SectionTypes,
  Section,
  Point,
  File,
  BlankingBit,
  LastBit,
} = require('./file');
const { parseColor } = require('./color');
const { MAX_VALUE } = require('../constants');

var ArrayReader = function(bytes) {
  this.bytes = bytes || [];
  this.position = 0;
  this.length = this.bytes.length;
};

ArrayReader.prototype.seek = function(p) {
  this.position = p;
};

ArrayReader.prototype.eof = function() {
  return this.position >= this.length;
};

ArrayReader.prototype.readString = function(length) {
  var s = '';
  for (var i = 0; i < length; i++) {
    var b0 = this.readByte();
    if (b0 > 0 && b0 < 0x7f) s += String.fromCharCode(b0);
  }
  return s.trim();
};

ArrayReader.prototype.readByte = function() {
  var b = this.bytes[this.position];
  this.position++;
  return b;
};

ArrayReader.prototype.readShort = function() {
  var b0 = this.readByte();
  var b1 = this.readByte();
  return (b0 << 8) + b1;
};

ArrayReader.prototype.readSignedShort = function() {
  var b0 = this.readByte();
  var b1 = this.readByte();
  var s = (b0 << 8) + b1;
  if (s > 32768) s = -(65535 - s);
  return s;
};

ArrayReader.prototype.convertCoordinate = function(xy) {
  xy = xy / MAX_VALUE + 0.5;
  return Math.floor(xy * MAX_VALUE - MAX_VALUE / 2);
};

ArrayReader.prototype.readLong = function() {
  var b0 = this.readByte();
  var b1 = this.readByte();
  var b2 = this.readByte();
  var b3 = this.readByte();
  return b3 + (b2 << 8) + (b1 << 16) + (b0 << 24);
};

var Reader = {};

Reader.fromByteArray = function(arr, callback) {
  var i;
  var f = new File();
  var p = new ArrayReader(arr);
  while (!p.eof()) {
    // read frame.
    var head = p.readString(4);
    if (head != 'ILDA') break;
    var section = new Section();
    section.type = p.readLong();
    switch (section.type) {
      case SectionTypes.THREE_DIMENSIONAL:
        // 3D frame
        section.name = p.readString(8);
        section.company = p.readString(8);
        var np = p.readShort();
        section.index = p.readShort();
        section.total = p.readShort();
        section.head = p.readByte();
        p.readByte();
        for (var i = 0; i < np; i++) {
          var point = new Point();

          point.x = p.convertCoordinate(p.readSignedShort());
          point.y = p.convertCoordinate(p.readSignedShort());
          // TODO: does it work like this?
          point.z = p.readSignedShort();
          const rgb = parseColor(p.readShort());
          point.r = rgb.r;
          point.g = rgb.g;
          point.b = rgb.b;
          section.points.push(point);
        }
        break;
      case SectionTypes.TWO_DIMENSIONAL:
        // 2D frame
        section.name = p.readString(8);
        section.company = p.readString(8);
        var np = p.readShort();
        section.index = p.readShort();
        section.total = p.readShort();
        section.head = p.readByte();
        p.readByte();
        for (var i = 0; i < np; i++) {
          var point = new Point();
          point.x = p.readSignedShort();
          point.y = p.readSignedShort();
          var st = p.readShort();
          point.color = (st >> 0) & 0x7f;
          point.last = (st & LastBit) == LastBit;
          section.points.push(point);
        }
        break;
      case SectionTypes.COLOR_TABLE:
        // color table
        section.name = p.readString(8);
        section.company = p.readString(8);
        var np = p.readShort();
        section.index = p.readShort();
        p.readByte();
        p.readByte();
        section.head = p.readByte();
        p.readByte();
        for (var i = 0; i < np; i++) {
          var color = new Color();
          color.r = p.readByte();
          color.g = p.readByte();
          color.b = p.readByte();
          section.colors.push(color);
        }
        break;
      case SectionTypes.TRUECOLOR_TABLE:
        // truecolor points
        var _len = p.readLong();
        var np = p.readLong();
        for (var i = 0; i < np; i++) {
          var color = new Color();
          color.r = p.readByte();
          color.g = p.readByte();
          color.b = p.readByte();
          section.colors.push(color);
        }
        break;
    }
    f.sections.push(section);
  }
  return f;
};

module.exports = Reader;
