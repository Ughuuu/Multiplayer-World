import { Server, ServerWebSocket } from "bun";
import { MessageData, MessageType, ReturnType, WebSocketData } from "../model/websocket_data";
import { EXPIRE_TIME, WebsocketController } from "./websocket_controller";
import { Vector2 } from "../model/redis_data";

const MAX_SPEED = 10;
const MAX_DIST = 10;

export class RedisController implements WebsocketController<WebSocketData> {
    server: Server
    constructor(server: Server) {
        this.server = server
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        await WebSocketData.redisClient.hSet(`user:${ws.data.id}`, ws.data.redisData.toJson())
        await WebSocketData.redisClient.expire(`user:${ws.data.id}`, EXPIRE_TIME)
        ws.subscribe("global");
        ws.send(JSON.stringify({ type: ReturnType.Initial_Info, data: ws.data.redisData }));
        await this.sendInfo()
    }

    async pong(ws: ServerWebSocket<WebSocketData>) {
    }

    async close(ws: ServerWebSocket<WebSocketData>) {
        await WebSocketData.redisClient.del(`user:${ws.data.id}`)
        await this.sendInfo()
    }

    async sendInfo() {
        let infoResult = await WebSocketData.redisClient.info("keyspace")
        const regex = /keys=(\d+)/gm;

        let match;
        let sumOfKeys = 0;
        while ((match = regex.exec(infoResult)) !== null) {
            const numberOfKeys = parseInt(match[1], 10);
            sumOfKeys += numberOfKeys;
        }
        this.server.publish("global", JSON.stringify({ type: ReturnType.Stats_Count, data: sumOfKeys }));
    }

    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
        await WebSocketData.redisClient.expire(`user:${ws.data.id}`, EXPIRE_TIME)
        switch (message_data.type) {
            case MessageType.Movement_Position: {
                if (typeof (message_data.data) !== 'object' || typeof (message_data.data.x) !== 'number' || typeof (message_data.data.y) !== 'number') {
                    throw new Error('Invalid message type for position');
                }
                let newPos = new Vector2(message_data.data.x, message_data.data.y)
                if (newPos.distanceSquared(ws.data.redisData.position) > MAX_SPEED * MAX_SPEED) {
                    throw new Error(`New distance is higher than ${MAX_SPEED}`);
                }
                if (ws.data.redisData.position != message_data.data) {
                    ws.data.redisData.position = message_data.data
                    await WebSocketData.redisClient.hSet(`user:${ws.data.id}`, 'position', `${message_data.data.x}, ${message_data.data.y}`)
                }
                let results = await WebSocketData.redisClient.ft.search(`idx:users`, `@position:[${message_data.data.x} ${message_data.data.y} ${MAX_DIST} km]`)
                let result_values: any[] = results.documents.map((document: any) => document.value)
                ws.send(JSON.stringify({ type: ReturnType.Positions, data: result_values }))

            } break
        }
    }
}
