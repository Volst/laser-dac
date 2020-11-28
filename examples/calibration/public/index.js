import WebsocketClient from './websocket.js';
import uuid from './uuid.js';

const host = window.document.location.host.replace(/:.*/, '');
const ws = new WebsocketClient();

const ppsInput = document.getElementById('pps');
const resolutionInput = document.getElementById('resolution');


function sendMessage(msg) {
  console.log("Sending:", msg.data);
  ws.send(JSON.stringify(msg));
}

function sendFormValues() {
  sendMessage({
    type: 'UPDATEPARAMS',
    data: {
      pps: parseInt(ppsInput.value, 10),
      resolution: parseInt(resolutionInput.value, 10)
    }
  });
}

ws.onopen = function() {
  console.log('Websocket connection opened.');

  ppsInput.addEventListener('input', sendFormValues);
  resolutionInput.addEventListener('input', sendFormValues);
};

const uniqueId = uuid();

ws.open(`ws://${host}:8321?id=${uniqueId}`);
