import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { PermissionModel } from '../permission.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { PermissionService } from '../permission.service';
import { MenuService } from 'src/app/modules/settings/menu/menu.service';

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
  menus:any = [];
  readonly dialogRef = inject(MatDialogRef<AddPermissionComponent>);
  readonly data = inject<{
    model: PermissionModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: PermissionService,
    private find: FindService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
   this.fetchMenus();
  }

  ngAfterViewInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }

  initForm(model: PermissionModel) {
    this.form = this.fb.group({
      id: [this.model.id, []],
      name: [this.model.name],
      description: [this.model.description, []],
      guard_name: [this.model.guard_name, [Validators.required]],
      menu_id: [this.model.menu_id, []],});
    this.clone = this.form.value;
  }

  fetchMenus(): void {
    
      this.find.findMenu().subscribe({
        next: (res:any) => {
          this.menus = res?.data;
        },
      });
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
