import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, ReturnType, WebSocketData } from "../model/websocket_data";
import { WebsocketController } from "./websocket_controller";

class ChatMessage {
    message: string = ""
    room: string = "global"
    id: string = ""
}

const MAX_MESSAGES_KEPT = 10

export class ChatController implements WebsocketController<WebSocketData> {
    lastMessages = new Map<string, Array<ChatMessage>>()
    server: Server
    constructor(server: Server) {
        this.server = server
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        this.server.publish("global", JSON.stringify({ type: ReturnType.Send_Join, data: ws.data.id }));
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        this.server.publish("global", JSON.stringify({ type: ReturnType.Send_Left, data: ws.data.id }));
    }


    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Receive_Chat_Message: {
                let chatMessage = message_data.data as ChatMessage
                // check if we are allowed to post in te room
                if (chatMessage.room == 'global' ||
                    chatMessage.room == 'lobby-' + ws.data.inMemoryData.lobby ||
                    chatMessage.room == ws.data.inMemoryData.cell.cellString()) {
                    // keep last 10 messages for each conversation
                    chatMessage.id = ws.data.id
                    this.lastMessages.set(chatMessage.room, [...(this.lastMessages.get(chatMessage.room) || []), chatMessage].slice(0, MAX_MESSAGES_KEPT))
                    this.server.publish(chatMessage.room, JSON.stringify({ type: ReturnType.Send_Chat_Message, data: chatMessage }));
                } break
            }
        }
    }

    async update(): Promise<void> {
    }
}
