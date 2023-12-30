export enum MessageType {
    // data: {x: number, y: number}
    Receive_Movement_Position = "user_position",
    // data: {message: string, room: string}
    Receive_Chat_Message = "chat_message",
    // data: {message: string, room: string}
    Receive_Room_Join = "room_join",
    // data: string
    Receive_Name = "user_name",
}

export interface MessageData {
    type: MessageType
    data: any
}
