import {Injectable} from "@angular/core";
import {Socket} from "ngx-socket-io";

import {EventNames} from "../../../../shared/constants/eventNames";
import {JoinedPlayerModel} from "../../../../shared/models/joinedPlayerModel"
import {RoomModel} from "../../../../shared/models/roomModel";
import {PickedCardModel} from "../../../../shared/models/pickedCard";
import {RoomSettingsModel} from "../../../../shared/models/roomSettingsModel";

@Injectable({
    providedIn: 'root'
})
export class EventService {
    get connected(): boolean {
        return this.socket.ioSocket.connected;
    }

    connectEvent = this.socket.fromEvent(EventNames.connect)
    playerDisconnectedEvent= this.socket.fromEvent<string>(EventNames.playerDisconnected);
    playerReconnectedEvent = this.socket.fromEvent<string>(EventNames.playerReconnected);
    joinPlayerEvent = this.socket.fromEvent<JoinedPlayerModel>(EventNames.joinPlayer);
    leavePlayerEvent = this.socket.fromEvent<string>(EventNames.leavePlayer);
    playerPickCardEvent = this.socket.fromEvent<string>(EventNames.playerPickCard);
    playerUnpickCardEvent = this.socket.fromEvent<string>(EventNames.playerUnpickCard);
    playerPickCertainCardEvent = this.socket.fromEvent<PickedCardModel>(EventNames.playerPickCertainCard);
    endGameEvent = this.socket.fromEvent<RoomModel>(EventNames.endGame);
    newGameEvent = this.socket.fromEvent(EventNames.newGame);
    roomSettingsUpdatedEvent = this.socket.fromEvent<RoomSettingsModel>(EventNames.settingsUpdated);


    constructor(private socket: Socket) {
    }

    connectReply(playerId: string): void {
        this.socket.emit(EventNames.connectReply, playerId);
    }

    joinPlayer(playerId: string, playerName: string, roomName: string) {
        const pokerPlayerEventModel = new JoinedPlayerModel(playerId, playerName, roomName);
        this.socket.emit(EventNames.joinPlayer, pokerPlayerEventModel);
    }

    pickCertainCard(playerId: string, roomName: string, cardValue: string) {
        const model = new PickedCardModel(roomName, playerId, cardValue);
        this.socket.emit(EventNames.playerPickCertainCard, model);
    }

    leave(playerId: string, roomName: string) {
        this.socket.emit(EventNames.leavePlayer, playerId, roomName);
    }

    endGame(roomId: string) {
        this.socket.emit(EventNames.endGame, roomId);
    }

    newGame(roomId: string) {
        this.socket.emit(EventNames.newGame, roomId);
    }
}