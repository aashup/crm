import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { PermissionModel } from '../permission.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { take } from 'rxjs';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { StateModel } from '../../state/state.model';
import { PermissionService } from '../permission.service';

@Component({
    selector: 'app-add-permission',
    templateUrl: './add-permission.component.html',
    styleUrl: './add-permission.component.scss',
    standalone: false
})
export class AddPermissionComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: PermissionModel;
  clone: any;
  isEdit: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddPermissionComponent>);
  readonly data = inject<{
    model: PermissionModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: PermissionService,
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

  initForm(model: PermissionModel) {
    this.form = this.fb.group({
      id: [this.model.id, []],
      name: [this.model.name, [Validators.required]],
      slug: [this.model.slug],
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
