import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import _ from 'lodash';
import { CustomersModel } from '../customers.model';
import { CustomersService } from '../customers.service';
@Component({
    selector: 'app-add-customers',
    templateUrl: '././add-customers.component.html',
    styleUrl: '../add-customers.component.scss',
    standalone: false
})
export class AddCustomersComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: CustomersModel;
  clone: any;
  isEdit: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddCustomersComponent>);
  readonly data = inject<{
    model: CustomersModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  customers: CustomersModel[] = [];

  constructor(
    private fb: FormBuilder,
    private service: CustomersService,
    private find: FindService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    // this.find
    //   .country()
    //   .pipe(take(1))
    //   .subscribe({
    //     next: (data: any) => (this.countries = data.data),
    //     error: (err) => this.commonService.handleError(err),
    //   });
    this.find
      .state()
      .pipe(take(1))
      .subscribe({
        next: (data: any) => (this.customers = data.data),
        error: (err) => this.commonService.handleError(err),
      });
  }

  ngAfterViewInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }

  initForm(model: CustomersModel) {
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
      contact_id: [model.contact_id, []],
      address_id: [model.address_id, []],
      created_at: [model.created_at, []],
      updated_at: [model.updated_at, []],
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
          this.isEdit ? 'State has been updated.' : 'State has been created.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => this.commonService.handleError(err),
    });
  }
}
