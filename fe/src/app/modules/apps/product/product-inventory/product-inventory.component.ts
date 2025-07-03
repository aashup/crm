import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import _ from 'lodash';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, fromEvent, merge, take, tap } from 'rxjs';
import { ProductInventoryDatasource } from './product-inventory.datasource';

import { SpinnerService } from 'src/app/services/spinner.service';
import { ProductInventoryModel } from './product-inventory.model';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { ProductInventoryService } from './product-inventory.service';
import { CommonService } from 'src/app/modules/core/common.service';
import { ProductService } from '../product.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { UsersService } from 'src/app/modules/usermanagement/users/users.service';
import { ConfirmationDialogComponent } from 'src/app/modules/core/confirmation-dialog/confirmation-dialog.component';
import { AddProductInventoryComponent } from './add-product-inventory/add-product-inventory.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-product-inventory',
  templateUrl: './product-inventory.component.html',
  styleUrl: './product-inventory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ProductInventoryComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  @Input() form: FormGroup;
  @Input() next!: () => void;
  @Input() prev!: () => void;
  dataSource: ProductInventoryDatasource;
  selection = new SelectionModel<ProductInventoryModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  productCache: { [key: string]: string } = {};
  isLoading = false;
  productId: string;
  unitCache: { [key: string]: string } = {};
  userCache: { [key: string]: string } = {};
  readonly dialog = inject(MatDialog);
  cities: any = [];
  search: any = { all: '' };
  filter: any = {};
  displayableCol = [
    'select',
    'id',
    'product_id',
    'unit_id',
    'created_by',
    'qty',
    'rem_qty',
    'purchase_price',
    'sale_price',
    'notes',

    'status',
    'action',
  ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  @ViewChild('searchElementRef', { static: true }) searchElementRef: ElementRef;

  tableColumns: Array<any> = [
    { ref: 'select', name: 'Select', style: { width: '70px' } },
    { ref: 'id', name: 'ID', style: { 'max-width': '30px' } },
    { ref: 'product_id', name: 'Product Name', mutator: (row: any) => row.product?.name || '—' },

    { ref: 'unit_id', name: 'Unit ID', mutator: (row: any) => row.unit?.name || '—' },
    { ref: 'created_by', name: 'Created By', mutator: (row: any) => this.getUserName(row.created_by) },
    { ref: 'qty', name: 'Quantity' },
    { ref: 'rem_qty', name: 'Remaining Quantity' },
    { ref: 'purchase_price', name: 'Purchase Price' },
    { ref: 'sale_price', name: 'Sale Price' },
    { ref: 'notes', name: 'Notes' },

    { ref: 'status', name: 'Status', mutator: (row: any) => (row.status === 1 ? 'Active' : 'Inactive') },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: ProductInventoryService,
    private commonService: CommonService,
    private productService: ProductService,
    private unitService: UnitService,
    private userService: UsersService,
    private spinnerService: SpinnerService
  ) {
    this.dataSource = new ProductInventoryDatasource(this.service);
  }
  ngOnInit(): void {
    this.productId = this.form.value.productInfo.id;
    console.log("inventory page ",this.form);
    if (this.productId) this.loadData();
    this.prefetchUserNames();
    this.subscriptionHandler.subscribe = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.subscriptionHandler.subscribe = merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadData();
        })
      )
      .subscribe();
  }
  prefetchProductNames() {
    this.productService.find().subscribe((products: any) => {
      products.data.forEach((product: any) => {
        this.productCache[product.id] = product.name;
      });
    });
  }

  prefetchUnitNames() {
    this.unitService.find().subscribe((units: any) => {
      units.data.forEach((unit: any) => {
        this.unitCache[unit.id] = unit.name;
      });
    });
  }

  prefetchUserNames() {
    this.userService.find({}).subscribe((users: any) => {
      users.data.forEach((user: any) => {
        this.userCache[user.id] = user.name;
      });
    });
  }

  getUserName(id: any): string {
    return this.userCache[id] || 'N/A';
  }

  ngOnDestroy(): void {
    this.subscriptionHandler.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.isLoading = false;
    this.spinnerService.hide();
    this.subscriptionHandler.subscribe = fromEvent(this.searchElementRef.nativeElement, 'keyup')
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.search.all = this.searchElementRef.nativeElement.value;
          this.loadData();
        })
      )
      .subscribe();
  }

  loadData() {
    this.filter.orderField = this.sort.active;
    this.filter.orderBy = this.sort.direction;
    this.filter.page = this.paginator.pageIndex + 1;
    this.filter.pageSize = this.paginator.pageSize || 20;
    this.filter.filter = JSON.stringify({
      ..._.pickBy(this.search),
      product_id: this.productId,
    });
    this.filter.with = ['product', 'unit'];

    this.filter.cols = [
      'id',
      'product_id',
      'unit_id',
      'created_by',
      'qty',
      'rem_qty',
      'purchase_price',
      'sale_price',
      'notes',
      'created_at',
      'updated_at',
      'deleted_at',
      'status',
    ];

    this.dataSource.find(_.pickBy(this.filter));
  }
  masterToggle() {
    if (this.selection.selected.length === this.dataSource.originalData.data.length) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: ProductInventoryModel) => this.selection.select(row));
    }
  }

  isAllSelected(): boolean {
    return this.dataSource.originalData.data.length === this.selection.selected.length;
  }

  delete(item: ProductInventoryModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Inventory',
          body: `Are you sure you want to delete this Inventory <span class="text-danger bold">${item.id}?</span>`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        this.isLoading = true;
        this.spinnerService.show();
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('Inventory has been deleted.');
              this.loadData();
              this.isLoading = false;
              this.spinnerService.hide();
            },
            error: (err: any) => {
              this.commonService.handleError(err);
              this.isLoading = false;
              this.spinnerService.hide();
            },
          });
        }
      });
  }

  add() {
    this.dialog
      .open(AddProductInventoryComponent, {
        data: {
          model: new ProductInventoryModel().clear(),
          isEdit: false,
          productId: this.form.value.productInfo.id,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        console.log("result of inventory page ",result);
         this.form.value.inventoryInfo=[...this.form.value.inventoryInfo,result];
        console.log("result is this ",result);
        this.loadData();
      });
  }

  edit(item: ProductInventoryModel) {
    this.dialog
      .open(AddProductInventoryComponent, {
        data: {
          model: item,
          isEdit: true,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        console.log("result of inventory page ",result);
         this.form.value.inventoryInfo=[...this.form.value.inventoryInfo,result];
        console.log("result is this ",result);
        this.loadData();
      });;
  }
}
