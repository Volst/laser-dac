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
        const pointLength = readHeader(p, section);
        for (let i = 0; i < pointLength; i++) {
          const x = p.readSignedShort();
          const y = p.readSignedShort();
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
        const pointLength2 = readHeader(p, section);
        for (let i = 0; i < pointLength2; i++) {
          const x = p.readSignedShort();
          const y = p.readSignedShort();
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
        const colorLength = readHeader(p, section);
        for (let i = 0; i < colorLength; i++) {
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
      case SectionTypes.TREE_DIMENSIONAL_TRUECOLOR:
        const pointLength3 = readHeader(p, section);
        for (let i = 0; i < pointLength3; i++) {
          const x = p.readSignedShort();
          const y = p.readSignedShort();
          const z = p.readSignedShort();
          p.readByte();
          const b = p.readByte();
          const g = p.readByte();
          const r = p.readByte();
          const point = {
            x,
            y,
            z,
            r,
            g,
            b
          };
          section.points.push(point);
        }
        break;
      case SectionTypes.TWO_DIMENSIONAL_TRUECOLOR:
        const pointLength4 = readHeader(p, section);
        for (let i = 0; i < pointLength4; i++) {
          const x = p.readSignedShort();
          const y = p.readSignedShort();
          p.readByte();
          const b = p.readByte() / 255;
          const g = p.readByte() / 255;
          const r = p.readByte() / 255;
          const point = {
            x,
            y,
            r,
            g,
            b
          };
          section.points.push(point);
        }
        break;
    }
    sections.push(section);
  }
  return sections;
}

function readHeader(p: ArrayReader, section: Section) {
  section.name = p.readString(8);
  section.company = p.readString(8);
  const length = p.readShort();
  p.readShort(); // this is the `index`, but we ignore that for now
  section.total = p.readShort();
  section.head = p.readByte();
  p.readByte();
  return length;
}

export { Section };
