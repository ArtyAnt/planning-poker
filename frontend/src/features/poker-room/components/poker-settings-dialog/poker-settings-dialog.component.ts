import {Component, ElementRef, HostListener, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup} from "@angular/forms";
import {AppConfig, Paths} from "../../../../app/app.config";
import {RoomSettingsModel} from "../../../../../../shared/models/roomSettingsModel";

@Component({
    selector: 'poker-settings-dialog',
    styleUrls: ['./poker-settings-dialog.component.scss'],
    templateUrl: './poker-settings-dialog.component.html'
})
export class PokerSettingsDialogComponent {
    private readonly roomId: string;
    formGroup: FormGroup;

    minMaxHighlightBefore: boolean;

    get minMaxHighlight() {
        return this.formGroup.value.minMaxHighlightOption;
    }

    constructor(
        public dialogRef: MatDialogRef<PokerSettingsDialogComponent>,
        private elementRef: ElementRef,
        @Inject(MAT_DIALOG_DATA) data: { minMaxHighlight: boolean, roomId: string }
    ) {
        this.minMaxHighlightBefore = data.minMaxHighlight;
        this.formGroup = new FormGroup({
            minMaxHighlightOption: new FormControl(data.minMaxHighlight),
        });

        this.roomId = data.roomId;
    }

    @HostListener('document:mousedown', ['$event'])
    onGlobalClick(event: Event): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.dialogRef.close();
        }
    }

    async save() {
        await fetch(
            `${AppConfig.host}/api/${Paths.rooms}/${this.roomId}/settings`,
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(new RoomSettingsModel(this.formGroup.value.minMaxHighlightOption))
            });

        this.minMaxHighlightBefore = this.formGroup.value.minMaxHighlightOption;
    }

    cancel() {
        this.dialogRef.close();
    }
}