import {Component, OnInit} from '@angular/core';
import {AppConfig, Paths} from "../../app/app.config";
import {MatDialog} from "@angular/material/dialog";
import {
    CreateTempRoomDialogComponent
} from "../main-page/components/create-temp-room-dialog/create-temp-room-dialog.component";

@Component({
    selector: 'poker-room',
    templateUrl: './poker-room.component.html',
    styleUrls: ['./poker-room.component.scss']
})
export class PokerRoomComponent implements OnInit {
    roomId: string = "";
    roomCreated: boolean = false;

    constructor(
        private readonly matDialog: MatDialog,
    ) {
    }

    async ngOnInit() {
        let roomId = window.location.pathname.slice(`/`.length + Paths.rooms.length + `/`.length);
        if (!roomId) {
            return this.openDialogWindow()
        }
        const response = await fetch(
            `${AppConfig.host}/api/${Paths.rooms}/${roomId}`,
            {
                method: "GET"
            });
        if (response.status != 200) {
            return this.openDialogWindow()
        }

        this.roomId = roomId;
        this.roomCreated = true;
    }

    private openDialogWindow() {


        this.matDialog.open(
            CreateTempRoomDialogComponent,
            {
                width: '400px',
                data: {
                    text: [
                        "Room not found...",
                    ],
                    buttonText: "Go to the main page",
                    createRoom: false
                }
            });
    }
}