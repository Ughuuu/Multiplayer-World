import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, WebSocketData } from "../model";
import { WebsocketController } from "./websocket_controller";
import { DataController } from "./data_controller";

class ChatMessage {
    message: string = ""
    room: string = "global"
}

export class ChatController implements WebsocketController<WebSocketData> {
    readonly dataController: DataController
    constructor(dataController: DataController) {
        this.dataController = dataController
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        let msg = `[b]${ws.data.inMemoryData.name}[/b]: joined.`
        await this.dataController.writeCellData(ws, "chat", msg)
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        let msg = `[b]${ws.data.inMemoryData.name}[/b]: left.`
        await this.dataController.writeCellData(ws, "chat", msg)
        await this.dataController.writeCellData(ws, "left", true)
    }

    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Receive_Chat_Message: {
                let chatMessage = message_data.data as ChatMessage
                // post in current cell
                if (chatMessage.room == 'current_cell') {
                    chatMessage.room = ws.data.inMemoryData.position.toCellString()
                }
                // check if we are allowed to post in the room
                if (chatMessage.room == 'room-' + ws.data.inMemoryData.room ||
                    chatMessage.room == ws.data.inMemoryData.position.toCellString()) {
                    let msg = `[b]${ws.data.inMemoryData.name}[/b]: ${chatMessage.message}`
                    chatMessage.message = msg
                }
                await this.dataController.writeCellData(ws, "chat", chatMessage)
            } break
        }
    }
}
