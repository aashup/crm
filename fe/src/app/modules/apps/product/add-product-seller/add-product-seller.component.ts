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
import { ProductSellerModel } from '../product-seller/product-seller.model';
import { ProductSellerService } from '../product-seller/product-seller.service';

@Component({
  selector: 'app-add-product-seller',
  templateUrl: './add-product-seller.component.html',
  styleUrl: './add-product-seller.component.scss',
})
export class AddProductSellerComponent implements OnInit, OnDestroy {
  form: FormGroup;
  model: ProductSellerModel;
  clone: any;
  isEdit: boolean = false;
  private unsubscribe = new SubscriptionHandler();
  sellers: ProductSellerModel[];
  @Input() product: any;
  @Output() formSubmit = new EventEmitter<any>();
  readonly dialogRef = inject(MatDialogRef<AddProductSellerComponent>);
  readonly data = inject<{
    product: ProductModel;
    isEdit: boolean;
  }>(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private service: ProductSellerService,
    private find: FindService,
    private commonService: CommonService,
    private us: ProductSellerService,
    private router: Router,
    private ar: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.model = new ProductSellerModel().clear();
    this.initForm(this.model);
    this.loadSellers()
  }

  loadSellers() {
   
  }

  initForm(model: ProductSellerModel) {
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
    this.commonService.toastr.success("Seller has been added.");
    console.log(this.form.value);

    this.dialogRef.close(this.form.value);
    // this.service.create(9, this.form.value).subscribe({
    //   complete: () => {
    //     console.log("called");
        
    //     this.commonService.toastr.success("Seller has been added.");
    //     this.dialogRef.close(true);
    //   },
    //   error: err => {
    //     console.log("faild");
        
    //     this.commonService.toastr.error(err);
    //             this.commonService.handleError(err)
    //   }
    // })
  }

  ngOnDestroy() {
    this.unsubscribe.unsubscribe();
  }
}
