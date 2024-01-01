export enum MessageType {
    // data: {x: number, y: number}
    Receive_Movement_Position = "p",
    // data: {message: string, room: string}
    Receive_Chat_Message = "c",
    // data: {message: string, room: string}
    Receive_Room_Join = "room_join",
    // data: string
    Receive_Name = "n",
}

export interface MessageData {
    type: MessageType
    data: any
}
