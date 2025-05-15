import { AfterViewInit, Component, inject, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { AddressModel } from '../address.model';
import { AddressService } from '../address.service';
@Component({
    selector: 'app-add-address',
    templateUrl: './add-address.component.html',
    styleUrl: './add-address.component.scss',
    standalone: false
})
export class AddAddressComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: AddressModel;
  clone: any;
  isEdit: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddAddressComponent>);
  readonly data = inject<{
    model: AddressModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: AddressService,
    private find: FindService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }

  ngAfterViewInit(): void {

  }

  initForm(model: AddressModel) {
    this.form = this.fb.group({
      id: [this.model.id, []],
      name: [this.model.address, [Validators.required]],
      status: [this.model.status],
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
          this.isEdit ? 'Permission has been updated.' : 'Permission has been created.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => this.commonService.handleError(err),
    });
  }
}
