import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UnitConversionModel } from '../unitconversion.model';
import { UnitConversionService } from '../unitconversion.service';
import { ProductService } from 'src/app/modules/apps/product/product.service';
import { UnitService } from '../../unit/unit.service';
import { tap, startWith, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-add-unit-conversion',
  templateUrl: './add-unit-conversion.component.html',
  styleUrl: './add-unit-conversion.component.scss',
  standalone: false
})
export class AddUnitConversionComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: UnitConversionModel;
  clone: any;
  isEdit: boolean = false;
  units: any[] = [];
  products: any[] = [];
  isLoading: boolean = false;
  fromUnitControl!: FormControl;
  toUnitControl!: FormControl;
  productControl!: FormControl;
  filteredFromUnits: any[] = [];
  filteredToUnits: any[] = [];
  filteredProducts: any[] = [];

  readonly dialogRef = inject(MatDialogRef<AddUnitConversionComponent>);
  readonly data = inject<{
    model: UnitConversionModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: UnitConversionService,
    private find: FindService,
    private commonService: CommonService,
    private spinnerService: SpinnerService,
    private productService: ProductService,
    private unitService: UnitService
  ) {}

  itemNameValidator(items: any[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const itemName = control.value;
      if (!itemName) {
        return null;
      }
      const found = items.some(item => item.name.toLowerCase() === itemName.toLowerCase());
      return found ? null : { 'invalidItemName': { value: itemName } };
    };
  }

  ngOnInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.isLoading = true;
    this.spinnerService.show();

    this.getAllProducts().subscribe(() => {
      this.getAllUnit().subscribe(() => {
        this.productControl = this.fb.control(
          this.getProductNameById(this.model.product_id),
          [Validators.required, this.itemNameValidator(this.products)]
        );
        this.fromUnitControl = this.fb.control(
          this.getUnitNameById(this.model.from_unit_id),
          [Validators.required, this.itemNameValidator(this.units)]
        );
        this.toUnitControl = this.fb.control(
          this.getUnitNameById(this.model.to_unit_id),
          [Validators.required, this.itemNameValidator(this.units)]
        );

        this.form = this.fb.group({
          id: [this.model.id],
          product_id: [this.model.product_id, [Validators.required]],
          from_unit_id: [this.model.from_unit_id, [Validators.required]],
          to_unit_id: [this.model.to_unit_id, [Validators.required]],
          conversion_factor: [this.model.conversion_factor, [Validators.required, Validators.min(0)]],
          description: [this.model.description, [Validators.required]],
          status: [this.model.status, [Validators.required]],
        });

        this.clone = this.form.value;

        // Product control value changes
        this.productControl.valueChanges.pipe(
          this.isEdit && this.productControl.value ? startWith(this.productControl.value) : tap(),
          map(value => this._filterProducts(value || ''))
        ).subscribe(filtered => {
          this.filteredProducts = filtered;
          if (!this.products.some(p => p.name.toLowerCase() === this.productControl.value?.toLowerCase())) {
            this.form.get('product_id')?.setValue(null);
          }
        });

        // From Unit control value changes
        this.fromUnitControl.valueChanges.pipe(
          this.isEdit && this.fromUnitControl.value ? startWith(this.fromUnitControl.value) : tap(),
          map(value => this._filterUnits(value || '', this.form.get('to_unit_id')?.value))
        ).subscribe(filtered => {
          this.filteredFromUnits = filtered;
          if (!this.units.some(u => u.name.toLowerCase() === this.fromUnitControl.value?.toLowerCase())) {
            this.form.get('from_unit_id')?.setValue(null);
          }
          this.filteredToUnits = this._filterUnits(this.toUnitControl.value || '', this.form.get('from_unit_id')?.value);
        });

        // To Unit control value changes
        this.toUnitControl.valueChanges.pipe(
          this.isEdit && this.toUnitControl.value ? startWith(this.toUnitControl.value) : tap(),
          map(value => this._filterUnits(value || '', this.form.get('from_unit_id')?.value))
        ).subscribe(filtered => {
          this.filteredToUnits = filtered;
          if (!this.units.some(u => u.name.toLowerCase() === this.toUnitControl.value?.toLowerCase())) {
            this.form.get('to_unit_id')?.setValue(null);
          }
          this.filteredFromUnits = this._filterUnits(this.fromUnitControl.value || '', this.form.get('to_unit_id')?.value);
        });

        if (this.isEdit) {
            this.filteredProducts = this._filterProducts(this.productControl.value || '');
            this.filteredFromUnits = this._filterUnits(this.fromUnitControl.value || '', this.form.get('to_unit_id')?.value);
            this.filteredToUnits = this._filterUnits(this.toUnitControl.value || '', this.form.get('from_unit_id')?.value);
        }

        this.isLoading = false;
        this.spinnerService.hide();
      });
    });
  }

  ngAfterViewInit(): void {
  
  }

  getAllProducts() {
    return this.productService.find({ pageSize: 1000 }).pipe(
      tap((res: any) => {
        this.products = res.data;
      })
    );
  }

  getAllUnit() {
    return this.unitService.find({ pageSize: 1000 }).pipe(
      tap((res: any) => {
        this.units = res.data;
      })
    );
  }

  getUnitNameById(id: any): string {
    const unit = this.units.find(u => u.id === id);
    return unit ? unit.name : '';
  }

  getProductNameById(id: any): string {
    const product = this.products.find(p => p.id === id);
    return product ? product.name : '';
  }

  selectFromUnit(unitName: string) {
    const unit = this.units.find(u => u.name === unitName);
    if (unit) {
      this.form.get('from_unit_id')?.setValue(unit.id);
      this.filteredToUnits = this._filterUnits(this.toUnitControl.value || '', unit.id);
    }
  }

  selectToUnit(unitName: string) {
    const unit = this.units.find(u => u.name === unitName);
    if (unit) {
      this.form.get('to_unit_id')?.setValue(unit.id);
      this.filteredFromUnits = this._filterUnits(this.fromUnitControl.value || '', unit.id);
    }
  }

  selectProduct(productName: string) {
    const product = this.products.find(p => p.name === productName);
    if (product) {
      this.form.get('product_id')?.setValue(product.id);
    }
  }

  private _filterProducts(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.products.filter(product => product.name.toLowerCase().includes(filterValue));
  }

  private _filterUnits(value: string, excludeUnitId: any): any[] {
    const filterValue = value.toLowerCase();
    return this.units
      .filter(unit => unit.name.toLowerCase().includes(filterValue))
      .filter(unit => unit.id !== excludeUnitId);
  }

  onProductInputFocus(): void {
    // This method is no longer needed to trigger filtering on focus,
    // as the startWith operator handles initial filtering for edit mode.
    // However, if you want to show all options on focus when not in edit mode,
    // you would need to implement that logic here.
  }

  submit() {
    this.commonService.markFormGroupTouched(this.form);
    this.commonService.markFormGroupTouched(new FormGroup({
      productControl: this.productControl,
      fromUnitControl: this.fromUnitControl,
      toUnitControl: this.toUnitControl
    }));


    if (this.form.invalid || this.productControl.invalid || this.fromUnitControl.invalid || this.toUnitControl.invalid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }

    if (_.isEqual(this.form.value, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }

    if (this.form.value.from_unit_id === this.form.value.to_unit_id) {
      this.commonService.toastr.error(`The 'From Unit' and 'To Unit' must be different.`);
      return;
    }

    this.isLoading = true;
    this.spinnerService.show();

    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.isLoading = false;
        this.spinnerService.hide();
        this.commonService.toastr.success(
          this.isEdit ? 'Unit Conversion has been updated.' : 'Unit Conversion has been created.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false;
        this.spinnerService.hide();
        this.commonService.toastr.error(err.error.message);
      },
    });
  }
}
