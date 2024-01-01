import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, WebSocketData, Vector3 } from "../model";
import { WebsocketController } from "./websocket_controller";
import { DataController } from "./data_controller";
import { CellListener } from "./cell_listener";

export class NameController implements WebsocketController<WebSocketData>, CellListener {
    dataController: DataController
    constructor(dataController: DataController) {
        this.dataController = dataController
    }
    async onCellUpdated(ws: ServerWebSocket<WebSocketData>, newCell: Vector3) {
        await this.dataController.removeData(ws, "name")
        await this.dataController.writeCellData(newCell, ws.data.id, "name", ws.data.inMemoryData.name, true)
    }

    async open(ws: ServerWebSocket<WebSocketData>) {
        await this.dataController.writeCellData(ws.data.inMemoryData.position, ws.data.id, "name", ws.data.inMemoryData.name, true)
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        await this.dataController.removeData(ws, "name")
    }

    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Receive_Name: {
                let newName = message_data.data
                if (ws.data.inMemoryData.name !== newName) {
                    ws.data.inMemoryData.name = newName
                    this.dataController.writeCellData(ws.data.inMemoryData.position, ws.data.id, "name", newName, true)
                }
            } break
        }
    }
}
