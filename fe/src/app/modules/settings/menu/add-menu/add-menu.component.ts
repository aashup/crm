import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { MenuModel } from '../menu.model';
import { MenuService } from '../menu.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { take } from 'rxjs';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { StateModel } from '../../state/state.model';

@Component({
    selector: 'app-add-menu',
    templateUrl: './add-menu.component.html',
    styleUrl: './add-menu.component.scss',
    standalone: false
})
export class AddMenuComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: MenuModel;
  clone: any;
  isEdit: boolean = false;
  isLoading: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddMenuComponent>);
  readonly data = inject<{
    model: MenuModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  menus: StateModel[] = [];

  constructor(
    private fb: FormBuilder,
    private service: MenuService,
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
    this.service
      .find({ pageSize: 1000 })
      .pipe(take(1))
      .subscribe({
        next: (data: any) => (this.menus = data.data),
        error: (err) => this.commonService.handleError(err),
      });
  }

  ngAfterViewInit(): void {
    this.isLoading = false; 
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }

  initForm(model: MenuModel) {
    this.form = this.fb.group({
      id: [this.model.id, []],
      name: [this.model.name, [Validators.required]],
      root: [this.model.root],
      icon: [this.model.icon],
      page: [this.model.page],
      parent_id: [this.model.parent_id],
      order_by: [this.model.order_by],
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
  
    this.isLoading = true; 
    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.isLoading = false; 
        this.commonService.toastr.success(
          this.isEdit ? 'Menu has been updated.' : 'Menu has been created.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false; 
        this.commonService.handleError(err);
      },
    });
  }
}
