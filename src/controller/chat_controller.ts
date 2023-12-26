import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, ReturnType, WebSocketData } from "../model/websocket_data";
import { WebsocketController } from "./websocket_controller";

class ChatMessage {
    message: string = ""
    chatRoom: string = "global"
}

const MAX_MESSAGES_KEPT = 10

export class ChatController implements WebsocketController<WebSocketData> {
    lastMessages = new Map<string, Array<string>>()
    server: Server
    constructor(server: Server) {
        this.server = server
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        const msg = `[b]${ws.data.inMemoryData.name}[/b] has entered the chat`;
        this.server.publish("global", JSON.stringify({ type: ReturnType.Chat, data: msg }));
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        const msg = `[b]${ws.data.inMemoryData.name}[/b] has left the chat`;
        ws.unsubscribe("global");
        this.server.publish("global", JSON.stringify({ type: ReturnType.Chat, data: msg }));
    }


    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Chat_Message: {
                let chatMessage = message_data.data as ChatMessage
                let msg = `[b]${ws.data.inMemoryData.name}[/b]: ${chatMessage.message}`
                let lastMessagesInChatRoom = this.lastMessages.get(chatMessage.chatRoom)
                // keep last 10 messages for each conversation
                if (lastMessagesInChatRoom == undefined) {
                    this.lastMessages.set(chatMessage.chatRoom, [])
                    lastMessagesInChatRoom = []
                }
                this.lastMessages.set(chatMessage.chatRoom, [...lastMessagesInChatRoom, msg].slice(0, MAX_MESSAGES_KEPT))
                this.server.publish(chatMessage.chatRoom, JSON.stringify({ type: ReturnType.Chat, data: {message: msg, chatRoom: chatMessage.chatRoom} }));
            } break
        }
    }

    async update() { }
}
