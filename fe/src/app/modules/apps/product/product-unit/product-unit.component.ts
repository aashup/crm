import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { ProductModel } from '../product.model';
import { ProductService } from '../product.service';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { MatDialog } from '@angular/material/dialog';
import { AddProductUnitComponent } from '../add-product-unit/add-product-unit.component';
import { ProductUnitModel } from './product-unit.model';

@Component({
  selector: 'app-product-unit',
  templateUrl: './product-unit.component.html',
  styleUrl: './product-unit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductUnitComponent implements OnInit, OnDestroy {

  @Input() product: ProductModel |  null;
  productUnits: ProductUnitModel[];
  private unsubscribe = new SubscriptionHandler();
  @Input() next: () => void;
  @Input() prev: () => void;

  constructor(
    private service: ProductService,
    private find: FindService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private ar: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUnit();
  }

  loadUnit() {
    this.service.update({id: this.product?.id, action: 'load-units'}).subscribe({
      next: (resp: any) => {
        this.productUnits = resp.data;
        this.cdr.detectChanges();
      },
      error: err => this.commonService.handleError(err)
    })
  }

  add() {
   this.unsubscribe.subscribe = this.dialog.open(AddProductUnitComponent, {
      data: {
        product: this.product
      }
    }).afterClosed().subscribe(v => v)
  }

  update() {
    this.unsubscribe.subscribe = this.dialog.open(AddProductUnitComponent, {
       data: {
         product: this.product
       }
     }).afterClosed().subscribe(v => v)
   }

  delete(unit_id: number) {
    this.service.update({
      action: 'delete-unit',
      id: this.product?.id,
      unit_id: unit_id
    })
  }

  ngOnDestroy() {
    this.unsubscribe.unsubscribe();
  }

}
