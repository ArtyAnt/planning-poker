import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from "@angular/material/snack-bar";

@Component({
    selector: 'snack-bar',
    templateUrl: 'snack-bar.component.html',
    styleUrls: ['snack-bar.component.scss'],
    standalone: true
})
export class SnackbarAnnotatedComponent {
    text: string;

    constructor(@Inject(MAT_SNACK_BAR_DATA) data: {text: string}) {
        this.text = data.text;
    }
}