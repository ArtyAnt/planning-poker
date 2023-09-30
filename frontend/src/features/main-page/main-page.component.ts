import {Component, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {CreateTempRoomDialogComponent} from "./components/create-temp-room-dialog/create-temp-room-dialog.component";
import {EventService} from "../../lib/services/eventService";

@Component({
    selector: 'main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
    public get connected(): boolean {
        return this.eventService.connected
    }

    constructor(
        private readonly matDialog: MatDialog,
        private readonly eventService: EventService) {
    }

    ngOnInit() {
        this.matDialog.open(
            CreateTempRoomDialogComponent,
            {
                width: '400px',
                data: {
                    text: [
                        "Permanent rooms are currently in development.",
                        "You can create a temporary room using the button below"
                    ],
                    buttonText: "Create temp room",
                    createRoom: true
                }
            });
    }
}
