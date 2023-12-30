export class Vector3 {
    static MAX_SPEED = 500;
    static MIN_SPEED = 1e-10;
    static CELL_SIZE = 1.0 / 1000;
    x: number
    y: number
    z: number
    // cached for performance reasons
    cell_x: number | undefined = undefined
    cell_y: number | undefined = undefined
    cell_z: number | undefined = undefined

    constructor(x: number = 0, y: number = 0, z: number = 0, CELL_SIZE: number = Vector3.CELL_SIZE) {
        this.x = x
        this.y = y
        this.z = z
    }

    distanceSquared(v: Vector3) {
        return (this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2
    }

    toString(): string {
        return `${this.x},${this.y},${this.z}`
    }

    toCellString(): string {
        if (this.cell_x === undefined) {
            this.cell_x = Math.floor(this.x * Vector3.CELL_SIZE)
            this.cell_y = Math.floor(this.x * Vector3.CELL_SIZE)
            this.cell_z = Math.floor(this.x * Vector3.CELL_SIZE)
        }
        return `${this.cell_x},${this.cell_y},${this.cell_z}`
    }

    getCellRooms(): Array<Vector3> {
        const cells = new Array(27)
        let idx = 0
        if (this.cell_x === undefined ||
            this.cell_y === undefined ||
            this.cell_z === undefined) {
            this.cell_x = Math.floor(this.x * Vector3.CELL_SIZE)
            this.cell_y = Math.floor(this.x * Vector3.CELL_SIZE)
            this.cell_z = Math.floor(this.x * Vector3.CELL_SIZE)
        }
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    cells[idx] = (new Vector3(this.cell_x + dx, this.cell_y + dy, this.cell_z + dz));
                    cells[idx].cell_x = cells[idx].x
                    cells[idx].cell_y = cells[idx].y
                    cells[idx].cell_z = cells[idx].z
                    idx++
                }
            }
        }
        return cells
    }
}
