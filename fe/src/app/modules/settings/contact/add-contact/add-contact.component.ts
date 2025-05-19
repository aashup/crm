import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactModel } from '../contact.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContactService } from '../contact.service';
import { FindService } from 'src/app/modules/core/find.service';
import { CommonService } from 'src/app/modules/core/common.service';
import _, { take } from 'lodash';


@Component({
  selector: 'app-add-contact',
  standalone: false,
  templateUrl: './add-contact.component.html',
  styleUrl: './add-contact.component.scss'
})

export class AddContactComponent {
  
form: FormGroup;
  model: ContactModel;
  clone: any;
  isEdit: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddContactComponent>);
  readonly data = inject<{
    model: ContactModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

   contacts: ContactModel[] = [];
   
  
    constructor(
      private fb: FormBuilder,
      private service: ContactService,
      private find: FindService,
      private commonService: CommonService
    ) {}
  
    
  
    ngAfterViewInit(): void {
      this.model = this.data.model;
      this.isEdit = this.data.isEdit;
      this.initForm(this.model);
    }
  
    initForm(model: ContactModel) {
      this.form = this.fb.group({
        id: [model.id, []],
        name: [
          model.name,
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(200),
          ],
        ],
        mob1: [
          model.mob1,
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(15),
          ],
        ],
        mob2: [
          model.mob2,
          [
            Validators.minLength(10),
            Validators.maxLength(15),   
          ],

        ],
        status: [model.status, [Validators.required]],
      });
      this.clone = this.form.value;
    }
  
    submit() {
      this.commonService.markFormGroupTouched(this.form);
      if (!this.form.valid) {
        this.commonService.toastr.error('Please fix all errors.');
        return;
      }
      if (_.isEqual(this.form.value, this.clone)) {
        this.commonService.toastr.error('Nothing changed.');
        return;
      }
      this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
        complete: () => {
          this.commonService.toastr.success(
            this.isEdit ? 'Contact has been updated.' : 'Contact has been created.'
          );
          this.dialogRef.close(true);
        },
        error: (err) => this.commonService.handleError(err),
      });
    }
}
