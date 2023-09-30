import {Component, Inject} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AppConfig, Paths} from "../../../../app/app.config";
import {RoomModel} from "../../../../../../shared/models/roomModel";
import {Router} from "@angular/router";
import {CreatingRoomModel} from "../../../../../../shared/models/creatingRoomModel";
import {v4 as uuid} from 'uuid';
import {RoomType} from "../../../../../../shared/enums/roomType";
import {SnackbarAnnotatedComponent} from "../../../../lib/components/snack-bar/snack-bar.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'create-temp-room-dialog',
    styleUrls: ['./create-temp-room-dialog.component.scss'],
    templateUrl: './create-temp-room-dialog.component.html'
})
export class CreateTempRoomDialogComponent {
    form: FormGroup;
    roomsControl = new FormControl();

    text: string[];
    buttonText: string;
    createRoom: boolean

    constructor(
        private readonly snackBar: MatSnackBar,
        private readonly router: Router,
        private readonly dialogRef: MatDialogRef<CreateTempRoomDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {text: string[], buttonText: string, createRoom: boolean}
    ) {
        this.text = data.text;
        this.buttonText = data.buttonText;
        this.createRoom = data.createRoom;
        this.form = new FormGroup({
            rooms: this.roomsControl,
        });

        this.form.disable({emitEvent: false});
    }

    async click() {
        if (this.createRoom) {
            await this.createTempRoom();
        } else {
            await this.navigateToRoot();
        }
    }

    async createTempRoom() {
        this.dialogRef.close();

        const creatingRoomModel = new CreatingRoomModel(uuid(), RoomType.temporary);

        const response = await fetch(
            `${AppConfig.host}/api/${Paths.rooms}`,
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(creatingRoomModel)
            });

        const roomModel: RoomModel = await response.json();

        const roomPath = `/${Paths.rooms}/${roomModel.id}`;
        const url = window.location.protocol + "//" + window.location.host + roomPath
        await this.copyToClipboard(url);

        await this.router.navigate([roomPath]);roomPath
    }

    async copyToClipboard(text: string) {
        await navigator.clipboard.writeText(text);

        this.snackBar.openFromComponent(SnackbarAnnotatedComponent, {
            duration: 3 * 1000,
            horizontalPosition: "center",
            verticalPosition: "top",
            panelClass: 'snackbar',
            data: {text: "📋 url was copied to the clipboard"}
        });
    }

    async navigateToRoot() {
        this.dialogRef.close();

        await this.router.navigate([``]);
    }
}
