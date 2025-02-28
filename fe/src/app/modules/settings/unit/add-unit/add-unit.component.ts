import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { UnitModel } from '../unit.model';
import { UnitService } from '../unit.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';

@Component({
    selector: 'app-add-unit',
    templateUrl: './add-unit.component.html',
    styleUrl: './add-unit.component.scss',
    standalone: false
})
export class AddUnitComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: UnitModel;
  clone: any;
  isEdit: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddUnitComponent>);
  readonly data = inject<{
    model: UnitModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: UnitService,
    private find: FindService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }

  initForm(model: UnitModel) {
    this.form = this.fb.group({
      id: [this.model.id, []],
      name: [this.model.name, [Validators.required]],
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
