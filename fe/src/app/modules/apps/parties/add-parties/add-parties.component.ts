import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
  LOCALE_ID,
  Inject,
  Optional,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { SpinnerService } from 'src/app/services/spinner.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { PartiesService } from '../parties.service';
import { PartiesModel } from '../parties.model';
import _ from 'lodash';
import { StateService } from 'src/app/modules/settings/state/state.service';
import { map, Observable, startWith, take, Subject, takeUntil } from 'rxjs';
import { ContactModel } from '../../product/product.model';
import { ContactService } from 'src/app/modules/settings/contact/contact.service';
import { AddressService } from 'src/app/modules/settings/address/address.service';
import { Router } from '@angular/router';
import { AddAddressComponent } from 'src/app/modules/settings/address/add-address/add-address.component';
import { AddressModel } from 'src/app/modules/settings/address/address.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { formatDate } from '@angular/common';
import { validate } from 'schema-utils';

@Component({
  selector: 'app-add-parties',
  templateUrl: './add-parties.component.html',
  styleUrls: ['./add-parties.component.scss'],
})
export class AddPartiesComponent implements OnInit, AfterViewInit, OnDestroy {
  form: FormGroup;
  model: PartiesModel;
  isEdit = false;
  isLoading = false;
  enableShipping = false;
  addresses: any[] = [];
  clone: any;
  contacts: any[] = [];
  filteredNames: Observable<ContactModel[]>;
  filteredContacts: Observable<ContactModel[]>;
  billing_address: any[] = [];
  shipping_address: any[] = [];
  states: any = [];
  filteredBillingAddresses!: Observable<any[]>;
  filteredShippingAddresses!: Observable<any[]>;
  gstTypeOption = [
    { name: 'Unregistered/Consumer', id: 1 },
    { name: 'Regular', id: 2 },
    { name: 'Composition', id: 3 },
  ];

  readonly dialog = inject(MatDialog);
  readonly data = inject<{
    model: PartiesModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA, { optional: true });
  private ngUnsubscribe = new Subject<void>();
  readonly dialogRef = inject<MatDialogRef<AddPartiesComponent>>(MatDialogRef, { optional: true });
    constructor(
    private fb: FormBuilder,
    private service: PartiesService,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private stateService: StateService,
    private contactService: ContactService,
    private addressService: AddressService,
    private router: Router,
    private cdr:ChangeDetectorRef,
    @Inject(LOCALE_ID) private locale: string,
    

  ) {}

  ngOnInit(): void {
    this.model = this.data?.model || new PartiesModel().clear();
    this.isEdit = this.data?.isEdit || false;

    this.getAddress();
    this.getAllStates();
    this.initForm(this.model);
    this.getContacts();
   
    
    this.form
      .get('credit_limit')
      ?.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((isLimitEnabled: boolean) => {
        const control = this.form.get('credit_limit_amount');
        if (isLimitEnabled) {
          control?.setValidators([Validators.required, Validators.min(0)]);
        } else {
          control?.clearValidators();
          control?.setValue(0);
        }
        control?.updateValueAndValidity();
      });
  }


  get billingAddressControl() {
    return this.form.get('billing_address') as FormControl;
  }

  onBillingAddressBlur(){
    if (this.form.get('billing_address_id')?.hasError("required")) {
      this.form.patchValue({
          billing_address:null
      })
      this.cdr.detectChanges()
      this.form.get('billing_address')?.markAsTouched();
    
    }
  }
  get shippingAddressControl() {
    return this.form.get('shipping_address') as FormControl;
  }

