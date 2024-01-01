import { WebSocketData } from './model'
import { RoutesHandler } from './routes_handler'
import { WebSocketRoute } from './websocket_route'

const websocketHandler = new WebSocketRoute()
const routesHandler = new RoutesHandler()

const server = Bun.serve<WebSocketData>({
    async fetch(req, server) {
        if (await websocketHandler.fetch(req, server)) {
            return new Response(null);
        }
        return await routesHandler.fetch(req, server)
    },
    websocket: {
        async open(ws) {
            await websocketHandler.open(ws)
        },
        async message(ws, message) {
            await websocketHandler.message(ws, message as string)
        },
        async close(ws, code, reason) {
            await websocketHandler.close(ws, code, reason)
        }
    }
});

websocketHandler.createControllers(server)

console.log(`🦊 WebSocket is running at http://${server.hostname}:${server.port}`);
