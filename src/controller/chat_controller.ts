import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, WebSocketData } from "../model/websocket_data";
import { WebsocketController } from "./websocket_controller";
import { DataController } from "./data_controller";

class ChatMessage {
    message: string = ""
    room: string = "global"
}

export class ChatController implements WebsocketController<WebSocketData> {
    readonly server: Server
    readonly dataController: DataController
    constructor(server: Server, dataController: DataController) {
        this.server = server
        this.dataController = dataController
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        let msg = `[b]${ws.data.inMemoryData.name}[/b]: joined.`
        this.dataController.writeCellData(ws, "chats", msg)
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        let msg = `[b]${ws.data.inMemoryData.name}[/b]: left.`
        this.dataController.writeCellData(ws, "chats", msg)
        this.dataController.writeCellData(ws, "left", true)
    }


    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Receive_Chat_Message: {
                let chatMessage = message_data.data as ChatMessage
                // post in current cell
                if (chatMessage.room == 'current_cell') {
                    chatMessage.room = ws.data.inMemoryData.cell.toString()
                }
                // check if we are allowed to post in the room
                if (chatMessage.room == 'lobby-' + ws.data.inMemoryData.lobby ||
                    chatMessage.room == ws.data.inMemoryData.cell.toString()) {
                    let msg = `[b]${ws.data.inMemoryData.name}[/b]: ${chatMessage.message}`
                    chatMessage.message = msg
                } break
            }
        }
    }

    async update(): Promise<void> {
    }
}