  setupContactAutocompletes(): void {
    this.filteredContacts = this.form.controls.mobile.valueChanges.pipe(
      startWith(''),
      map((value: string) => {
        const val = (value || '').toLowerCase().trim();
        const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        return this.contacts
          .filter((contact) => contact.mob1?.toLowerCase().includes(val))
          .map((contact) => {
            contact.html =
              contact.name +
              '&nbsp; [' +
              contact.mob1.replace(regex, (match: any) => `<strong>${match}</strong>`) +
              ']';
            return contact;
          });
      })
    );

    this.filteredNames = this.form.controls.name.valueChanges.pipe(
      startWith(''),
      map((value: string) => {
        const val = (value || '').toLowerCase().trim();
        const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        return this.contacts
          .filter((contact) => contact.name?.toLowerCase().includes(val))
          .map<ContactModel>((contact: ContactModel) => {
            contact.html =
              contact.name?.replace(regex, (match: any) => `<strong>${match}</strong>`) +
              `&nbsp;[${contact.mob1}]`;
            return contact;
          });
      })
    );

    this.form.get('name')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value) => {
      const match = this.contacts.find((c) => c.name === value);
      if (match) {
        this.form.patchValue(
          {
            mobile: match.mob1,
            contact_id: match.id,
          },
          { emitEvent: false }
        );
      } else {
        this.form.patchValue(
          {
            contact_id: null,
          },
          { emitEvent: false }
        );
      }
    });

    this.form.get('mobile')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value) => {
      const match = this.contacts.find((c) => c.mob1 === value);
      if (match) {
        this.form.patchValue(
          {
            name: match.name,
            contact_id: match.id,
          },
          { emitEvent: false }
        );
      } else {
        this.form.patchValue(
          {
            contact_id: null,
          },
          { emitEvent: false }
        );
      }
    });
  }

  setupAddressAutocompletes(): void {
   
    this.filteredBillingAddresses = this.billingAddressControl.valueChanges.pipe(
      startWith(''),
      map((val: string) => {
        const value = val?.toLowerCase() || '';
        return this.billing_address.filter(a => a.address.toLowerCase().includes(value));
      })
    );
  
    this.billingAddressControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      const selected = this.billing_address.find(a => a.address === val);
      if (selected) {
        this.form.patchValue({ billing_address_id: selected.id }, { emitEvent: false });
      } else {
        this.form.patchValue({ billing_address_id: null }, { emitEvent: false });
      }
    });
  
   
    this.filteredShippingAddresses = this.shippingAddressControl.valueChanges.pipe(
      startWith(''),
      map((val: string) => {
        const value = val?.toLowerCase() || '';
        return this.shipping_address.filter(a => a.address.toLowerCase().includes(value));
      })
    );
  
    this.shippingAddressControl.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      const selected = this.shipping_address.find(a => a.address === val);
      if (selected) {
        this.form.patchValue({ shipping_address_id: selected.id }, { emitEvent: false });
      } else {
        this.form.patchValue({ shipping_address_id: null }, { emitEvent: false });
      }
    });
  }
  
  onBillingSelect(addressStr: string) {
    const selected = this.billing_address.find((a: any) => a.address === addressStr);
    if (selected) {
      this.form.patchValue({
        billing_address_id: selected.id,
      });
    }
  }

  onShippingSelect(addressStr: string) {
    const selected = this.shipping_address.find((a: any) => a.address === addressStr);
    if (selected) {
      this.form.patchValue({
        shipping_address_id: selected.id,
      });
    }
  }

  getAllStates(): void {
    this.spinnerService.show();
    this.stateService.find({ pageSize: 100, sortBy: 'name', sortOrder: 'asc' }).subscribe({
      next: (res: any) => {
        this.states = res?.data || [];
      },
      error: (err) => {
        this.commonService.toastr.error('Failed to load states. Please try again.', 'Error');
      },
      complete: () => {
        this.spinnerService.hide();
      },
    });
  }

  ngAfterViewInit(): void {
    this.spinnerService.hide();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  preventMinus(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'Minus') {
      event.preventDefault();
    }
  }

  initForm(model: PartiesModel) {
    this.form = this.fb.group({
      id: [model?.id || null],
      name: [model?.name || '', [Validators.required, Validators.maxLength(200)]],
      gstin: [model?.gstin || ''],
      contact_id: [null],
      mobile: [model?.mobile || ''],
      opening_balance: [model?.opening_balance || 0],
      opening_balance_date: [model?.opening_balance_date || new Date()],
      credit_limit: [model?.credit_limit ?? false],
      credit_limit_amount: [model?.credit_limit_amount || 0],
      billing_address: ['',[Validators.required]],
      billing_address_id: ['', Validators.required],
      shipping_address: [''],
      shipping_address_id: [model?.shipping_address_id || ''],
      state_id: [model?.state_id || ''],
      gst_type: [model?.gst_type || ''],
      email: [model?.email || '', [Validators.email]],
    });

    this.clone = this.form.value;

    if (this.isEdit && model.billing_address_id) {
      this.addressService.find({ id: model.billing_address_id }).pipe(take(1)).subscribe((res: any) => {
        if (res?.data?.length > 0) {
          this.form.get('billing_address')?.setValue(res.data[0].address);
        }
      });
    }

    if (this.isEdit && model.shipping_address_id) {
      this.addressService.find({ id: model.shipping_address_id }).pipe(take(1)).subscribe((res: any) => {
        if (res?.data?.length > 0) {
          this.form.get('shipping_address')?.setValue(res.data[0].address);
        }
      });
    }
  }

  getAddress(): void {
    this.addressService.find({ pageSize: 10000 }).subscribe({
      next: (res: any) => {
        this.addresses = res?.data || [];
        res.data.forEach((add: any) => {
          if (add.type === 1) {
            this.billing_address.push(add);
          } else {
            this.shipping_address.push(add);
          }
        });
        this.setupAddressAutocompletes();
      },
      error: (err) => {
        console.error('Error fetching addresses:', err);
      },
    });
  }

  getContacts(): void {
    this.contactService.find({ pageSize: 10000 }).subscribe({
      next: (res: any) => {
        this.contacts = res && res.data ? res.data : [];
        this.setupContactAutocompletes();
      },
      error: (err) => {
        console.error('Error fetching contacts:', err);
      },
    });
  }

  add(type: any): void {
    this.dialog
      .open(AddAddressComponent, {
        data: {
          model: new AddressModel().clear(),
          isEdit: false,
          addressType: type || null,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((newAddress: any) => {
        if (newAddress) {
          if (newAddress.type === 1) {
            this.billing_address.push(newAddress);
            this.form.get('billing_address')?.updateValueAndValidity();
          } else if (newAddress.type === 2) {
            this.shipping_address.push(newAddress);
            this.form.get('shipping_address')?.updateValueAndValidity();
          }
        }
      });
  }

  save(resetAfter: boolean = false) {
    this.commonService.markFormGroupTouched(this.form);
  
    if (this.form.invalid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }
  
    if (_.isEqual(this.form.value, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }
  
    this.isLoading = true;
    this.spinnerService.show();
  
    let dateToFormat = this.form.value.opening_balance_date;
    let formattedDate = null;
  
    if (dateToFormat) {
      if (!(dateToFormat instanceof Date)) {
        dateToFormat = new Date(dateToFormat);
      }
      formattedDate = formatDate(dateToFormat, 'yyyy-MM-dd', this.locale);
    }
  
    let mobile = this.form.value.mobile?.toString().trim() || '';
    if (!mobile.startsWith('+')) {
      mobile = mobile.replace(/\s|-/g, '');
      mobile = '+91' + mobile;
    }
  
    let payLoad = {
      ...this.form.value,
      mobile: mobile || null,
      opening_balance_date: formattedDate,
    };
  
    const save$ = this.service[this.isEdit ? 'update' : 'create'](payLoad);
  
    
    save$.subscribe((res:any)=>{
      this.isLoading = false;
      this.spinnerService.hide();
      this.commonService.toastr.success(
        `Party ${this.isEdit ? 'updated' : 'created'} successfully!`
      );
  
      if (resetAfter) {
        this.form.reset();
        this.initForm(new PartiesModel().clear());
      } else {
        if( this.dialogRef)
        this.dialogRef.close(true);
       else
        this.router.navigate(['/app/parties']);
      }   
    }
    , (err: any) => {
      this.isLoading = false;
      this.spinnerService.hide();
      this.commonService.toastr.error(
        `Failed to ${this.isEdit ? 'update' : 'create'} party. Please try again.`,
        'Error'
      );
    }
  );
  }
  
  
  
}
