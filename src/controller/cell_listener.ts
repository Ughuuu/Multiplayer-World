import { ServerWebSocket } from "bun";
import { Vector3, WebSocketData } from "../model";

export interface CellListener {
    onCellUpdated(ws: ServerWebSocket<WebSocketData>, newCell: Vector3): Promise<void>
}
