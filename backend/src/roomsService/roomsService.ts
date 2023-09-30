import {RoomsRepository} from "../applicationServer/storages/roomsRepository";
import {Room} from "../domain/room";
import {IRoomsService} from "../contracts/roomsService";
import {RoomType} from "../../../shared/enums/roomType";
import {RoomSettingsUpdated} from "../subjects/roomSettingsUpdated";
import {Subject} from "rxjs";
import {RoomSettings} from "../domain/roomSettings";

export class RoomsService implements IRoomsService {
    private readonly roomLifetimeMinutes: number = 10;

    private removeRoomTasks: Map<string, NodeJS.Timeout> = new Map();

    constructor(
        private readonly roomsRepository: RoomsRepository,
        private readonly subject: Subject<RoomSettingsUpdated>
    ) {}

    createTemporaryRoom(roomName: string): Room {
        const newRoom = new Room(roomName, RoomType.temporary);

        this.roomsRepository.save(newRoom);
        this.scheduleDeletingRoom(newRoom.id, newRoom.name);

        this.logEvent(`room '${newRoom.name}' was created`)

        return newRoom;
    }

    createPermanentRoom(roomName: string): Room {
        const newRoom = new Room(roomName, RoomType.permanent);

        this.roomsRepository.save(newRoom);

        this.logEvent(`room '${newRoom.name}' was created`)

        return newRoom;
    }

    getRoom(roomId: string): Room | undefined {
        return this.roomsRepository.load(roomId);
    }

    deleteRoom(roomId: string): boolean {
        return this.roomsRepository.delete(roomId);
    }

    addPlayer(roomName: string, playerId: string, playerName: string): void {
        const room = this.roomsRepository.load(roomName);
        if (!room) {
            return;
        }

        room.addPlayer(playerId, playerName);
        this.unscheduleDeletingRoom(room.id, room.name);
    }

    removePlayer(roomName: string, playerId: string): boolean {
        const room = this.roomsRepository.load(roomName);

        if (!room) {
            return false;
        }

        room.removePlayer(playerId);

        if (room.isRoomEmpty()) {
            this.scheduleDeletingRoom(room.id, room.name);
        }

        return true;
    }

    updatePlayerStatus(roomName: string, playerId: string, connected: boolean): void {
        const room = this.roomsRepository.load(roomName);

        if (!room) {
            return;
        }

        return room.updateStatus(playerId, connected);
    }

    updatePlayerCard(roomName: string, playerId: string, cardValue: string): boolean {
        const room = this.roomsRepository.load(roomName);

        if (!room) {
            return false;
        }

        return room.updateCard(playerId, cardValue);
    }

    endGame(roomId: string): Room | undefined {
        const room = this.roomsRepository.load(roomId);
        if (!room) {
            return undefined;
        }

        const result = room.endGame()
        if (!result) {
            return undefined;
        }

        return room;
    }

    newGame(roomName: string): Room | undefined {
        const room = this.roomsRepository.load(roomName);
        if (!room) {
            return undefined;
        }

        const result = room.newGame();
        if (!result) {
            return undefined;
        }

        return room;
    }

    updateRoomSettings(roomId: string, roomSettings: RoomSettings): void {
        const room = this.roomsRepository.load(roomId);
        if (!room) {
            return;
        }

        room.updateRoomSettings(roomSettings);
        this.subject.next({roomId: roomId, roomSettings: roomSettings});
    }

    private scheduleDeletingRoom(roomId: string, roomName: string): boolean {
        const timeOut = setTimeout(
            (_: void) => {
                const result = this.deleteRoom(roomId);
                if (result) {
                    this.logEvent(`room '${roomName}' was deleted`);
                }
            },
            this.roomLifetimeMinutes * 60 * 1000);

        this.removeRoomTasks.set(roomId, timeOut);

        this.logEvent(`room '${roomName}' was scheduled to remove`);

        return true;
    }

    private unscheduleDeletingRoom(roomId: string, roomName: string): boolean {
        const removeTask = this.removeRoomTasks.get(roomId);

        if (!removeTask) {
            return false;
        }

        clearTimeout(removeTask);
        this.removeRoomTasks.delete(roomId);

        this.logEvent(`room '${roomName}' lifetime was prolonged`);

        return true;
    }

    private logEvent(text: string) {
        console.log(`${new Date().toISOString()}\t${text}`);
    }
}