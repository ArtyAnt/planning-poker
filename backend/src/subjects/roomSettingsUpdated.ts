import {RoomSettings} from "../domain/roomSettings";

export class RoomSettingsUpdated {
    constructor(
        public roomId: string,
        public roomSettings: RoomSettings
    ) {}
}