import { WebSocketData } from './model'
import { RoutesHandler } from './routes_handler'
import { WebSocketRoute } from './websocket_route'

const websocketHandler = new WebSocketRoute()
const routesHandler = new RoutesHandler()

const server = Bun.serve<WebSocketData>({
    async fetch(req, server) {
        if (await websocketHandler.fetch(req, server)) {
            return;
        }
        return await routesHandler.fetch(req, server)
    },
    websocket: {
        open(ws) {
            websocketHandler.open(ws)
        },
        message(ws, message) {
            websocketHandler.message(ws, message as string)
        },
        close(ws, code, reason) {
            websocketHandler.close(ws, code, reason)
        }
    }
});

console.log(`🦊 WebSocket is running at http://${server.hostname}:${server.port}`);
