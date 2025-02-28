import { AfterViewInit, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountryModel } from '../country.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CountryService } from '../country.service';
import { CommonService } from '../../../core/common.service';
import _ from 'lodash';

@Component({
    selector: 'app-add-country',
    templateUrl: './add-country.component.html',
    styleUrl: './add-country.component.scss',
    standalone: false
})
export class AddCountryComponent implements AfterViewInit {
  form: FormGroup;
  model: CountryModel;
  clone: any;
  isEdit: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddCountryComponent>);
  readonly data = inject<{
    model: CountryModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: CountryService,
    private commonService: CommonService
  ) {}

  ngAfterViewInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }

  initForm(model: CountryModel) {
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
      status: [model.status, [Validators.required]],
    });
    this.clone = this.form.value;
  }

  submit() {
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }
    if (_.isEqual(this.form.value.name, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }
    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.commonService.toastr.success(this.isEdit ? 'Country has been updated.' : 'Country has been created.');
        this.dialogRef.close(true);
      },
      error: (err) => this.commonService.handleError(err),
    });
  }
}
