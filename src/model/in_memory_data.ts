import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator'
import { Vector3 } from "./vector3";

const ALFNUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function randomInt(low: number, high: number) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

export function randomSecret(length: number) {
    let out = '';
    for (let i = 0; i < length; i++) {
        out += ALFNUM[randomInt(0, ALFNUM.length - 1)];
    }
    return out;
}

export class InMemoryData {
    name: string = uniqueNamesGenerator({
        dictionaries: [adjectives, animals]
    })
    position: Vector3 = new Vector3()
    room: string = ""
}
