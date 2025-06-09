import { Component, AfterViewInit, OnInit, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { Observable, take } from 'rxjs';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { UsersModel } from '../users.model';
import { UsersService } from '../users.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-users',
  templateUrl: './add-users.component.html',
  styleUrl: './add-users.component.scss',
  standalone: false,
})
export class AddUsersComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: UsersModel;
  clone: any;
  isLoading: boolean = false;
  isEdit: boolean = false;
  isPasswordChanged: boolean = false;
  showPasswordFields: boolean = false; 

  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
  }
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  fechedRoles: any[] = [];
  readonly dialogRef = inject(MatDialogRef<AddUsersComponent>);
  readonly data = inject<{
    model: UsersModel;
    isEdit: boolean;
    isPasswordChanged: boolean;
  }>(MAT_DIALOG_DATA);

  users: UsersModel[] = [];

  constructor(
    private fb: FormBuilder,
    private service: UsersService,
    private find: FindService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {

    this.find.getRoles().subscribe(
      (data) => {
        this.fechedRoles = data.data;
        
      },
      (error) => {
        console.error('Error fetching roles:', error);
      }

    )
  }
  changePassword() {
    this.isPasswordChanged = !this.isPasswordChanged;
  }

 ngAfterViewInit(): void {
  this.dialogRef.afterClosed().subscribe(() => {
    this.isLoading = false; // Stop loader if modal is canceled
  });

  this.model = this.data.model;
  this.isEdit = this.data.isEdit;
  this.isPasswordChanged = this.data.isPasswordChanged;
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
      email: [model.email, [Validators.required, Validators.email]],
      password: [model.password],
      cpassword: [model.cpassword],
      roles: [model.roles, [Validators.required]],
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
  
    this.isLoading = true; // Start loader
  
    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.commonService.toastr.success(
          this.isEdit ? 'User has been updated.' : 'User has been created.'
        );
        this.dialogRef.close(true); // Close modal
        this.isLoading = false; // Stop loader
      },
      error: (err) => {
        this.commonService.handleError(err);
        this.isLoading = false; // Stop loader on error
      },
    });
  }
}
