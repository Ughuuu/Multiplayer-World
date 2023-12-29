import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, ReturnType, WebSocketData } from "../model/websocket_data";
import { WebsocketController } from "./websocket_controller";
import { Vector2 } from "../model/in_memory_data";
import { NameController } from "./name_controller";

const CELL_SIZE = 1.0/1000;

export class MovementController implements WebsocketController<WebSocketData> {
    lastPositions = new Map<string, Map<string, Vector2>>()
    cellPositions = new Map<string, Map<string, Vector2>>()
    server: Server
    nameController: NameController
    constructor(server: Server, nameController: NameController) {
        this.server = server
        this.nameController = nameController
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        // The movement controller is first so it subscribes to all topics
        ws.subscribe("global");
        ws.subscribe(`lobby-${ws.data.inMemoryData.lobby}`);
        const cell = ws.data.inMemoryData.cell
        // send cell data
        this.sendCellData(ws, cell)
        // update cell and last positions
        this.lastPositions.set(cell.toString(), (this.lastPositions.get(cell.toString()) || new Map<string, Vector2>()).set(ws.data.id, ws.data.inMemoryData.position));
        this.cellPositions.set(cell.toString(), (this.cellPositions.get(cell.toString()) || new Map<string, Vector2>()).set(ws.data.id, ws.data.inMemoryData.position));
    }

    sendCellData(ws: ServerWebSocket<WebSocketData>, oldCell: Vector2) {
        const cell = ws.data.inMemoryData.cell
        oldCell.getCellRooms().forEach((cell) => {
            ws.unsubscribe(cell.toString());
            this.cellPositions.get(cell.toString())?.delete(ws.data.id)
        }, this)
        cell.getCellRooms().forEach((cell) => {
            ws.subscribe(cell.toString());
            const cellData = this.cellPositions.get(cell.toString()) || new Map<string, Vector2>()
            if (cellData.size > 0) {
                ws.send(JSON.stringify({ type: ReturnType.Send_Movement, data: Object.fromEntries(cellData) }));
            }
        }, this)
    }


    async close(ws: ServerWebSocket<WebSocketData>) {
        ws.unsubscribe("global");
        ws.unsubscribe(`lobby-${ws.data.inMemoryData.lobby}`);
        ws.data.inMemoryData.cell.getCellRooms().forEach((cell) => {
            ws.unsubscribe(cell.toString());
            this.cellPositions.get(cell.toString())?.delete(ws.data.id)
        }, this)
    }

    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Receive_Movement_Position: {
                if (typeof (message_data.data) !== 'object' || typeof (message_data.data.x) !== 'number' || typeof (message_data.data.y) !== 'number') {
                    throw new Error('Invalid message type for position');
                }
                // update position only if it's not too far
                let newPos = new Vector2(message_data.data.x, message_data.data.y)
                let newCell = new Vector2(Math.floor(newPos.x * CELL_SIZE), Math.floor(newPos.y * CELL_SIZE))
                const distanceSquared = newPos.distanceSquared(ws.data.inMemoryData.position)
                if (distanceSquared > Vector2.MAX_SPEED * Vector2.MAX_SPEED || distanceSquared < Vector2.MIN_SPEED * Vector2.MIN_SPEED) {
                    return;
                }
                // update cell and last positions
                const cell = ws.data.inMemoryData.cell
                this.lastPositions.set(cell.toString(), (this.lastPositions.get(cell.toString()) || new Map<string, Vector2>()).set(ws.data.id, ws.data.inMemoryData.position));
                this.cellPositions.set(cell.toString(), (this.cellPositions.get(cell.toString()) || new Map<string, Vector2>()).set(ws.data.id, ws.data.inMemoryData.position));
                ws.data.inMemoryData.position = message_data.data
                // update cell if needed
                if (newCell.toString() != ws.data.inMemoryData.cell.toString()) {
                    let oldCell = ws.data.inMemoryData.cell
                    ws.data.inMemoryData.cell = newCell
                    // send new updates if we updated cell
                    this.sendCellData(ws, oldCell)
                    this.nameController.sendCellData(ws, oldCell)
                }
            } break
        }
    }

    async update() {
        for (const [cell, positions] of this.lastPositions) {
            if (positions.size === 0) {
                continue
            }
            this.server.publish(cell.toString(), JSON.stringify({ type: ReturnType.Send_Movement, data: Object.fromEntries(positions) }));
        }
        for (const [cell, positions] of this.lastPositions) {
            positions.clear()
        }
    }
}
