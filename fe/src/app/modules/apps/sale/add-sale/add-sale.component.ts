import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { SaleModel } from '../sale.model';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { ProductService } from '../../product/product.service';
import { SaleService } from '../sale.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { map, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { Observable } from 'rxjs';
import { PartiesService } from '../../parties/parties.service';


@Component({
  selector: 'app-add-sale',
  templateUrl: './add-sale.component.html',
  styleUrls: ['./add-sale.component.scss'],
  standalone: false,
})
export class AddSaleComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  parties: any[] = [];
  units: any[] = [];
  products: any[] = [];
  filteredParties: Observable<any[]>;
  filteredUnits: Observable<any[]>;
  isLoading = false;
  isEdit = false;
  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddSaleComponent>);
  readonly data = inject<{
    model: SaleModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  @ViewChild('partyInput') partyInput: ElementRef<HTMLInputElement>;
  @ViewChild('unitInput') unitInput: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private unitService: UnitService,
    private productService: ProductService,
    private saleService: SaleService,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private partyService: PartiesService,
    private cdr: ChangeDetectorRef
  ) {}

  autocompleteValidator(validList: any[], valueProp: string = 'id'): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return { required: true };
      const isValid = validList.some(item => item[valueProp] === value);
      return isValid ? null : { invalidAutocomplete: true };
    };
  }

  ngOnInit(): void {
    this.getAllParties();
    this.isEdit = this.data.isEdit;
    this.initializeForm();

    forkJoin([
      this.unitService.find({ pageSize: 10000 }),
      this.productService.find({ pageSize: 10000 })
    ]).subscribe({
      next: ([unitsData, productsData]: [any, any]) => {
        this.units = unitsData.data;
        this.products = productsData.data;

        if (this.isEdit) {
          this.patchForm(this.data.model);
        }
        
        this.form.get('unit_id')?.setValidators([
          Validators.required,
          this.autocompleteValidator(this.units)
        ]);
        this.form.get('unit_id')?.updateValueAndValidity();

        this.saleDetails.controls.forEach((row: AbstractControl) => {
          row.get('product_id')?.setValidators([
            Validators.required,
            this.autocompleteValidator(this.products)
          ]);
          row.get('product_id')?.updateValueAndValidity();
    
          row.get('unit_id')?.setValidators([
            Validators.required,
            this.autocompleteValidator(this.units)
          ]);
          row.get('unit_id')?.updateValueAndValidity();
        });
    
        this.cdr.detectChanges();
      },
      
      error: (err) => {
        console.error('Error fetching initial data:', err);
      },
    });

    this.filteredParties = this.partyControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(value => {
        if (typeof value === 'string' && value.length > 0) {
          return this._filterParties(value);
        } else if (typeof value === 'number') {
            return this.parties.slice(); 
        } else {
            return this.parties.slice();
        }
      })
    );

    this.filteredUnits = this.unitControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(value => {
        if (typeof value === 'string' && value.length > 0) {
          return this._filterUnits(value);
        } else if (typeof value === 'number') {
            return this.units.slice();
        } else {
            return this.units.slice();
        }
      })
    );
  }

  
  ngAfterViewInit(): void {
    this.isLoading = false;
    this.spinnerService.hide();
    this.dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false;
      this.spinnerService.hide();
    });

    if (this.partyInput) {
      this.partyInput.nativeElement.blur();
    }
    if (this.unitInput) {
      this.unitInput.nativeElement.blur();
    }
    this.cdr.detectChanges();
  }

  get partyControl(): FormControl {
    return this.form.get('party_id') as FormControl;
  }

  get unitControl(): FormControl {
    return this.form.get('unit_id') as FormControl;
  }

  displayPartyFn = (partyId: number): string => {
    const party = this.parties.find((p) => p.id === partyId);
    return party ? party.name : '';
  };

  private _filterParties(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.parties.filter((party) => party.name.toLowerCase().includes(filterValue));
  }

  displayUnitFn = (unitId: number): string => {
    const unit = this.units.find((u) => u.id === unitId);
    return unit ? unit.name : '';
  };

  private _filterUnits(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.units.filter((unit) => unit.name.toLowerCase().includes(filterValue));
  }

  displayProductFn = (productId: number): string => {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : '';
  };

  private _filterProducts(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.products.filter((product) => product.name.toLowerCase().includes(filterValue));
  }

  displaySaleDetailUnitFn = (unitId: number): string => {
    const unit = this.units.find((u) => u.id === unitId);
    return unit ? unit.name : '';
  };

  private _filterSaleDetailUnits(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.units.filter((unit) => unit.name.toLowerCase().includes(filterValue));
  }

  get saleDetails(): FormArray {
    return this.form.get('saleDetails') as FormArray;
  }


  getAllParties() {
    this.partyService.find({pageSize:10000,with:['contact']}).subscribe((res: any) => {
      if (res.data.length) {
        console.log(res.data);
        
        this.parties = res.data;
        // After fetching parties, apply the validator
        this.form.get('party_id')?.setValidators([
          Validators.required,
          this.autocompleteValidator(this.parties)
        ]);
        this.form.get('party_id')?.updateValueAndValidity();
        this.cdr.detectChanges();
      }
    })
  }
  initializeForm(): void {
    this.form = this.fb.group({
      party_id: [null],
      unit_id: [null],
      amount: [null, [Validators.required, Validators.min(1)]],
      discount_amount: [0, [Validators.required, Validators.min(0)]],
      discount_type: [1, Validators.required],
      net_total: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      notes: [''],
      status: [1, Validators.required],
      saleDetails: this.fb.array([this.createSaleDetailWithCalculation(0)]),
    });
  }

  createSaleDetailWithCalculation(index: number): FormGroup {
    const group = this.fb.group({
      product_id: [null],
      unit_id: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      amount: [0, [Validators.required, Validators.min(1)]],
      discount_amount: [0, [Validators.required, Validators.min(0)]],
      discount_type: [1, Validators.required],
      net: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    });

    const productControl = group.get('product_id') as FormControl;
    (group as any).filteredProducts = productControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(value => {
        if (typeof value === 'string' && value.length > 0) {
          return this._filterProducts(value);
        } else if (typeof value === 'number') {
            return this.products.slice();
        } else {
          return this.products.slice();
        }
      })
    );

    const unitControl = group.get('unit_id') as FormControl;
    (group as any).filteredUnits = unitControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(value => {
        if (typeof value === 'string' && value.length > 0) {
          return this._filterSaleDetailUnits(value);
        } else if (typeof value === 'number') {
            return this.units.slice();
        } else {
          return this.units.slice();
        }
      })
    );

    group.get('quantity')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_amount')?.valueChanges.subscribe(() => this.calculateNet(index));
    group.get('discount_type')?.valueChanges.subscribe(() => this.calculateNet(index));

    return group;
  }

  getFilteredProducts(detail: AbstractControl): Observable<any[]> {
    return (detail as any).filteredProducts;
  }

  getFilteredUnits(detail: AbstractControl): Observable<any[]> {
    return (detail as any).filteredUnits;
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
    const quantity = item?.get('quantity')?.value || 1;
    const amount = item?.get('amount')?.value || 0;
    const discountAmount = item?.get('discount_amount')?.value || 0;
    const discountType = item?.get('discount_type')?.value;

    let net = amount * quantity;

    if (discountType === 1) {
      net -= discountAmount;
    } else if (discountType === 2) {
      net -= ((amount * discountAmount) / 100) * quantity;
    }

    net = Math.max(0, parseFloat(net.toFixed(2)));
    item?.get('net')?.setValue(net, { emitEvent: false });

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
      party_id: sale.party_id,
      unit_id: sale.unit_id,
      amount: sale.amount || null,
      discount_amount: sale.discount_amount || 0,
      discount_type: sale.discount_type || 1,
      notes: sale.notes || '',
      status: sale.status || 1,
    });

    if (sale.party_id) {
        this.partyControl.setValue(sale.party_id, { emitEvent: false });
    }
    if (sale.unit_id) {
        this.unitControl.setValue(sale.unit_id, { emitEvent: false });
    }

    this.saleDetails.clear();

    if (sale.sale_details && Array.isArray(sale.sale_details)) {
      sale.sale_details.forEach((detail: any, index: number) => {
        const group = this.createSaleDetailWithCalculation(index);
        this.saleDetails.push(group);
        
        group.get('quantity')?.setValue(detail.quantity || 1, { emitEvent: false });
        group.get('amount')?.setValue(detail.amount || 0, { emitEvent: false });
        group.get('discount_amount')?.setValue(detail.discount_amount || 0, { emitEvent: false });
        group.get('discount_type')?.setValue(detail.discount_type || 1, { emitEvent: false });

        if (detail.product_id) {
          group.get('product_id')?.setValue(detail.product_id, { emitEvent: false });
        }
        if (detail.unit_id) {
          group.get('unit_id')?.setValue(detail.unit_id, { emitEvent: false });
        }
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
      id: this.data.model?.id || null,
    };

    if (this.isEdit) {
      this.saleService.update(payload).subscribe({
        next: () => {
          this.commonService.toastr.success('Updated Successfully');
          this.dialogRef.close(true);
          this.isLoading = false;
          this.spinnerService.hide();
        },
        error: (err) => {
          console.error('Error updating sale:', err);
          this.commonService.handleError(err);
          this.isLoading = false;
          this.spinnerService.hide();
        },
      });
    } else {
      this.saleService.create(payload).subscribe({
        next: () => {
          this.commonService.toastr.success('Sale Created Successfully');
          this.dialogRef.close(true);
          this.isLoading = false;
          this.spinnerService.hide();
        },
        error: (err) => {
          console.error('Error creating sale:', err);
          this.commonService.handleError(err);
          this.isLoading = false;
          this.spinnerService.hide();
        },
      });
    }
  }
}