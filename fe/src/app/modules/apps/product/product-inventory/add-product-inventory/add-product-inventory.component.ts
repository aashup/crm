import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import _ from 'lodash';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { AuthService } from 'src/app/modules/auth';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ProductService } from '../../product.service';
import { InventoryModel } from '../../../inventory/inventory.model';
import { InventoryService } from '../../../inventory/inventory.service';
import { map, Observable, startWith, take } from 'rxjs';
import { UnitModel } from 'src/app/modules/settings/unit/unit.model';

@Component({
  selector: 'app-add-product-inventory',
  templateUrl: './add-product-inventory.component.html',
  styleUrl: './add-product-inventory.component.scss',
  standalone: false,
})
export class AddProductInventoryComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: InventoryModel;
  products: any[] = [];
  units: any[] = [];
  filteredUnits: Observable<UnitModel[]>;
  clone: any;
  isEdit: boolean = false;
  isLoading = false;
  userId: any;

  // Controls references
  productControl: FormControl;
  unitControl: FormControl;

  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddProductInventoryComponent>);
  readonly data = inject<{
    model: InventoryModel;
    isEdit: boolean;
    productId: string;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: InventoryService,
    private find: FindService,
    private commonService: CommonService,
    private productService: ProductService,
    private unitService: UnitService,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getUserId();
    this.getProducts();
    this.loadUnits();
  }

  ngAfterViewInit(): void {
    this.model = this.data.model;
    this.isEdit = this.data.isEdit;
    this.initForm(this.model);
    this.isLoading = false;

    this.dialogRef.afterClosed().subscribe(() => {
      this.isLoading = false;
      this.spinnerService.hide();
    });
  }

  getUserId() {
    const userData = this.authService.getCurrentUser();
    this.userId = userData?.user?.id;
  }

  getProducts() {
    this.productService.find({}).pipe(take(1)).subscribe((res: any) => {
      if (res?.data) {
        this.products = res.data;
        // Update validator with fresh data
        this.productControl?.setValidators([Validators.required, this.itemNameValidator(() => this.products)]);
      }
    });
  }

  loadUnits() {
    this.unitService.find({ pageSize: 1000 }).pipe(take(1)).subscribe({
      next: (resp: any) => {
        this.units = resp.data || [];

        this.filteredUnits = this.unitIdControl.valueChanges.pipe(
          startWith(''),
          map((value: any) => {
            const search =
              typeof value === 'string' ? value.toLowerCase() : this.displayUnitName(value).toLowerCase();
            return this.units.filter((unit: any) => unit.name.toLowerCase().includes(search));
          })
        );

        if (this.isEdit && this.model?.unit_id) {
          this.unitIdControl.setValue(this.model.unit_id);
        }

        // Update validator after units load
        this.unitControl?.setValidators([Validators.required, this.itemNameValidator(() => this.units)]);
      },
      error: (err) => this.commonService.handleError(err),
    });
  }

  get unitIdControl(): FormControl {
    return this.form.get('unit_id') as FormControl;
  }

  displayUnitName = (id: number | string): string => {
    if (!id || !this.units) return '';
    const unit: any = this.units.find((u) => u.id === +id);
    return unit ? unit.name : '';
  };

  itemNameValidator(itemsProvider: () => any[]): ValidatorFn {
    return (control: AbstractControl) => {
      const items = itemsProvider() || [];
      const itemName = control.value;
      if (!itemName) return null;
      const found = items.some((item) => item.name?.toLowerCase() === itemName.toLowerCase());
      return found ? null : { invalidItemName: { value: itemName } };
    };
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

  initForm(model: InventoryModel) {
    this.form = this.fb.group({
      id: [model.id],
      product_id: [model.product_id, Validators.required],
      unit_id: [model.unit_id, Validators.required],
      qty: [model.qty, [Validators.required, Validators.min(0)]],
      rem_qty: [model.rem_qty, [Validators.min(0)]],
      unit_price: [model.unit_price, [Validators.required, Validators.min(0)]],
      notes: [model.notes],
      status: [model.status, Validators.required],
      productControl: ['', Validators.required], // validators will be added after data loads
      unitControl: ['', Validators.required] // validators will be added after data loads
    }, {
      validators: [this.maxRemainingQuantityValidator()]
    });

    // Store references
    this.productControl = this.form.get('productControl') as FormControl;
    this.unitControl = this.form.get('unitControl') as FormControl;

    this.clone = this.form.value;
  }

  submit() {
    this.commonService.markFormGroupTouched(this.form);

   

    if (_.isEqual(this.form.value, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }

    const payload = {
      ...this.form.value,
      product_id: this.data.productId,
      qty: Number(this.form.value.qty),
      rem_qty: Number(this.form.value.rem_qty)
    };

    if (payload.qty < payload.rem_qty) {
      this.commonService.toastr.error('Remaining Quantity cannot be greater than Quantity.');
      return;
    }

    delete payload.productControl;
    delete payload.unitControl;

    this.isLoading = true;
    this.spinnerService.show();
   
    this.service[this.isEdit ? 'update' : 'create'](payload).subscribe({
      next: (res: any) => {
        this.commonService.toastr.success(this.isEdit ? 'Inventory has been updated.' : 'Inventory has been created.');
        this.isLoading = false;
        this.spinnerService.hide();
        this.dialogRef.close({ ...res.data, product_id: this.data.productId });
      },
      error: (err: any) => {
        this.commonService.toastr.error(err.error?.message || 'Something went wrong');
        this.isLoading = false;
        this.spinnerService.hide();
        this.cdr.detectChanges();
      }
    });
  }
}
