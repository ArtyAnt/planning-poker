import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {MatSelectionList, MatSelectionListChange} from "@angular/material/list";

@Component({
    selector: 'room-list-dialog',
    styleUrls: ['./room-list-dialog.component.scss'],
    templateUrl: './room-list-dialog.component.html'
})
export class RoomListDialogComponent implements AfterViewInit {
    @ViewChild('rooms') selectionList: MatSelectionList | undefined;

    form: FormGroup;
    roomsControl = new FormControl();

    constructor() {
        this.form = new FormGroup({
            rooms: this.roomsControl,
        });

        this.form.disable({onlySelf: true});
    }

    ngAfterViewInit() {
        this.selectionList!.selectionChange.subscribe((value: MatSelectionListChange) => {
            value.options.forEach(option => {
                 option.selected = !option.selected;
            })
        })
    }
}
