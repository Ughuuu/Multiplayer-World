import { RedisClientType, SchemaFieldTypes } from "redis";
import { WebsocketController } from "../controller/websocket_controller";
import { InMemoryData } from "./in_memory_data";
import { createClient } from 'redis';

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
    id: string = randomSecret(256)
    inMemoryData: InMemoryData = new InMemoryData()
    controllers: WebsocketController<WebSocketData>[]

    constructor(controllers: WebsocketController<WebSocketData>[]) {
        this.controllers = controllers
    }
};


export class MessageData {
    type: MessageType = MessageType.Movement_Position
    data: any
}

export enum MessageType {
    Movement_Position = 0,
    Chat_Message,
    MatchMaking_Join,
    MatchMaking_Id,
    MatchMaking_PeerConnected,
    MatchMaking_PeerDisconnected,
    MatchMaking_Offer,
    MatchMaking_Answer,
    MatchMaking_Candidate,
    MatchMaking_Seal,
}

export enum ReturnType {
    Initial_Info = 0,
    Chat,
    Positions,
    Stats_Count,
}
