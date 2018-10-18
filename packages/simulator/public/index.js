import WebsocketClient from './websocket.js';
import dat from './dat.gui.js';

class SimulatorOptions {
  constructor() {
    this.positionDelay = 0;
    this.afterglowAmount = 50;
  }
}

const options = new SimulatorOptions();
var gui = new dat.GUI();
gui.add(options, 'positionDelay', 0, 10);
gui.add(options, 'afterglowAmount', 0, 300);

let points = [];
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const MAX_VALUE = 65535;
const HALF_MAX_VALUE = MAX_VALUE / 2;
let lastRenderTime;
ctx.strokeStyle = '#fff';
ctx.lineCap = 'round';

function handleResize() {
  const pixelRatio = window.devicePixelRatio;

  ctx.scale(pixelRatio, pixelRatio);
  canvas.width = Math.floor(canvas.clientWidth * pixelRatio);
  canvas.height = Math.floor(canvas.clientHeight * pixelRatio);
  ctx.lineWidth = pixelRatio;
}
handleResize();
window.onresize = handleResize;

// Listen to changes in device pixel ratio.
window
  .matchMedia('screen and (min-resolution: 2dppx)')
  .addListener(handleResize);

function calculateRelativePosition(position) {
  return 1 - (position + HALF_MAX_VALUE) / MAX_VALUE;
}

function calculateColor(raw) {
  return Math.round((raw / MAX_VALUE) * 255);
}

function render() {
  const currentTime = new Date();
  if (lastRenderTime) {
    const frameInterval = currentTime - lastRenderTime;
    // We add variable afterglow depending on the time until the last render.
    ctx.fillStyle = `rgba(0, 0, 0, ${frameInterval / options.afterglowAmount})`;
  }
  lastRenderTime = currentTime;

  // This rectangle will use the afterglow style from the code above.
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  points.forEach(function(point, i) {
    // To simulate the behaviour of an actual laser, controlling the color
    // of the lasers is faster than moving the scanners to a position.
    // "Accurate and Efficient Drawing Method for Laser Projection" describes this as:
    // "... the command ‘turn on beam’ takes less time to execute than the actual ‘jump’ command."
    const colorIndex = i + options.positionDelay;
    const color =
      points[colorIndex < points.length ? colorIndex : points.length - 1];

    ctx.beginPath();
    if (i > 0) {
      const previousPoint = points[i - 1];
      ctx.moveTo(
        calculateRelativePosition(previousPoint.x) * canvas.width,
        calculateRelativePosition(previousPoint.y) * canvas.height
      );
    }

    // If a point doesn't have any color, it shouldn't be drawn at all. This is known as blanking.
    if (color && (color.r || color.g || color.b)) {
      ctx.lineTo(
        calculateRelativePosition(point.x) * canvas.width,
        calculateRelativePosition(point.y) * canvas.height
      );
      ctx.strokeStyle = `rgb(${calculateColor(color.r)}, ${calculateColor(
        color.g
      )}, ${calculateColor(color.b)})`;
      ctx.stroke();
    } else {
      ctx.moveTo(
        calculateRelativePosition(point.x) * canvas.width,
        calculateRelativePosition(point.y) * canvas.height
      );
    }
    ctx.closePath();
  });
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

const host = window.document.location.host.replace(/:.*/, '');
const ws = new WebsocketClient();
ws.open('ws://' + host + ':8080');
ws.onmessage = function(event) {
  points = JSON.parse(event.data);
};
