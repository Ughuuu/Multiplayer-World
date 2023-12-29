import { ServerWebSocket } from "bun";
import { MessageData } from "../model/websocket_data";

export interface WebsocketController<T>{
    open(ws: ServerWebSocket<T>): Promise<void>;
    close(ws: ServerWebSocket<T>): Promise<void>;
    // Called for every message per socket
    message(ws: ServerWebSocket<T>, message_data: MessageData): Promise<void>;
}
