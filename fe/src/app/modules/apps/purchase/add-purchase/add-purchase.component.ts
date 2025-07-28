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
  contactControl = new FormControl('', [Validators.required, this.autocompleteObjectValidator()]);
  filteredContacts: any[] = [];

  unitControl = new FormControl('', [Validators.required, this.autocompleteObjectValidator()]);
  // Use a map or object to store filtered options for each row index
  filteredProductOptions: { [key: number]: any[] } = {};
  filteredUnitOptions: { [key: number]: any[] } = {};

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
      purchaseDetails: this.fb.array([]), // Initialize as empty array
    });

    forkJoin([
      this.unitService.find({ pageSize: 1000 }),
      this.supplierService.find({}),
      this.contactService.find({}),
      this.productService.find({}),
    ]).subscribe(([unitsRes, suppliersRes, contactsRes, productsRes]: any[]) => {
      this.units = unitsRes.data;
      this.suppliers = suppliersRes.data;
      this.contacts = contactsRes.data;
      this.products = productsRes.data;

      if (this.isEdit && this.data.model) {
        this.patchForm(this.data.model);
      } else {
        // For 'Create' mode, add one default purchase detail row
        this.addPurchaseDetail();
      }
    });

    // --- Main Form Controls Autocomplete Logic ---
    this.contactControl.valueChanges
      .pipe(
        startWith(''), // Ensure it emits on initialization for filtering
        map((value: any) => (typeof value === 'string' ? value : value?.name)),
        map((name) =>
          name ? this.contacts.filter((c: any) => c.name.toLowerCase().includes(name.toLowerCase())) : this.contacts
        )
      )
      .subscribe((filtered) => (this.filteredContacts = filtered));

    this.unitControl.valueChanges
      .pipe(
        startWith(''),
        map((value: any) => (typeof value === 'string' ? value : value?.name)),
        map((name) =>
          name ? this.units.filter((u: any) => u.name.toLowerCase().includes(name.toLowerCase())) : this.units
        )
      )
      .subscribe((filtered) => (this.filteredUnits = filtered));

    this.contactControl.valueChanges.subscribe((val: any) => {
      // Ensure the value is an object with an 'id' property before setting
      if (val && typeof val === 'object' && val.id) {
        this.form.get('contact_id')?.setValue(val.id);
      } else {
        this.form.get('contact_id')?.setValue(null); // Clear if not a valid selection
      }
    });

    this.unitControl.valueChanges.subscribe((val: any) => {
      // Ensure the value is an object with an 'id' property before setting
      if (val && typeof val === 'object' && val.id) {
        this.form.get('unit_id')?.setValue(val.id);
      } else {
        this.form.get('unit_id')?.setValue(null); // Clear if not a valid selection
      }
    });
  }

  // --- Autocomplete Validation Functions ---
  autocompleteObjectValidator() {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value && typeof value === 'object' && value.id) {
        return null;
      }
      return { invalidSelection: true };
    };
  }

  validateUnitControl(): void {
    const value: any = this.unitControl.value;
    if (!value || typeof value !== 'object' || !value.id) {
      this.unitControl.setErrors({ invalidSelection: true });
    } else {
      this.unitControl.setErrors(null);
    }
    this.unitControl.markAsTouched();
  }

  validateContactControl(): void {
    const value: any = this.contactControl.value;
    if (!value || typeof value !== 'object' || !value.id) {
      this.contactControl.setErrors({ invalidSelection: true });
    } else {
      this.contactControl.setErrors(null);
    }
    this.contactControl.markAsTouched();
  }

  // --- Display Functions for Autocomplete ---
  displayContact(contact: any): string {
    return contact ? `${contact.name}` : '';
  }

  displayUnit(unit: any): string {
    return unit ? unit.name : '';
  }

  getProductName(product: any): string {
    return product?.name || '';
  }

  getUnitName(unit: any): string {
    return unit?.name || '';
  }

  // --- Form Array (Purchase Details) Functions ---
  get purchaseDetails(): FormArray {
    return this.form.get('purchaseDetails') as FormArray;
  }

  createPurchaseDetail(): FormGroup {
    const group = this.fb.group({
      // These will hold the full object for autocomplete display, but we'll extract the ID for submission
      product_id: [null, [Validators.required, this.autocompleteObjectValidator()]],
      unit_id: [null, [Validators.required, this.autocompleteObjectValidator()]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      amount: [null, Validators.required],
    });
    return group;
  }

  addPurchaseDetail(): void {
    const detailGroup = this.createPurchaseDetail();
    this.purchaseDetails.push(detailGroup);
    const index = this.purchaseDetails.length - 1;

    // Initialize filtered arrays for the new row
    this.filteredProductOptions[index] = this.products;
    this.filteredUnitOptions[index] = this.units;

    const productCtrl = detailGroup.get('product_id');
    const unitCtrl = detailGroup.get('unit_id');

    // Setup autocomplete filtering for product for this specific row
    productCtrl?.valueChanges
      .pipe(
        startWith(''), // Emit an empty string initially to show all options
        map(value => {
          // If value is an object (selected from dropdown), return its name for filtering.
          // If value is a string (being typed), return the string itself.
          return typeof value === 'string' ? value : (value?.name || '');
        }),
        map(name => {
          const filtered = name ? this.products.filter((p: any) => p.name.toLowerCase().includes(name.toLowerCase())) : this.products;
          // Important: If the input is a string that doesn't match any object,
          // or if the user types something invalid, ensure the control's value reflects this.
          // This part is for validation and setting the actual model value later.
          // We don't change the control's value here; it will be an object on selection.
          return filtered;
        })
      )
      .subscribe(filtered => {
        this.filteredProductOptions = { ...this.filteredProductOptions, [index]: filtered };
      });

    // Setup autocomplete filtering for unit for this specific row
    unitCtrl?.valueChanges
      .pipe(
        startWith(''), // Emit an empty string initially to show all options
        map(value => {
          return typeof value === 'string' ? value : (value?.name || '');
        }),
        map(name => {
          const filtered = name ? this.units.filter((u: any) => u.name.toLowerCase().includes(name.toLowerCase())) : this.units;
          return filtered;
        })
      )
      .subscribe(filtered => {
        this.filteredUnitOptions = { ...this.filteredUnitOptions, [index]: filtered };
      });
  }

  removePurchaseDetail(index: number): void {
    if (this.purchaseDetails.length > 1) {
      this.purchaseDetails.removeAt(index);
      // Clean up the filtered options for the removed index
      delete this.filteredProductOptions[index];
      delete this.filteredUnitOptions[index];
    }
  }

  // --- Patch Form for Edit Mode ---
  patchForm(purchase: any): void {
    // Patch main form controls
    this.form.patchValue(purchase);

    // Set value for contact and unit autocomplete controls
    const selectedContact = this.contacts.find((c: any) => c.id === purchase.contact_id);
    const selectedUnit = this.units.find((u: any) => u.id === purchase.unit_id);
    if (selectedContact) {
      this.contactControl.setValue(selectedContact);
    }
    if (selectedUnit) {
      this.unitControl.setValue(selectedUnit);
    }

    // Clear existing purchase details and repopulate
    this.purchaseDetails.clear();
    purchase.purchase_details.forEach((detail: any, i: number) => {
      const product = this.products.find((p: any) => p.id === detail.product_id);
      const unit = this.units.find((u: any) => u.id === detail.unit_id);

      const detailGroup = this.createPurchaseDetail();
      detailGroup.patchValue({
        product_id: product, // Set the full object for display
        unit_id: unit,       // Set the full object for display
        quantity: detail.quantity || 1,
        amount: detail.amount,
      });

      this.purchaseDetails.push(detailGroup);

      // Now set up the autocomplete subscriptions for this specific patched row
      this.filteredProductOptions[i] = this.products;
      this.filteredUnitOptions[i] = this.units;

      const productCtrl = detailGroup.get('product_id');
      const unitCtrl = detailGroup.get('unit_id');

      productCtrl?.valueChanges
        .pipe(
          startWith(product), // Start with the pre-filled value (object)
          map(value => {
            return typeof value === 'string' ? value : (value?.name || '');
          }),
          map(name => {
            const filtered = name ? this.products.filter((p: any) => p.name.toLowerCase().includes(name.toLowerCase())) : this.products;
            return filtered;
          })
        )
        .subscribe(filtered => {
          this.filteredProductOptions = { ...this.filteredProductOptions, [i]: filtered };
        });

      unitCtrl?.valueChanges
        .pipe(
          startWith(unit), // Start with the pre-filled value (object)
          map(value => {
            return typeof value === 'string' ? value : (value?.name || '');
          }),
          map(name => {
            const filtered = name ? this.units.filter((u: any) => u.name.toLowerCase().includes(name.toLowerCase())) : this.units;
            return filtered;
          })
        )
        .subscribe(filtered => {
          this.filteredUnitOptions = { ...this.filteredUnitOptions, [i]: filtered };
        });
    });
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

    // Validate main autocomplete controls
    this.validateContactControl();
    this.validateUnitControl();

    // Validate each purchase detail autocomplete control
    this.purchaseDetails.controls.forEach((group: AbstractControl) => {
      const productCtrl = group.get('product_id');
      const unitCtrl = group.get('unit_id');

      // Manually trigger validation if needed, especially if a value was typed but not selected
      if (productCtrl?.value && typeof productCtrl.value !== 'object') {
          productCtrl.setErrors({ 'invalidSelection': true });
      } else if (!productCtrl?.value?.id) { // Check if a valid ID exists for selected object
          productCtrl?.setErrors({ 'required': true });
      } else {
          productCtrl?.setErrors(null);
      }
      productCtrl?.markAsTouched();


      if (unitCtrl?.value && typeof unitCtrl.value !== 'object') {
          unitCtrl.setErrors({ 'invalidSelection': true });
      } else if (!unitCtrl?.value?.id) { // Check if a valid ID exists for selected object
          unitCtrl?.setErrors({ 'required': true });
      } else {
          unitCtrl?.setErrors(null);
      }
      unitCtrl?.markAsTouched();
    });

    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }

    this.isLoading = true;
    this.spinnerService.show();
    const payload = { ...this.form.value };
    let contact:any=this.contactControl.value
    payload.contact_id = contact.id;
    let unit:any=this.unitControl.value
    payload.unit_id = unit.id;

    payload.purchaseDetails = payload.purchaseDetails.map((detail: any) => ({
      ...detail,
      product_id: detail.product_id.id,
      unit_id: detail.unit_id.id,
    }));


    if (this.isEdit && this.data.model) {
      payload.id = this.data.model.id;

      this.purchaseService.update(payload).subscribe({
        complete: () => {
          this.commonService.toastr.success('Purchase Updated');
          this.dialogRef.close(true); // Indicate success for the dialog opener
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

    this.purchaseService.create(payload).subscribe({
      complete: () => {
        this.commonService.toastr.success('Purchase Item Created');
        this.dialogRef.close(true); // Indicate success for the dialog opener
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