import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { ProductModel } from '../product.model';
import { ProductService } from '../product.service';
import { take } from 'rxjs';
import { ProductInventoryModel } from '../product-inventry/product-inventry.model';
import { ProductInventryService } from '../product-inventry/product-inventry.service';
import { InventoryService } from '../../inventory/inventory.service';


@Component({
  selector: 'app-add-product-inventry',
  templateUrl: './add-product-inventry.component.html',
  styleUrl: './add-product-inventry.component.scss',
})
export class AddProductInventryComponent implements OnInit, OnDestroy {
  form: FormGroup;
  model: ProductInventoryModel;
  clone: any;
  isEdit: boolean = false;
  @Input() product: any;
  @Output() formSubmit = new EventEmitter<any>();
  private unsubscribe = new SubscriptionHandler();
  inventries: ProductInventoryModel[];
  readonly dialogRef = inject(MatDialogRef<AddProductInventryComponent>);
  readonly data = inject<{
    product: ProductModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: ProductInventryService,
    private find: FindService,
    private commonService: CommonService,
    private us: InventoryService,
    private router: Router,
    private ar: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.model = new ProductInventoryModel().clear();
    this.initForm(this.model);
    this.loadInventry()
    console.log(this.inventries);
    
  }

  loadInventry() {
    this.us
      .find({
        pageSize: 100,
      })
      .pipe(take(1))
      .subscribe({
        next: (resp: any) => (this.inventries = resp.data),
        error: err => this.commonService.handleError(err)
      });
  }

  initForm(model: ProductInventoryModel) {
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
    this.formSubmit.emit(this.form.value);
    this.commonService.toastr.success("Inventry has been added.");
        this.dialogRef.close(this.form.value);
    // this.service.create(9, this.form.value).subscribe({
    //   complete: () => {
    //     console.log("called");
        
    //     this.commonService.toastr.success("Inventry has been added.");
    //     this.dialogRef.close(true);
    //   },
    //   error: err => {
    //     console.log("faild");
        
    //     this.commonService.toastr.error(err);
    //             this.commonService.handleError(err)
    //   }
    // })
    console.log(this.form.value);

  }

  ngOnDestroy() {
    this.unsubscribe.unsubscribe();
  }
}
