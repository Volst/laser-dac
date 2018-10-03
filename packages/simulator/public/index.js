import WebsocketClient from './websocket.js';

let lines = [];
const c = document.getElementById('canvas');
const ctx = c.getContext('2d');
const MAX_VALUE = 65535;
const AFTERGLOW_AMOUNT = 50;
let lastRenderTime;
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
ctx.strokeStyle = '#fff';
ctx.lineWidth = 2;

function calculateColor(raw) {
  return Math.round((raw / MAX_VALUE) * 255);
}

function render() {
  const currentTime = new Date();
  if (lastRenderTime) {
    const frameInterval = currentTime - lastRenderTime;
    // We add variable afterglow depending on the time until the last render.
    ctx.fillStyle = `rgba(0, 0, 0, ${frameInterval / AFTERGLOW_AMOUNT})`;
  }
  lastRenderTime = currentTime;

  // This rectangle will use the afterglow style from the code above.
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  lines.forEach(function(line, i) {
    ctx.beginPath();
    if (i > 0) {
      ctx.moveTo(
        ((MAX_VALUE - (lines[i - 1].x + MAX_VALUE / 2)) / MAX_VALUE) *
          canvas.width,
        ((MAX_VALUE - (lines[i - 1].y + MAX_VALUE / 2)) / MAX_VALUE) *
          canvas.height
      );
    }

    // If a line doesn't have any color, it shouldn't be drawn at all. This is known as blanking.
    if (line.r || line.g || line.b) {
      ctx.lineTo(
        ((MAX_VALUE - (line.x + MAX_VALUE / 2)) / MAX_VALUE) * canvas.width,
        ((MAX_VALUE - (line.y + MAX_VALUE / 2)) / MAX_VALUE) * canvas.height
      );
      ctx.strokeStyle = `rgb(${calculateColor(line.r)}, ${calculateColor(
        line.g
      )}, ${calculateColor(line.b)})`;
      ctx.stroke();
    } else {
      ctx.moveTo(
        ((MAX_VALUE - (line.x + MAX_VALUE / 2)) / MAX_VALUE) * canvas.width,
        ((MAX_VALUE - (line.y + MAX_VALUE / 2)) / MAX_VALUE) * canvas.height
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
  lines = JSON.parse(event.data);
};
