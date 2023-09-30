import {Room} from "../domain/room";
import {RoomSettings} from "../domain/roomSettings";

export interface IRoomsService {
    createTemporaryRoom(roomName: string): Room;
    createPermanentRoom(roomName: string): Room;

    getRoom(roomId: string): Room | undefined;
    deleteRoom(roomId: string): boolean;

    addPlayer(roomId: string, playerId: string, playerName: string): void;
    removePlayer(roomId: string, playerId: string): boolean;

    updatePlayerStatus(roomId: string, playerId: string, connected: boolean): void;
    updatePlayerCard(roomId: string, playerId: string, cardValue: string): boolean;

    endGame(roomId: string): Room | undefined;
    newGame(roomId: string): Room | undefined;

    updateRoomSettings(roomId: string, settings: RoomSettings): void;
}
