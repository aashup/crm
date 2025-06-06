import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import _ from 'lodash';
import { CustomersModel } from '../customers.model';
import { CustomersService } from '../customers.service';
import { ContactService } from 'src/app/modules/settings/contact/contact.service';
import { AddressService } from 'src/app/modules/settings/address/address.service';
@Component({
    selector: 'app-add-customers',
    templateUrl: '././add-customers.component.html',
    styleUrl: '././add-customers.component.scss',
    standalone: false
})
export class AddCustomersComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: CustomersModel;
  clone: any;
  isEdit: boolean = false;
  contacts: any = [];
  addresses: any = [];
  isLoading = false;
  readonly _ = _;
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
    private commonService: CommonService,
    private contactService: ContactService,
    private addressService: AddressService,
  ) {}

  ngOnInit(): void {
   this.getContacts()
   this.getAddresses()
  }

  getContacts() {
    this.contactService.find().subscribe((res: any) => {
      this.contacts = res.data;
    }
    );
  }
  getAddresses() {
    this.addressService.find().subscribe((res: any) => {
      this.addresses = res.data;
    }
    );
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
      contact_id: [model.contact_id, [Validators.required]],
      address_id: [model.address_id, [Validators.required]],
     
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
          this.isEdit ? 'Customer has been updated.' : 'Customer has been created.'
        );
        this.dialogRef.close(); 
        this.isLoading = false; 
      },
      error: (err) => {
        this.commonService.handleError(err);
        this.isLoading = false; 
      },
    });
  }
}
