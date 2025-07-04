import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import _ from 'lodash';

import { ContactService } from 'src/app/modules/settings/contact/contact.service';
import { AddressService } from 'src/app/modules/settings/address/address.service';

import { SpinnerService } from 'src/app/services/spinner.service';
import { ProductSellerModel } from '../product-seller.model';
import { ProductSellerService } from '../product-seller.service';
@Component({
    selector: 'app-add-prooduct-seller',
    templateUrl: './add-product-seller.component.html',
    styleUrl: './add-product-seller.component.scss',
    standalone: false
})
export class AddProductSellerComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: ProductSellerModel;
  clone: any;
  isEdit: boolean = false;
  contacts: any = [];
  addresses: any = [];
  billingAddress: any = [];
  shippingAddress: any = [];
  isLoading = false;
  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddProductSellerComponent>);
  readonly data = inject<{
    model: ProductSellerModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  vendors: ProductSellerModel[] = [];

  constructor(
    private fb: FormBuilder,
    private service: ProductSellerService,
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
  getAddresses() {
    this.addressService.find().subscribe((res: any) => {
      this.addresses = res.data;
      this.addresses.filter((address: any) => {
        if (address.type =='1') {
          this.billingAddress.push(address);
        } else if (address.type == '2') {
          this.shippingAddress.push(address);
        }
      }
      );
    }
    );
  }
  ngAfterViewInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
    this.isLoading = false; 
    this.spinnerService.hide();
  }

  initForm(model: ProductSellerModel) {
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
