import { Server, ServerWebSocket } from "bun";
import { MessageData } from "../model/websocket_data";

export interface WebsocketController<T> {
    server: Server
    open(ws: ServerWebSocket<T>): Promise<void>;
    close(ws: ServerWebSocket<T>): Promise<void>;
    // Called for every message per socket
    message(ws: ServerWebSocket<T>, message_data: MessageData): Promise<void>;
    // Called every interval per server
    update(): Promise<void>;
}
