import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { ProductService } from '../../product/product.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { filter, map, Observable, startWith, take } from 'rxjs';
import { PartiesModel } from '../../parties/parties.model';
import { PartiesService } from '../../parties/parties.service';
import { ProductModel } from '../../product/product.model';
import { UnitModel } from 'src/app/modules/settings/unit/unit.model';
import { SaleModel } from '../sale.model';
import { SaleService } from '../sale.service';

@Component({
  selector: 'app-add-sale',
  templateUrl: './add-sale.component.html',
  styleUrls: ['./add-sale.component.scss'],
  standalone: false,
})
export class AddSaleComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  contacts: any = [];
  units: any = [];
  products: any = [];
  updatingAmountFromCode: boolean = false;
  isManualAmount: boolean = false;
  filteredPartiesByName: Observable<PartiesModel[]>;
  filteredPartiesByMobile: Observable<PartiesModel[]>;
  parties: any[] = [];
  tax_rates: any[] = [];
  showCashFields: boolean = true;
  showOnlineFields: boolean = false;

  isNameSelected = false;
  isMobileSelected = false;
  filteredProductList: ProductModel[][] = [];
  filteredUnitsList: any[][] = [];
  searchValue: '';
  isEdit = false;
  isLoading = false;
  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddSaleComponent>);
  readonly data = inject<{
    model: SaleModel;
    isEdit: boolean;
    tax_rates: any[];
  }>(MAT_DIALOG_DATA);

  saleItems: SaleModel[] = [];

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private unitService: UnitService,
    private productService: ProductService,
    private saleService: SaleService,
    private spinnerService: SpinnerService,
    private partyService: PartiesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isEdit = this.data.isEdit;
    this.tax_rates = this.data.tax_rates || [];
    this.getAllParties();
    this.getAllUnits();
    this.getAllProducts();

    this.form = this.fb.group({
      party_id: [null],
      mobile: [null, Validators.required],
      name: [null, Validators.required],
      unit_id: [null, Validators.required],
      amount: [null, Validators.required],
      notes: [''],
      net_total: [0],
      discount_amount: [0, this.negativeValueValidator()],
      discount_type: [1],
      payment_method: [1],
      cash_amount: [0, Validators.required],
      online_amount: [0],
      transaction_id: [''],
      saleDetails: this.fb.array([]),
    });

    this.addSaleDetail();

    this.form.get('discount_amount')?.valueChanges.subscribe(() => this.calculateNetTotal());
    this.form.get('discount_type')?.valueChanges.subscribe(() => this.calculateNetTotal());
    this.form.get('amount')?.valueChanges.subscribe(() => {
      if (!this.updatingAmountFromCode) {
        this.isManualAmount = true;
        this.calculateNetTotal();
      }
    });

    if (this.isEdit) {
      this.patchForm(this.data.model);
    }
  }

  get saleDetails(): FormArray {
    return this.form.get('saleDetails') as FormArray;
  }

  createSaleDetail(): FormGroup {
    const detailFormGroup = this.fb.group({
      product_id: [null, Validators.required],
      product_name: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), this.negativeValueValidator()]],
      unit_id: [null, Validators.required],
      unit_name: [null, Validators.required],
      price_per_unit: [0, [Validators.required, this.negativeValueValidator()]],
      sale_price_tax_type: [null],
      discount_amount: [0, this.negativeValueValidator()],
      sale_price_discount_type: [1],
      tax_amount: [0],
      rate:[0],
      tax_rate: [null],
      net: [0],
    });
    return detailFormGroup;
  }

  addSaleDetail(): void {
    const newDetail = this.createSaleDetail();
    this.saleDetails.push(newDetail);
    this.setupSaleDetailItem(newDetail, this.saleDetails.length - 1);
  }

  removeSaleDetail(index: number): void {
    if (this.saleDetails.length > 1) {
      this.saleDetails.removeAt(index);
      this.calculateNetTotal();
      this.isManualAmount = false;

      this.filteredProductList.splice(index, 1);
      this.filteredUnitsList.splice(index, 1);
    }
  }

  private negativeValueValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      return value !== null && value < 0 ? { negativeValue: { value: control.value } } : null;
    };
  }

  getAllUnits() {
    this.unitService.find({}).subscribe((res: any) => {
      if (res.data) {
        this.units = res.data;
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

  onProductSelected(selectedProduct: any, index: number): void {
    console.log('selectedProduct', selectedProduct);

    const group = this.saleDetails.at(index) as FormGroup;
    if (!group || !selectedProduct?.units?.length) {
      return;
    }

    const productUnit = selectedProduct.units[0];
    const salePrice = parseFloat(productUnit.sale_price);
    const taxRateId = productUnit.tax_rate_id || null;
    const taxType = productUnit.sale_price_tax_type;
    const discountAmount = parseFloat(productUnit.sale_price_discount_amount) || 0;
    const discountType = productUnit.sale_price_discount_type || 1;
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
        discount_amount: discountAmount || 0,
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
  getAllProducts() {
    this.productService.find({ pageSize: 1000, with: ['units.unit'] }).subscribe({
      next: (res: any) => {
        if (res?.data?.length) {
          this.products = res.data;
          this.setupDropdowns();
        } else {
          this.products = [];
        }
      },
      error: (error: any) => {
        this.products = [];
      },
    });
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
        (product: any) => !selectedIds.includes(product.id) || product.id === currentSelectedProductId
      );
      if (!this.filteredProductList[index]) {
        this.filteredProductList[index] = [];
      }
      this.filteredProductList[index] = availableProducts;
    });
    this.cdr.detectChanges();
  }

  updateFilteredUnits(index?: number): void {
    if (!this.saleDetails) {
      return;
    }
    const controlsToUpdate =
      index !== undefined ? [this.saleDetails.controls[index]] : this.saleDetails.controls;
    controlsToUpdate.forEach((group, i) => {
      const currentRowIndex = index !== undefined ? index : i;
      if (!group) {
        return;
      }
      const selectedProductId = group.get('product_id')?.value;
      let unitsForProduct = [...this.units];
      if (selectedProductId) {
        const selectedProduct: any = this.products.find((p: any) => p.id === selectedProductId);
        unitsForProduct = selectedProduct?.product_unit?.map((pu: any) => pu.unit) || [];
      }
      const unitNameControl = group.get('unit_name');
      const searchValue = (unitNameControl?.value || '').toLowerCase();
      const filtered = unitsForProduct.filter((unit: any) => unit.name.toLowerCase().includes(searchValue));

      if (!this.filteredUnitsList[currentRowIndex]) {
        this.filteredUnitsList[currentRowIndex] = [];
      }
      this.filteredUnitsList[currentRowIndex] = [...filtered];
      this.cdr.detectChanges();
    });
  }

  onUnitSelected(selectedUnitName: string, index: number): void {
    const group = this.saleDetails.at(index);
    const selectedUnit = this.filteredUnitsList[index].find((u: UnitModel) => u.name === selectedUnitName);
    if (selectedUnit) {
      group.get('unit_id')?.setValue(selectedUnit.id);
    }
  }

  searchUnit(event: any, index: number) {
    this.getAllUnits();
    let list;
    this.searchValue = event.target.value;
    list = this.units.filter((unit: any) => unit.name.toLowerCase().includes(this.searchValue.toLocaleLowerCase()));
    this.filteredUnitsList[index] = list;
  }

  private setupSaleDetailItem(group: FormGroup, index: number): void {
    if (!group) {
      return;
    }
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
          (product: any) => !selectedIds.includes(product.id) || product.id === group.get('product_id')?.value
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

  calculateItemNet(index: number): void {
    const group = this.saleDetails.at(index);
    const quantity = parseFloat(group.get('quantity')?.value || 0);
    let pricePerUnit = parseFloat(group.get('price_per_unit')?.value || 0);
    const taxRateControl = group.get('tax_rate');
    const taxRate = taxRateControl ? this.tax_rates.find((t: any) => t.id === taxRateControl.value)?.rate || 0 : 0;
    const discountAmount = parseFloat(group.get('discount_amount')?.value || 0);
    const discountType = group.get('sale_price_discount_type')?.value;
    const taxType = group.get('sale_price_tax_type')?.value || 2;

    let basePricePerUnit = pricePerUnit;

    if (discountType === 1) {
      pricePerUnit -= discountAmount;
    } else if (discountType === 2) {
      pricePerUnit -= (pricePerUnit * discountAmount) / 100;
    }

    pricePerUnit = Math.max(0, pricePerUnit);

    basePricePerUnit = pricePerUnit;
    pricePerUnit = basePricePerUnit * (1 + taxRate / 100);

    const taxPerUnit = (basePricePerUnit * taxRate) / 100;
    const totalTaxAmount = taxPerUnit * quantity;
    const totalItemAmount = pricePerUnit * quantity;

    group.get('tax_amount')?.setValue(parseFloat(totalTaxAmount.toFixed(2)), { emitEvent: false });
    group.get('amount')?.setValue(parseFloat(totalItemAmount.toFixed(2)), { emitEvent: false });
    group.get('net')?.setValue(parseFloat(totalItemAmount.toFixed(2)), { emitEvent: false });
    this.calculateNetTotal();
  }

  calculateNetTotal(): void {
    let totalNet = 0;
    this.saleDetails.controls.forEach((ctrl) => {
      totalNet += parseFloat(ctrl.get('net')?.value || 0);
    });

    if (this.isManualAmount) {
      totalNet = parseFloat(this.form.get('amount')?.value) || 0;
    } else {
      this.updatingAmountFromCode = true;
      this.form.get('amount')?.setValue(parseFloat(totalNet.toFixed(2)), { emitEvent: false });
      this.updatingAmountFromCode = false;
    }

    const discountAmount = parseFloat(this.form.get('discount_amount')?.value) || 0;
    const discountType = this.form.get('discount_type')?.value;
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

  patchForm(sale: any): void {
    this.form.patchValue({
      ...sale,
      name: sale.party.name,
      mobile: sale.party.mobile,
      party_id: sale.party_id,
    });

    this.saleDetails.clear();
    this.filteredProductList = [];
    this.filteredUnitsList = [];

    sale.sale_details.forEach((detail: any, index: any) => {
      console.log(detail);
      let p_unit = detail?.product?.units[0] || {};
      console.log('units', p_unit);

      const salePrice = parseFloat(p_unit.sale_price);
      const taxRateId = p_unit.tax_rate_id || null;
      const taxType = p_unit.sale_price_tax_type;
      const discountAmount = parseFloat(p_unit.sale_price_discount_amount) || 0;
      const discountType = p_unit.sale_price_discount_type || 1;
      const taxRateObj = this.tax_rates.find((t) => t.id === taxRateId);
      const taxRatePercentage = taxRateObj ? taxRateObj.rate : 0;

      let pricePerUnit: number;
      if (taxType === 1) {
        pricePerUnit = salePrice / (1 + taxRatePercentage / 100);
      } else {
        pricePerUnit = salePrice;
      }
      const detailGroup = this.fb.group({
        product_id: [detail.product_id, Validators.required],
        product_name: [detail.product?.name, Validators.required],
        quantity: [detail.quantity || 1, [Validators.required, Validators.min(1)]],
        unit_id: [detail.unit_id, Validators.required],
        unit_name: [detail.unit?.name, Validators.required],
        price_per_unit: [pricePerUnit?.toFixed(2), [Validators.required, this.negativeValueValidator()]],
        sale_price_tax_type: [taxType],
        discount_amount: [detail.discount_amount, this.negativeValueValidator()],
        sale_price_discount_type: [detail.discount_type],
        tax_amount: [0],
        rate:[detail?.rate],
        tax_rate: [p_unit.tax_rate_id],
        net: [detail.net],
      });

      this.saleDetails.push(detailGroup);
      this.setupSaleDetailItem(detailGroup, index);

      this.calculateItemNet(index);
      this.cdr.detectChanges();
    });
    this.calculateNetTotal();
    this.updateFilteredProducts();
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    this.isLoading = false;
    this.spinnerService.hide();

    this.dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false;
      this.spinnerService.hide();
    });
  }

  getAllParties() {
    this.partyService.find({ pageSize: 1000 }).subscribe({
      next: (res: any) => {
        if (res?.data?.length) {
          this.parties = res.data;
          this.setupDropdowns();
        } else {
          this.parties = [];
        }
      },
      error: (error: any) => {
        this.parties = [];
      },
    });
  }

  displayProductName(product: ProductModel | string): string {
    return (product as ProductModel)?.name || (product as string);
  }

  onContactBlur(): void {
    const mobileValue = this.form.get('mobile')?.value;
    const match = this.parties.find((c) => c.mobile === mobileValue);
    if (!match) {
      this.form.patchValue({ name: '', party_id: null });
      this.isNameSelected = false;
    }
  }

  onNameBlur(): void {
    const nameValue = this.form.get('name')?.value;
    const match = this.parties.find((c) => c.name === nameValue);
    if (!match && this.isMobileSelected) {
      this.form.patchValue({ mobile: '', party_id: null });
      this.isMobileSelected = false;
    }
  }

  setupDropdowns(): void {
    this.filteredPartiesByName = this.form.controls.name.valueChanges.pipe(
      map((val) => {
        const value = (typeof val === 'string' ? val : val?.name || '').toLowerCase().trim();
        const regex = new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        return this.parties
          .filter((party) => !value || party.name.toLowerCase().includes(value))
          .map((party) => ({
            ...party,
            html: `${party.name.replace(regex, (match: any) => `<strong>${match}</strong>`)} - [${party.mobile}]`,
          }));
      })
    );

    this.filteredPartiesByMobile = this.form.controls.mobile.valueChanges.pipe(
      map((val) => {
        const value = (typeof val === 'string' ? val : val?.mobile || '').toLowerCase().trim();
        const regex = new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        return this.parties
          .filter((party) => !value || party.mobile.toLowerCase().includes(value))
          .map((party) => ({
            ...party,
            html: `${party.name} - [${party.mobile.replace(regex, (match: any) => `<strong>${match}</strong>`)}]`,
          }));
      })
    );

    this.form.get('name')?.valueChanges.subscribe((value) => {
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
            name: match.name,
            party_id: match.id,
          },
          { emitEvent: false }
        );
      } else {
        this.isMobileSelected = false;
      }
    });
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

  onSubmit(): void {
    this.commonService.markFormGroupTouched(this.form);

    
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
      const rateId = detail.tax_rate || null;
      const taxRateObj = this.tax_rates.find((t) => t.id === rateId);
      return {
        ...detail,
        net: detail.net,
        with_tax: withTax,
        tax_rate: this.getFormattedTaxLabel(taxRateObj?.type, taxRateObj?.rate),
      };
    });
    processedSaleDetails.forEach((details: any) => {
      delete details.amount;
    });
    const payload = {
      ...rawForm,

      payment_method: rawForm.payment_method,
      cash_amount: rawForm.cash_amount || 0,
      online_amount: rawForm.online_amount || 0,
      transaction_id: rawForm.transaction_id || '',
      return_amount: this.returnAmount,
      due_amount: this.dueAmount,
      amount: rawForm.amount,
      saleDetails: processedSaleDetails,
      status:1
    };

    if (this.isEdit && this.data.model) {
     
      payload.id = this.data.model.id;

      this.saleService.update(payload).subscribe({
        complete: () => {
          this.commonService.toastr.success('Sale Updated');
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
    } else {
      this.filteredProductList = [];
      this.filteredUnitsList = [];
      this.isManualAmount = false;
    }

    const saleData = this.form.value;
    this.saleService.create(saleData).subscribe({
      complete: () => {
        this.commonService.toastr.success('Sale Item Created');
        this.dialogRef.close(saleData);
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
