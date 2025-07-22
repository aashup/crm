import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
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
  products: any[];
  units: any[];
  filteredUnits: Observable<UnitModel[]>;
  clone: any;
  isEdit: boolean = false;
  isLoading = false;
  userId: any;
  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddProductInventoryComponent>);
  readonly data = inject<{
    model: InventoryModel;
    isEdit: boolean;
    productId: string;
  }>(MAT_DIALOG_DATA);

  inventries: InventoryModel[] = [];

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
    console.log('data ', this.data);
    this.getProducts();
    this.loadUnits();
    this.getUserId();
  }
  getUserId() {
    const userData = this.authService.getCurrentUser();
    this.userId = userData.user.id;
    console.log(userData.user.id);
  }
  getProducts() {
    this.productService.find({}).subscribe((res: any) => {
      console.log(res);
      if (res) {
        this.products = res.data;
      }
    });
  }
  loadUnits() {
    this.unitService
      .find({ pageSize: 1000})
      .pipe(take(1))
      .subscribe({
        next: (resp: any) => {
          this.units = resp.data;

          const unitControl = this.unitIdControl;

         if(this.isEdit){
          this.filteredUnits = unitControl.valueChanges.pipe(
            map((value: any) => {
              const search =
                typeof value === 'string' ? value.toLowerCase() : this.displayUnitName(value).toLowerCase();

              return this.units.filter((unit: any) => unit.name.toLowerCase().includes(search));
            })
          );
         }else{
          this.filteredUnits = unitControl.valueChanges.pipe(
            startWith(''),
            map((value: any) => {
              const search =
                typeof value === 'string' ? value.toLowerCase() : this.displayUnitName(value).toLowerCase();

              return this.units.filter((unit: any) => unit.name.toLowerCase().includes(search));
            })
          );
         }

          if (this.isEdit && this.model.unit_id) {
            unitControl.setValue(this.model.unit_id);
          }
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

  initForm(model: InventoryModel) {
    this.form = this.fb.group({
      id: [model.id, []],
      unit_id: [model.unit_id, Validators.required],
      qty: [model.qty, [Validators.required, Validators.min(0)]], // Only integers
      rem_qty: [model.rem_qty, [Validators.min(0)]], // Only integers
      purchase_price: [model.purchase_price, Validators.min(0)],
      sale_price: [model.sale_price, Validators.min(0)],
      notes: [model.notes],
      status: [model.status, [Validators.required]],
    });
    this.clone = this.form.value;
  }
  submit() {
    console.log(this.data);

    this.commonService.markFormGroupTouched(this.form);
    this.form.value.qty = Number(this.form.value.qty);
    this.form.value.rem_qty = Number(this.form.value.rem_qty);
    if (!this.form.valid) {
      this.commonService.toastr.error('Please fix all errors.');
      return;
    }
    if (_.isEqual(this.form.value, this.clone)) {
      this.commonService.toastr.error('Nothing changed.');
      return;
    }

    this.isLoading = true;
    this.spinnerService.show();
    const payload = {
      ...this.form.value,
      product_id: this.data.productId,
    };
    console.log('payload ', payload);

    this.service[this.isEdit ? 'update' : 'create'](payload).subscribe(
      (res: any) => {
        this.commonService.toastr.success(this.isEdit ? 'Inventory has been updated.' : 'Inventory has been created.');
        this.isLoading = false;
        this.spinnerService.hide();
        this.dialogRef.close({ ...res.data, product_id: this.data.productId });
      },
      (err: any) => {
        console.log('error in inventory ', err);

        this.commonService.toastr.error(err.error.message || 'something went wrong');
        this.isLoading = false;
        this.spinnerService.hide();
        this.cdr.detectChanges();
      }
    );
  }
}
