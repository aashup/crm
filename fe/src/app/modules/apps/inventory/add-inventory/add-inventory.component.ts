import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import _ from 'lodash';
import { InventoryModel } from '../inventory.model';
import { InventoryService } from '../inventory.service';
import { ProductService } from '../../product/product.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { AuthService } from 'src/app/modules/auth';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-add-inventory',
  templateUrl: '././add-inventory.component.html',
  styleUrl: '././add-inventory.component.scss',
  standalone: false,
})
export class AddInventoryComponent implements AfterViewInit, OnInit {
  form: FormGroup;
  model: InventoryModel;
  products: any[];
  units: any[];
  clone: any;
  isEdit: boolean = false;
  isLoading = false;
  userId: any;
  readonly _ = _;
  readonly dialogRef = inject(MatDialogRef<AddInventoryComponent>);
  readonly data = inject<{
    model: InventoryModel;
    isEdit: boolean;
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
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    this.getProducts();
    this.getUnits();
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
  getUnits() {
    this.unitService.find({pageSize:1000}).subscribe((res: any) => {
      console.log(res);
      if (res) {
        this.units = res.data;
      }
    });
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

  initForm(model: InventoryModel) {
    this.form = this.fb.group({
      id: [model.id, []],
      product_id: [model.product_id, Validators.required],
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
    this.service[this.isEdit ? 'update' : 'create'](this.form.value).subscribe({
      complete: () => {
        this.commonService.toastr.success(this.isEdit ? 'Inventory has been updated.' : 'Inventory has been created.');
        this.isLoading = false;
        this.spinnerService.hide();
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.commonService.handleError(err);
        this.isLoading = false;
        this.spinnerService.hide();
      },
    });
  }
}
