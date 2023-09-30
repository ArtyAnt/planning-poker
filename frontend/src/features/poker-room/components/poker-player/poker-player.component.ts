import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {Player} from "../../models/player";
import {Subscription} from "rxjs";
import {EventService} from "../../../../lib/services/eventService";

@Component({
    selector: 'poker-player',
    styleUrls: ['./poker-player.component.scss'],
    templateUrl: './poker-player.component.html'
})
export class PokerPlayerComponent implements OnInit, OnDestroy {
    @Input() player: Player | undefined;
    @Input() currentUserId: string = "";
    @Input() inGame: boolean = false;
    @Input() onMinMaxHighlight: boolean = false;

    private subscriptions: Subscription[] = [];

    public get currentUser() {
        return this.currentUserId === this.player?.id;
    }

    constructor(private readonly eventService: EventService) {
    }

    ngOnInit(): void {
        this.subscriptions.push(
            this.eventService.playerPickCardEvent.subscribe(playerId => {
                if (playerId !== this.player!.id) {
                    return;
                }

                this.player!.pickedCard = true;
            })
        )

        this.subscriptions.push(
            this.eventService.playerUnpickCardEvent.subscribe(playerId => {
                if (playerId !== this.player!.id) {
                    return;
                }

                this.player!.pickedCard = false;
            })
        )

        this.subscriptions.push(
            this.eventService.playerPickCertainCardEvent.subscribe(model => {
                if (model.playerId !== this.player!.id) {
                    return;
                }

                this.player!.pickedCard = model.picked;
            }));

        this.subscriptions.push(
            this.eventService.newGameEvent.subscribe(_ => {
                this.player!.cardValue = ""
                this.player!.pickedCard = false;
            }));

        this.subscriptions.push(
            this.eventService.playerDisconnectedEvent.subscribe(playerId => {
                if (playerId !== this.player!.id) {
                    return;
                }

                this.player!.connected = false;
            }));

        this.subscriptions.push(
            this.eventService.playerReconnectedEvent.subscribe(playerId => {
                if (playerId !== this.player!.id) {
                    return;
                }

                this.player!.connected = true;
            }));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}