import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator'

export class Vector2 {
    static MAX_SPEED = 10;
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
}

export class InMemoryData {
    name: string = uniqueNamesGenerator({
        dictionaries: [adjectives, animals]
    })
    lobby: string = ''
    position: Vector2 = new Vector2()
    cell: string = '0x0'
}
