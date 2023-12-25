import { ServerWebSocket } from 'bun'
import { ChatController } from './controller/chat_controller'
import { WebSocketData, MessageData } from './model/websocket_data'
import { RedisController } from './controller/redis_controller';

await WebSocketData.create();

const server = Bun.serve<WebSocketData>({
  hostname: '0.0.0.0',
  fetch(req, server) {
    if (server.upgrade(req, {
      data: new WebSocketData([new RedisController(server), new ChatController(server)]),
    })) {
      return;
    }
    let filePath = new URL(req.url).pathname;
    const publicFolder = "./"
    if (filePath == "/") {
      filePath = "index.html";
    }
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

console.log(
  `🦊 WebSocket is running at http://${server.hostname}:${server.port}`
);
