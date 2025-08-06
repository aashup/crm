import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ProductModel } from '../product/product.model';
import { DirectSaleService } from './direct-sale.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { Router } from '@angular/router';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { UnitModel } from '../../settings/unit/unit.model';
import { UnitService } from '../../settings/unit/unit.service';
import { ProductUnitService } from '../product/product-unit/product-unit.service';
import { PartiesService } from '../parties/parties.service';
import { PartiesModel } from '../parties/parties.model';

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
  filteredContacts: Observable<PartiesModel[]>;
  filteredParties: Observable<PartiesModel[]>;
  products: ProductModel[] = [];
  filteredProductList: ProductModel[][] = [];

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
  searchValue: ""
  parties: any[] = [];

  constructor(
    private fb: FormBuilder,
    private service: DirectSaleService,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private router: Router,
    private unitService: UnitService,
    private partyService: PartiesService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getAllParties()
    this.getAllProducts();
    this.initializeForm();
    this.validateDiscountAmount();
    this.handlePaymentMethodValidation();

    this.filteredContacts = this.form.controls.mobile.valueChanges.pipe(
      startWith(''),
      map((value: string) => {
        const val = value?.toLowerCase().trim();
        const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        return this.contacts
          .filter((contact) => contact.mobile.toLowerCase().includes(val))
          .map((value) => {
            value.html = value.name + '&nbsp; [' + value.mobile.replace(regex, (match: any) => `<strong>${match}</strong>`) + ']';
            return value;
          });
      })
    );
    
    this.filteredParties = this.form.controls.partyName.valueChanges.pipe(
      startWith(''),
      map((value: string) => {
        const val = value?.toLowerCase().trim();
        const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        return this.contacts
          .filter((contact) => contact.name.toLowerCase().includes(val))
          .map<PartiesModel>((value: any) => {
            value.html = value.name?.replace(regex, (match: any) => `<strong>${match}</strong>`) + `&nbsp;[${value.mobile}]`;
            return value;
          });
      })
    );


    this.form.get('partyName')?.valueChanges.subscribe((value) => {
      const match = this.contacts.find((c) => c.name === value);
      if (match) {
        this.isNameSelected = true;
        this.form.patchValue(
          {
            mobile: match.mobile,
            contact_id: match.contact?.id,
            party_id: match.id,
          },
          { emitEvent: false }
        );
      } else {
        this.isNameSelected = false;
      }
    });

    this.form.get('mobile')?.valueChanges.subscribe((value) => {
      const match = this.contacts.find((c) => c.mobile === value);
      if (match) {
        this.isMobileSelected = true;
        this.form.patchValue(
          {
            partyName: match.name,
            contact_id: match.contact?.id,
            party_id: match.id,
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
    this.filteredProductList = [];
    this.contacts = [];
    this.products = [];
    this.units = [];
  }

  initializeForm(): void {
    this.form = this.fb.group({
      contact_id: [null],
      party_id: [null],
      mobile: [null, Validators.required],
      partyName: [null, Validators.required],
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
      saleDetails: this.fb.array([]),
    });

    const firstSaleDetail = this.createSaleDetailGroup();
    this.saleDetails.push(firstSaleDetail);
    this.setupSaleDetailItem(firstSaleDetail, 0);


    this.form.get('discount_amount')?.valueChanges.subscribe(() => this.calculateNetTotal());
    this.form.get('discount_type')?.valueChanges.subscribe(() => this.calculateNetTotal());

    this.form.get('amount')?.valueChanges.subscribe(() => {
      if (!this.updatingAmountFromCode) {
        this.isManualAmount = true;
        this.calculateNetTotal();
      }
    });
  }

  getAllUnits() {
    this.unitService.find({ pageSize: 1000 }).subscribe((res: any) => {
      this.units = res.data
    })
  }

  getAllParties() {
    this.partyService.find({ pageSize: 1000, with: ['contact'] }).subscribe((res: any) => {
      console.log(res.data);
      this.parties = res.data;
      this.contacts = res.data;
      this.cdr.detectChanges();
    },
      error => {
        this.commonService.toastr.error('Failed to fetch parties. Please try again later.');
      }
    );
  }

  handlePaymentMethodValidation(): void {
    this.form.get('payment_method')?.valueChanges.subscribe((type) => {
      const cash = this.form.get('cash_amount');
      const online = this.form.get('online_amount');
      const txn = this.form.get('transaction_id');
      cash?.clearValidators();
      online?.clearValidators();
      txn?.clearValidators();

      if (type == 1) {
        this.showCashFields = true;
        this.showOnlineFields = false;
        online?.setValue(0);
        txn?.setValue('');
        cash?.setValue(this.form.get('net_total')?.value || 0);
        cash?.setValidators([Validators.required, Validators.min(0)]);
      } else if (type == 2) {
        this.showOnlineFields = false;
        this.showCashFields = false;
        cash?.setValue(0);
        online?.setValue(this.form.get('net_total')?.value || 0);

      } else if (type == 3) {
        this.showCashFields = true;
        this.showOnlineFields = true;
        cash?.setValue(0);
        online?.setValue(0);
        cash?.setValidators([Validators.required, Validators.min(0)]);
        online?.setValidators([Validators.required, Validators.min(0)]);
      }

      cash?.updateValueAndValidity();
      online?.updateValueAndValidity();
      txn?.updateValueAndValidity();
    });
  }

  updateFilteredUnits(index?: number): void {
    const controlsToUpdate = index !== undefined ? [this.saleDetails.controls[index]] : this.saleDetails.controls;

    controlsToUpdate.forEach((group, i) => {
      const currentRowIndex = index !== undefined ? index : i;

      const selectedProductId = group.get('product_id')?.value;
      let unitsForProduct = [...this.units];

      if (selectedProductId) {
        const selectedProduct: any = this.products.find(p => p.id === selectedProductId);
        unitsForProduct = selectedProduct?.product_unit?.map((pu: any) => pu.unit) || [];
      }

      const searchValue = (group.get('unit_name')?.value || '').toLowerCase();
      const filtered = unitsForProduct.filter((unit: any) =>
        unit.name.toLowerCase().includes(searchValue)
      );

      if (!this.filteredUnitsList[currentRowIndex]) {
        this.filteredUnitsList[currentRowIndex] = [];
      }
      this.filteredUnitsList[currentRowIndex] = [...filtered];
      this.cdr.detectChanges();
    });
  }

  createSaleDetailGroup(): FormGroup {
    return this.fb.group({
      product_id: [null],
      product_name: [null, Validators.required],
      unit_id: [null, Validators.required],
      unit_name: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      amount: [0, Validators.required],
      net: [{ value: 0, disabled: true }]
    });
  }

  searchUnit(event: any, index: number) {
    this.getAllUnits();
    let list;
    this.searchValue = event.target.value;
    list = this.units.filter((unit: any) => unit.name.toLowerCase().includes(this.searchValue.toLocaleLowerCase()))
    this.filteredUnitsList[index] = list
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

  get dueAmount(): number {
    const net = +this.form.get('net_total')?.value || 0;
    const cash = +this.form.get('cash_amount')?.value || 0;
    const online = +this.form.get('online_amount')?.value || 0;
    const type = this.form.get('payment_method')?.value;

    let paid = 0;

    switch (type) {
      case 1:
        paid = cash;
        break;
      case 2:
        paid = online;
        break;
      case 3:
        paid = cash + online;
        break;
      default:
        paid = 0;
    }

    const dueAmt = Math.max(0, net - paid);
    return dueAmt;
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

        this.units = data.data.units;
        console.log(data);

        this.cdr.detectChanges();
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
    const match = this.contacts.find((c) => c.mobile === mobileValue);
    if (!match) {
      this.form.patchValue({ partyName: '', contact_id: null, party_id: null });
      this.isNameSelected = false;
    }
  }

  onNameBlur(): void {
    const nameValue = this.form.get('partyName')?.value;
    const match = this.contacts.find((c) => c.name === nameValue);
    if (!match && this.isMobileSelected) {
      this.form.patchValue({ mobile: '', contact_id: null, party_id: null });
      this.isMobileSelected = false;
    }
  }

  getSelectedProductIds(): number[] {
    return this.saleDetails.controls
      .map((control) => control.get('product_id')?.value)
      .filter((id) => id !== null);
  }

  updateFilteredProducts(): void {
    const selectedIds = this.getSelectedProductIds();
    this.filteredProductList = [];

    this.saleDetails.controls.forEach((group, index) => {
      const currentSelectedProductId = group.get('product_id')?.value;
      const availableProducts = this.products.filter(
        (product) => !selectedIds.includes(product.id) || product.id === currentSelectedProductId
      );
      if (!this.filteredProductList[index]) {
        this.filteredProductList[index] = [];
      }
      this.filteredProductList[index] = availableProducts;
    });
    this.cdr.detectChanges();
  }

  private setupSaleDetailItem(group: FormGroup, index: number): void {
    group.get('product_name')?.valueChanges
      .pipe(
        map((value: any) => {
          const name = typeof value === 'string' ? value.toLowerCase() : value?.name?.toLowerCase() || '';
          return name;
        }),
        filter(name => name.length > 0 || group.get('product_id')?.value !== null)
      )
      .subscribe((name: string) => {
        if (!this.filteredProductList[index]) {
          this.filteredProductList[index] = [];
        }
        const selectedIds = this.getSelectedProductIds();
        const availableProducts = this.products.filter(
          (product) => !selectedIds.includes(product.id) || product.id === group.get('product_id')?.value
        );

        this.filteredProductList[index] = availableProducts.filter((product: any) =>
          product.name.toLowerCase().includes(name)
        );
        this.cdr.detectChanges();
      });

    group.get('unit_name')?.valueChanges
      .pipe(startWith(''))
      .subscribe(() => {
        this.updateFilteredUnits(index);
      });

    group.get('quantity')?.valueChanges.subscribe(() => {
      const quantity = group.get('quantity')?.value || 0;
      const amount = group.get('amount')?.value || 0;
      group.get('net')?.setValue(quantity * amount, { emitEvent: false });
      this.calculateNetTotal();
    });

    group.get('amount')?.valueChanges.subscribe(() => {
      const quantity = group.get('quantity')?.value || 0;
      const amount = group.get('amount')?.value || 0;
      group.get('net')?.setValue(quantity * amount, { emitEvent: false });
      this.calculateNetTotal();
    });

    this.updateFilteredUnits(index);
  }

  addSaleDetail(): void {
    const group = this.createSaleDetailGroup();
    this.saleDetails.push(group);
    const index = this.saleDetails.length - 1;
    this.setupSaleDetailItem(group, index);
    this.cdr.detectChanges();
  }

  displayProductName(product: ProductModel | string): string {
    return (product as ProductModel)?.name || (product as string);
  }

  onUnitSelected(selectedUnitName: string, index: number): void {
    const group = this.saleDetails.at(index);
    const selectedUnit = this.filteredUnitsList[index].find((u: UnitModel) => u.name === selectedUnitName);
    if (selectedUnit) {
      group.get('unit_id')?.setValue(selectedUnit.id);
    }
  }

  removeSaleDetail(index: number): void {
    if (this.saleDetails.length > 1) {
      this.saleDetails.removeAt(index);
      this.filteredUnitsList.splice(index, 1);
      this.filteredProductList.splice(index, 1);
      this.calculateNetTotal();
      this.updateFilteredProducts();
      this.isManualAmount = false;
      this.cdr.detectChanges();
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
      const net = this.form.get('amount')?.value || 0;
      const discount = parseFloat(discountControl?.value) || 0;
      if (type === 1 && discount > net) {
        discountControl?.setErrors({ exceedsAmount: true });
      } else if (type === 2 && discount > 100) {
        discountControl?.setErrors({ exceedsPercent: true });
      } else {
        if (discountControl?.hasError('exceedsAmount') || discountControl?.hasError('exceedsPercent')) {
          discountControl.setErrors(null);
        }
      }
      this.cdr.detectChanges();
    });

    this.form.get('discount_type')?.valueChanges.subscribe(() => {
      this.form.get('discount_amount')?.updateValueAndValidity();
      this.cdr.detectChanges();
    });
  }
  onProductSelected(selectedProduct: any, index: number): void {
    const group = this.saleDetails.at(index);
    if (group) {
      group.get('product_id')?.setValue(selectedProduct.id);
      group.get('product_name')?.setValue(selectedProduct.name);
      group.get('amount')?.setValue(selectedProduct.product_unit[0].sale_price || 0);

      if (selectedProduct.product_unit && selectedProduct.product_unit.length > 0) {
        const defaultUnit = selectedProduct.product_unit[0].unit;
        if (defaultUnit) {
          group.get('unit_id')?.setValue(defaultUnit.id);
          group.get('unit_name')?.setValue(defaultUnit.name);
        } else {
          group.get('unit_id')?.setValue(null);
          group.get('unit_name')?.setValue(null);
        }
      } else {
        group.get('unit_id')?.setValue(null);
        group.get('unit_name')?.setValue(null);
      }

      this.updateFilteredProducts();
      this.updateFilteredUnits(index);
      this.calculateNetTotal();
      this.cdr.detectChanges();
    }
  }

  calculateNetTotal(): void {
    let totalAmount = 0;
    this.saleDetails.controls.forEach((ctrl) => {
      totalAmount += ctrl.get('net')?.value || 0;
    });

    if (this.isManualAmount) {
      totalAmount = parseFloat(this.form.get('amount')?.value) || 0;
    } else {
      this.updatingAmountFromCode = true;
      this.form.get('amount')?.setValue(totalAmount, { emitEvent: false });
      this.updatingAmountFromCode = false;
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

    if (this.form.get('payment_method')?.value === 1) {
      this.form.get('cash_amount')?.setValue(netTotal, { emitEvent: false });
      this.form.get('online_amount')?.setValue(0, { emitEvent: false });
    } else if (this.form.get('payment_method')?.value === 2) {
      this.form.get('cash_amount')?.setValue(0, { emitEvent: false });
      this.form.get('online_amount')?.setValue(netTotal, { emitEvent: false });
    }

    this.form.get('net_total')?.setValue(netTotal, { emitEvent: false });
    this.cdr.detectChanges();
  }


  navigateToSale(): void {
    this.router.navigate(['/app/sale']);
  }

  patchForm(sale: any): void {
    this.form.patchValue({
      contact_id: sale.contact_id || null,
      party_id: sale.party_id || null,
      partyName: sale.party ? sale.party.name : '',
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
    this.filteredProductList = [];

    if (Array.isArray(sale.sale_details)) {
      sale.sale_details.forEach((detail: any, index: number) => {
        const group = this.createSaleDetailGroup();
        group.patchValue({
          product_id: detail.product_id || null,
          product_name: detail.product?.name || null,
          unit_id: detail.unit_id || null,
          unit_name: detail.unit?.name || null,
          quantity: detail.quantity || 1,
          amount: detail.amount || 0,
          net: detail.net || (detail.quantity * detail.amount),
        });
        this.saleDetails.push(group);
        this.setupSaleDetailItem(group, index);
      });
    }

    this.calculateNetTotal();
    this.updateFilteredProducts();
    this.cdr.detectChanges();
  }

  onUnitBlur(index: number) {
    const group = this.saleDetails.at(index);
    const unitId = group.get('unit_id')?.value;
    const unitName = group.get('unit_name')?.value;

    if (!unitId || !unitName) {
      group.get('unit_name')?.setErrors({ required: true });
      group.get('unit_name')?.markAsTouched();
    } else {
      group.get('unit_name')?.setErrors(null);
    }
    this.cdr.detectChanges();
  }

  onSubmit(redirectToPrint: boolean = false): void {

    this.commonService.markFormGroupTouched(this.form);
    if (!this.validateData()) {
      return;
    }

    this.saleDetails.controls.forEach(control => {
      this.commonService.markFormGroupTouched(control as FormGroup);
    });

    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors in the form.');
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
      name: rawForm.partyName,
      payment_method: rawForm.payment_method,
      cash_amount: rawForm.cash_amount || 0,
      online_amount: rawForm.online_amount || 0,
      transaction_id: rawForm.transaction_id || '',
      return_amount: this.returnAmount,
      due_amount: this.dueAmount,
      amount: rawForm.amount
    };

    delete payload.partyName;
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
          this.filteredProductList = [];
          const newFirstSaleDetail = this.createSaleDetailGroup();
          this.saleDetails.push(newFirstSaleDetail);
          this.setupSaleDetailItem(newFirstSaleDetail, 0);
          this.isManualAmount = false;
          this.cdr.detectChanges();
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
      return false;
    }

    if (method === 1 && cash + this.dueAmount < netTotal) {
      this.commonService.toastr.error('Cash + due Amount must be greater than or equal to Net Total.');
      return;
    }

    if (method === 2 && online + this.dueAmount < netTotal) {
      this.commonService.toastr.error('Online + due Amount must be greater than or equal to Net Total.');
      return;
    }

    if (method === 3 && cash + online + this.dueAmount < netTotal) {
      this.commonService.toastr.error('Combined Cash and Online amount must cover Net Total.');
      return;
    }

    const invalidFields = ['amount', 'discount_amount', 'cash_amount', 'online_amount'].filter((field) => {
      const control = this.form.get(field);
      return control?.hasError('negativeValue');
    });

    if (invalidFields.length > 0) {
      this.commonService.toastr.error('Negative values are not allowed in any amount fields.');
      return false;
    }

    const saleDetailsInvalid = this.saleDetails.controls.some((group) => {
      return (group.get('quantity')?.hasError('negativeValue') && group.get('quantity')?.value < 0) ||
        (group.get('amount')?.hasError('negativeValue') && group.get('amount')?.value < 0);
    });

    if (saleDetailsInvalid) {
      this.commonService.toastr.error('Negative values are not allowed in sale item fields (Quantity or amount).');
      return false;
    }

    const missingUnit = this.saleDetails.controls.some((group) => {
      return !group.get('unit_id')?.value;
    });

    if (missingUnit) {
      this.commonService.toastr.error('Please select a unit for all sale items.');
      return false;
    }


    return true;
  }
}