import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';

import { PurchaseModel } from '../purchase.model';
import { CommonService } from 'src/app/modules/core/common.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { ProductService } from '../../product/product.service';
import { ContactService } from 'src/app/modules/settings/contact/contact.service';
import { PurchaseService } from '../purchase.service';
import { VendorService } from '../../vendor/vendor.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { forkJoin, map, startWith } from 'rxjs';
@Component({
  selector: 'app-add-purchase',
  templateUrl: '././add-purchase.component.html',
  styleUrl: '././add-purchase.component.scss',
  standalone: false,
})
export class AddPurchaseComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  contacts: any = [];
  units: any = [];
  suppliers: any = [];
  products: any = [];
  contactControl = new FormControl('', [
    Validators.required,
    this.autocompleteObjectValidator()
  ]);
  filteredContacts: any[] = [];

  unitControl = new FormControl('');
  filteredUnits: any[] = [];
  isEdit = false;
  isLoading = false;
  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddPurchaseComponent>);
  readonly data = inject<{
    model: PurchaseModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  purchaseItems: PurchaseModel[] = [];

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private unitService: UnitService,
    private productService: ProductService,
    private contactService: ContactService,
    private purchaseService: PurchaseService,
    private supplierService: VendorService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    this.isEdit = this.data.isEdit;
  
    this.form = this.fb.group({
      contact_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      supplier_id: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      notes: [''],
      purchaseDetails: this.fb.array([this.createPurchaseDetail()])
    });
  
    forkJoin([
      this.unitService.find({ pageSize: 1000 }),
      this.supplierService.find({}),
      this.contactService.find({}),
      this.productService.find({})
    ]).subscribe(([unitsRes, suppliersRes, contactsRes, productsRes]: any[]) => {
      this.units = unitsRes.data;
      this.suppliers = suppliersRes.data;
      this.contacts = contactsRes.data;
      this.products = productsRes.data;
  
      if (this.isEdit && this.data.model) {
        this.patchForm(this.data.model);
      }
    });
  
    
    // Contact autocomplete
    this.contactControl.valueChanges.pipe(
      map((value: any) => typeof value === 'string' ? value : value?.name),
      map(name => name ? this.contacts.filter((c: any) => c.name.toLowerCase().includes(name.toLowerCase())) : this.contacts)
    ).subscribe(filtered => this.filteredContacts = filtered);
  
    // Unit autocomplete
    this.unitControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => typeof value === 'string' ? value : value?.name),
      map(name => name ? this.units.filter((u: any) => u.name.toLowerCase().includes(name.toLowerCase())) : this.units)
    ).subscribe(filtered => this.filteredUnits = filtered);
  
    this.contactControl.valueChanges.subscribe((val: any) => {
      if (val?.id) this.form.get('contact_id')?.setValue(val.id);
    });
  
    this.unitControl.valueChanges.subscribe((val: any) => {
      if (val?.id) this.form.get('unit_id')?.setValue(val.id);
    });
  }

  autocompleteObjectValidator() {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value && typeof value === 'object' && value.id) {
        return null; 
      }
      return { invalidSelection: true }; 
    };
  }


  displayContact(contact: any): string {
    return contact ? `${contact.name} - ${contact.mob1}` : '';
  }
  
  displayUnit(unit: any): string {
    return unit?.name || '';
  }

  validateContactControl(): void {
    const value:any = this.contactControl.value;
    if (!value || typeof value !== 'object' || !value.id) {
      this.contactControl.setErrors({ invalidSelection: true });
    } else {
      this.contactControl.setErrors(null);
    }
    this.contactControl.markAsTouched();
  }
  getAllUnits() {
    this.unitService.find({ pageSize: 1000 }).subscribe((res: any) => {
      if (res.data) {
        this.units = res.data;
      }
    });
  }
  getAllSuppliers() {
    this.supplierService.find({}).subscribe((res: any) => {
      if (res.data) {
        this.suppliers = res.data;
      }
    });
  }

  getAllConntact() {
    this.contactService.find({}).subscribe((res: any) => {
      if (res.data) {
        this.contacts = res.data;
      }
    });
  }
  getAllProduct() {
    this.productService.find({}).subscribe((res: any) => {
      if (res.data) {
        this.products = res.data;
      }
    });
  }

  get purchaseDetails(): FormArray {
    return this.form.get('purchaseDetails') as FormArray;
  }
  initializeForm(): void {
    this.form = this.fb.group({
      contact_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      supplier_id: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      notes: [''],
      purchaseDetails: this.fb.array([]),
    });
  }

  createPurchaseDetail(): FormGroup {
    return this.fb.group({
      product_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]], // Added quantity field
      amount: [null, Validators.required],
    });
  }

  addPurchaseDetail(): void {
    this.purchaseDetails.push(this.createPurchaseDetail());
  }

  removePurchaseDetail(index: number): void {
    if (this.purchaseDetails.length > 1) {
      this.purchaseDetails.removeAt(index);
    }
  }

  patchForm(purchase: any): void {
    this.form.patchValue(purchase);
    this.purchaseDetails.clear();

    purchase.purchase_details.forEach((detail: any) => {
      this.purchaseDetails.push(this.fb.group({
        product_id: [detail.product_id, Validators.required],
        unit_id: [detail.unit_id, Validators.required],
        quantity: [detail.quantity || 1, [Validators.required, Validators.min(1)]],
        amount: [detail.amount, Validators.required]
      }));
    });

    const selectedContact = this.contacts.find((c:any) => c.id === purchase.contact_id);
    const selectedUnit = this.units.find((u:any) => u.id === purchase.unit_id);
    if (selectedContact) this.contactControl.setValue(selectedContact);
    if (selectedUnit) this.unitControl.setValue(selectedUnit);
  }

  ngAfterViewInit(): void {
    this.isLoading = false;
    this.spinnerService.hide();

    this.dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false;
      this.spinnerService.hide();
    });
  }

  onSubmit(): void {
    this.commonService.markFormGroupTouched(this.form);

    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }

    this.isLoading = true;
    this.spinnerService.show();

    if (this.isEdit && this.data.model) {
      const payload = this.form.value;
      payload.id = this.data.model.id;

      this.purchaseService.update(payload).subscribe({
        complete: () => {
          this.commonService.toastr.success('Purchase Updated');
          this.dialogRef.close(this.data.model);
          this.isLoading = false;
          this.spinnerService.hide();
        },
        error: (err) => {
          this.commonService.handleError(err);
          this.isLoading = false;
          this.spinnerService.hide();
        },
      });
      return;
    }

    const purchaseData = this.form.value;
    this.purchaseService.create(purchaseData).subscribe({
      complete: () => {
        this.commonService.toastr.success('Purchase Item Created');
        this.dialogRef.close(purchaseData);
        this.isLoading = false;
        this.spinnerService.hide();
      },
      error: (err) => {
        this.commonService.handleError(err);
        this.isLoading = false;
        this.spinnerService.hide();
      },
    });
  }
}
