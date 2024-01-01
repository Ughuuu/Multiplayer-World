import { Server, ServerWebSocket, WebSocketHandler } from "bun"
import { MessageData, WebSocketData } from "./model"
import { ChatController, WebsocketController, NameController, DataController, MovementController, RoomController } from './controller'

export class WebSocketRoute implements WebSocketHandler<WebSocketData>{
    server: Server | undefined
    websocketControllers: WebsocketController<WebSocketData>[] = []

    constructor() {
    }
    // handle websocket upgrade
    async fetch(req: Request, server: Server) {
        if ((new URL(req.url).pathname) !== "/ws") {
            return false;
        }
        return server.upgrade(req, {
            data: new WebSocketData(this.websocketControllers),
        })
    }
    async message(ws: ServerWebSocket<WebSocketData>, message: string) {
        for (const controller of this.websocketControllers) {
            // execute messages async
            controller.message(ws, JSON.parse(message) as MessageData)
        }
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        ws.subscribe("global");
        for (const controller of this.websocketControllers) {
            await controller.open(ws)
        }
    }
    async close(ws: ServerWebSocket<WebSocketData>, code: number, reason: string) {
        ws.unsubscribe("global");
        for (const controller of this.websocketControllers) {
            controller.close(ws)
        }
    }

    async createControllers(server: Server) {
        const dataController = new DataController(server)
        await dataController.connect()
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
