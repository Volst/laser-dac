import WebsocketClient from './websocket.js';

let points = [];
const c = document.getElementById('canvas');
const ctx = c.getContext('2d');
const MAX_VALUE = 65535;
const AFTERGLOW_AMOUNT = 50;
let lastRenderTime;
ctx.strokeStyle = '#fff';
ctx.lineCap = 'round';

function handleResize() {
  const pixelRatio = window.devicePixelRatio;

  ctx.scale(pixelRatio, pixelRatio);
  c.width = Math.floor(c.clientWidth * pixelRatio);
  c.height = Math.floor(c.clientHeight * pixelRatio);
  ctx.lineWidth = pixelRatio;
}
handleResize();
window.onresize = handleResize;

// Listen to changes in device pixel ratio.
window
  .matchMedia('screen and (min-resolution: 2dppx)')
  .addListener(handleResize);

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

  points.forEach(function(point, i) {
    ctx.beginPath();
    if (i > 0) {
      ctx.moveTo(
        ((MAX_VALUE - (points[i - 1].x + MAX_VALUE / 2)) / MAX_VALUE) *
          canvas.width,
        ((MAX_VALUE - (points[i - 1].y + MAX_VALUE / 2)) / MAX_VALUE) *
          canvas.height
      );
    }

    // If a point doesn't have any color, it shouldn't be drawn at all. This is known as blanking.
    if (point.r || point.g || point.b) {
      ctx.lineTo(
        ((MAX_VALUE - (point.x + MAX_VALUE / 2)) / MAX_VALUE) * canvas.width,
        ((MAX_VALUE - (point.y + MAX_VALUE / 2)) / MAX_VALUE) * canvas.height
      );
      ctx.strokeStyle = `rgb(${calculateColor(point.r)}, ${calculateColor(
        point.g
      )}, ${calculateColor(point.b)})`;
      ctx.stroke();
    } else {
      ctx.moveTo(
        ((MAX_VALUE - (point.x + MAX_VALUE / 2)) / MAX_VALUE) * canvas.width,
        ((MAX_VALUE - (point.y + MAX_VALUE / 2)) / MAX_VALUE) * canvas.height
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
