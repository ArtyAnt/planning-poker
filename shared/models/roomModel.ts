import {GameModel} from "./gameModel"
import {PokerPlayerModel} from "./pokerPlayerModel";
import {RoomSettingsModel} from "./roomSettingsModel";


export class RoomModel {
    constructor(
        public id: string,
        public name: string,
        public game: GameModel, 
        public players: PokerPlayerModel[],
        public settings: RoomSettingsModel
    ) {}
} 