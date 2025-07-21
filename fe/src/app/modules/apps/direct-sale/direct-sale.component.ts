import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ContactModel, ProductModel } from '../product/product.model';
import { DirectSaleService } from './direct-sale.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { Router } from '@angular/router';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { UnitModel } from '../../settings/unit/unit.model';

@Component({
  selector: 'app-direct-sale',
  templateUrl: './direct-sale.component.html',
  styleUrl: './direct-sale.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectSaleComponent implements AfterViewInit, OnInit, OnDestroy {
  subscriptionHandler = new SubscriptionHandler();
  form: FormGroup;
  contacts: any[] = [];
  filteredContacts: Observable<ContactModel[]>;
  filteredNames: Observable<ContactModel[]>;
  products: ProductModel[] = [];
  filteredProductsList: ProductModel[][] = [];
  units: UnitModel[] = [];
  filteredUnitsList: any[][] = [];
  isNameSelected = false;
  isMobileSelected = false;
  isLoading = false;
  isEdit = false;
  isManualAmount: boolean = false;
  updatingAmountFromCode: boolean = false;
  showCashFields: boolean = true;
  showOnlineFields: boolean = false;
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
    this.handlePaymentMethodValidation();

    this.filteredNames = this.form.controls.name.valueChanges.pipe(
      startWith(''),
      map((value: string) => {
        const val = value?.toLowerCase().trim();
        const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        return this.contacts
          .filter((contact) => contact.name.toLowerCase().includes(val))
          .map<ContactModel>((value: ContactModel) => {
            value.html =
              value.name?.replace(regex, (match: any) => `<strong>${match}</strong>`) + `&nbsp;[${value.mob1}]`;
            return value;
          });
      })
    );

    this.filteredContacts = this.form.controls.mobile.valueChanges.pipe(
      startWith(''),
      map((value: string) => {
        const val = value?.toLowerCase().trim();
        const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        return this.contacts
          .filter((contact) => contact.mob1.toLowerCase().includes(val))
          .map((value) => {
            value.html =
              value.name + '&nbsp; [' + value.mob1.replace(regex, (match: any) => `<strong>${match}</strong>`) + ']';
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

  ngAfterViewInit(): void {
    this.isLoading = false;
    this.spinnerService.hide();
  }

  ngOnDestroy(): void {
    this.subscriptionHandler.unsubscribe();
    this.form.reset();
    this.filteredUnitsList = [];
    this.filteredProductsList = [];
    this.contacts = [];
    this.products = [];
    this.units = [];
  }

  initializeForm(): void {
    this.form = this.fb.group({
      contact_id: [null],
      mobile: [null, Validators.required],
      name: [null, Validators.required],
      unit_id: [null],
      amount: [0, [Validators.required, this.nonNegativeValidator()]],
      discount_amount: [0, [this.nonNegativeValidator()]],
      discount_type: [1],
      net_total: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      notes: [''],
      status: [1, Validators.required],
      payment_method: [1, Validators.required],
      cash_amount: [null, [Validators.required, Validators.min(0), this.nonNegativeValidator()]],
      online_amount: [null, this.nonNegativeValidator()],
      transaction_id: [null],
      saleDetails: this.fb.array([this.createSaleDetailWithCalculation(0)]),
    });

    this.form.get('discount_amount')?.valueChanges.subscribe(() => this.calculateNetTotal());
    this.form.get('discount_type')?.valueChanges.subscribe(() => this.calculateNetTotal());

    this.form.get('amount')?.valueChanges.subscribe(() => {
      if (!this.updatingAmountFromCode) {
        this.isManualAmount = true;
        this.calculateNetTotal();
      }
    });
  }

  handlePaymentMethodValidation(): void {
    this.form.get('payment_method')?.valueChanges.subscribe((type) => {
      const cash = this.form.get('cash_amount');
      const online = this.form.get('online_amount');
      const txn = this.form.get('transaction_id');

      // Clear all validators initially
      cash?.clearValidators();
      online?.clearValidators();
      txn?.clearValidators();

      // Update visibility and validators based on selection
      if (type == 1) {
        // Online
        this.showCashFields = true;
        this.showOnlineFields = false;
        online?.setValue(0);
        txn?.setValue('');
        cash?.setValidators([Validators.required, Validators.min(0)]);
      } else if (type == 2) {
        // Cash
        this.showOnlineFields = false;
        this.showCashFields = false;
        cash?.setValue(0);
        online?.setValue(this.form.get('net_total')?.value || 0);
        // online?.setValidators([Validators.required, Validators.min(0.01)]);
        // txn?.setValidators([Validators.required]);
      } else if (type == 3) {
        // Split
        this.showCashFields = true;
        this.showOnlineFields = true;
        cash?.setValidators([Validators.required, Validators.min(0)]);
        online?.setValidators([Validators.required, Validators.min(0.01)]);
        txn?.setValidators([Validators.required]);
      }

      // Apply validation updates
      cash?.updateValueAndValidity();
      online?.updateValueAndValidity();
      txn?.updateValueAndValidity();
    });
  }

  get returnAmount(): number {
    const net = this.form.get('net_total')?.value || 0;
    const cash = parseFloat(this.form.get('cash_amount')?.value) || 0;
    const online = parseFloat(this.form.get('online_amount')?.value) || 0;
    const type = this.form.get('payment_method')?.value;

    let returnAmt = 0;
    if (type === 1) {
      returnAmt = cash - net;
    } else if (type === 2) {
      returnAmt = online - net;
    } else if (type === 3) {
      returnAmt = cash + online - net;
    }

    return returnAmt > 0 ? parseFloat(returnAmt.toFixed(2)) : 0;
  }

  nonNegativeValidator() {
    return (control: AbstractControl) => {
      const value = parseFloat(control.value);
      if (isNaN(value)) return null;
      return value < 0 ? { negativeValue: true } : null;
    };
  }

  getAllProducts() {
    this.subscriptionHandler.subscribe = this.service.find().subscribe({
      next: (data: any) => {
        this.products = data.data.products;
        this.contacts = data.data.contacts;
        this.units = data.data.units;
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

  onContactBlur(): void {
    const mobileValue = this.form.get('mobile')?.value;
    const match = this.contacts.find((c) => c.mob1 === mobileValue);
    if (!match) {
      this.form.patchValue({ name: '', contact_id: null });
      this.isNameSelected = false;
    }
  }

  onNameBlur(): void {
    const nameValue = this.form.get('name')?.value;
    const match = this.contacts.find((c) => c.name === nameValue);
    if (!match && this.isMobileSelected) {
      this.form.patchValue({ mobile: '', contact_id: null });
      this.isMobileSelected = false;
    }
  }

  getSelectedProductIds(): number[] {
    return this.saleDetails.controls.map((control) => control.get('product_id')?.value).filter((id) => id !== null);
  }

  updateFilteredProducts(): void {
    const selectedIds = this.getSelectedProductIds();

    this.filteredProductsList = this.saleDetails.controls.map((_, index) => {
      const currentSelected = this.saleDetails.at(index).get('product_id')?.value;
      return this.products.filter((product) => !selectedIds.includes(product.id) || product.id === currentSelected);
    });
  }

  createSaleDetailWithCalculation(index: number): FormGroup {
    const group = this.fb.group({
      product_id: [null, Validators.required],
      product_name: [null, Validators.required],
      unit_id: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), this.nonNegativeValidator()]],
      amount: [0, [Validators.required, Validators.min(1), this.nonNegativeValidator()]],
      discount_amount: [0, this.nonNegativeValidator()],
      discount_type: [1],
      net: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    });

    group.get('quantity')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_type')?.valueChanges.subscribe(() => this.calculateNet(index));

    group.get('product_name')?.valueChanges.subscribe((productId) => {
      const selectedProduct: any = this.products.find((p) => p.name === productId);

      if (selectedProduct && Array.isArray(selectedProduct.product_unit)) {
        this.filteredUnitsList[index] = selectedProduct.product_unit.map((pu: any) => pu.unit);
        group.get('unit_id')?.setValue(this.filteredUnitsList[index][0].id);
        group.patchValue(
          {
            quantity: 1,
            amount: selectedProduct?.product_unit?.find((p: any) => p.unit_id == this.filteredUnitsList[index][0].id)
              ?.sale_price,
            product_id: selectedProduct.id,
          },
          { emitEvent: true }
        );
        this.subscriptionHandler.subscribe = group.get('unit_id')?.valueChanges.subscribe((unitId) => {
          group
            .get('amount')
            ?.patchValue(selectedProduct.product_unit.find((p: any) => p.unit_id == unitId)?.sale_price);
        });
      } else {
        console.log('I');
        this.filteredUnitsList[index] = this.units;
        group.get('unit_id')?.reset();
        group.get('product_id')?.reset();
      }
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
      payment_method: sale.payment_method || 1,
      cash_amount: sale.cash_amount || null,
      online_amount: sale.online_amount || null,
      transaction_id: sale.transaction_id || null,
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
    if (!this.validateData()) {
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
      payment_method: rawForm.payment_method,
      cash_amount: rawForm.cash_amount || 0,
      online_amount: rawForm.online_amount || 0,
      transaction_id: rawForm.transaction_id || '',
      return_amount: this.returnAmount,
    };

    this.subscriptionHandler.subscribe = this.service.create(payload).subscribe({
      next: (response: any) => {
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

  validateData() {
    const netTotal = this.form.get('net_total')?.value || 0;
    const cash = parseFloat(this.form.get('cash_amount')?.value) || 0;
    const online = parseFloat(this.form.get('online_amount')?.value) || 0;
    const method = this.form.get('payment_method')?.value;
    const returnAmt = this.returnAmount;

    if (returnAmt < 0) {
      this.commonService.toastr.error('Return amount cannot be negative.');
      return;
    }

    if (method === 1 && cash < netTotal) {
      this.commonService.toastr.error('Cash amount must be greater than or equal to Net Total.');
      return;
    }

    if (method === 2 && online < netTotal) {
      this.commonService.toastr.error('Online amount must be greater than or equal to Net Total.');
      return;
    }

    if (method === 3 && cash + online < netTotal) {
      this.commonService.toastr.error('Combined Cash and Online amount must cover Net Total.');
      return;
    }

    const invalidFields = ['amount', 'discount_amount', 'cash_amount', 'online_amount'].filter((field) => {
      const control = this.form.get(field);
      return control?.hasError('negativeValue');
    });

    if (invalidFields.length > 0) {
      this.commonService.toastr.error('Negative values are not allowed in in any amount fields.');
      return;
    }

    const saleDetailsInvalid = this.saleDetails.controls.some((group) => {
      return group.get('amount')?.hasError('negativeValue') || group.get('discount_amount')?.hasError('negativeValue');
    });

    if (saleDetailsInvalid) {
      this.commonService.toastr.error('Negative values are not allowed in sale item fields.');
      return;
    }

    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }
    return true;
  }
}
