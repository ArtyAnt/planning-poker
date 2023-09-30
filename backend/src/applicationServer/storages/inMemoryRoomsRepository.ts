import { Room } from "../../domain/room";
import { RoomsRepository } from "./roomsRepository";

export class InMemoryRoomsRepository implements RoomsRepository {
    private readonly _rooms: Map<string, Room>;
    
    constructor() {
        this._rooms = new Map();
    }

    load(id: string): Room | undefined {
        return this._rooms.get(id);
    }
    
    save(room: Room): void {
        this._rooms.set(room.id, room);
    }

    delete(id: string): boolean {
        return this._rooms.delete(id);
    }
}