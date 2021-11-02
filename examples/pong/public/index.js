import WebsocketClient from './websocket.js';
import uuid from './uuid.js';

const host = window.document.location.host.replace(/:.*/, '');
const ws = new WebsocketClient();

function sendMessage(msg) {
  ws.send(JSON.stringify(msg));
}

function moveToLeft() {
  sendMessage({
    type: 'LEFT',
  });
}

function moveToRight() {
  sendMessage({
    type: 'RIGHT',
  });
}

ws.onopen = function () {
  console.log('Websocket connection opened.');

  const $left = document.getElementById('left');
  const $right = document.getElementById('right');

  $left.removeEventListener('click', moveToLeft);
  $right.removeEventListener('click', moveToRight);

  $left.addEventListener('click', moveToLeft, false);
  $right.addEventListener('click', moveToRight, false);
};

const uniqueId = uuid();

ws.open(`ws://${host}:8321?id=${uniqueId}`);
