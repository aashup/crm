import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import _ from 'lodash';

import { ContactService } from 'src/app/modules/settings/contact/contact.service';
import { AddressService } from 'src/app/modules/settings/address/address.service';
import { InventoryModel } from '../inventory.model';
import { InventoryService } from '../inventory.service';

@Component({
    selector: 'app-add-inventory',
    templateUrl: '././add-inventory.component.html',
    styleUrl: '././add-inventory.component.scss',
    standalone: false
})
export class AddInventoryComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: InventoryModel;
  clone: any;
  isEdit: boolean = false;
  contacts: any = [];
  addresses: any = [];
  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddInventoryComponent>);
  readonly data = inject<{
    model: InventoryModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  inventries: InventoryModel[] = [];

  constructor(
    private fb: FormBuilder,
    private service: InventoryService,
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

  initForm(model: InventoryModel) {
    this.form = this.fb.group({
      id: [model.id, []],
      name: [
        model.id,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      
     
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
          this.isEdit ? 'Vendor has been updated.' : 'Vendor has been created.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => this.commonService.handleError(err),
    });
  }
}
