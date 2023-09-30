import { Room } from "../../domain/room";

export interface RoomsRepository {
    load(id: string): Room | undefined;
    save(room: Room): void;
    delete(id: string): boolean;
}