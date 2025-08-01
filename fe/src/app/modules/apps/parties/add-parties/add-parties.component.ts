import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SpinnerService } from 'src/app/services/spinner.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { PartiesService } from '../parties.service';
import { PartiesModel } from '../parties.model';
import _ from 'lodash';
import { StateService } from 'src/app/modules/settings/state/state.service';
import { map, Observable, startWith } from 'rxjs';
import { ContactModel } from '../../product/product.model';
import { ContactService } from 'src/app/modules/settings/contact/contact.service';
import { AddressService } from 'src/app/modules/settings/address/address.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-parties',
  templateUrl: './add-parties.component.html',
  styleUrls: ['./add-parties.component.scss'],
})
export class AddPartiesComponent implements OnInit, AfterViewInit,OnDestroy {
  form: FormGroup;
  model: PartiesModel;
  isEdit = false;
  isLoading = false;
  enableShipping = false;
  addresses:any=[]
  isMobileSelected = false;
  clone: any;
  contacts: any[] = [];
  filteredNames: Observable<ContactModel[]>;
  filteredContacts: Observable<ContactModel[]>;
  billing_address:any=[]
  shipping_address:any=[]
  isNameSelected = false;
  states:any= []
  

  constructor(
    private fb: FormBuilder,
    private service: PartiesService,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private stateService:StateService,
    private cdr:ChangeDetectorRef,
    private contactService:ContactService,
    private addressService:AddressService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.getAddress()
    this.getAllStates()
    this.getContacts()
    this.initForm(this.model);

    this.form.get('credit_limit')?.valueChanges.subscribe((isLimitEnabled: boolean) => {
      const control = this.form.get('credit_limit_amount');
      if (isLimitEnabled) {
        control?.setValidators([
          Validators.required,
          Validators.min(0) 
        ]);
      } else {
        control?.clearValidators();
        control?.setValue(0); 
      }
      control?.updateValueAndValidity();
    });

    this.filteredContacts = this.form.controls.mobile.valueChanges.pipe(
      startWith(''),
      map((value: string) => {
        const val = (value || '').toLowerCase().trim();
        const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        return this.contacts
          .filter((contact) => contact.mob1?.toLowerCase().includes(val))
          .map((value) => {
            value.html =
              value.name +
              '&nbsp; [' +
              value.mob1.replace(regex, (match: any) => `<strong>${match}</strong>`) +
              ']';
            return value;
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
              .map<ContactModel>((value: ContactModel) => {
                value.html =
                  value.name?.replace(regex, (match: any) => `<strong>${match}</strong>`) +
                  `&nbsp;[${value.mob1}]`;
                return value;
              });
          })
        );
        

        this.form.get('name')?.valueChanges.subscribe((value) => {
          const match = this.contacts.find((c) => c.name === value);
          if (match) {
            this.isNameSelected = true;
            this.form.patchValue(
              {
                mobile: match.mob1,
                contact_id: match.id,
              },
              { emitEvent: false }
            );
          } else {
            this.isNameSelected = false;
          }
        });

        this.form.get('name')?.valueChanges.subscribe((value) => {
          const match = this.contacts.find((c) => c.name === value);
          if (match) {
            this.isNameSelected = true;
            this.form.patchValue(
              {
                mobile: match.mob1,
                contact_id: match.id,
              },
              { emitEvent: false }
            );
          } else {
            this.isNameSelected = false;
          }
        });
    
        this.form.get('mobile')?.valueChanges.subscribe((value) => {
          const match = this.contacts.find((c) => c.mob1 === value);
          if (match) {
            this.isMobileSelected = true;
            this.form.patchValue(
              {
                name: match.name,
                contact_id: match.id,
              },
              { emitEvent: false }
            );
          } else {
            this.isMobileSelected = false;
          }
        });

  }
  getAllStates(): void {
    this.spinnerService.show(); 
    this.stateService.find({ pageSize: 100, sortBy: 'name', sortOrder: 'asc' }).subscribe({
      next: (res: any) => {
        this.states = res?.data || [];        
      },
      error: (err) => {
        this.commonService.toastr.error('Failed to load states. Please try again.', 'Error');
        console.error('Error loading states:', err);
      },
      complete: () => {
        this.spinnerService.hide();
      }
    });
  }
  
  ngAfterViewInit(): void {
    this.spinnerService.hide();
  }

ngOnDestroy(): void {
 
}

preventMinus(event: KeyboardEvent) {
  if (event.key === '-' || event.key === 'Minus') {
    event.preventDefault();
  }
}
  formatToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
      billing_address_id: [model?.billing_address_id || ''],
      shipping_address_id: [model?.billing_address_id || ''],
      state_id: [model?.state_id || ''],
      gst_type:[model?.gst_type||''],
      email: [model?.email || '', [Validators.email]],
    });
  
    this.clone = this.form.value;
  }

  getAddress(): void {
    this.addressService.find({ pageSize: 10000 }).subscribe({
      next: (res: any) => {
        this.addresses = res?.data || [];
        res.data.forEach((add:any) => {
          if(add.type===1){
            this.billing_address.push(add)
          }else{
            this.shipping_address.push(add)
          }
        });        
      },
      error: (err) => {
        console.error('Error fetching addresses:', err);
      }
    });
  }

  getContacts(): void {
    this.contactService.find({ pageSize: 10000 }).subscribe({
      next: (res: any) => {
        this.contacts = res && res.data ? res.data : [];
      },
      error: (err) => {
        console.error('Error fetching contacts:', err);
      }
    });
  }
  


  onNameBlur(): void {
    const nameValue = this.form.get('name')?.value;
    const match = this.contacts.find((c) => c.name === nameValue);
    if (!match && this.isMobileSelected) {
      this.form.patchValue({ mobile: '', contact_id: null });
      this.isMobileSelected = false;
    }
  }

  onContactBlur(): void {
    const mobileValue = this.form.get('mobile')?.value;
    const match = this.contacts.find((c) => c.mob1 === mobileValue);
    if (!match) {
      this.form.patchValue({ name: '', contact_id: null });
      this.isNameSelected = false;
    }
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
    let date=this.formatToYYYYMMDD(this.form.value.opening_balance_date)
    let payLoad={
      ...this.form.value,
      opening_balance_date:date
    }
    const save$ = this.service[this.isEdit ? 'update' : 'create'](payLoad);

    save$.subscribe({
      next: () => {
        this.commonService.toastr.success(this.isEdit ? 'Party updated.' : 'Party created.');

        if (resetAfter) {
          this.form.reset();
          this.enableShipping = false;
        }else{
          this.router.navigate(["/app/parties"])
        }
      },
      error: (err) => {
        this.commonService.handleError(err);
        this.spinnerService.hide();
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
        this.spinnerService.hide();
      },
    });
  }
}
