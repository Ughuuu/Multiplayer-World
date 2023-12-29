import { WebsocketController } from "../controller/websocket_controller";
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator'


export class Vector2 {
    static MAX_SPEED = 500;
    static MIN_SPEED = 1e-10;
    static CELL_SIZE = 1.0/500;
    x: number
    y: number
    cell: string

    constructor(x: number = 0, y: number = 0, CELL_SIZE: number = Vector2.CELL_SIZE) {
        this.x = x
        this.y = y
        this.cell = `${Math.floor(x * CELL_SIZE)},${Math.floor(y * CELL_SIZE)}`
    }

    distanceSquared(v: Vector2) {
        return (this.x - v.x) ** 2 + (this.y - v.y) ** 2
    }

    toString(): string {
        return `${this.x},${this.y}`
    }

    toCellString(): string {
        return `${this.x},${this.y}`
    }

    getCellRooms(): Array<Vector2>{
        return [
            new Vector2(this.x,this.y),
            new Vector2(this.x-1,this.y),
            new Vector2(this.x-1,this.y-1),
            new Vector2(this.x-1,this.y+1),
            new Vector2(this.x+1,this.y),
            new Vector2(this.x+1,this.y-1),
            new Vector2(this.x+1,this.y+1),
            new Vector2(this.x,this.y-1),
            new Vector2(this.x,this.y+1)
        ]
    }
}

export class InMemoryData {
    name: string = uniqueNamesGenerator({
        dictionaries: [adjectives, animals]
    })
    position: Vector2 = new Vector2()
    lobby: string = ""
}

const ALFNUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function randomInt(low: number, high: number) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

export function randomSecret(length: number) {
    let out = '';
    for (let i = 0; i < length; i++) {
        out += ALFNUM[randomInt(0, ALFNUM.length - 1)];
    }
    return out;
}


export class WebSocketData {
    id: string = ""
    inMemoryData: InMemoryData = new InMemoryData()
    controllers: WebsocketController<WebSocketData>[]

    constructor(controllers: WebsocketController<WebSocketData>[]) {
        this.controllers = controllers
    }
};


export class MessageData {
    type: MessageType = MessageType.Receive_Movement_Position
    data: any
}

export enum MessageType {
    // data: {x: number, y: number}
    Receive_Movement_Position = "user_position",
    // data: {message: string, room: string}
    Receive_Chat_Message = "chat_message",
    // data: string
    Receive_Name = "user_name",
}
