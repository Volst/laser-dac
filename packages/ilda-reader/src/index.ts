import { SectionTypes, Section } from './file';
import { parseColor } from './color';
import { ArrayReader, ByteArray } from './ArrayReader';

export function fromByteArray(arr: ByteArray) {
  const sections: Section[] = [];
  const p = new ArrayReader(arr);
  while (!p.eof()) {
    // read frame.
    const head = p.readString(4);
    if (head != 'ILDA') break;
    const section: Section = {
      name: '',
      type: p.readLong(),
      points: [],
      colors: []
    };
    switch (section.type) {
      case SectionTypes.THREE_DIMENSIONAL:
        // 3D frame
        section.name = p.readString(8);
        section.company = p.readString(8);
        const np1 = p.readShort();
        p.readShort(); // this is the `index`, but we ignore that for now
        section.total = p.readShort();
        section.head = p.readByte();
        p.readByte();
        for (let i = 0; i < np1; i++) {
          const x = p.convertCoordinate(p.readSignedShort());
          const y = p.convertCoordinate(p.readSignedShort());
          // TODO: does it work like this?
          const z = p.readSignedShort();
          const rgb = parseColor(p.readShort());
          const point = {
            x,
            y,
            z,
            r: rgb.r,
            g: rgb.g,
            b: rgb.b
          };
          section.points.push(point);
        }
        break;
      case SectionTypes.TWO_DIMENSIONAL:
        // 2D frame
        section.name = p.readString(8);
        section.company = p.readString(8);
        const np2 = p.readShort();
        p.readShort(); // this is the `index`, but we ignore that for now
        section.total = p.readShort();
        section.head = p.readByte();
        p.readByte();
        for (let i = 0; i < np2; i++) {
          const x = p.convertCoordinate(p.readSignedShort());
          const y = p.convertCoordinate(p.readSignedShort());
          const rgb = parseColor(p.readShort());
          const point = {
            x,
            y,
            r: rgb.r,
            g: rgb.g,
            b: rgb.b
          };
          section.points.push(point);
        }
        break;
      case SectionTypes.COLOR_TABLE:
        // color table
        section.name = p.readString(8);
        section.company = p.readString(8);
        const np3 = p.readShort();
        p.readShort(); // this is the `index`, but we ignore that for now
        p.readByte();
        p.readByte();
        section.head = p.readByte();
        p.readByte();
        for (let i = 0; i < np3; i++) {
          const color = {
            r: p.readByte(),
            g: p.readByte(),
            b: p.readByte()
          };
          section.colors.push(color);
        }
        break;
      case SectionTypes.TRUECOLOR_TABLE:
        // truecolor points
        // const _len = p.readLong();
        const np = p.readLong();
        for (let i = 0; i < np; i++) {
          const color = {
            r: p.readByte(),
            g: p.readByte(),
            b: p.readByte()
          };
          section.colors.push(color);
        }
        break;
    }
    sections.push(section);
  }
  return sections;
}

export { Section };
