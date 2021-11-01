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
server.listen(PORT, function () {
  console.log(`Started Square Interactive demo on http://localhost:${PORT}`);
});

wss.on('connection', function connection(ws, req) {
  const id = req.url!.replace('/?id=', '');

  ws.on('message', function incoming(message) {
    // TODO: should handle illegal JSON so the server can't crash...
    const payload = JSON.parse(message as string);
    if (payload.type === 'MOVE') {
      console.log('Moving x/y', payload.data.x, payload.data.y);
      renderer.updateClientPosition(id, payload.data.x, payload.data.y);
    } else if (payload.type === 'REMOVE') {
      console.log('Removing client');
      renderer.removeClient(id);
    } else if (payload.type === 'PRESS') {
      console.log('Triggering press');
      renderer.triggerPress();
    } else {
      console.log('Unknown websocket message', payload);
    }
  });

  ws.on('close', function incoming(message) {
    renderer.removeClient(id);
  });
});
