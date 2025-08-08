import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { filter, map, startWith, take } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { ProductModel } from '../product/product.model';
import { DirectSaleService } from './direct-sale.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { Router } from '@angular/router';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { UnitModel } from '../../settings/unit/unit.model';
import { UnitService } from '../../settings/unit/unit.service';
import { PartiesModel } from '../parties/parties.model';
import { RateService } from '../product/add-product-unit/rate-service';

@Component({
  selector: 'app-direct-sale',
  templateUrl: './direct-sale.component.html',
  styleUrls: ['./direct-sale.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectSaleComponent implements AfterViewInit, OnInit, OnDestroy {
  subscriptionHandler = new SubscriptionHandler();
  form: FormGroup;
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
  searchValue: '';
  parties: any[] = [];
  tax_rates: any[] = [];

  constructor(
    private fb: FormBuilder,
    private service: DirectSaleService,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private router: Router,
    private unitService: UnitService,
    private taxRateService: RateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAllTaxRates();
    this.getAllProducts();
    this.initializeForm();
    this.validateDiscountAmount();
    this.handlePaymentMethodValidation();

    this.filteredParties = combineLatest([
      this.form.controls.partyName.valueChanges.pipe(),
      this.form.controls.mobile.valueChanges.pipe(),
    ]).pipe(
      map(([partyNameValue, mobileValue]) => {
        const val = (this.form.controls.partyName.value || this.form.controls.mobile.value)?.toLowerCase().trim();

        if (!val) {
          return this.parties.map(party => ({
            ...party,
            html: `${party.name} - [${party.mobile}]`
          }));
        }

        const isFilteringByName = !!this.form.controls.partyName.value;
        const isFilteringByMobile = !!this.form.controls.mobile.value;
        const regex = new RegExp(val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

        return this.parties
          .filter(
            (party) =>
              (isFilteringByName && party.name.toLowerCase().includes(val)) ||
              (isFilteringByMobile && party.mobile.toLowerCase().includes(val))
          )
          .map<PartiesModel>((value: any) => {
            let htmlName = value.name;
            let htmlMobile = value.mobile;

            if (isFilteringByName) {
              htmlName = value.name?.replace(regex, (match: any) => `<strong>${match}</strong>`);
            } else if (isFilteringByMobile) {
              htmlMobile = value.mobile?.replace(regex, (match: any) => `<strong>${match}</strong>`);
            }
            value.html = `${htmlName} - [${htmlMobile}]`;
            return value;
          });
      })
    );

    this.form.get('partyName')?.valueChanges.subscribe((value) => {
      const match = this.parties.find((c) => c.name === value);
      if (match) {
        this.isNameSelected = true;
        this.form.patchValue(
          {
            mobile: match.mobile,
            party_id: match.id,
          },
          { emitEvent: false }
        );
      } else {
        this.isNameSelected = false;
      }
    });

    this.form.get('mobile')?.valueChanges.subscribe((value) => {
      const match = this.parties.find((c) => c.mobile === value);
      if (match) {
        this.isMobileSelected = true;
        this.form.patchValue(
          {
            partyName: match.name,
            party_id: match.id,
          },
          { emitEvent: false }
        );
      } else {
        this.isMobileSelected = false;
      }
    });
  }

  getFormattedTaxLabel(type: number, rate: number): string {
    const taxTypeMap: { [key: number]: string } = {
      1: 'GST',
      2: 'IGST',
      3: 'CGST',
      4: 'SGST',
      5: 'VAT',
      6: 'Service Tax',
      7: 'Other',
    };

    const taxName = taxTypeMap[type] || 'Unknown';
    return `${taxName}@${rate}`;
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
    this.parties = [];
    this.products = [];
    this.units = [];
  }

  initializeForm(): void {
    this.form = this.fb.group({
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
      this.units = res.data;
    });
  }

  getAllTaxRates(): void {
    this.taxRateService
      .find({ pageSize: 1000 })
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          if (res?.data?.length) {
            this.tax_rates = res.data;
          } else {
            this.tax_rates = [];
          }
        },
        error: (error: any) => {
          this.tax_rates = [];
        },
      });
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
        const selectedProduct: any = this.products.find((p) => p.id === selectedProductId);
        unitsForProduct = selectedProduct?.product_unit?.map((pu: any) => pu.unit) || [];
      }

      const searchValue = (group.get('unit_name')?.value || '').toLowerCase();
      const filtered = unitsForProduct.filter((unit: any) => unit.name.toLowerCase().includes(searchValue));

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
      quantity: [1, [Validators.required, Validators.min(1), this.nonNegativeValidator()]],
      price_per_unit: [0, [Validators.required, this.nonNegativeValidator()]],
      discount_amount: [0, [this.nonNegativeValidator()]],
      sale_price_tax_type: [2], 
      sale_price_discount_type: [1],
      tax_rate: [null],
      tax_amount: [0],
      amount: [0, [Validators.required, this.nonNegativeValidator()]],
      net: [{ value: 0, disabled: true }],
    });
  }

  searchUnit(event: any, index: number) {
    this.getAllUnits();
    let list;
    this.searchValue = event.target.value;
    list = this.units.filter((unit: any) => unit.name.toLowerCase().includes(this.searchValue.toLocaleLowerCase()));
    this.filteredUnitsList[index] = list;
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
    this.subscriptionHandler.subscribe = this.service.find({ pageSize: 10000 }).subscribe({
      next: (data: any) => {
        this.products = data.data.products;
        this.parties = data.data.parties;
        this.units = data.data.units;
        this.cdr.detectChanges();
      },
      error: (err) => {
      },
    });
  }

  get saleDetails(): FormArray {
    return this.form.get('saleDetails') as FormArray;
  }

  onContactBlur(): void {
    const mobileValue = this.form.get('mobile')?.value;

    const match = this.parties.find((c) => c.mobile === mobileValue);

    if (!match) {
      this.form.patchValue({ partyName: '', party_id: null });

      this.isNameSelected = false;
    }
  }

  onNameBlur(): void {
    const nameValue = this.form.get('partyName')?.value;
    const match = this.parties.find((c) => c.name === nameValue);
    if (!match && this.isMobileSelected) {
      this.form.patchValue({ mobile: '', party_id: null });
      this.isMobileSelected = false;
    }
  }

  getSelectedProductIds(): number[] {
    return this.saleDetails.controls.map((control) => control.get('product_id')?.value).filter((id) => id !== null);
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
    group
      .get('product_name')
      ?.valueChanges.pipe(
        map((value: any) => {
          const name = typeof value === 'string' ? value.toLowerCase() : value?.name?.toLowerCase() || '';
          return name;
        }),
        filter((name) => name.length > 0 || group.get('product_id')?.value !== null)
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

    group
      .get('unit_name')
      ?.valueChanges.pipe(startWith(''))
      .subscribe(() => {
        this.updateFilteredUnits(index);
      });

    group.get('quantity')?.valueChanges.subscribe(() => this.calculateItemNet(index));
    group.get('price_per_unit')?.valueChanges.subscribe(() => this.calculateItemNet(index));
    group.get('tax_rate')?.valueChanges.subscribe(() => this.calculateItemNet(index));
    group.get('discount_amount')?.valueChanges.subscribe(() => this.calculateItemNet(index));
    group.get('sale_price_discount_type')?.valueChanges.subscribe(() => this.calculateItemNet(index));

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

  calculateItemNet(index: number): void {
    const group = this.saleDetails.at(index);
    const quantity = group.get('quantity')?.value || 0;
    let pricePerUnit = group.get('price_per_unit')?.value || 0;
    const taxRateControl = group.get('tax_rate');
    const taxRate = taxRateControl ? this.tax_rates.find((t) => t.id === taxRateControl.value)?.rate || 0 : 0;
    const discountAmount = group.get('discount_amount')?.value || 0;
    const discountType = group.get('sale_price_discount_type')?.value;
    const taxType = group.get('sale_price_tax_type')?.value || 2; 
  
    let priceAfterDiscountPerUnit = pricePerUnit;
    if (discountType === 1) { 
      
      priceAfterDiscountPerUnit = pricePerUnit - discountAmount;
    } else if (discountType === 2) {
      priceAfterDiscountPerUnit = pricePerUnit - (pricePerUnit * discountAmount) / 100;
    }
    
    priceAfterDiscountPerUnit = Math.max(0, priceAfterDiscountPerUnit);
  
    let netPricePerUnit;
    let taxPerUnit;
  
    if (taxType === 1) { 
      
      netPricePerUnit = priceAfterDiscountPerUnit / (1 + taxRate / 100);
      taxPerUnit = priceAfterDiscountPerUnit - netPricePerUnit;
    } else { 
      
      netPricePerUnit = priceAfterDiscountPerUnit;
      taxPerUnit = (netPricePerUnit * taxRate) / 100;
    }
    
    const totalTaxAmount = taxPerUnit * quantity;
    const totalItemAmount = (netPricePerUnit + taxPerUnit) * quantity;
  
    group.get('tax_amount')?.setValue(parseFloat(totalTaxAmount.toFixed(2)), { emitEvent: false });
    group.get('amount')?.setValue(parseFloat(totalItemAmount.toFixed(2)), { emitEvent: false });
    group.get('net')?.setValue(parseFloat(totalItemAmount.toFixed(2)), { emitEvent: false });
  
    this.calculateNetTotal();
  }

  validateDiscountAmount(): void {
    this.form.get('discount_amount')?.valueChanges.subscribe(() => {
      const discountControl = this.form.get('discount_amount');
      const type = this.form.get('sale_price_discount_type')?.value;
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

    this.form.get('sale_price_discount_type')?.valueChanges.subscribe(() => {
      this.form.get('discount_amount')?.updateValueAndValidity();
      this.cdr.detectChanges();
    });
  }

  onProductSelected(selectedProduct: any, index: number): void {
    const group = this.saleDetails.at(index) as FormGroup;
    if (!group || !selectedProduct?.product_unit?.length) {
      return;
    }

    const productUnit = selectedProduct.product_unit[0];
    const salePrice = parseFloat(productUnit.sale_price);
    const taxRateId = productUnit.tax_rate_id || null;
    const taxType = productUnit.sale_price_tax_type;
    const discountAmount = parseFloat(productUnit.sale_price_discount_amount) || 0;
    const discountType = productUnit.sale_price_discount_type;

    const taxRateObj = this.tax_rates.find((t) => t.id === taxRateId);
    const taxRatePercentage = taxRateObj ? taxRateObj.rate : 0;

    let pricePerUnit: number;

    if (taxType === 1) {
      pricePerUnit = salePrice / (1 + taxRatePercentage / 100);
    } else {
      pricePerUnit = salePrice;
    }

    group.patchValue(
      {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        unit_id: productUnit.unit.id,
        unit_name: productUnit.unit.name,
        price_per_unit: parseFloat(pricePerUnit.toFixed(2)),
        discount_amount: discountAmount||0,
        sale_price_tax_type: taxType,
        sale_price_discount_type: discountType,
        tax_rate: taxRateId, 
      },
      { emitEvent: false }
    );

    this.calculateItemNet(index);

    this.updateFilteredProducts();
    this.updateFilteredUnits(index);
    this.cdr.detectChanges();
  }

  calculateNetTotal(): void {
    let totalNet = 0;
    this.saleDetails.controls.forEach((ctrl) => {
      totalNet += ctrl.get('net')?.value || 0;
    });

    if (this.isManualAmount) {
      totalNet = parseFloat(this.form.get('amount')?.value) || 0;
    } else {
      this.updatingAmountFromCode = true;
      this.form.get('amount')?.setValue(totalNet, { emitEvent: false });
      this.updatingAmountFromCode = false;
    }

    const discountAmount = parseFloat(this.form.get('discount_amount')?.value) || 0;
    const discountType = this.form.get('sale_price_discount_type')?.value;
    let netTotal = totalNet;

    if (discountType === 1) {
      netTotal -= discountAmount;
    } else if (discountType === 2) {
      netTotal -= (totalNet * discountAmount) / 100;
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
      party_id: sale.party_id || null,
      partyName: sale.party ? sale.party.name : '',
      amount: sale.amount || null,
      discount_amount: sale.discount_amount || 0,
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
          price_per_unit: detail.price_per_unit,
          discount_amount: detail.discount_amount||0,
          sale_price_discount_type: detail.discount_type,
          tax_rate: detail.tax_rate,
          tax_amount: detail.tax_amount.toFixed(2),
          amount: detail.amount || 0,
          net: detail.net || detail.quantity * detail.amount,
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
  
    this.saleDetails.controls.forEach((control) => {
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
  
    const processedSaleDetails = rawForm.saleDetails.map((detail: any, index: number) => {
      const saleDetailGroup = this.saleDetails.at(index);
      const salePriceTaxType = saleDetailGroup?.get('sale_price_tax_type')?.value;
      
      const withTax = salePriceTaxType === 1;
      const rateId= detail.tax_rate || null;
      const taxRateObj = this.tax_rates.find((t) => t.id === rateId);
      
      return {
        ...detail,
        rate: detail.amount,
        net: detail.net,
        with_tax: withTax,
        tax_rate: this.getFormattedTaxLabel(taxRateObj?.type, taxRateObj?.rate),
      };
    });
  
     processedSaleDetails.forEach((details:any)=>{
      delete details.amount;
     })
     
    const payload = {
      ...rawForm,
      name: rawForm.partyName,
      payment_method: rawForm.payment_method,
      cash_amount: rawForm.cash_amount || 0,
      online_amount: rawForm.online_amount || 0,
      transaction_id: rawForm.transaction_id || '',
      return_amount: this.returnAmount,
      due_amount: this.dueAmount,
      amount: rawForm.amount,
      saleDetails: processedSaleDetails,
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
      return false;
    }

    if (method === 2 && online + this.dueAmount < netTotal) {
      this.commonService.toastr.error('Online + due Amount must be greater than or equal to Net Total.');
      return false;
    }

    if (method === 3 && cash + online + this.dueAmount < netTotal) {
      this.commonService.toastr.error('Combined Cash and Online amount must cover Net Total.');
      return false;
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
      return (
        (group.get('quantity')?.hasError('negativeValue') && group.get('quantity')?.value < 0) ||
        (group.get('amount')?.hasError('negativeValue') && group.get('amount')?.value < 0)
      );
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

  validateNumericInput(event: KeyboardEvent): void {
    const char = event.key;
    const allowedKeys = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];

    if (!allowedKeys.includes(char) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }

  validateAlphabeticInput(event: KeyboardEvent): void {
    const char = event.key;
    const isLetter = /^[a-zA-Z\s]*$/.test(char);
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (!isLetter && !allowedKeys.includes(char) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }
}