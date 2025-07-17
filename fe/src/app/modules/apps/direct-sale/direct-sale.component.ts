import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ContactModel, ProductModel } from '../product/product.model';
import { DirectSaleService } from './direct-sale.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-direct-sale',
  templateUrl: './direct-sale.component.html',
  styleUrl: './direct-sale.component.scss',
})
export class DirectSaleComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  contacts: any[] = [];
  filteredContacts: Observable<ContactModel[]>;
  filteredNames: Observable<ContactModel[]>;
  products: ProductModel[] = [];
  filteredProductsList: ProductModel[][] = [];
  units: any[] = [];
  filteredUnitsList: any[][] = [];
  isNameSelected = false;
  isMobileSelected = false;
  isLoading = false;
  isEdit = false;
  isManualAmount: boolean = false;
  updatingAmountFromCode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private service: DirectSaleService,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAllProducts();
    this.initializeForm();
    this.validateDiscountAmount();
  
    // Filtered names
    this.filteredNames = this.form.controls.name.valueChanges.pipe(
      startWith(''),
      map((value: string) => {
        const val = value?.toLowerCase().trim();
        return this.contacts.filter(
          contact => contact.name.toLowerCase().includes(val)
        );
      })
    );
  
    // Filtered mobiles
    this.filteredContacts = this.form.controls.mobile.valueChanges.pipe(
      startWith(''),
      map((value: string) => {
        const val = value?.toLowerCase().trim();
        return this.contacts.filter(
          contact => contact.mob1.toLowerCase().includes(val)
        );
      })
    );
  
    this.form.get('name')?.valueChanges.subscribe(value => {
      const match = this.contacts.find(c => c.name === value);
      if (match) {
        this.isNameSelected = true;
        this.form.patchValue({
          mobile: match.mob1,
          contact_id: match.id
        }, { emitEvent: false });
      } else {
        this.isNameSelected = false;
      }
    });
  
    this.form.get('mobile')?.valueChanges.subscribe(value => {
      const match = this.contacts.find(c => c.mob1 === value);
      if (match) {
        this.isMobileSelected = true;
        this.form.patchValue({
          name: match.name,
          contact_id: match.id
        }, { emitEvent: false });
      } else {
        this.isMobileSelected = false;
      }
    });
  }
  
  ngAfterViewInit(): void {
    this.isLoading = false;
    this.spinnerService.hide();
  }

  getAllProducts() {
    this.service.find().subscribe({
      next: (data: any) => {
        this.products = data.data.products;
        this.contacts = data.data.contacts;
        this.updateFilteredProducts();
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      },
    });
  }

  get saleDetails(): FormArray {
    return this.form.get('saleDetails') as FormArray;
  }

  initializeForm(): void {
    this.form = this.fb.group({
      contact_id: [null],
      mobile: [null, Validators.required],
      name: [null, Validators.required],
      unit_id: [null],
      amount: [0, [Validators.required]],
      discount_amount: [0],
      discount_type: [1],
      net_total: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      notes: [''],
      status: [1, Validators.required],
      saleDetails: this.fb.array([this.createSaleDetailWithCalculation(0)]),
    });

    this.filteredNames = this.form.controls.name.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter<ContactModel>(value || ''))
    );

    this.filteredContacts = this.form.controls.mobile.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter<ContactModel>(value || ''))
    );

    this.form.get('discount_amount')?.valueChanges.subscribe(() => this.calculateNetTotal());
    this.form.get('discount_type')?.valueChanges.subscribe(() => this.calculateNetTotal());

    this.form.get('amount')?.valueChanges.subscribe(() => {
      if (!this.updatingAmountFromCode) {
        this.isManualAmount = true;
        this.calculateNetTotal();
      }
    });
  }

  private _filter<T extends ContactModel>(value: string): T[] {
    const filterValue = value.toLowerCase().replace(/\s/g, '');
    return this.contacts.filter(
      (contact) =>
        contact.mob1?.toLowerCase().includes(filterValue) ||
        contact.name?.toLowerCase().includes(filterValue)
    );
  }

  onContactBlur(): void {
    const mobileValue = this.form.get('mobile')?.value;
    const match = this.contacts.find(c => c.mob1 === mobileValue);
  
    if (!match && this.isNameSelected) {
      // Clear name only if previously selected
      this.form.patchValue({ name: '', contact_id: null });
      this.isNameSelected = false;
    }
  }
  onNameBlur(): void {
    const nameValue = this.form.get('name')?.value;
    const match = this.contacts.find(c => c.name === nameValue);
  
    if (!match && this.isMobileSelected) {
      // Clear mobile only if it was previously selected
      this.form.patchValue({ mobile: '', contact_id: null });
      this.isMobileSelected = false;
    }
  }
  getSelectedProductIds(): number[] {
    return this.saleDetails.controls
      .map(control => control.get('product_id')?.value)
      .filter(id => id !== null);
  }

  updateFilteredProducts(): void {
    const selectedIds = this.getSelectedProductIds();

    this.filteredProductsList = this.saleDetails.controls.map((_, index) => {
      const currentSelected = this.saleDetails.at(index).get('product_id')?.value;
      return this.products.filter(
        product => !selectedIds.includes(product.id) || product.id === currentSelected
      );
    });
  }

  createSaleDetailWithCalculation(index: number): FormGroup {
    const group = this.fb.group({
      product_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      amount: [0, [Validators.required, Validators.min(1)]],
      discount_amount: [0],
      discount_type: [1],
      net: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    });
  
    // Watch for changes and calculate net
    group.get('quantity')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_type')?.valueChanges.subscribe(() => this.calculateNet(index));
  
    // Watch for product change
    group.get('product_id')?.valueChanges.subscribe((productId) => {
      const selectedProduct: any = this.products.find(p => p.id === productId);
  
      // Update units
      if (selectedProduct && Array.isArray(selectedProduct.product_unit)) {
        this.filteredUnitsList[index] = selectedProduct.product_unit.map((pu: any) => pu.unit);
  
        if (this.filteredUnitsList[index].length === 1) {
          group.get('unit_id')?.setValue(this.filteredUnitsList[index][0].id);
        } else {
          group.get('unit_id')?.reset();
        }
      } else {
        this.filteredUnitsList[index] = [];
        group.get('unit_id')?.reset();
      }
  
      group.patchValue({
        quantity: 1,
        amount: null,
      }, { emitEvent: true });
      

      this.updateFilteredProducts();
    });
  
    return group;
  }
  
  addSaleDetail(): void {
    const index = this.saleDetails.length;
    this.filteredUnitsList[index] = [];
    this.saleDetails.push(this.createSaleDetailWithCalculation(index));
    this.updateFilteredProducts();
    this.isManualAmount = false;
  }

  removeSaleDetail(index: number): void {
    if (this.saleDetails.length > 1) {
      this.saleDetails.removeAt(index);
      this.filteredUnitsList.splice(index, 1);
      this.filteredProductsList.splice(index, 1);
      this.calculateNetTotal();
      this.updateFilteredProducts();
      this.isManualAmount = false;
    }
  }

  calculateNet(index: number): void {
    const item = this.saleDetails.at(index);
    const quantity = item.get('quantity')?.value || 1;
    const amount = item.get('amount')?.value || 0;
    const discountAmount = item.get('discount_amount')?.value || 0;
    const discountType = item.get('discount_type')?.value;

    let net = amount * quantity;

    if (discountType === 1) {
      net -= discountAmount;
    } else if (discountType === 2) {
      net -= ((amount * discountAmount) / 100) * quantity;
    }

    net = Math.max(0, parseFloat(net.toFixed(2)));
    item.get('net')?.setValue(net, { emitEvent: false });

    this.calculateNetTotal();
  }
  validateDiscountAmount(): void {
    this.form.get('discount_amount')?.valueChanges.subscribe(() => {
      const discountControl = this.form.get('discount_amount');
      const type = this.form.get('discount_type')?.value;
      const total = this.form.get('amount')?.value || 0;
      const discount = parseFloat(discountControl?.value) || 0;
      if (type === 1 && discount > total) {
        discountControl?.setErrors({ exceedsAmount: true });
      } else if (type === 2 && discount > 100) {
        discountControl?.setErrors({ exceedsPercent: true });
      } else {
        if (discountControl?.hasError('exceedsAmount') || discountControl?.hasError('exceedsPercent')) {
          discountControl.setErrors(null);
        }
      }
    });
  
    this.form.get('discount_type')?.valueChanges.subscribe(() => {
      this.form.get('discount_amount')?.updateValueAndValidity();
    });
  }

  calculateNetTotal(): void {
    let totalAmount = 0;

    if (!this.isManualAmount) {
      this.saleDetails.controls.forEach((ctrl) => {
        const quantity = ctrl.get('quantity')?.value || 1;
        const amount = ctrl.get('amount')?.value || 0;
        totalAmount += quantity * amount;
      });

      totalAmount = parseFloat(totalAmount.toFixed(2));
      this.updatingAmountFromCode = true;
      this.form.get('amount')?.setValue(totalAmount, { emitEvent: false });
      this.updatingAmountFromCode = false;
    } else {
      totalAmount = parseFloat(this.form.get('amount')?.value) || 0;
    }

    const discountAmount = parseFloat(this.form.get('discount_amount')?.value) || 0;
    const discountType = this.form.get('discount_type')?.value;
    let netTotal = totalAmount;

    if (discountType === 1) {
      netTotal -= discountAmount;
    } else if (discountType === 2) {
      netTotal -= (totalAmount * discountAmount) / 100;
    }

    netTotal = Math.max(0, parseFloat(netTotal.toFixed(2)));
    this.form.get('net_total')?.setValue(netTotal, { emitEvent: false });
  }

  navigateToSale(): void {
    this.router.navigate(['/app/sale']);
  }

  patchForm(sale: any): void {
    this.form.patchValue({
      contact_id: sale.contact_id || null,
      unit_id: sale.unit_id || null,
      amount: sale.amount || null,
      discount_amount: sale.discount_amount || null,
      discount_type: sale.discount_type || null,
      notes: sale.notes || '',
      status: sale.status || 1,
    });

    this.saleDetails.clear();
    this.filteredUnitsList = [];
    this.filteredProductsList = [];

    if (Array.isArray(sale.sale_details)) {
      sale.sale_details.forEach((detail: any, index: number) => {
        const group = this.createSaleDetailWithCalculation(index);
        group.patchValue({
          product_id: detail.product_id || null,
          unit_id: detail.unit_id || null,
          quantity: detail.quantity || 1,
          amount: detail.amount || 0,
          discount_amount: detail.discount_amount || 0,
          discount_type: detail.discount_type || 1,
        });
        this.saleDetails.push(group);
        this.calculateNet(index);
      });
    }

    this.calculateNetTotal();
    this.updateFilteredProducts();
  }


 onSubmit(redirectToPrint: boolean = false): void {
  this.commonService.markFormGroupTouched(this.form);

  if (!this.form.valid) {
    this.commonService.toastr.error('Please fix all errors.');
    return;
  }

  this.isLoading = true;
  this.spinnerService.show();

  const rawForm = this.form.getRawValue();
  if (rawForm.mobile && !rawForm.mobile.startsWith('+')) {
    rawForm.mobile = '+91' + rawForm.mobile.trim();
  }
  const payload = {
    ...rawForm,
  };

  this.service.create(payload).subscribe({
    next: (response:any) => {
      this.isLoading = false;
      this.spinnerService.hide();

      const createdId = response?.data?.id || response?.data?.sale?.id;

      this.commonService.toastr.success('Sale created successfully.');
      if (redirectToPrint && createdId) {
        this.router.navigate([`/app/direct-sale/print/${createdId}`]);
      } else {
        this.form.reset();
        this.saleDetails.clear();
        this.filteredUnitsList = [];
        this.filteredProductsList = [];
        this.router.navigate(['/app/sale']);
      }
    },
    error: (error) => {
      this.isLoading = false;
      this.spinnerService.hide();
      this.cdr.detectChanges();
      this.commonService.toastr.error(error.error?.message || 'Failed to create sale. Please try again.');
    },
  });
}

}
