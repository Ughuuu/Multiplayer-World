import { WebsocketController } from "../controller/websocket_controller";
import { InMemoryData } from "./in_memory_data";

export class WebSocketData {
    id: number = -1
    inMemoryData: InMemoryData = new InMemoryData();
    controllers: WebsocketController<WebSocketData>[]

    constructor(controllers: WebsocketController<WebSocketData>[]) {
        this.controllers = controllers
    }
};
