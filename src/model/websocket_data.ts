import { WebsocketController } from "../controller/websocket_controller";
import { InMemoryData } from "./in_memory_data";

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
    id: string = randomSecret(32)
    inMemoryData: InMemoryData = new InMemoryData()
    controllers: WebsocketController<WebSocketData>[]

    constructor(controllers: WebsocketController<WebSocketData>[]) {
        this.controllers = controllers
    }
};


export class MessageData {
    type: MessageType = 0
    data: any
}

export enum MessageType {
    // data: {x: number, y: number}
    Receive_Movement_Position = 0,
    // data: {message: string, room: string}
    Receive_Chat_Message,
    // data: string
    Receive_Name,
    Receive_MatchMaking_Join,
    Receive_MatchMaking_Id,
    Receive_MatchMaking_PeerConnected,
    Receive_MatchMaking_PeerDisconnected,
    Receive_MatchMaking_Offer,
    Receive_MatchMaking_Answer,
    Receive_MatchMaking_Candidate,
    Receive_MatchMaking_Seal,
}

export enum ReturnType {
    // data: string
    Send_Id = 0,
    // data: {string: Vector2, ...}
    Send_Movement_Diff,
    // data: {id: string, message: string, room: string}
    Send_Chat_Message,
    // data: {id: string, name: string}
    Send_Name,
    Send_Join,
    Send_Left,
    Send_Stats_Count,
}
