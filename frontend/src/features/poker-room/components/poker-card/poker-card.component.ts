import {Component, Input} from '@angular/core';

@Component({
    selector: 'poker-card',
    styleUrl: './poker-card.component.scss',
    templateUrl: './poker-card.component.html'
})
export class PokerCardComponent {
    @Input() cardValue: string = "";
    @Input() pickedCard: boolean = false;
    @Input() inGame: boolean = false;
    @Input() isMin: boolean = false;
    @Input() isMax: boolean = false;
    @Input() onMinMaxHighlight: boolean = false;
    @Input() currentUser: boolean = false;
    @Input() connected: boolean = false;
}
