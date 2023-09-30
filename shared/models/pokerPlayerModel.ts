export class PokerPlayerModel {
    cardValue: string = "";
    isMin: boolean = false;
    isMax: boolean = false;

    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly connected: boolean,
        public readonly pickedCard: boolean = false,
        ) {
    }
}
