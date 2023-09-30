import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {RoomModel} from '../../../../../../shared/models/roomModel';
import {PokerPlayerModel} from "../../../../../../shared/models/pokerPlayerModel";
import {Player} from "src/features/poker-room/models/player";
import {EventService} from "src/lib/services/eventService";
import {Subscription} from "rxjs";
import {StorageService} from "src/features/poker-room/services/storageService";
import {GetNameDialogComponent} from "../get-name-dialog/get-name-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {CoordinateCalculator} from "src/features/poker-room/services/coordinateCalculator";
import {Game} from "src/features/poker-room/models/game";
import {v4 as uuid} from 'uuid';
import {EndGameTimerComponent} from "../end-game-timer/end-game-timer.component";
import {AppConfig, Paths} from "../../../../app/app.config";
import {Router} from "@angular/router";
import {RoomSettings} from "../../models/roomSettings";
import {PokerKeyboardComponent} from "../poker-keyboard/poker-keyboard.component";

@Component({
    selector: 'poker-desk',
    styleUrls: ['./poker-desk.component.scss'],
    templateUrl: './poker-desk.component.html'
})
export class PokerDeskComponent implements OnInit, OnDestroy {
    @ViewChild(EndGameTimerComponent, {static: false})
    private endGameTimer: EndGameTimerComponent | undefined;

    @ViewChild(PokerKeyboardComponent, {static: false})
    private keyboard: PokerKeyboardComponent | undefined;

    @Input() roomId: string = "";

    onFirework: boolean = false;
    onMinMaxHighlight: boolean = false;

    players: Map<string, Player> = new Map();
    game = new Game();
    initialized = false;
    roomSettings = new RoomSettings();

    public get nobodyVoted(): boolean {
        let nobody = true;
        this.players.forEach((player: Player) => {
            nobody = nobody && !player.pickedCard
        })

        return nobody;
    }

    public get connected() {
        return this.eventService.connected
    }

    private subscriptions: Subscription[] = []
    private coordinateCalculator;

    public readonly currentPlayerId: string;

    constructor(
        private readonly eventService: EventService,
        private readonly localService: StorageService,
        private readonly matDialog: MatDialog,
        private readonly router: Router,
    ) {
        this.currentPlayerId = this.localService.getData("planningPokerId") ?? uuid()
        this.localService.saveData("planningPokerId", this.currentPlayerId);

        this.coordinateCalculator = new CoordinateCalculator(200);
    }

    endGame() {
        this.eventService.endGame(this.roomId);
    }

    newGame() {
        this.eventService.newGame(this.roomId);
    }

    ngOnInit() {
        let userName = this.localService.getData("planningPokerUserName");
        if (!userName || userName == 'undefined'){
            userName = ""
        }

        let dialog = this.matDialog.open(
            GetNameDialogComponent,
            {
                data: {name: userName},
                width: '400px',
                height: '200px',
                panelClass: "dialog-window"
            });

        dialog.afterClosed().subscribe(async (newUserName) => {
            this.localService.saveData("planningPokerUserName", newUserName);

            await this.updatePokerRoom();

            this.subscriptions.push(
                this.eventService.joinPlayerEvent.subscribe(async joinedPlayer => {
                    this.players.set(joinedPlayer.id, new Player(joinedPlayer.id, joinedPlayer.name, true))
                    this.updateCoordinates();

                    if (joinedPlayer.id === this.currentPlayerId) {
                        await this.updatePokerRoom();
                        this.initialized = true;
                    }
                }));

            this.subscriptions.push(
                this.eventService.leavePlayerEvent.subscribe(playerId => {
                    this.players.delete(playerId)
                }));

            this.subscriptions.push(
                this.eventService.endGameEvent.subscribe(room => {
                    this.endGameTimer!.start();

                    this.game = {inGame: room.game.inGame, result: room.game.result}

                    this.updatePlayers(room.players);
                }));

            this.subscriptions.push(
                this.eventService.newGameEvent.subscribe(_ => {
                    this.game.inGame = true;
                }));

            this.subscriptions.push(
                this.eventService.roomSettingsUpdatedEvent.subscribe(data => {
                    this.roomSettings.minMaxHighlight = data.minMaxHighlight;
                })
            )

            this.subscriptions.push(
                this.eventService.connectEvent.subscribe(async _ => {
                    this.eventService.connectReply(this.currentPlayerId);
                    await this.updatePokerRoom();
                    if (!this.players.get(this.currentPlayerId)){
                        this.eventService.joinPlayer(this.currentPlayerId, newUserName, this.roomId);
                        this.keyboard!.resetCards()
                    }
                }));

            this.eventService.joinPlayer(this.currentPlayerId, newUserName, this.roomId);
        })
    }

    ngOnDestroy() {
        this.eventService.leave(this.currentPlayerId, this.roomId);

        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    @HostListener('window:beforeunload', [ '$event' ])
    beforeUnloadHandler(event: Event) {
        this.eventService.leave(this.currentPlayerId, this.roomId);
    }

    private updatePlayers(players: PokerPlayerModel[], ignoreFirework?: boolean): void {
        let nearAverage = true;

        let votersNumber = 0;
        players.forEach(x => {
            const player = this.players.get(x.id)!;

            player.cardValue = x.cardValue ?? "";
            const parsedCardValue = parseInt(player.cardValue);
            if (parsedCardValue) {
                votersNumber += 1;

                if (parsedCardValue !== this.game.result) {
                    nearAverage = false;
                }
            }

            player.isMin = x.isMin;
            player.isMax = x.isMax;
        });

        if (votersNumber < 2) {
            nearAverage = false;
        }

        this.onFirework = nearAverage && !ignoreFirework;

        this.onMinMaxHighlight = !nearAverage && votersNumber > 1 && this.roomSettings.minMaxHighlight;
    }

    private async updatePokerRoom(): Promise<void> {
        const response = await fetch(
            `${AppConfig.host}/api/${Paths.rooms}/${this.roomId}`,
            {
                method: "GET"
            });

        if (response.status != 200) {
            await this.router.navigate([''])
            return
        }

        const model: RoomModel = await response.json()

        this.players.clear();

        model.players.forEach((model: PokerPlayerModel) => {
            const player = new Player(model.id, model.name, model.connected)
            player.pickedCard = model.pickedCard;

            this.players.set(model.id, player);
        })

        this.updateCoordinates();

        this.game = {inGame: model.game.inGame, result: model.game.result}
        this.roomSettings.minMaxHighlight = model.settings.minMaxHighlight

        if (!this.game.inGame) {
            this.updatePlayers(model.players, true);
        }
    }

    private updateCoordinates(): void {
        if (!this.players) {
            return;
        }

        const angleStep = 360 / this.players.size;
        let currentAngle = 0;

        this.players.forEach((player) => {
            player.coordinate = this.coordinateCalculator.calculateCoordinate(currentAngle);
            currentAngle += angleStep;
        });
    }
}
