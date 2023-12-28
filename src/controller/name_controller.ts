import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, ReturnType, WebSocketData } from "../model/websocket_data";
import { WebsocketController } from "./websocket_controller";
import { Vector2 } from "../model/in_memory_data";

class NameMessage {
    name: string = ""
    id: string = ""
}

export class NameController implements WebsocketController<WebSocketData> {
    names = new Map<string, Map<string, string>>()
    server: Server
    constructor(server: Server) {
        this.server = server
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        // add name to map
        const cellString = ws.data.inMemoryData.cell.cellString()
        this.names.set('global', (this.names.get('global') || new Map<string, string>()).set(ws.data.id, ws.data.inMemoryData.name));
        this.names.set(cellString, (this.names.get('global') || new Map<string, string>()).set(ws.data.id, ws.data.inMemoryData.name));
        // send self name and id
        ws.send(JSON.stringify({ type: ReturnType.Send_Name, data: [{id: ws.data.id, name: ws.data.inMemoryData.name }]}));
        ws.send(JSON.stringify({ type: ReturnType.Send_Id, data: ws.data.id }));
        // send name to others
        ws.publish(cellString, JSON.stringify({ type: ReturnType.Send_Name, data: [{ id: ws.data.id, name: ws.data.inMemoryData.name}] }));
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
    }


    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
    }

    async update(): Promise<void> {
    }
}
