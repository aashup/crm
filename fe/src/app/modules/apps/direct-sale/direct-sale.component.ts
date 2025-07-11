import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { ContactService } from 'src/app/modules/settings/contact/contact.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ProductService } from '../product/product.service';
import { SaleService } from '../sale/sale.service';
import { DirectSaleService } from './direct-sale.service';
import { map, startWith } from 'rxjs/operators';
import { ContactModel, ProductModel } from '../product/product.model';
import { Observable } from 'rxjs';
import { MatOption } from '@angular/material/core';

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
  products: any[] = [];
  filteredProducts: Observable<ProductModel[]>;
  isLoading = false;
  isEdit = false;
  readonly _ = _;
  units:any = [];

  constructor(
    private fb: FormBuilder,
    private service: DirectSaleService,
    private commonService: CommonService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    this.getAllProducts();
    this.initializeForm();
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
      contact_id: [null, Validators.required],
      mobile: [null],
      name: [null],
      unit_id: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      discount_amount: [null, [Validators.required, Validators.min(0)]],
      discount_type: [1, Validators.required],
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
  }

  private _filter<T>(value: string): T[] {
    const filterValue = this._normalizeValue(value);
    return this.contacts.filter((contact) => this._normalizeValue(contact.mob1 + contact.name).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  contactSelected(val: any) {
    const tmp = this._filter(val?.option?.value)[0] as any;
    this.form.patchValue({ name: tmp.name, contact_id: tmp.id });
  }

  createSaleDetailWithCalculation(index: number): FormGroup {
    const group = this.fb.group({
      product_id: [null, Validators.required],
      unit_id: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]], // Added quantity field
      amount: [0, [Validators.required, Validators.min(1)]],
      discount_amount: [0, [Validators.required, Validators.min(0)]],
      discount_type: [1, Validators.required],
      net: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    });

    group.get('quantity')?.valueChanges.subscribe(() => this.calculateNet(index)); // Added quantity change listener
    group.get('amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_type')?.valueChanges.subscribe(() => this.calculateNet(index));

    return group;
  }

  addSaleDetail(): void {
    const index = this.saleDetails.length;
    this.saleDetails.push(this.createSaleDetailWithCalculation(index));
  }

  removeSaleDetail(index: number): void {
    if (this.saleDetails.length > 1) {
      this.saleDetails.removeAt(index);
      this.calculateNetTotal();
    }
  }

  calculateNet(index: number): void {
    const item = this.saleDetails.at(index);
    const quantity = item.get('quantity')?.value || 1; // Use quantity in calculation
    const amount = item.get('amount')?.value || 0;
    const discountAmount = item.get('discount_amount')?.value || 0;
    const discountType = item.get('discount_type')?.value;

    let net = amount * quantity; // Multiply amount by quantity

    if (discountType === 1) {
      net -= discountAmount;
    } else if (discountType === 2) {
      net -= ((amount * discountAmount) / 100) * quantity;
    }

    net = Math.max(0, parseFloat(net.toFixed(2)));
    item.get('net')?.setValue(net, { emitEvent: false });

    this.calculateNetTotal();
  }
  calculateNetTotal(): void {
    let total = 0;
    this.saleDetails.controls.forEach((ctrl) => {
      total += ctrl.get('net')?.value || 0;
    });
    this.form.get('net_total')?.setValue(parseFloat(total.toFixed(2)), { emitEvent: false });
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

    if (sale.sale_details && Array.isArray(sale.sale_details)) {
      sale.sale_details.forEach((detail: any, index: number) => {
        const group = this.createSaleDetailWithCalculation(index);
        group.patchValue({
          product_id: detail.product_id || null,
          unit_id: detail.unit_id || null,
          quantity: detail.quantity || 1, // Patch quantity value
          amount: detail.amount || 0,
          discount_amount: detail.discount_amount || 0,
          discount_type: detail.discount_type || 1,
        });
        this.saleDetails.push(group);
        this.calculateNet(index);
      });
    }

    this.calculateNetTotal();
  }
  onSubmit(): void {
    this.commonService.markFormGroupTouched(this.form);

    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }

    this.isLoading = true;
    this.spinnerService.show();

    const payload = {
      ...this.form.getRawValue(),
    };
  }
}
