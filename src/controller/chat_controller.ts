import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, ReturnType, WebSocketData } from "../model/websocket_data";
import { EXPIRE_TIME, WebsocketController } from "./websocket_controller";

export class ChatController implements WebsocketController<WebSocketData> {
    server: Server
    constructor(server: Server) {
        this.server = server
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        const msg = `[b]${ws.data.redisData.name}[/b] has entered the chat`;
        this.server.publish("global", JSON.stringify({ type: ReturnType.Chat, data: msg }));
    }

    async pong(ws: ServerWebSocket<WebSocketData>) {
        console.log('pong')
        await WebSocketData.redisClient.expire(`user:${ws.data.id}`, EXPIRE_TIME)
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        const msg = `[b]${ws.data.redisData.name}[/b] has left the chat`;
        ws.unsubscribe("global");
        this.server.publish("global", JSON.stringify({ type: ReturnType.Chat, data: msg }));
    }


    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        await WebSocketData.redisClient.expire(`user:${ws.data.id}`, EXPIRE_TIME)
        switch (message_data.type) {
            case MessageType.Chat_Message: {
                if (typeof (message_data.data) !== 'string') {
                    throw new Error('Invalid message type for chat');
                }
                let msg = `[b]${ws.data.redisData.name}[/b]: ${message_data.data}`
                this.server.publish("global", JSON.stringify({ type: ReturnType.Chat, data: msg }));
            } break
        }
    }
}
