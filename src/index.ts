import { WebSocketData } from './model'
import { RoutesHandler } from './routes_handler'
import { WebSocketRoute } from './websocket_route'

const websocketHandler = new WebSocketRoute()
const routesHandler = new RoutesHandler()

const server = Bun.serve<WebSocketData>({
    fetch(req, server) {
        if (websocketHandler.fetch(req, server)) {
            return;
        }
        return routesHandler.fetch(req, server)
    },
    websocket: websocketHandler
});

console.log(
    `🦊 WebSocket is running at http://${server.hostname}:${server.port}`
);
