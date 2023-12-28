import { ServerWebSocket } from 'bun'
import { ChatController } from './controller/chat_controller'
import { WebSocketData, MessageData } from './model/websocket_data'
import { MovementController } from './controller/movement_controller';
import { WebsocketController } from './controller/websocket_controller';
import { StatsController } from './controller/stats_controller';
import { NameController } from './controller/name_controller';

let webSocketController: WebsocketController<WebSocketData>[] = []
const UPDATE_INTERVAL = 64

const server = Bun.serve<WebSocketData>({
  hostname: '0.0.0.0',
  fetch(req, server) {
    if (webSocketController.length === 0) {
      webSocketController.push(new MovementController(server))
      webSocketController.push(new NameController(server))
      webSocketController.push(new StatsController(server))
      webSocketController.push(new ChatController(server))
    }
    if (server.upgrade(req, {
      data: new WebSocketData(webSocketController),
    })) {
      return;
    }
    let filePath = new URL(req.url).pathname;
    const publicFolder = "."
    if (filePath == "/") {
      filePath = "/index.html";
    }
    console.log(publicFolder + filePath)
    let response = new Response(Bun.file(publicFolder + filePath))
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
    response.headers.set("Cross-Origin-Embedder-Policy", "require-corp")
    return response
  },
  websocket: {
    async open(ws: ServerWebSocket<WebSocketData>) {
      try {
        for (const controller of ws.data.controllers) {
          await controller.open(ws);
        }
      } catch (err: any) {
        ws.sendText(JSON.stringify({ error: err.message }));
      }
    },
    async message(ws: ServerWebSocket<WebSocketData>, message) {
      try {
        for (const controller of ws.data.controllers) {
          if (typeof (message) !== 'string') {
            throw new Error('Invalid message type');
          }
          let message_data = JSON.parse(message.toString()) as MessageData;
          await controller.message(ws, message_data);
        }
      } catch (err: any) {
        ws.sendText(JSON.stringify({ error: err.message }));
      }
    },
    async close(ws: ServerWebSocket<WebSocketData>, code: number, reason: string) {
      try {
        for (const controller of ws.data.controllers) {
          await controller.close(ws);
        }
      } catch (err: any) {
        ws.sendText(JSON.stringify({ error: err.message }));
      }
    }
  },
});

setInterval(() => {
  // wait for the object to be created
  for (const controller of webSocketController) {
    controller.update();
  }
}, UPDATE_INTERVAL);

console.log(
  `🦊 WebSocket is running at http://${server.hostname}:${server.port} at ${UPDATE_INTERVAL} update interval.`
);
