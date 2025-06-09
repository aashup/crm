import { AfterViewInit, Component, inject, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { AddressModel } from '../address.model';
import { AddressService } from '../address.service';
import { AuthService } from 'src/app/modules/auth';
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
  isLoading: boolean = false;
  cityOptions: any[] = [];
  currentUser: any;
  typeOptions: Array<{ value: number; label: string }> = [
    { value: 1, label: 'Billing' },
    { value: 2, label: 'Shipping' },
  ];
  readonly dialogRef = inject(MatDialogRef<AddAddressComponent>);
  readonly data = inject<{
    model: AddressModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: AddressService,
    private find: FindService,
    private commonService: CommonService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.model = this.data.model || this.getDefaultModel(); // Default model for "Add"
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
    this.loadCities()
    this.currentUser = this.authService.getCurrentUser();
    console.log(this.currentUser.user);
    
  }

  loadCities(): void {
    this.find.city().subscribe({
      next: (cities:any) => {
        this.cityOptions = cities.data.map((city: any) => ({
          id: city.id,
          name: city.name,
        }));
      },
      error: (err:any) => {
        this.commonService.toastr.error('Failed to load cities.');
        console.error(err);
      },
    });
  }
  
  getDefaultModel(): AddressModel {
    return {
      id: 0,
      address: '',
      type: null,
      city:{id: 0, name: ''}, 
      mob1: '',
      mob2: '',
      pin: '',
      status: 1, 
      created_by: null,
      clear() {

      },
    };

  }

  ngAfterViewInit(): void {

  }

  initForm(model: AddressModel) {
    this.form = this.fb.group({
      id: [model.id, []],
      address: [model.address, [Validators.required]],
      type: [model.type, [Validators.required]],
      city: [model.city?.id, [Validators.required]],
      mob1: [model.mob1, [Validators.required]],
      mob2: [model.mob2, []],
      pin: [model.pin, [Validators.required]],
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
  
    const payload = {
      ...this.form.value,
      city_id: this.form.value.city,
      created_by: this.currentUser.user.id,
    };
  
    if (_.isEqual(payload, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }
  
    this.isLoading = true; 
    this.service[this.isEdit ? 'update' : 'create'](payload).subscribe({
      complete: () => {
        this.isLoading = false; 
        this.commonService.toastr.success(
          this.isEdit ? 'Address has been updated.' : 'Address has been created.'
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
