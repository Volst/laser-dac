import * as express from 'express';
import { Server as WebSocketServer } from 'ws';
import * as http from 'http';
import * as path from 'path';
import { Renderer } from './renderer';

const PORT = 8321;

const renderer = new Renderer();

const server = http.createServer();
const app = express();
app.use(express.static(path.join(__dirname, '/public')));
const wss = new WebSocketServer({ server });

server.on('request', app);
server.listen(PORT, function() {
  console.log(`Started Square Interactive demo on http://localhost:${PORT}`);
});

wss.on('connection', function connection(ws, req) {
  const id = req.url!.replace('/?id=', '');

  function send(type: string, data: any) {
    ws.send(JSON.stringify({ type, data }));
  }

  function sendSettings() {
    send("SettingsToClient", renderer.getParams());
  }

  function sendStats() {
    send("stats", renderer.getStats());
  };

  const statsInterval = setInterval(sendStats, 300);
  sendSettings();
  sendStats();

  ws.on('message', function incoming(message) {
    // TODO: should handle illegal JSON so the server can't crash...
    const payload = JSON.parse(message as string);
    if (payload.type === 'UPDATEPARAMS') {
      console.log('Updating Parameters', payload.data);
      renderer.updateParams(payload.data);
    } else {
      console.log('Unknown websocket message', payload);
    }
  });

  ws.on('close', function incoming(message) {
    clearInterval(statsInterval);
  });
});
