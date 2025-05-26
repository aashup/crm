import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import _ from 'lodash';
import { CommonService } from 'src/app/modules/core/common.service';
import { FindService } from 'src/app/modules/core/find.service';
import { ProductModel } from '../product.model';
import { ProductService } from '../product.service';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { MatDialog } from '@angular/material/dialog';
import { AddProductSellerComponent } from '../add-product-seller/add-product-seller.component';
import { ProductSellerService } from './product-seller.service';
import { ProductSellerModel } from './product-seller.model';


@Component({
  selector: 'app-product-seller',
  templateUrl: './product-seller.component.html',
  styleUrl: './product-seller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSellerComponent implements OnInit, OnDestroy {
  @Input() product: ProductModel;
  productSeller: ProductSellerModel[];
  private unsubscribe = new SubscriptionHandler();
  @Input() next: () => void;
  @Input() prev: () => void;

  constructor(
    private service: ProductSellerService,
    private find: FindService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private ar: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {

    console.log(this.product);
    
    this.loadSeller();
  }

  loadSeller() {
    this.service.find(8).subscribe({
      next: (resp: any) => {
        this.productSeller = resp.data;
        this.cdr.detectChanges();
      },
      error: (err) => this.commonService.handleError(err),
    });
  }

  add() {
    this.unsubscribe.subscribe = this.dialog
      .open(AddProductSellerComponent, {
        data: {
          product: this.product,
        },
      })
      .afterClosed()
      .subscribe((v) => v && this.loadSeller());
  }

  update() {
    this.unsubscribe.subscribe = this.dialog
      .open(AddProductSellerComponent, {
        data: {
          product: this.product,
        },
      })
      .afterClosed()
      .subscribe((v) => v && this.loadSeller());
  }

  delete(seller_id: number) {
    this.service.delete(this.product.id, { id: seller_id }).subscribe({
      complete: () =>
        this.commonService.toastr.success('Seller has been detached.') && this.loadSeller(),
      error: (err) => this.commonService.handleError(err),
    });
  }

  ngOnDestroy() {
    this.unsubscribe.unsubscribe();
  }
}
