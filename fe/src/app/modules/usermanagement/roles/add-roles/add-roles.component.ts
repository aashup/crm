import { Component, AfterViewInit, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import _ from "lodash";
import { take } from "rxjs";
import { CommonService } from "src/app/modules/core/common.service";
import { FindService } from "src/app/modules/core/find.service";

import { RolesModel } from "../roles.model";
import { RolesService } from "../roles.service";
import { SpinnerService } from "src/app/services/spinner.service";


@Component({
    selector: 'app-add-roles',
    templateUrl: './add-roles.component.html',
    styleUrl: './add-roles.component.scss',
    standalone: false
})
export class AddRolesComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: RolesModel;
  clone: any;
  isLoading: boolean = false;
  isEdit: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddRolesComponent>);
  readonly data = inject<{
    model: RolesModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  roles: RolesModel[] = [];
 

  constructor(
    private fb: FormBuilder,
    private service: RolesService,
    private find: FindService,
    private commonService: CommonService,
    private spinnerService: SpinnerService
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
        next: (data: any) => (this.roles = data.data),
        error: (err) => this.commonService.handleError(err),
      });
  }

  ngAfterViewInit(): void {
    this.isLoading= false;
    this.spinnerService.hide()
    this.dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false;
      this.spinnerService.hide()
    });
  
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }

  initForm(model: RolesModel) {
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
      guard_name: [model.guard_name, [Validators.required]],
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
    this.spinnerService.show()
  
    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.commonService.toastr.success(
          this.isEdit ? 'Role has been updated.' : 'Role has been created.'
        );
        this.dialogRef.close(true); 
        this.isLoading = false; 
        this.spinnerService.hide()
      },
      error: (err) => {
        this.commonService.handleError(err);
        this.isLoading = false; 
        this.spinnerService.hide()
      },
    });
  }
}
