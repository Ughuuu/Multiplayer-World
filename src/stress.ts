import { MessageType, ReturnType } from "./model/websocket_data";

const maxSockets = 100
//const url = 'ws://0.0.0.0:3000'
const url = 'wss://world.appsinacup.com'
const maxRetries = 200
const iterationTimes = 100
let connecting = true
let chatReceived = 0
let moveReceived = 0


function connectToServer(url: string, idx: number = 0, socketArray: WebSocket[]) {
    let socket = new WebSocket(url);
    socketArray[idx] = socket
    socket.addEventListener('close', () => {
        if (connecting) {
            process.stdout.write('r')
            socketArray[idx] = new WebSocket(url)
        } else {
            throw new Error('Timed out waiting for socket to open');
        }
    });
    socket.addEventListener('open', () => {
    });

    socket.addEventListener('message', (event) => {
        let dataReturn = JSON.parse(event.data)
        let messageType = dataReturn["type"] as ReturnType
        switch (messageType) {
            case ReturnType.Send_Chat_Message: {
                chatReceived++
            }break
            case ReturnType.Send_Movement: {
                moveReceived++
            }break
        }
    });
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
    moveReceived = 0
    for (const socket of sockets) {
        socket.send(JSON.stringify({ type: MessageType.Receive_Movement_Position, data: {x: Math.random(), y: Math.random()} }))
    }
}
function sendChat(sockets: WebSocket[]) {
    chatReceived = 0
    for (const socket of sockets) {
        socket.send(JSON.stringify({ type: MessageType.Receive_Chat_Message, data: {message: "testMe" + Math.random(), room: "global"} }))
    }
}

async function validateChat() {
    let start = performance.now()
    sendChat(socketArray)
    let maxValidationRetries = maxRetries
    while (maxValidationRetries >= 0) {
        maxValidationRetries--
        if (chatReceived >= maxSockets * maxSockets) {
            break
        }
        await new Promise(resolve => setTimeout(resolve, 1));
    }
    return performance.now() - start
}

async function validateMove() {
    sendPosition(socketArray)
    let start = performance.now()
    let maxValidationRetries = maxRetries
    while (maxValidationRetries >= 0) {
        maxValidationRetries--
        if (moveReceived >= maxSockets) {
            break
        }
        await new Promise(resolve => setTimeout(resolve, 5));
    }
    return performance.now() - start
}

await waitForSockets(socketArray)
connecting = false
let chatDelayTotal = 0
let moveDelayTotal = 0
let chatDelayMax = 0
let chatDelayMin = Infinity
let moveDelayMax = 0
let moveDelayMin = Infinity
for (let i = 0; i < iterationTimes; i++) {
    const moveDelay = await validateMove()
    moveDelayTotal += moveDelay
    moveDelayMax = Math.max(moveDelay, moveDelayMax)
    moveDelayMin = Math.min(moveDelay, moveDelayMin)
    console.log(`MoveDelay ${moveDelay} ms`)
}
// Skip chat perf for now
/*
for (let i = 0; i < iterationTimes; i++) {
    const chatDelay = await validateChat()
    chatDelayTotal += chatDelay
    chatDelayMax = Math.max(chatDelay, chatDelayMax)
    chatDelayMin = Math.min(chatDelay, chatDelayMin)
    console.log(`ChatDelay ${chatDelay} ms`)
}
*/

console.log("Chat Average: " + chatDelayTotal / iterationTimes)
console.log("Move Average: " + moveDelayTotal / iterationTimes)
console.log("Chat Max: " + chatDelayMax)
console.log("Chat Min: " + chatDelayMin)
console.log("Move Max: " + moveDelayMax)
console.log("Move Min: " + moveDelayMin)

export { };

