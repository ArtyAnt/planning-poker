import {Game} from "./game";
import {PokerPlayer} from "./pokerPlayer";
import {v4 as uuid} from 'uuid';
import {RoomType} from "../../../shared/enums/roomType";
import {RoomSettings} from "./roomSettings";

export class Room {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _roomType: RoomType;
    private game: Game = new Game();
    private readonly _players: Map<string, PokerPlayer> = new Map();
    private _settings: RoomSettings = new RoomSettings();

    get id(): string {
        return this._id
    }

    get name(): string {
        return this._name;
    }

    get inGame(): boolean {
        return this.game.inGame;
    }

    get players(): PokerPlayer[] {
        return Array.from(this._players.values())
    }

    get settings(): RoomSettings {
        return this._settings
    }

    constructor(roomName: string, roomType: RoomType, id?: string) {
        this._id = id ?? uuid();
        this._name = roomName;
        this._roomType = roomType;
    }

    addPlayer(playerId: string, playerName: string) {
        this._players.set(playerId, new PokerPlayer(playerId, playerName));
    }

    removePlayer(playerId: string) {
        this._players.delete(playerId);
    }

    isRoomEmpty(): boolean {
        return this._players.size == 0;
    }

    isPlayerPickMaxCard(playerId: string): boolean {
        return this.game.maxPlayerIds.has(playerId);
    }

    isPlayerPickMinCard(playerId: string): boolean {
        return this.game.minPlayerIds.has(playerId);
    }

    getResult(): number {
        return this.game.result;
    }

    updateStatus(playerId: string, connected: boolean) {
        const player = this._players.get(playerId);
        if (!player) {
            return;
        }

        player.connected = connected;
    }

    updateCard(playerId: string, cardValue: string): boolean {
        const player = this._players.get(playerId);
        if (!player) {
            throw new Error("Player not found");
        }

        this.removePlayerFromMin(player.id);
        this.removePlayerFromMax(player.id);

        let state = CardState.unpicked;
        if (player.cardValue && cardValue !== player.cardValue || !player.cardValue) {
            state = CardState.picked
        }

        if (state == CardState.unpicked) {
            player.cardValue = "";

            return false
        }

        player.cardValue = cardValue;

        const playerCardValue = parseInt(player.cardValue);
        if (!playerCardValue) {
            return true;
        }

        this.updateMinCardValuePlayer(player.id, playerCardValue)
        this.updateMaxCardValuePlayer(player.id, playerCardValue)

        return true;
    }

    updateRoomSettings(roomSettings: RoomSettings) {
        this._settings = roomSettings;
    }

    private removePlayerFromMin(playerId: string) {
        const result = this.game.minPlayerIds.delete(playerId);

        if (!result) {
            return;
        }

        if (this.game.minPlayerIds.size) {
            return;
        }

        this.game.minCardValue = Number.MAX_VALUE;
        for (let player of this._players.values()) {
            const cardValue = parseInt(player.cardValue);
            if (!cardValue) {
                continue;
            }

            this.updateMinCardValuePlayer(player.id, cardValue)
        }
    }

    private updateMinCardValuePlayer(playerId: string, cardValue: number) {
        if (this.game.minCardValue > cardValue) {

            this.game.minCardValue = cardValue;
            this.game.minPlayerIds.clear();
            this.game.minPlayerIds.add(playerId);

            return;
        }
        if (this.game.minCardValue == cardValue) {

            this.game.minPlayerIds.add(playerId);
        }
    }

    private removePlayerFromMax(playerId: string) {
        const result = this.game.maxPlayerIds.delete(playerId);

        if (!result) {
            return;
        }

        if (this.game.maxPlayerIds.size) {
            return;
        }

        this.game.maxCardValue = -1;
        for (let player of this._players.values()) {
            const cardValue = parseInt(player.cardValue);
            if (!cardValue) {
                continue;
            }

            this.updateMaxCardValuePlayer(player.id, cardValue)
        }
    }

    private updateMaxCardValuePlayer(playerId: string, cardValue: number) {
        if (this.game.maxCardValue < cardValue) {

            this.game.maxCardValue = cardValue;
            this.game.maxPlayerIds.clear();
            this.game.maxPlayerIds.add(playerId);

            return;
        }
        if (this.game.maxCardValue == cardValue) {

            this.game.maxPlayerIds.add(playerId);
        }
    }

    endGame(): boolean {
        if (!this.game.inGame) {
            return false;
        }

        this.game.inGame = false;

        this.leaveOneRandom(this.game.maxPlayerIds);

        const excludeId = this.game.maxPlayerIds.size === 1
            ? [...this.game.maxPlayerIds][0]
            : undefined;
        this.leaveOneRandom(this.game.minPlayerIds, excludeId);

        this.calculateResult();

        return true;
    }

    newGame(): boolean {
        if (this.game.inGame) {
            return false;
        }

        this.game.result = 0;
        this._players.forEach(player => player.cardValue = "")
        this.game.inGame = true;

        this.game.maxCardValue = -1;
        this.game.maxPlayerIds.clear();

        this.game.minCardValue = Number.MAX_VALUE;
        this.game.minPlayerIds.clear();

        return true;
    }

    private leaveOneRandom(set: Set<string>, excludeId?: string) {
        if (set.size == 0) {
            return;
        }

        const oneRandom = this.getOneRandom(set, excludeId);
        set.clear();
        set.add(oneRandom!);
    }

    private getOneRandom(set: Set<string>, excludeId?: string) {
        if (excludeId) {
            set.delete(excludeId);
        }

        let needIndex = this.getRandomInt(set.size - 1);

        return [...set][needIndex];
    }

    private getRandomInt(max: number) {
        return Math.round(Math.random() * max);
    }

    private calculateResult() {
        let votersNumber = 0;
        this._players.forEach((player) => {
            const parsed = parseInt(player.cardValue)
            if (parsed) {
                this.game.result += parsed;
                votersNumber += 1;
            }
        })
        this.game.result /= votersNumber;
        this.game.result = Math.trunc(this.game.result * 100) / 100
    }
}

enum CardState {
    unpicked,
    picked
}