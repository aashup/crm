import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ProductService } from '../../product/product.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { AuthService } from 'src/app/modules/auth';
import { InventoryModel } from '../inventory.model';
import { InventoryService } from '../inventory.service';
import { startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-add-inventory',
  templateUrl: '././add-inventory.component.html',
  styleUrl: '././add-inventory.component.scss',
  standalone: false,
})
export class AddInventoryComponent implements AfterViewInit, OnInit {
  form!: FormGroup;
  model!: InventoryModel;
  products: any[] = [];
  units: any[] = [];
  clone: any;
  isEdit: boolean = false;
  isLoading = false;
  userId: any;
  readonly _ = _;

  productControl = new FormControl('', [Validators.required, this.autocompleteObjectValidator()]);
  unitControl = new FormControl('', [Validators.required, this.autocompleteObjectValidator()]);

  filteredProducts: any[] = [];
  filteredUnits: any[] = [];

  readonly dialogRef = inject(MatDialogRef<AddInventoryComponent>);
  readonly data = inject<{
    model: InventoryModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  inventries: InventoryModel[] = [];

  constructor(
    private fb: FormBuilder,
    private service: InventoryService,
    private commonService: CommonService,
    private productService: ProductService,
    private unitService: UnitService,
    private authService: AuthService,
    private spinnerService: SpinnerService
  ) {}
  
  autocompleteObjectValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const isString = typeof control.value === 'string';
      return isString ? { 'invalidObject': { value: control.value } } : null;
    };
  }

  ngOnInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.getAllProducts();
    this.getAllUnits();
    this.getUserId();
    this.initializeForm();

    this.productControl.valueChanges
      .pipe(startWith(''))
      .subscribe(value => {
        this.filteredProducts = this._filter(value, this.products);
      });

    this.unitControl.valueChanges
      .pipe(startWith(''))
      .subscribe(value => {
        this.filteredUnits = this._filter(value, this.units);
      });
  }

  initializeForm() {
    this.form = this.fb.group({
      id: [this.model.id],
      product_id: [this.model.product_id, Validators.required],
      unit_id: [this.model.unit_id, Validators.required],
      qty: [this.model.qty, [Validators.required, Validators.min(0)]],
      rem_qty: [this.model.rem_qty, [Validators.min(0)]],
      unit_price: [this.model.unit_price, [Validators.required, Validators.min(0)]],
      notes: [this.model.notes],
      status: [this.model.status, Validators.required],
    });

    if (this.isEdit) {
      this.productControl.setValue(this.products.find(p => p.id === this.model.product_id));
      this.unitControl.setValue(this.units.find(u => u.id === this.model.unit_id));
    }
  }

  getUserId() {
    const userData = this.authService.getCurrentUser();
    this.userId = userData.user.id;
  }

  getAllProducts() {
    this.productService.find({ pageSize: 10000 }).subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res?.data) ? res.data : [];
        if (this.isEdit) {
          this.productControl.setValue(this.products.find(p => p.id === this.model.product_id));
        }
      },
      error: () => {
        this.products = [];
      }
    });
  }

  getAllUnits() {
    this.unitService.find({ pageSize: 1000 }).subscribe({
      next: (res: any) => {
        this.units = Array.isArray(res?.data) ? res.data : [];
        if (this.isEdit) {
          this.unitControl.setValue(this.units.find(u => u.id === this.model.unit_id));
        }
      },
      error: () => {
        this.units = [];
      }
    });
  }

  displayFn(item: any): string {
    return item ? item.name : '';
  }

  onProductSelected(event: MatAutocompleteSelectedEvent) {
    const selectedProduct = event.option.value;
    this.form.get('product_id')?.setValue(selectedProduct.id);
  }
  onUnitSelected(event: MatAutocompleteSelectedEvent) {
    const selectedUnit = event.option.value;
    this.form.get('unit_id')?.setValue(selectedUnit.id);
  }

  private _filter(value: string | any, list: any[]): any[] {
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();
      return list.filter(item => item.name.toLowerCase().includes(filterValue));
    }
    return list;
  }

  ngAfterViewInit(): void {
    this.dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false;
      this.spinnerService.hide();
    });
  }

  maxRemainingQuantityValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      if (!this.isEdit) return null;

      const qtyControl = group.get('qty');
      const remQtyControl = group.get('rem_qty');

      if (!qtyControl || !remQtyControl) return null;

      const qty = qtyControl.value;
      const remQty = remQtyControl.value;

      if (qty != null && remQty != null && remQty > qty) {
        remQtyControl.setErrors({ ...remQtyControl.errors, remQtyExceeds: true });
      } else {
        if (remQtyControl.errors) {
          const { remQtyExceeds, ...rest } = remQtyControl.errors;
          remQtyControl.setErrors(Object.keys(rest).length ? rest : null);
        }
      }
      return null;
    };
  }

  submit() {
    this.commonService.markFormGroupTouched(this.form);
    this.productControl.markAsTouched();
    this.unitControl.markAsTouched();

    if (this.form.invalid || this.productControl.invalid || this.unitControl.invalid) {
      this.commonService.toastr.error('Please fill all the required fields correctly.');
      return;
    }

    let payLoad = this.form.value;
    this.form.value.qty = Number(this.form.value.qty);
    this.form.value.rem_qty = Number(this.form.value.rem_qty);
    if (_.isEqual(this.form.value, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }
    if (payLoad.qty < payLoad.rem_qty) {
      this.commonService.toastr.error('Remaining Quantity cannot be greater than Quantity.');
      return;
    }
    this.isLoading = true;
    this.spinnerService.show();
    console.log(payLoad);
    delete payLoad.productControl;
    delete payLoad.unitControl;
    this.service[this.isEdit ? 'update' : 'create'](payLoad).subscribe({
      complete: () => {
        this.commonService.toastr.success(this.isEdit ? 'Inventory has been updated.' : 'Inventory has been created.');
        this.isLoading = false;
        this.spinnerService.hide();
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.commonService.handleError(err);
        this.isLoading = false;
        this.spinnerService.hide();
      },
    });
  }
}