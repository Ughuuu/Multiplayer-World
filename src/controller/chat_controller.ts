import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, WebSocketData } from "../model";
import { WebsocketController } from "./websocket_controller";
import { DataController } from "./data_controller";

class ChatMessage {
    message: string = ""
    room: string = "current_cell"
}

export class ChatController implements WebsocketController<WebSocketData> {
    readonly dataController: DataController
    constructor(dataController: DataController) {
        this.dataController = dataController
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        let msg = `[b]${ws.data.inMemoryData.name}[/b]: joined.`
        await this.dataController.writeCellData(ws.data.inMemoryData.position, ws.data.id, "chat", msg)
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        let msg = `[b]${ws.data.inMemoryData.name}[/b]: left.`
        await this.dataController.writeCellData(ws.data.inMemoryData.position, ws.data.id, "chat", msg)
        await this.dataController.writeCellData(ws.data.inMemoryData.position, ws.data.id, "left")
    }

    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Receive_Chat_Message: {
                const chatMessage = message_data.data as ChatMessage
                // post in current cell
                if (chatMessage.room == 'current_cell') {
                    chatMessage.room = ws.data.inMemoryData.position.toCellString()
                }
                // check if we are allowed to post in the room
                if (chatMessage.room == ws.data.inMemoryData.position.toCellString()) {
                    let msg = `[b]${ws.data.inMemoryData.name}[/b]: ${chatMessage.message}`
                    await this.dataController.writeCellData(ws.data.inMemoryData.position, ws.data.id, "chat", msg)
                }
                if (chatMessage.room == 'room-' + ws.data.inMemoryData.room) {

                }
            } break
        }
    }
}
