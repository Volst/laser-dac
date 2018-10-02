import WebsocketClient from './websocket.js';

let lines = [];
const c = document.getElementById('canvas');
const ctx = c.getContext('2d');
const MAX_VALUE = 65535;
ctx.strokeStyle = '#fff';
ctx.lineWidth = 3;

function calculateColor(raw) {
  return Math.round((raw / MAX_VALUE) * 255);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  lines.forEach(function(line, i) {
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(
        ((MAX_VALUE - (lines[i - 1].x + MAX_VALUE / 2)) / MAX_VALUE) *
          canvas.width,
        ((MAX_VALUE - (lines[i - 1].y + MAX_VALUE / 2)) / MAX_VALUE) *
          canvas.height
      );
      ctx.lineTo(
        ((MAX_VALUE - (line.x + MAX_VALUE / 2)) / MAX_VALUE) * canvas.width,
        ((MAX_VALUE - (line.y + MAX_VALUE / 2)) / MAX_VALUE) * canvas.height
      );
      ctx.closePath();
      ctx.strokeStyle = `rgb(${calculateColor(line.r)}, ${calculateColor(
        line.g
      )}, ${calculateColor(line.b)})`;
      ctx.stroke();
    }
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
