import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import _ from 'lodash';

import { ContactService } from 'src/app/modules/settings/contact/contact.service';
import { AddressService } from 'src/app/modules/settings/address/address.service';
import { VendorModel } from '../vendor.model';
import { VendorService } from '../vendor.service';
import { SpinnerService } from 'src/app/services/spinner.service';
@Component({
    selector: 'app-add-vendor',
    templateUrl: '././add-vendor.component.html',
    styleUrl: '././add-vendor.component.scss',
    standalone: false
})
export class AddVendorComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: VendorModel;
  clone: any;
  isEdit: boolean = false;
  contacts: any = [];
  addresses: any = [];
  billingAddress: any = [];
  shippingAddress: any = [];
  isLoading = false;
  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddVendorComponent>);
  readonly data = inject<{
    model: VendorModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  vendors: VendorModel[] = [];

  constructor(
    private fb: FormBuilder,
    private service: VendorService,
    private find: FindService,
    private commonService: CommonService,
    private contactService: ContactService,
    private addressService: AddressService,
    private spinnerService: SpinnerService
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
  getAddresses(page: number = 1) {
    this.addressService.find({ page }).subscribe((res: any) => {
      const fetchedAddresses = res.data;
      this.addresses = [...this.addresses, ...fetchedAddresses];
  
      fetchedAddresses.forEach((address: any) => {
        if (address.type == '1') {
          this.billingAddress.push(address);
        } else if (address.type == '2') {
          this.shippingAddress.push(address);
        }
      });
  
     
      if (fetchedAddresses.length > 0) {
        this.getAddresses(page + 1); 
      }
    });
  }
  ngAfterViewInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
    this.isLoading = false; 
    this.spinnerService.hide();
  }

  initForm(model: VendorModel) {
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
      billing_address_id: [model.billing_address_id, [Validators.required]],
      shipping_address_id: [model.shipping_address_id, [Validators.required]],
      level: [model.level, [Validators.required]],
      status: [model.status, [Validators.required]],
      type: [model.type, [Validators.required]],
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
    this.spinnerService.show();

    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.isLoading = false; 
        this.spinnerService.hide();
        this.commonService.toastr.success(
          this.isEdit ? 'Supplier has been updated.' : 'Supplier has been created.'
        );
        this.isLoading = false; 
        this.spinnerService.hide();
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false; 
        this.spinnerService.hide();
        this.commonService.handleError(err);
      },
    });
  }
}
