import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ContactModel, ProductModel } from '../product/product.model';
import { DirectSaleService } from './direct-sale.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { Router } from '@angular/router';
import { find } from 'lodash';

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
  isLoading = false;
  isEdit = false;
  units: any[] = [];
  filteredUnitsList: any[][] = [];

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
      amount: [{ value: 0 }, [Validators.required]],
      discount_amount: [0, [Validators.required, Validators.min(0)]],
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

    this.form.get('discount_amount')?.valueChanges.subscribe(() => this.calculateNetTotal());
    this.form.get('discount_type')?.valueChanges.subscribe(() => this.calculateNetTotal());
  }

  private _filter<T extends ContactModel>(value: string): T[] {
    const filterValue = value.toLowerCase().replace(/\s/g, '');
    return this.contacts.filter(
      (contact) =>
        contact.mob1?.toLowerCase().includes(filterValue) || contact.name?.toLowerCase().includes(filterValue)
    );
  }

  contactSelected(event: any) {
    const selectedMob = event?.option?.value;
    const matched = this.contacts.find((c) => c.mob1 === selectedMob);

    if (matched) {
      this.form.patchValue({
        name: matched.name,
        contact_id: matched.id,
      });
    }
  }

  nameSelected(event: any) {
    const selectedName = event?.option?.value;
    const matched = this.contacts.find((c) => c.name === selectedName);

    if (matched) {
      this.form.patchValue({
        mobile: matched.mob1,
        contact_id: matched.id,
      });
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
      unit_id: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      amount: [0, [Validators.required, Validators.min(1)]],
      discount_amount: [0, [Validators.required, Validators.min(0)]],
      discount_type: [1, Validators.required],
      net: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    });

    group.get('quantity')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_type')?.valueChanges.subscribe(() => this.calculateNet(index));

    group.get('product_id')?.valueChanges.subscribe((productId) => {
      const selectedProduct: any = this.products.find((p) => p.id === productId);
      console.log(selectedProduct);
      if (selectedProduct && Array.isArray(selectedProduct.product_unit)) {
        this.filteredUnitsList[index] = selectedProduct.product_unit.map((pu: any) => pu.unit);
        if (this.filteredUnitsList[index].length === 1) {
          group.get('unit_id')?.setValue(this.filteredUnitsList[index][0].id);
          group.get('unit_id')?.valueChanges.subscribe((unitId) => this.setAmount(unitId, selectedProduct));
        } else {
          group.get('unit_id')?.reset();
          group.get('unit_id')?.valueChanges.subscribe((unitId) => {
            console.log(find(selectedProduct?.product_unit, ['unit_id', unitId])?.sale_price);
            group.get('amount')?.setValue(find(selectedProduct?.product_unit, ['unit_id', unitId])?.sale_price);
          });
        }
      } else {
        this.filteredUnitsList[index] = [];
        group.get('unit_id')?.reset();
        group.get('unit_id')?.valueChanges.subscribe((unitId) => {
          console.log(find(selectedProduct?.product_unit, ['unit_id', unitId])?.sale_price);
          group.get('amount')?.setValue(find(selectedProduct?.product_unit, ['unit_id', unitId])?.sale_price);
        });
      }
      this.updateFilteredProducts(); // ✅ update list on change
    });

    return group;
  }

  setAmount(unitId: any, selectedProduct: any) {
    console.log(unitId, selectedProduct);
    return 1;
  }

  addSaleDetail(): void {
    const index = this.saleDetails.length;
    this.filteredUnitsList[index] = [];
    this.saleDetails.push(this.createSaleDetailWithCalculation(index));
    this.updateFilteredProducts(); // ✅
  }

  removeSaleDetail(index: number): void {
    if (this.saleDetails.length > 1) {
      this.saleDetails.removeAt(index);
      this.filteredUnitsList.splice(index, 1);
      this.filteredProductsList.splice(index, 1);
      this.calculateNetTotal();
      this.updateFilteredProducts(); // ✅
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

  calculateNetTotal(): void {
    let totalAmount = 0;

    this.saleDetails.controls.forEach((ctrl) => {
      const quantity = ctrl.get('quantity')?.value || 1;
      const amount = ctrl.get('amount')?.value || 0;
      totalAmount += quantity * amount;
    });

    this.form.get('amount')?.setValue(parseFloat(totalAmount.toFixed(2)), { emitEvent: false });

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

  onSubmit(): void {
    this.commonService.markFormGroupTouched(this.form);

    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }

    this.isLoading = true;
    this.spinnerService.show();

    const rawForm = this.form.getRawValue();

    const payload = {
      ...rawForm,
    };

    this.service.create(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.spinnerService.hide();
        this.commonService.toastr.success('Sale created successfully.');
        this.form.reset();
        this.saleDetails.clear();
        this.filteredUnitsList = [];
        this.filteredProductsList = [];
        this.router.navigate(['/app/sale']);
      },
      error: (error) => {
        this.isLoading = false;
        this.spinnerService.hide();
        console.error('Error creating sale:', error);
        this.cdr.detectChanges();
        this.commonService.toastr.error('Failed to create sale. Please try again.');
      },
    });
  }
}
