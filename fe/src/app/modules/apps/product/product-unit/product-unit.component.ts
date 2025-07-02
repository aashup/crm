import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { MatDialog } from '@angular/material/dialog';
import { AddProductUnitComponent } from '../add-product-unit/add-product-unit.component';
import { ProductUnitModel } from './product-unit.model';
import { ProductUnitService } from './product-unit.service';

@Component({
  selector: 'app-product-unit',
  templateUrl: './product-unit.component.html',
  styleUrl: './product-unit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductUnitComponent implements OnInit, OnDestroy {
  
  productUnits: ProductUnitModel[];
  productId: number = 0;

  private unsubscribe = new SubscriptionHandler();
  @Input() form!: FormGroup;
  @Input() next!: () => void;
  @Input() prev!: () => void;
  

  constructor(
    private service: ProductUnitService,
    private find: FindService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private ar: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.productId = this.form.value.productInfo.id

    console.log(this.form);
    console.log(this.productId);
    
   if(this.productId)
    this.loadUnit();
  }

  loadUnit() {
    this.service.find(this.productId).subscribe({
      next: (resp: any) => {
        this.productUnits = resp.data;
        this.cdr.detectChanges();
      },
      error: (err) => this.commonService.handleError(err),
    });
  }

  add() {
    this.unsubscribe.subscribe = this.dialog
      .open(AddProductUnitComponent, {
        data: {
          product: this.form.value,
          isEdit: false,
          productId: this.productId,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        console.log("result is ",result);
        this.form.value.unitInfo=[...this.form.value.unitInfo,result];
        console.log("form",this.form);
        this.loadUnit();
      });
     
      
  }

  update() {
    this.unsubscribe.subscribe = this.dialog
      .open(AddProductUnitComponent, {
        data: {
          product: this.form,
          isEdit: true,
          productId: this.productId,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.form.patchValue(result);
          this.loadUnit();
          this.commonService.toastr.success('Product unit updated successfully');
        } else {
          this.commonService.toastr.error('Failed to update product unit');
        }
        this.cdr.markForCheck();
        this.loadUnit();
        this.cdr.detectChanges();
      });
  }

  delete(unit_id: number) {
    this.service.delete(this.productId, { id: unit_id }).subscribe({
      complete: () =>
        this.commonService.toastr.success('Unit has been detached.') && this.loadUnit(),
      error: (err) => this.commonService.handleError(err),
    });
  }

  ngOnDestroy() {
    this.unsubscribe.unsubscribe();
  }
}
