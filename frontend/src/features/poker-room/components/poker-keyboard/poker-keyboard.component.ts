import {Component, Input, OnInit} from '@angular/core';
import {EventService} from "../../../../lib/services/eventService";
import {Button} from "../../models/button";
import {Subscription} from "rxjs";

@Component({
    selector: 'poker-keyboard',
    styleUrl: './poker-keyboard.component.scss',
    templateUrl: './poker-keyboard.component.html'
})
export class PokerKeyboardComponent implements OnInit {
    @Input() roomId: string = "";
    @Input() currentPlayerId = "";
    @Input() inGame: boolean = false;

    private buttons: Map<string, Button> = new Map([
        ["☕", new Button("☕", -1)],
        ["?", new Button("?", 0)],
        ["1", new Button("1", 1)],
        ["2", new Button("2", 2)],
        ["3", new Button("3", 3)],
        ["5", new Button("5", 4)],
        ["8", new Button("8", 5)],
        ["13", new Button("13", 6)],
        ["21", new Button("21", 7)]
    ]);

    private subscriptions: Subscription[] = [];
    private currentPickedValue: string = "";

    public get cards() {
        const result: Button[] = [];
        this.buttons.forEach(button => result.push(button));

        return result.sort((a, b) => a.position - b.position);
    }

    constructor(private readonly eventService: EventService) {
    }

    public resetCards(){
        this.buttons.forEach(button => button.picked = false);
    }

    clickCard(pickedValue: string) {
        this.eventService.pickCertainCard(this.currentPlayerId, this.roomId, pickedValue)
    }

    ngOnInit(): void {
        this.subscriptions.push(
            this.eventService.playerPickCertainCardEvent.subscribe(model => {
                if (this.currentPickedValue) {
                    const pickedButton = this.buttons.get(this.currentPickedValue)
                    if (!pickedButton) {
                        throw new Error("Button not exists")
                    }
                    pickedButton.picked = false
                    this.currentPickedValue = "";
                }

                if (!model.picked) {
                    return;
                }

                const clickedButton = this.buttons.get(model.cardValue)
                if (!clickedButton) {
                    throw new Error("Button not exists")
                }
                clickedButton.picked = true;

                this.currentPickedValue = model.cardValue
            }));

        this.subscriptions.push(
            this.eventService.newGameEvent.subscribe(_ => {
                this.buttons.forEach(button => button.picked = false);
            }));
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
