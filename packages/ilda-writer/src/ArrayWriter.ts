export type ByteArray = number[];

export class ArrayWriter {
  bytes: ByteArray = [];

  writeByte(value: number) {
    this.bytes.push(value);
  }

  writeShort(value: number) {
    this.writeByte((value >> 8) & 0xff);
    this.writeByte((value >> 0) & 0xff);
  }

  writeSignedShort(value: number) {
    if (value < 0) value = 65535 + value;
    this.writeByte((value >> 8) & 0xff);
    this.writeByte((value >> 0) & 0xff);
  }

  writeLong(value: number) {
    this.writeByte((value >> 24) & 0xff);
    this.writeByte((value >> 16) & 0xff);
    this.writeByte((value >> 8) & 0xff);
    this.writeByte((value >> 0) & 0xff);
  }

  writeString(str: string, len: number) {
    for (var i = 0; i < len; i++) {
      if (i < str.length) this.writeByte(str.charCodeAt(i));
      else this.writeByte(0);
    }
  }
}
