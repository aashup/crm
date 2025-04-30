import { Component, AfterViewInit, OnInit, inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import _ from "lodash";
import { take } from "rxjs";
import { CommonService } from "src/app/modules/core/common.service";
import { FindService } from "src/app/modules/core/find.service";
import { UsersModel } from "../users.model";
import { UsersService } from "../users.service";




@Component({
    selector: 'app-add-users',
    templateUrl: './add-users.component.html',
    styleUrl: './add-users.component.scss',
    standalone: false
})
export class AddUsersComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: UsersModel;
  clone: any;
  isEdit: boolean = false;
  readonly dialogRef = inject(MatDialogRef<AddUsersComponent>);
  readonly data = inject<{
    model: UsersModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  users: UsersModel[] = [];
 

  constructor(
    private fb: FormBuilder,
    private service: UsersService,
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
        next: (data: any) => (this.users = data.data),
        error: (err) => this.commonService.handleError(err),
      });

      
  }

  ngAfterViewInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
  }

  initForm(model: UsersModel) {
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
