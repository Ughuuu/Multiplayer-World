import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, ReturnType, WebSocketData } from "../model/websocket_data";
import { WebsocketController } from "./websocket_controller";
import { Vector2 } from "../model/in_memory_data";

const MAX_DIST = 10;
const CELL_SIZE = 1000;

export class MovementController implements WebsocketController<WebSocketData> {
    lastPositions = new Map<string, Vector2>()
    server: Server
    constructor(server: Server) {
        this.server = server
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        // The movement controller is first so it subscribes to all topics
        ws.subscribe("global");
        ws.subscribe(`cell-${ws.data.inMemoryData.position.x}x${ws.data.inMemoryData.position.y}`);
        ws.subscribe(`lobby-${ws.data.inMemoryData.lobby}`);
        ws.send(JSON.stringify({ type: ReturnType.Initial_Info, data: ws.data.inMemoryData }));
        await this.sendInfo()
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        await this.sendInfo()
    }

    async sendInfo() {
        let userCount = 10
        this.server.publish("global", JSON.stringify({ type: ReturnType.Stats_Count, data: userCount }));
    }

    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Movement_Position: {
                if (typeof (message_data.data) !== 'object' || typeof (message_data.data.x) !== 'number' || typeof (message_data.data.y) !== 'number') {
                    throw new Error('Invalid message type for position');
                }
                // update position only if it's not too far
                let newPos = new Vector2(message_data.data.x, message_data.data.y)
                let newCell = `cell-${Math.floor(newPos.x/1000)}x${Math.floor(newPos.y/1000)}`
                const distanceSquared = newPos.distanceSquared(ws.data.inMemoryData.position) 
                if (distanceSquared > Vector2.MAX_SPEED * Vector2.MAX_SPEED || distanceSquared < Vector2.MIN_SPEED * Vector2.MIN_SPEED) {
                    return;
                }
                this.lastPositions.set(ws.data.inMemoryData.name, newPos)
                ws.data.inMemoryData.position = message_data.data
                // update cell if needed
                if (newCell != ws.data.inMemoryData.cell) {
                    ws.unsubscribe(ws.data.inMemoryData.cell);
                    ws.data.inMemoryData.cell = newCell
                    ws.send(JSON.stringify({ type: ReturnType.Initial_Info, data: ws.data.inMemoryData }));
                    ws.subscribe(ws.data.inMemoryData.cell);
                }
            } break
        }
    }

    async update() {
        this.lastPositions.clear()
    }
}
