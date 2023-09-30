import {GameModel} from "../../../shared/models/gameModel";
import {PokerPlayerModel} from "../../../shared/models/pokerPlayerModel";
import {Room} from "../domain/room";
import {RoomModel} from "../../../shared/models/roomModel";
import {RoomSettings} from "../domain/roomSettings";
import {RoomSettingsModel} from "../../../shared/models/roomSettingsModel";

export class RoomMapper {
    mapToModel(room: Room): RoomModel {
        const game = this.mapToGameModel(room);
        const players = this.mapToPlayerModels(room);
        const settings = this.mapToSettingsModel(room.settings);
        
        return new RoomModel(room.id, room.name, game, players, settings);
    }

    mapToGameModel(room: Room): GameModel {
        const model = new GameModel();
        model.inGame = room.inGame;
        model.result = room.getResult();

        return model;
    }

    mapToPlayerModels(room: Room): PokerPlayerModel[] {
        const playerModels: PokerPlayerModel[] = [];

        for (let player of room.players) {
            const model = new PokerPlayerModel(player.id, player.name, player.connected, player.cardValue != '');

            if (!room.inGame) {

                model.cardValue = player.cardValue;

                model.isMax = room.isPlayerPickMaxCard(player.id);
                model.isMin = room.isPlayerPickMinCard(player.id);
            }

            playerModels.push(model)
        }

        return playerModels;
    }

    mapToSettingsModel(settings: RoomSettings): RoomSettingsModel {
        return new RoomSettingsModel(settings.minMaxHighlight)
    }

    mapToSettings(settings: RoomSettingsModel): RoomSettings {
        return new RoomSettings(settings.minMaxHighlight)
    }
}