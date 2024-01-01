import { Server } from "bun";

export class RoutesHandler {

    constructor() {
    }

    async fetch(req: Request, server: Server) {
        let filePath = new URL(req.url).pathname;
        const publicFolder = "."
        if (filePath == "/") {
            filePath = "/index.html";
        }
        let response = new Response(Bun.file(publicFolder + filePath))
        response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
        response.headers.set("Cross-Origin-Embedder-Policy", "require-corp")
        return response
    }
}
