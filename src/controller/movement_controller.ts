import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, ReturnType, WebSocketData } from "../model/websocket_data";
import { WebsocketController } from "./websocket_controller";
import { Vector2 } from "../model/in_memory_data";

const CELL_SIZE = 500;

export class MovementController implements WebsocketController<WebSocketData> {
    lastPositions = new Map<Vector2, Map<string, Vector2>>()
    cellPositions = new Map<Vector2, Map<string, Vector2>>()
    server: Server
    constructor(server: Server) {
        this.server = server
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        // The movement controller is first so it subscribes to all topics
        ws.subscribe("global");
        ws.subscribe(`lobby-${ws.data.inMemoryData.lobby}`);
        const cell = ws.data.inMemoryData.cell
        // send cell data
        cell.getCellRooms().forEach((cell) => {
            ws.subscribe(cell.cellString());
            const cellData = this.cellPositions.get(cell) || new Map<string, Vector2>()
            if (cellData.size > 0) {
                ws.send(JSON.stringify({ type: ReturnType.Send_Movement_Diff, data: cellData }));
            }
        })
        // update cell and last positions
        this.lastPositions.set(cell, (this.lastPositions.get(cell) || new Map<string, Vector2>()).set(ws.data.id, ws.data.inMemoryData.position));
        this.cellPositions.set(cell, (this.cellPositions.get(cell) || new Map<string, Vector2>()).set(ws.data.id, ws.data.inMemoryData.position));
    }


    async close(ws: ServerWebSocket<WebSocketData>) {
        ws.unsubscribe("global");
        ws.unsubscribe(`lobby-${ws.data.inMemoryData.lobby}`);
        ws.data.inMemoryData.cell.getCellRooms().forEach((cell) => {
            ws.unsubscribe(cell.cellString());
            this.cellPositions.get(cell)?.delete(ws.data.id)
        })
    }

    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Receive_Movement_Position: {
                if (typeof (message_data.data) !== 'object' || typeof (message_data.data.x) !== 'number' || typeof (message_data.data.y) !== 'number') {
                    throw new Error('Invalid message type for position');
                }
                // update position only if it's not too far
                let newPos = new Vector2(message_data.data.x, message_data.data.y)
                let newCell = new Vector2((newPos.x/CELL_SIZE),Math.floor(newPos.y/CELL_SIZE))
                const distanceSquared = newPos.distanceSquared(ws.data.inMemoryData.position) 
                if (distanceSquared > Vector2.MAX_SPEED * Vector2.MAX_SPEED || distanceSquared < Vector2.MIN_SPEED * Vector2.MIN_SPEED) {
                    return;
                }
                // update cell and last positions
                const cell = ws.data.inMemoryData.cell
                this.lastPositions.set(cell, (this.lastPositions.get(cell) || new Map<string, Vector2>()).set(ws.data.id, ws.data.inMemoryData.position));
                this.cellPositions.set(cell, (this.cellPositions.get(cell) || new Map<string, Vector2>()).set(ws.data.id, ws.data.inMemoryData.position));
                ws.data.inMemoryData.position = message_data.data
                // update cell if needed
                if (newCell != ws.data.inMemoryData.cell) {
                    ws.data.inMemoryData.cell.getCellRooms().forEach((cell) => {
                        ws.unsubscribe(cell.cellString());
                    })
                    newCell.getCellRooms().forEach((cell) => {
                        ws.subscribe(cell.cellString());
                    })
                    ws.data.inMemoryData.cell = newCell
                }
            } break
        }
    }

    async update() {
        for (const [cell, positions] of this.lastPositions) {
            if (positions.size === 0) {
                continue
            }
            console.log(positions)
            this.server.publish(cell.cellString(), JSON.stringify({ type: ReturnType.Send_Movement_Diff, data: Object.fromEntries(positions) }));
        }
        this.lastPositions.clear()
    }
}
