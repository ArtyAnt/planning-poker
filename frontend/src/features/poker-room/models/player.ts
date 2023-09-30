import {Coordinate} from "./coordinate";

export class Player {
    coordinate: Coordinate = {x: 0, y: 0};
    cardValue: string = "";
    pickedCard: boolean = false;
    isMin: boolean = false;
    isMax: boolean = false;

    public get name() {
        if (!this._name) {
            throw new Error("Name is required");
        }

        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    constructor(public readonly id: string, public _name: string, public connected: boolean, cardValue?: string) {
        this.cardValue = cardValue ?? "";
    }
}