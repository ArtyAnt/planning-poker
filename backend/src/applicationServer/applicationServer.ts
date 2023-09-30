import http from "http";
import express, {Express} from 'express';

import {RoomsController} from './controllers/roomsController';

export class ApplicationServer {
    httpServer: http.Server;

    constructor(
        private roomsController: RoomsController,
    ) {
        const app = express();

        this.configureApp(app);
        this.addControllers(app);

        this.httpServer = new http.Server(app);
    }

    public run(host: string, port: number) {
        this.httpServer.listen(port, host, () => {
            console.log(`⚡️[server]: Server is running at http://${host}:${port}`);
        });
    }

    private configureApp(app: Express) {
        app.use(express.json());
        app.use(express.urlencoded({extended: true}))
    }

    private addControllers(app: Express) {
        app.use('/api/rooms', this.roomsController.bind());
    }
}