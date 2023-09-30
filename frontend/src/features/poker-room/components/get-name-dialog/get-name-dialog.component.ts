import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Component, Inject} from '@angular/core';
import {FormControl, FormGroupDirective, NgForm, ValidationErrors, Validators} from "@angular/forms";
import {ErrorStateMatcher} from '@angular/material/core';

@Component({
    selector: 'get-name-dialog',
    styleUrls: ['./get-name-dialog.component.scss'],
    templateUrl: './get-name-dialog.component.html'
})
export class GetNameDialogComponent {
    nameFormControl;
    matcher = new DialogErrorStateMatcher();

    constructor(
        public dialogRef: MatDialogRef<GetNameDialogComponent>,
        @Inject(MAT_DIALOG_DATA) data: { name: string }
    ) {
        this.nameFormControl = new FormControl(data.name, [Validators.required, this.noWhitespaceValidator]);
    }

    save() {
        if (!this.nameFormControl.invalid) {
            this.dialogRef.close(this.nameFormControl.value!.trim());

            return;
        }

        this.nameFormControl.markAllAsTouched();
    }

    public noWhitespaceValidator(control: FormControl): ValidationErrors | null {
        return (control.value || '').trim().length ? null : {'whitespace': true};
    }
}

export class DialogErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

