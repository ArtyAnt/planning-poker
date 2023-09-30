import {RoomType} from "../enums/roomType";

export class CreatingRoomModel {
    constructor(
        public readonly name: string,
        public readonly type: RoomType) {}
}
