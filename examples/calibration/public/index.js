import WebsocketClient from './websocket.js';
import uuid from './uuid.js';

const host = window.document.location.host.replace(/:.*/, '');
const ws = new WebsocketClient();

const ppsInput = document.getElementById('pps');
const resolutionInput = document.getElementById('resolution');
const blankingPointsInput = document.getElementById('blankingPoints');
const maxWaitPointsInput = document.getElementById('maxWaitPoints');

const statsTable = document.getElementById('stats-table');

function sendMessage(msg) {
  console.log("Sending:", msg.data);
  ws.send(JSON.stringify(msg));
}

function sendFormValues() {
  sendMessage({
    type: 'UPDATEPARAMS',
    data: {
      pps: parseInt(ppsInput.value, 10),
      resolution: parseInt(resolutionInput.value, 10),
      blankingPoints: parseInt(blankingPointsInput.value, 10),
      maxWaitPoints: parseInt(maxWaitPointsInput.value, 10)
    }
  });
}

ws.onopen = function() {
  console.log('Websocket connection opened.');

  ppsInput.addEventListener('input', sendFormValues);
  resolutionInput.addEventListener('input', sendFormValues);
  blankingPointsInput.addEventListener('input', sendFormValues);
  maxWaitPointsInput.addEventListener('input', sendFormValues);
};

function displayStats(stats) {
  statsTable.innerText = JSON.stringify(stats, null, 2);
}

function updateSettings(settings) {
  ppsInput.value = settings.pps;
  resolutionInput.value = settings.resolution;
  blankingPointsInput.value = settings.blankingPoints;
  maxWaitPointsInput.value = settings.maxWaitPoints;
}

ws.onmessage = function(ev) {
  const message = JSON.parse(ev.data);
  switch (message.type) {
    case 'stats': displayStats(message.data); break;
    case 'SettingsToClient': updateSettings(message.data); break;
    default: console.error("Unknown message type: " + message.type, message)
  }
};

const uniqueId = uuid();

ws.open(`ws://${host}:8321?id=${uniqueId}`);
