export enum MessageType {
    // data: {x: number, y: number}
    Receive_Movement_Position = "position",
    // data: {message: string, room: string}
    Receive_Chat_Message = "chat",
    // data: {message: string, room: string}
    Receive_Room_Join = "room_join",
    // data: string
    Receive_Name = "name",
}

export interface MessageData {
    type: MessageType
    data: any
}
