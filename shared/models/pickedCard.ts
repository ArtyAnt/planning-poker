export class PickedCardModel {
    public picked: boolean = false;

    constructor(
        public roomId: string,
        public playerId: string,
        public cardValue: string,
    ) {}
}
