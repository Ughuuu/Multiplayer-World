import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, WebSocketData, Vector3 } from "../model";
import { WebsocketController } from "./websocket_controller";
import { NameController } from "./name_controller";
import { DataController } from "./data_controller";
import { CellListener } from "./cell_listener";

export class MovementController implements WebsocketController<WebSocketData> {
    server: Server
    dataController: DataController
    cellListener: CellListener[]
    constructor(server: Server, dataController: DataController, cellListener: CellListener[]) {
        this.server = server
        this.dataController = dataController
        this.cellListener = cellListener
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        await this.dataController.writeCellData(ws, "position", ws.data.inMemoryData.position, true)
        this.subscribeToCell(ws, ws.data.inMemoryData.position)
    }

    updateCell(ws: ServerWebSocket<WebSocketData>, newPosition: Vector3) {
        this.unsubscribeFromCell(ws, ws.data.inMemoryData.position)
        this.subscribeToCell(ws, newPosition)
        for (const listener of this.cellListener) {
            listener.onCellUpdated(ws, newPosition)
        }
    }

    subscribeToCell(ws: ServerWebSocket<WebSocketData>, newCell: Vector3) {
        newCell.getCellRooms().forEach((cell) => {
            ws.subscribe(cell.toString());
        })
    }

    unsubscribeFromCell(ws: ServerWebSocket<WebSocketData>, newCell: Vector3) {
        newCell.getCellRooms().forEach((cell) => {
            ws.unsubscribe(cell.toString());
        })
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        await this.dataController.removeData(ws, "position")
        this.unsubscribeFromCell(ws, ws.data.inMemoryData.position)
    }

    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Receive_Movement_Position: {
                if (typeof (message_data.data) !== 'object' || typeof (message_data.data.x) !== 'number' || typeof (message_data.data.y) !== 'number') {
                    throw new Error('Invalid message type for position');
                }
                // update position only if it's not too far
                let newPos = new Vector3(message_data.data.x, message_data.data.y)
                const distanceSquared = newPos.distanceSquared(ws.data.inMemoryData.position)
                if (distanceSquared > Vector3.MAX_SPEED * Vector3.MAX_SPEED || distanceSquared < Vector3.MIN_SPEED * Vector3.MIN_SPEED) {
                    return;
                }
                this.dataController.writeCellData(ws, "position", newPos, true)
                // update cell if needed
                if (newPos.toCellString() != ws.data.inMemoryData.position.toCellString()) {
                    this.updateCell(ws, newPos)
                }
                // update in memory position
                ws.data.inMemoryData.position = newPos
            } break
        }
    }
}
