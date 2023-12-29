import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, ReturnType, WebSocketData } from "../model/websocket_data";
import { WebsocketController } from "./websocket_controller";

class ChatMessage {
    message: string = ""
    room: string = "global"
}

export class ChatController implements WebsocketController<WebSocketData> {
    server: Server
    constructor(server: Server) {
        this.server = server
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        let msg = `[b]${ws.data.inMemoryData.name}[/b]: joined.`
        this.server.publish(ws.data.inMemoryData.cell.toString(), JSON.stringify({ type: ReturnType.Send_Chat_Message, data: { message: msg, room: "global" } }));
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        let msg = `[b]${ws.data.inMemoryData.name}[/b]: left.`
        this.server.publish(ws.data.inMemoryData.cell.toString(), JSON.stringify({ type: ReturnType.Send_Chat_Message, data: { message: msg, room: "global" } }));
        this.server.publish(ws.data.inMemoryData.cell.toString(), JSON.stringify({ type: ReturnType.Send_Leave, data: ws.data.id }));
    }


    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Receive_Chat_Message: {
                let chatMessage = message_data.data as ChatMessage
                if (chatMessage.room == 'cell') {
                    chatMessage.room = ws.data.inMemoryData.cell.toString()
                }
                // check if we are allowed to post in the room
                if (chatMessage.room == 'global' ||
                    chatMessage.room == 'lobby-' + ws.data.inMemoryData.lobby ||
                    chatMessage.room == ws.data.inMemoryData.cell.toString()) {
                    let msg = `[b]${ws.data.inMemoryData.name}[/b]: ${chatMessage.message}`
                    chatMessage.message = msg
                    this.server.publish(chatMessage.room, JSON.stringify({ type: ReturnType.Send_Chat_Message, data: chatMessage }));
                } break
            }
        }
    }

    async update(): Promise<void> {
    }
}
