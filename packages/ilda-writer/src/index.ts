import { ArrayWriter } from './ArrayWriter';
import { Section, SectionTypes, BlankingBit, LastBit } from './file';

const DEFAULT_COMPANY_NAME = '';

export function toByteArray(sections: Section[]) {
  const p = new ArrayWriter();
  for (let si = 0; si < sections.length; si++) {
    const section = sections[si];
    const total = sections.length - 1;
    const colors = section.colors || [];
    switch (section.type) {
      case SectionTypes.THREE_DIMENSIONAL:
        writeHeader(p, section, si, total);
        for (let i = 0; i < section.points.length; i++) {
          const point = section.points[i];
          p.writeSignedShort(point.x);
          p.writeSignedShort(point.y);
          p.writeSignedShort(point.z!);
          let st = 0;
          st |= point.color! & 127;
          if (point.blanking) st |= BlankingBit;
          if (i == section.points.length - 1) st |= LastBit;
          p.writeShort(st);
        }
        break;
      case SectionTypes.TWO_DIMENSIONAL:
        writeHeader(p, section, si, total);
        for (let i = 0; i < section.points.length; i++) {
          const point = section.points[i];
          p.writeSignedShort(point.x);
          p.writeSignedShort(point.y);
          let st = 0;
          st |= point.color! & 127;
          if (point.blanking) st |= BlankingBit;
          if (i == section.points.length - 1) st |= LastBit;
          p.writeShort(st);
        }
        break;
      case SectionTypes.COLOR_TABLE:
        p.writeString('ILDA', 4);
        p.writeLong(section.type);
        p.writeString(section.name, 8);
        p.writeString(section.company || DEFAULT_COMPANY_NAME, 8);
        p.writeShort(colors.length);
        p.writeShort(si);
        p.writeByte(0);
        p.writeByte(0);
        p.writeByte(section.head || 0);
        p.writeByte(0);
        for (let i = 0; i < colors.length; i++) {
          const color = colors[i];
          p.writeByte(color.r);
          p.writeByte(color.g);
          p.writeByte(color.b);
        }
        break;
      case SectionTypes.TRUECOLOR_TABLE:
        p.writeString('ILDA', 4);
        p.writeLong(section.type);
        p.writeLong(colors.length * 3 + 4);
        p.writeLong(colors.length);
        for (let i = 0; i < colors.length; i++) {
          const color = colors[i];
          p.writeByte(color.r);
          p.writeByte(color.g);
          p.writeByte(color.b);
        }
        break;
      case SectionTypes.TREE_DIMENSIONAL_TRUECOLOR:
        writeHeader(p, section, si, total);
        for (let i = 0; i < section.points.length; i++) {
          const point = section.points[i];
          p.writeSignedShort(point.x);
          p.writeSignedShort(point.y);
          p.writeSignedShort(point.z!);
          let st = 0;
          if (point.blanking) st |= BlankingBit;
          if (i == section.points.length - 1) st |= LastBit;
          p.writeByte(st);
          // Sidenote: we trust on the user providing correct r,g,b values
          p.writeByte(point.b!);
          p.writeByte(point.g!);
          p.writeByte(point.r!);
        }
        break;
      case SectionTypes.TWO_DIMENSIONAL_TRUECOLOR:
        writeHeader(p, section, si, total);
        for (let i = 0; i < section.points.length; i++) {
          const point = section.points[i];
          p.writeSignedShort(point.x);
          p.writeSignedShort(point.y);
          let st = 0;
          if (point.blanking) st |= BlankingBit;
          if (i == section.points.length - 1) st |= LastBit;
          p.writeByte(st);
          // Sidenote: we trust on the user providing correct r,g,b values
          p.writeByte(point.b!);
          p.writeByte(point.g!);
          p.writeByte(point.r!);
        }
        break;
    }
  }
  return p.bytes;
}

function writeHeader(
  p: ArrayWriter,
  section: Section,
  sectionIndex: number,
  total: number
) {
  p.writeString('ILDA', 4);
  p.writeLong(section.type);
  p.writeString(section.name, 8);
  p.writeString(section.company || DEFAULT_COMPANY_NAME, 8);
  p.writeShort(section.points.length);
  p.writeShort(sectionIndex);
  p.writeShort(section.total || total);
  p.writeByte(section.head || 0);
  p.writeByte(0);
}
