import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, ReturnType, WebSocketData } from "../model/websocket_data";
import { WebsocketController } from "./websocket_controller";

export class StatsController implements WebsocketController<WebSocketData> {
    count: number = 0
    server: Server
    constructor(server: Server) {
        this.server = server
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        this.count++
        this.sendInfo()
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        this.count--
        this.sendInfo()
    }

    sendInfo() {
        this.server.publish("global", JSON.stringify({ type: ReturnType.Send_Stats_Count, data: this.count }));
    }


    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
    }

    async update(): Promise<void> {
    }
}
