import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator'

export class Vector2 {
    static MAX_SPEED = 100;
    static MIN_SPEED = 1e-10;
    x: number
    y: number

    constructor(x: number = 0, y: number = 0) {
        this.x = x
        this.y = y
    }

    distanceSquared(v: Vector2) {
        return (this.x - v.x) ** 2 + (this.y - v.y) ** 2
    }

    toString(): string {
        return `cell-${this.x}x${this.y}`
    }

    getCellRooms(): Array<Vector2>{
        return [
            new Vector2(this.x,this.y),
            new Vector2(this.x-1,this.y),
            new Vector2(this.x-1,this.y-1),
            new Vector2(this.x-1,this.y+1),
            new Vector2(this.x+1,this.y),
            new Vector2(this.x+1,this.y-1),
            new Vector2(this.x+1,this.y+1),
            new Vector2(this.x,this.y-1),
            new Vector2(this.x,this.y+1)
        ]
    }
}

export class InMemoryData {
    name: string = uniqueNamesGenerator({
        dictionaries: [adjectives, animals]
    })
    lobby: string = ''
    position: Vector2 = new Vector2()
    cell: Vector2 = new Vector2()
}
