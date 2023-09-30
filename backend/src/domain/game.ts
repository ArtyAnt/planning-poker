export class Game {
    inGame: boolean = true;
    result: number = 0;
    votersNumber: number = 0;

    maxPlayerIds = new Set<string>();
    maxCardValue: number = -1;

    minPlayerIds = new Set<string>();
    minCardValue: number = Number.MAX_VALUE;
}