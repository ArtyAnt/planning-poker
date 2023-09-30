import {Subject} from 'rxjs';

import {SocketServer} from './socketServer/socketServer';
import {IRoomsService} from './contracts/roomsService';
import {RoomsService} from './roomsService/roomsService';
import {RoomsController} from './applicationServer/controllers/roomsController';
import {RoomMapper} from './mappings/roomMapper';
import {ApplicationServer} from './applicationServer/applicationServer';
import {RoomsRepository} from './applicationServer/storages/roomsRepository';
import {InMemoryRoomsRepository} from './applicationServer/storages/inMemoryRoomsRepository';
import {RoomSettingsUpdated} from "./subjects/roomSettingsUpdated";

const subject = new Subject<RoomSettingsUpdated>();
const roomsRepository: RoomsRepository = new InMemoryRoomsRepository();
const roomsService: IRoomsService = new RoomsService(roomsRepository, subject);
const mapper = new RoomMapper();

const roomsController = new RoomsController(roomsService, mapper);

const httpServer = new ApplicationServer(roomsController);
new SocketServer(mapper, roomsService, httpServer, subject);

httpServer.run("0.0.0.0", 8000);
