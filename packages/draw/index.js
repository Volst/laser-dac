const fs = require('fs');
const IldaReader = require('./ilda/reader');
const { MAX_VALUE, RESOLUTION } = require('./constants');

class DrawingContext {
  constructor() {
    this.points = [];
    this.red = 0;
    this.green = 0;
    this.blue = 0;
    this.currentX = 0;
    this.currentY = 0;
  }

  moveTo(x, y) {
    this.currentX = x;
    this.currentY = y;
    const point = {
      x: Math.floor(x * MAX_VALUE - MAX_VALUE / 2),
      y: Math.floor(y * MAX_VALUE - MAX_VALUE / 2),
      r: 0,
      g: 0,
      b: 0,
    };
    this.points.push(point);
  }

  lineTo(x, y) {
    const distanceX = this.currentX - x;
    const distanceY = this.currentY - y;
    const distanceTotal = Math.sqrt(
      Math.pow(distanceX, 2) + Math.pow(distanceY, 2)
    );

    const steps = Math.round(distanceTotal * RESOLUTION);
    const points = [];

    for (let i = 0; i < steps; i++) {
      const stepX = this.currentX - (distanceX / steps) * i;
      const stepY = this.currentY - (distanceY / steps) * i;

      points.push({
        x: Math.floor(stepX * MAX_VALUE - MAX_VALUE / 2),
        y: Math.floor(stepY * MAX_VALUE - MAX_VALUE / 2),
        r: Math.floor(MAX_VALUE * this.red),
        g: Math.floor(MAX_VALUE * this.green),
        b: Math.floor(MAX_VALUE * this.blue),
      });
    }

    this.currentX = x;
    this.currentY = y;
    this.points = this.points.concat(points);
  }

  color(r, g, b) {
    this.red = Math.floor(MAX_VALUE * r);
    this.green = Math.floor(MAX_VALUE * g);
    this.blue = Math.floor(MAX_VALUE * b);
  }

  rect(x, y, width, height) {
    this.moveTo(x, y);

    this.lineTo(x + width, y);
    this.lineTo(x + width, y + height);
    this.lineTo(x, y + height);
    this.lineTo(x, y);
  }

  ilda(ildaJson, options = {}) {
    const frame = options.frame || 0;

    const section = ildaJson.sections[frame];

    this.points = this.points.concat(section.points);
  }
}

function loadIldaFile(path) {
  const buffer = fs.readFileSync(path);
  const byteArray = Array.prototype.slice.call(buffer, 0);

  return IldaReader.fromByteArray(byteArray);
}

module.exports = { DrawingContext, loadIldaFile };
