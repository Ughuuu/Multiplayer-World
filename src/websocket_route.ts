import { Server, ServerWebSocket, WebSocketHandler } from "bun"
import { MessageData, WebSocketData } from "./model"
import { ChatController, WebsocketController, NameController, DataController, MovementController, RoomController } from './controller'

export class WebSocketRoute implements WebSocketHandler<WebSocketData>{
    server: Server | undefined
    websocketControllers: WebsocketController<WebSocketData>[] = []

    constructor() {
    }
    // handle websocket upgrade
    fetch(req: Request, server: Server) {
        if (this.websocketControllers.length === 0) {
            this.createControllers(server)
        }
        if (server.upgrade(req, {
            data: new WebSocketData(this.websocketControllers),
        })) {
            return false;
        }
        return true
    }
    async message(ws: ServerWebSocket<WebSocketData>, message: string) {
        for (const controller of this.websocketControllers) {
            controller.message(ws, JSON.parse(message) as MessageData)
        }
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        ws.subscribe("global");
        for (const controller of this.websocketControllers) {
            controller.open(ws)
        }
    }
    async close(ws: ServerWebSocket<WebSocketData>, code: number, reason: string) {
        ws.unsubscribe("global");
        for (const controller of this.websocketControllers) {
            controller.close(ws)
        }
    }

    createControllers(server: Server) {
        const dataController = new DataController(server)
        const nameController = new NameController(dataController)
        const chatController = new ChatController(dataController)
        const roomController = new RoomController(dataController)
        const movementController = new MovementController(server, dataController, [roomController, nameController])
        this.websocketControllers.push(dataController)
        this.websocketControllers.push(roomController)
        this.websocketControllers.push(nameController)
        this.websocketControllers.push(movementController)
        this.websocketControllers.push(chatController)
    }
}
