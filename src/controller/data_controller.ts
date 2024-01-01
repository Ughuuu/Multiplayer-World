import { RedisClientType, TimeSeriesDuplicatePolicies, createClient } from "redis";
import { Server, ServerWebSocket } from "bun";
import { MessageData, Vector3, WebSocketData } from "../model";
import { WebsocketController } from "./websocket_controller";

type StreamData = {
    [key in 'id' | 'property' | 'value']: string;
};

function floatToHex(floatNumber: number) {
    var floatArray = new Float32Array(1);
    floatArray[0] = floatNumber;
    var int32View = new Int32Array(floatArray.buffer);
    return int32View[0].toString(16);
}

function hexToFloat(hexString: string) {
    var int32Value = parseInt(hexString, 16);
    var floatArray = new Float32Array(new Int32Array([int32Value]).buffer);
    return floatArray[0];
}

export const UPDATE_INTERVAL_MS = parseInt(process.env.UPDATE_INTERVAL_MS || '50')
export class DataController implements WebsocketController<WebSocketData> {
    readonly server: Server
    readonly redisClient: RedisClientType
    readonly properties = ["name", "position", "room", "lobby"]
    readonly MAX_DATA_AGE_MS: number
    lastTime: number = Date.now()
    constructor(server: Server) {
        this.server = server
        this.redisClient = createClient({
            url: process.env.REDIS_URL,
            password: process.env.REDIS_PASSWORD
        })
        this.redisClient.on('error', (err) => console.log('Redis Client Error', err))
        this.MAX_DATA_AGE_MS = parseInt(process.env.MAX_DATA_AGE_MS || '10000')

        setInterval(this.update.bind(this), UPDATE_INTERVAL_MS);
    }
    async connect() {
        await this.redisClient.connect()
    }
    async open(ws: ServerWebSocket<WebSocketData>) {
        let time = Date.now()
        ws.data.id = await this.getUniqueId()
        // send all data from rooms close to it
        let newData: { [key: string]: { [key: string]: string } } = {}
        for (const cell of ws.data.inMemoryData.position.getCellRooms()) {
            const cellData = await this.readData("cell", cell.toCellString())
            newData = { ...newData, ...cellData }
        }
        // empty id object means self id
        ws.send(JSON.stringify({[ws.data.id]: {}}))
        ws.send(JSON.stringify(newData))
        this.writePerformance(Date.now() - time, "data_controller", "open")

    }

    async writePerformance(time: number, file: string, func: string) {
        //await this.redisClient.ts.create(`performance:${file}:${func}`)
        await this.redisClient.ts.add(`performance:${file}:${func}`, Date.now(), time, {
            ON_DUPLICATE: TimeSeriesDuplicatePolicies.MAX,
            RETENTION: 10000,
        })
    }

    async getUniqueId() {
        return await this.redisClient.incr("global_id")
    }
    async close(ws: ServerWebSocket<WebSocketData>) {
    }
    async message(ws: ServerWebSocket<WebSocketData>, message_data: MessageData) {
    }
    async writeCellData(position: Vector3, id: number, property: string, value: string = "", permanent = false) {
        const cellString = position.toCellString()
        await this.writeData("cell", cellString, id.toString(), property, value, permanent)
    }
    async writeCellDataHex(ws: ServerWebSocket<WebSocketData>, property: string, value: number = 0, permanent = false) {
        const cellString = ws.data.inMemoryData.position.toCellString()
        await this.writeData("cell", cellString, ws.data.id.toString(), property, floatToHex(value), permanent)
    }
    async writeRoomData(ws: ServerWebSocket<WebSocketData>, property: string, value: string, permanent = false) {
        const room = ws.data.inMemoryData.room
        await this.writeData("room", room, ws.data.id.toString(), property, value, permanent)
    }
    async writeData(prefix: string, place: string, id: string, property: string, value: string, permanent = false) {
        if (permanent) {
            await this.redisClient.hSet(`${prefix}:${place}`, `${property},${id}`, JSON.stringify(value))
        }
        await this.redisClient.xAdd(`${prefix}:last:${place}`, '*', { id: id, property: property, value: value })
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
            newData[userId] = { ...newData[userId], [userProperty]: JSON.parse(value) }
        }
        return newData
    }

    async update() {
        let time = Date.now()
        if (!this.redisClient.isReady) {
            return
        }
        let lastTime = this.lastTime
        let timeNow = Date.now()
        this.lastTime = timeNow

        const cells = await this.redisClient.keys("cell:last:*")
        this.writePerformance(Date.now() - time, "data_controller", "update:keys")
        let promises = []
        for (const cell of cells) {
            let timeCell = Date.now()
            promises.push(this.redisClient.xRange(cell, lastTime.toString(), timeNow.toString()).then((results) => {
                this.writePerformance(Date.now() - timeCell, "data_controller", "update:xRange")
                let cellResults: { [x: string]: { [key: string]: string } } = {}
                for (const result of results) {
                    let streamData = result.message as StreamData
                    let key = streamData.id
                    cellResults[key] = { ...cellResults[key], [streamData.property]: streamData.value }
                }
                if (Object.keys(cellResults).length > 0) {
                    const split = cell.split(":")
    
                    let channel = `[${split[2]},${split[3]},${split[4]}]`
                    this.server.publish(channel, JSON.stringify(cellResults));
                }
            }))
        }
        await Promise.all(promises)
        this.writePerformance(Date.now() - time, "data_controller", "update")
        // after sending the data, trim entries older than 10 seconds
        for (const cell of cells) {
            await this.redisClient.xTrim(cell, 'MINID', this.lastTime - this.MAX_DATA_AGE_MS, {
                strategyModifier: '~'
            })
        }
    }
}
