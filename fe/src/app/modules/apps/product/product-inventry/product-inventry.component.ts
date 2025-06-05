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
import { ProductInventoryModel } from './product-inventry.model';
import { ProductInventryService } from './product-inventry.service';
import { AddProductInventryComponent } from '../add-product-inventry /add-product-inventry.component';

@Component({
  selector: 'app-product-inventry',
  templateUrl: './product-inventry.component.html',
  styleUrl: './product-inventry.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInventryComponent implements OnInit, OnDestroy {
  @Input() product: ProductModel;
  productInventry: ProductInventoryModel[];
  productId: number = 0;
  private unsubscribe = new SubscriptionHandler();
  @Input() form!: FormGroup;
  @Input() next: () => void;
  @Input() prev: () => void;

  constructor(
    private service: ProductInventryService,
    private find: FindService,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef,
    private ar: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.productId = Number(this.ar.snapshot.paramMap.get('id'));
    this.loadInventry();
    
  }

  loadInventry() {
    this.service.find(this.productId).subscribe({
      next: (resp: any) => {
        this.productInventry = resp.data;
        this.cdr.detectChanges();
      },
      error: (err) => this.commonService.handleError(err),
    });
  }

  add() {
    this.unsubscribe.subscribe = this.dialog
      .open(AddProductInventryComponent, {
        data: {
          product: this.product,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.loadInventry();
          this.form.patchValue(result)
          this.commonService.toastr.success('Inventry has been attached.');
        }
      });
  }

  update() {
    this.unsubscribe.subscribe = this.dialog
      .open(AddProductInventryComponent, {
        data: {
          product: this.product,
        },
      })
      .afterClosed()
      .subscribe((v) => v && this.loadInventry());
  }

  delete(inventry_id: number) {
    this.service.delete(this.product.id, { id: inventry_id }).subscribe({
      complete: () =>
        this.commonService.toastr.success('Inventry has been detached.') && this.loadInventry(),
      error: (err) => this.commonService.handleError(err),
    });
  }

  ngOnDestroy() {
    this.unsubscribe.unsubscribe();
  }
}
