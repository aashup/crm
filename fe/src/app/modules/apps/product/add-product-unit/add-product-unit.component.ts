import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ProductUnitModel } from '../product-unit/product-unit.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { ProductModel } from '../product.model';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { take } from 'rxjs';
import { UnitModel } from 'src/app/modules/settings/unit/unit.model';
import { ProductUnitService } from '../product-unit/product-unit.service';

@Component({
  selector: 'app-add-product-unit',
  templateUrl: './add-product-unit.component.html',
  styleUrl: './add-product-unit.component.scss',
})
export class AddProductUnitComponent implements OnInit, OnDestroy {
  form: FormGroup;
  model: ProductUnitModel;
  clone: any;
  isEdit: boolean = false;
  private unsubscribe = new SubscriptionHandler();
  units: UnitModel[];

  readonly dialogRef = inject(MatDialogRef<AddProductUnitComponent>);

  readonly data = inject<{
    product: ProductModel;
    isEdit: boolean;
    productId: number;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: ProductUnitService,
    private find: FindService,
    private commonService: CommonService,
    private us: UnitService,
    private router: Router,
    private ar: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { 
    this.model = new ProductUnitModel().clear();
    this.initForm(this.model);
   
    this.loadUnits()

  }

  loadUnits() {
    this.us
      .find({
        pageSize: 100,
      })
      .pipe(take(1))
      .subscribe({
        next: (resp: any) => (this.units = resp.data),
        error: err => this.commonService.handleError(err)
      });
  }

  initForm(model: ProductUnitModel) {
    this.form = this.fb.group({
      id: [this.model.id, []],
      product_id: [this.model.product_id, [Validators.required]],
      unit_id: [this.model.unit_id, [Validators.required]],
      sale_price: [this.model.sale_price, [Validators.required]],
      purchase_price: [this.model.purchase_price],
      notes: [this.model.notes],
      status: [this.model.status],
    });
    this.clone = this.form.value;
  }

  submit() {
  
    
    this.service.create(this.data.productId, this.form.value).subscribe({
      complete: () => {
        console.log("called");
        this.commonService.toastr.success("Unit has been added.");
        this.loadUnits()
        this.form.value.product_id = this.data.productId;
        
        this.dialogRef.close(this.form.value);
      },
      error: err => {
        console.log("faild");
        
        this.commonService.toastr.error(err.error.message);
                // this.commonService.handleError(err.error)
      }
    })
  }

  ngOnDestroy() {
    this.unsubscribe.unsubscribe();
  }
}
