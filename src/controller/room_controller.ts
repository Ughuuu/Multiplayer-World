import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, Vector3, WebSocketData } from "../model";
import { WebsocketController } from "./websocket_controller";
import { DataController } from "./data_controller";
import { CellListener } from "./cell_listener";

export class RoomController implements WebsocketController<WebSocketData>, CellListener {
    readonly dataController: DataController
    constructor(dataController: DataController) {
        this.dataController = dataController
    }
    async onCellUpdated(ws: ServerWebSocket<WebSocketData>, newCell: Vector3) {
        await this.dataController.removeData(ws, "room")
        await this.dataController.writeCellData(ws, "room", ws.data.inMemoryData.room, true)
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        ws.subscribe(`room-${ws.data.inMemoryData.room}`)
        this.dataController.writeCellData(ws, "room", ws.data.inMemoryData.room, true)
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        ws.unsubscribe(`room-${ws.data.inMemoryData.room}`)
        this.dataController.removeData(ws, "room")
    }

    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Receive_Room_Join: {
                if (ws.data.inMemoryData.room !== message_data.data) {
                    ws.unsubscribe(`room-${ws.data.inMemoryData.room}`)
                    ws.subscribe(`room-${message_data.data}`)
                    ws.data.inMemoryData.room = message_data.data
                    this.dataController.writeCellData(ws, "room", ws.data.inMemoryData.room, true)
                }
            } break
        }
    }
}
