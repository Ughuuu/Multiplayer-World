import { Server, ServerWebSocket } from "bun";
import { MessageData } from "../model/websocket_data";

export const EXPIRE_TIME = 60 * 5

export interface WebsocketController<T> {
    server: Server
    open(ws: ServerWebSocket<T>): Promise<void>;
    close(ws: ServerWebSocket<T>): Promise<void>;
    message(ws: ServerWebSocket<T>, message_data: MessageData): Promise<void>;
}
