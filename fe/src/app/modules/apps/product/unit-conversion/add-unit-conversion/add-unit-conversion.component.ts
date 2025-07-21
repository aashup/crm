import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ProductService } from 'src/app/modules/apps/product/product.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { UnitConversionModel } from 'src/app/modules/settings/unit-conversion/unitconversion.model';
import { UnitConversionService } from 'src/app/modules/settings/unit-conversion/unitconversion.service';
import { map, Observable, of, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-add-unit-conversion',
  templateUrl: './add-unit-conversion.component.html',
  styleUrl: './add-unit-conversion.component.scss',
  standalone: false,
})
export class AddUnitConversionComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: UnitConversionModel;
  clone: any;
  isEdit: boolean = false;
  units: any[] = [];
  products: any[];
  isLoading: boolean = false;
  filteredFromUnits: Observable<any[]>;
  filteredToUnits: Observable<any[]>;

  fromUnitDisplayControl = new FormControl('');
  toUnitDisplayControl = new FormControl('');

  private fromUnitsSubject = new BehaviorSubject<any[]>([]);
  private toUnitsSubject = new BehaviorSubject<any[]>([]);

  readonly dialogRef = inject(MatDialogRef<AddUnitConversionComponent>);
  readonly data = inject<{
    model: UnitConversionModel;
    isEdit: boolean;
    productId: string;
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

  ngOnInit(): void {
    console.log('pid', this.data.productId);
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    
    this.initForm(this.model);
    
    this.initializeObservables();
    
    this.getAllProducts();
    this.getAllUnit(() => {
      this.setInitialDisplayValues();
    });
  }

  ngAfterViewInit(): void {
    this.isLoading = false;
    this.spinnerService.hide();
  }

  initializeObservables() {
    this.filteredFromUnits = this.fromUnitsSubject.asObservable();
    this.filteredToUnits = this.toUnitsSubject.asObservable();
  }

  initForm(model: UnitConversionModel) {
    this.form = this.fb.group({
      id: [model.id, []],
      from_unit_id: [model.from_unit_id, [Validators.required]],
      to_unit_id: [model.to_unit_id, [Validators.required]],
      conversion_factor: [model.conversion_factor, [Validators.required, Validators.min(0)]],
      description: [model.description, [Validators.required]],
      status: [model.status, [Validators.required]],
    });
    
    this.clone = this.form.value;
    
    this.fromUnitDisplayControl.valueChanges.subscribe((value) => {
      if (typeof value === 'number') {
        this.form.patchValue({ from_unit_id: value });
      }
      if (this.units && this.units.length > 0) {
        const filtered = this.filterUnits(value, 'from');
        this.fromUnitsSubject.next(filtered);
      }
    });

    this.toUnitDisplayControl.valueChanges.subscribe((value) => {
      if (typeof value === 'number') {
        this.form.patchValue({ to_unit_id: value });
      }
      if (this.units && this.units.length > 0) {
        const filtered = this.filterUnits(value, 'to');
        this.toUnitsSubject.next(filtered);
      }
    });
  }

  setInitialDisplayValues() {
    if (this.isEdit && this.units.length > 0) {
      const fromUnit = this.units.find(u => u.id === this.model.from_unit_id);
      const toUnit = this.units.find(u => u.id === this.model.to_unit_id);
      
      if (fromUnit) {
        this.fromUnitDisplayControl.setValue(fromUnit.id, { emitEvent: false });
      }
      if (toUnit) {
        this.toUnitDisplayControl.setValue(toUnit.id, { emitEvent: false });
      }
    }
  }

  getAllProducts() {
    this.productService.find().subscribe((res: any) => {
      this.products = res.data;
    });
  }

  getAllUnit(callback?: () => void) {
    this.unitService.find().subscribe((res: any) => {
      this.units = res.data;
      if (callback) callback();
    });
  }

  onFromUnitFocus() {
    if (this.units && this.units.length > 0) {
      const filtered = this.filterUnits(this.fromUnitDisplayControl.value, 'from');
      this.fromUnitsSubject.next(filtered);
    }
  }

  onToUnitFocus() {
    if (this.units && this.units.length > 0) {
      const filtered = this.filterUnits(this.toUnitDisplayControl.value, 'to');
      this.toUnitsSubject.next(filtered);
    }
  }

  filterUnits(value: string | number | null, controlName: 'from' | 'to'): any[] {
    if (!this.units) return [];
    
    let filterValue = '';
    
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (typeof value === 'number') {
      const unit = this.units.find(u => u.id === value);
      filterValue = unit ? unit.name.toLowerCase() : '';
    }
    
    const otherControlValue = controlName === 'from' 
      ? this.toUnitDisplayControl.value
      : this.fromUnitDisplayControl.value;
    
    return this.units
      .filter(unit => unit.name.toLowerCase().includes(filterValue))
      .filter(unit => unit.id !== otherControlValue);
  }

  displayUnitName = (id: number | string): string => {
    if (!id || !this.units || this.units.length === 0) return '';
    const unit = this.units.find((u) => u.id === +id);
    return unit ? unit.name : '';
  };

  get fromUnitControl(): FormControl {
    return this.fromUnitDisplayControl;
  }
  
  get toUnitControl(): FormControl {
    return this.toUnitDisplayControl;
  }

  submit() {
    this.commonService.markFormGroupTouched(this.form);
    if (!this.form.valid) {
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
    let payload = {
      ...this.form.value,
      product_id: this.data.productId,
    };
    this.service[this.isEdit ? 'update' : 'create'](payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.spinnerService.hide();
        this.commonService.toastr.success(
          this.isEdit ? 'Unit Conversion has been updated.' : 'Unit Conversion has been created.'
        );
        this.dialogRef.close({ ...res.data, product_id: this.data.productId });
      },
      error: (err: any) => {
        this.isLoading = false;
        this.spinnerService.hide();
        this.commonService.toastr.error('Failed to save Unit Conversion. Please try again.');
      },
    });
  }
}
