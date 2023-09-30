import {Component} from '@angular/core';
import {EventService} from "../../services/eventService";

@Component({
    selector: 'connecting-spinner',
    templateUrl: 'connecting-spinner.component.html',
    styleUrls: ['connecting-spinner.component.scss']
})
export class ConnectingSpinnerComponent {
    public get connected(): boolean {
        return this.eventService.connected;
    }

    constructor(private readonly eventService: EventService) {}
}