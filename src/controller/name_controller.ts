import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, ReturnType, WebSocketData } from "../model/websocket_data";
import { WebsocketController } from "./websocket_controller";
import { Vector2 } from "../model/in_memory_data";

export class NameController implements WebsocketController<WebSocketData> {
    names = new Map<string, Map<string, string>>()
    server: Server
    constructor(server: Server) {
        this.server = server
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        // send self id
        ws.send(JSON.stringify({ type: ReturnType.Send_Id, data: ws.data.id }));
        // send current names from cells including self name
        this.sendCellData(ws, ws.data.inMemoryData.cell)
        // send name to others
        ws.publish(ws.data.inMemoryData.cell.toString(), JSON.stringify({ type: ReturnType.Send_Name, data: { [ws.data.id]: ws.data.inMemoryData.name } }))
    }

    sendCellData(ws: ServerWebSocket<WebSocketData>, oldCell: Vector2) {
        this.names.get(oldCell.toString())?.delete(ws.data.id)
        const cell = ws.data.inMemoryData.cell
        this.names.set(cell.toString(), (this.names.get(cell.toString()) || new Map<string, string>()).set(ws.data.id, ws.data.inMemoryData.name));
        //(this.names.get(ws.data.inMemoryData.cell.toString()) || new Map<string, string>()).delete(ws.data.id)
        cell.getCellRooms().forEach((cell) => {
            const cellData = this.names.get(cell.toString()) || new Map<string, Vector2>()
            if (cellData.size > 0) {
                ws.send(JSON.stringify({ type: ReturnType.Send_Name, data: Object.fromEntries(cellData) }));
            }
        }, this)
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        // remove name from map
        (this.names.get(ws.data.inMemoryData.cell.toString()) || new Map<string, string>()).delete(ws.data.id)
    }


    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        switch (message_data.type) {
            case MessageType.Receive_Name: {
                let name = message_data.data
                // renamed
                if (name !== ws.data.inMemoryData.name) {
                    ws.data.inMemoryData.name = name
                    // send update to cell
                    const cell = ws.data.inMemoryData.cell
                    ws.publish(cell.toString(), JSON.stringify({ type: ReturnType.Send_Name, data: { [ws.data.id]: ws.data.inMemoryData.name } }))
                } break
            }
        }
    }

    async update(): Promise<void> {
    }
}
