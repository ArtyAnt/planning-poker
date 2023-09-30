import express, {Request, Response, Router} from 'express';
import {IRoomsService} from '../../contracts/roomsService';
import {Controller} from "./сontroller";
import {RoomMapper} from '../../mappings/roomMapper';
import {CreatingRoomModel} from "../../../../shared/models/creatingRoomModel";
import {RoomType} from "../../../../shared/enums/roomType";
import {RoomSettingsModel} from "../../../../shared/models/roomSettingsModel";

export class RoomsController implements Controller {
    private readonly router: Router

    constructor(private roomsService: IRoomsService, private roomMapper: RoomMapper) {
        this.router = express.Router();
        this.bindRoutes();
    }

    bind(): Router {
        return this.router;
    }

    private bindRoutes() {
        this.router.route('/').post(async (req: Request, res: Response) => await this.createNewRoom(req, res))
        this.router.route('/:roomId').get((req: Request, res: Response) => this.getRoom(req, res));
        this.router.route('/:roomId/settings').post((req: Request, res: Response) => this.updateRoomSettings(req, res));
    }

    private async createNewRoom(req: Request, res: Response) {
        let creatingRoomModel: CreatingRoomModel = req.body;

        const newRoom = creatingRoomModel.type === RoomType.permanent
            ? this.roomsService.createPermanentRoom(creatingRoomModel.name)
            : this.roomsService.createTemporaryRoom(creatingRoomModel.name);

        const roomModel = this.roomMapper.mapToModel(newRoom);
        res.send(roomModel);
    }

    private getRoom(req: Request, res: Response) {
        const roomId = req.params["roomId"];
        const room = this.roomsService.getRoom(roomId);
        if (!room) {
            res.sendStatus(404);
            return;
        }

        const roomModel = this.roomMapper.mapToModel(room);
        res.send(roomModel);
    }

    private updateRoomSettings(req: Request, res: Response) {
        const roomId = req.params["roomId"];
        const room = this.roomsService.getRoom(roomId);
        if (!room) {
            res.sendStatus(404);
            return;
        }

        let settingsModel: RoomSettingsModel = req.body;
        const settings = this.roomMapper.mapToSettingsModel(settingsModel);

        console.log(settings);

        this.roomsService.updateRoomSettings(roomId, settings);

        res.sendStatus(200);
    }
}