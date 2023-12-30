import { RedisClientType, createClient } from "redis";
import { Server, ServerWebSocket } from "bun";
import { MessageData, WebSocketData } from "../model";
import { WebsocketController } from "./websocket_controller";

export const UPDATE_INTERVAL = parseInt(process.env.UPDATE_INTERVAL || '50')
export class DataController implements WebsocketController<WebSocketData> {
    readonly server: Server
    readonly redisClient: RedisClientType
    readonly properties = ["name", "position", "room", "lobby"]
    constructor(server: Server) {
        this.server = server
        this.redisClient = createClient({
            url: process.env.REDIS_URL,
            password: process.env.REDIS_PASSWORD
        })

        setInterval(this.update.bind(this), UPDATE_INTERVAL);
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        ws.data.id = await this.getUniqueId()
        // send all data from rooms close to it
        let newData: { [key: string]: { [key: string]: string } } = {}
        for (const cell of ws.data.inMemoryData.position.getCellRooms()) {
            const cellData = await this.readData("cell", cell.toString())
            newData = { ...newData, ...cellData }
        }
        ws.send(JSON.stringify(newData));
    }
    async getUniqueId() {
        return await this.redisClient.incr("global_id")
    }
    async close(ws: ServerWebSocket<WebSocketData>) {
    }
    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
    }
    async writeCellData(ws: ServerWebSocket<WebSocketData>, property: string, value: any, permanent = false) {
        const cellString = ws.data.inMemoryData.position.toCellString()
        await this.writeData("cell", cellString, ws.data.id.toString(), property, value, permanent)
    }
    async writeRoomData(ws: ServerWebSocket<WebSocketData>, property: string, value: any, permanent = false) {
        const room = ws.data.inMemoryData.room
        await this.writeData("room", room, ws.data.id.toString(), property, value, permanent)
    }
    async writeData(prefix: string, place: string, id: string, property: string, value: any, permanent = false) {
        if (permanent) {
            await this.redisClient.hSet(`${prefix}:${place}`, `${property},${id}`, JSON.stringify(value))
        }
        await this.redisClient.hSet(`${prefix}:last:${place}`, `${property},${id}`, JSON.stringify(value))
    }
    async removeData(ws: ServerWebSocket<WebSocketData>, property: string) {
        const cellString = ws.data.inMemoryData.position.toCellString()
        await this.redisClient.hDel(`cell:${cellString}`, `${property},${ws.data.id}`)
    }
    async readData(prefix: string, place: string) {
        const data = await this.redisClient.hGetAll(`${prefix}:${place}`)
        let newData: { [key: string]: { [key: string]: string } } = {}
        for (const key in data) {
            const value = data[key]
            const split = key.split(",")
            const userId = split[1]
            const userProperty = split[0]
            newData[userId] = { ...newData[userId], [userProperty]: value }
        }
        return newData
    }

    async update(): Promise<void> {
        const cells = await this.redisClient.keys("cell:last:*")
        const rooms = await this.redisClient.keys("room:last:*")
        for (const cell of cells) {
            // we might be losing some events here possibly
            const data = await this.redisClient.hGetAll(cell)
            await this.redisClient.del(cell)
        }
        for (const room of rooms) {
            const data = await this.redisClient.hGetAll(room)
        }
        this.redisClient.getDel("global")
        //this.server.publish("global", JSON.stringify({ type: ReturnType.Send_Data, data: Object.fromEntries(this.lastData) }));
    }
}
