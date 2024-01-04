import { MessageType } from "./model";

const maxSockets = 20
//const url = 'ws://0.0.0.0:6000/ws'
const url = 'wss://world.appsinacup.com/ws'
const maxRetries = 500
let connecting = true

let probability = 0.1


function connectToServer(url: string, idx: number = 0, socketArray: WebSocket[]) {
    let socket = new WebSocket(url);
    socketArray[idx] = socket
    return socket
}


async function waitForSockets(socketArray: WebSocket[]) {
    console.log("Waiting sockets")
    let maxConnectionRetry = maxRetries
    for (const socket of socketArray) {
        if (maxConnectionRetry <= 0) {
            throw new Error('Timed out waiting for socket to open');
        }
        if (socket.readyState !== WebSocket.OPEN) {
            await new Promise(resolve => setTimeout(resolve, 100));
            process.stdout.write('z')
            maxConnectionRetry--
            continue
        }
        process.stdout.write('.')
    }
    console.log("")
}


const socketArray: WebSocket[] = []
console.log("Creating sockets")
for (let i = 0; i < maxSockets; i++) {
    process.stdout.write('.')
    connectToServer(url, i, socketArray)
}
console.log("")


function sendPosition(sockets: WebSocket[]) {
    let iterations = 0
    for (const socket of sockets) {
        if (Math.random() > probability) {
            continue
        }
        iterations++
        if (socket.readyState !== WebSocket.OPEN) {
            throw new Error('Timed out waiting for socket to open');
        }
        socket.send(JSON.stringify({ type: MessageType.Receive_Movement_Position, data: {x: Math.random() * 2000 - 1000, y: Math.random() * 2000 - 1000} }))
    }
    return iterations
}
function sendChat(sockets: WebSocket[]) {
    let iterations = 0
    for (const socket of sockets) {
        if (Math.random() > probability) {
            continue
        }
        iterations++
        if (socket.readyState !== WebSocket.OPEN) {
            throw new Error('Timed out waiting for socket to open');
        }
        socket.send(JSON.stringify({ type: MessageType.Receive_Chat_Message, data: {message: "testMe" + Math.random(), room: "current_cell"} }))
    }
    return iterations
}

await waitForSockets(socketArray)
connecting = false
let average = 0
while(true) {
    let iterations = 0
    iterations += sendPosition(socketArray)
    iterations += sendChat(socketArray)
    average += iterations

    console.log(`Sent ${iterations}/25ms messages`)
    // wait 25ms
    await new Promise(resolve => setTimeout(resolve, 25));
}

export { };

