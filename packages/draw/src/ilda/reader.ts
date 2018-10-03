import { SectionTypes, Section, Point, File, Color } from './file';
import { parseColor } from './color';
import { ArrayReader, ByteArray } from './ArrayReader';

export function fromByteArray(arr: ByteArray) {
  const f = new File();
  const p = new ArrayReader(arr);
  while (!p.eof()) {
    // read frame.
    const head = p.readString(4);
    if (head != 'ILDA') break;
    const section = new Section();
    section.type = p.readLong();
    switch (section.type) {
      case SectionTypes.THREE_DIMENSIONAL:
        // 3D frame
        section.name = p.readString(8);
        section.company = p.readString(8);
        const np1 = p.readShort();
        section.index = p.readShort();
        section.total = p.readShort();
        section.head = p.readByte();
        p.readByte();
        for (let i = 0; i < np1; i++) {
          const point = new Point();

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
        const np2 = p.readShort();
        section.index = p.readShort();
        section.total = p.readShort();
        section.head = p.readByte();
        p.readByte();
        for (let i = 0; i < np2; i++) {
          const point = new Point();
          point.x = p.readSignedShort();
          point.y = p.readSignedShort();
          // const st = p.readShort();
          // point.color = (st >> 0) & 0x7f;
          section.points.push(point);
        }
        break;
      case SectionTypes.COLOR_TABLE:
        // color table
        section.name = p.readString(8);
        section.company = p.readString(8);
        const np3 = p.readShort();
        section.index = p.readShort();
        p.readByte();
        p.readByte();
        section.head = p.readByte();
        p.readByte();
        for (let i = 0; i < np3; i++) {
          const color = new Color();
          color.r = p.readByte();
          color.g = p.readByte();
          color.b = p.readByte();
          section.colors.push(color);
        }
        break;
      case SectionTypes.TRUECOLOR_TABLE:
        // truecolor points
        // const _len = p.readLong();
        const np = p.readLong();
        for (let i = 0; i < np; i++) {
          const color = new Color();
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
}
