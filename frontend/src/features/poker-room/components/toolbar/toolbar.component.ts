import {Component, Input, OnDestroy} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDialog} from "@angular/material/dialog";
import {PokerSettingsDialogComponent} from "../poker-settings-dialog/poker-settings-dialog.component";
import {RoomSettings} from "../../models/roomSettings";
import {EventService} from "../../../../lib/services/eventService";
import {Subscription} from "rxjs";
import {SnackbarAnnotatedComponent} from "../../../../lib/components/snack-bar/snack-bar.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'toolbar',
    templateUrl: 'toolbar.component.html',
    styleUrl: 'toolbar.component.scss',
    standalone: true,
    imports: [MatToolbarModule, MatButtonModule, MatIconModule],
})
export class ToolbarBasicExample implements OnDestroy {
    @Input() settings = new RoomSettings();
    @Input() roomId: string = "";

    private subscriptions: Subscription[] = [];

    private windowOpened = false;

    constructor(
        private readonly snackBar: MatSnackBar,
        private readonly matDialog: MatDialog,
        eventService: EventService,
    ) {
        this.subscriptions.push(
            eventService.roomSettingsUpdatedEvent.subscribe(_ => {
                if (!this.windowOpened){
                    return;
                }
                this.windowOpened = false;
                this.matDialog.closeAll();

                this.openMenu();

                this.snackBar.openFromComponent(SnackbarAnnotatedComponent, {
                    duration: 3 * 1000,
                    horizontalPosition: "center",
                    verticalPosition: "top",
                    panelClass: 'snackbar',
                    data: {text: "⚙️ settings was changed"}
                });
            })
        )

        this.matDialog.afterAllClosed.subscribe(_ => this.windowOpened = false);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    openMenu() {
        if (this.windowOpened) {
            return;
        }

        this.matDialog.open(
            PokerSettingsDialogComponent,
            {
                data: {minMaxHighlight: this.settings.minMaxHighlight, roomId: this.roomId},
                width: '400px',
                height: '200px'
            });

        this.windowOpened = true;
    }
}