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
import { merge, tap } from 'rxjs';

import { SpinnerService } from 'src/app/services/spinner.service';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { CommonService } from 'src/app/modules/core/common.service';
import { ProductService } from '../product.service';
import { UnitService } from 'src/app/modules/settings/unit/unit.service';
import { UsersService } from 'src/app/modules/usermanagement/users/users.service';
import { ConfirmationDialogComponent } from 'src/app/modules/core/confirmation-dialog/confirmation-dialog.component';
import { AddProductInventoryComponent } from './add-product-inventory/add-product-inventory.component';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InventoryDatasource } from '../../inventory/inventory.datasource';
import { InventoryModel } from '../../inventory/inventory.model';
import { InventoryService } from '../../inventory/inventory.service';

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
  dataSource: InventoryDatasource;
  selection = new SelectionModel<InventoryModel>(true, []);
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
    'id',
    'product_id',
    'unit_id',
    'created_by',
    'qty',
    'rem_qty',
    'unit_price',
    'notes',
    'status',
    'action',
  ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  @ViewChild('searchElementRef', { static: true }) searchElementRef: ElementRef;

  tableColumns: Array<any> = [
    { ref: 'id', name: 'ID', style: { 'max-width': '30px' } },
    { ref: 'product_id', name: 'Product', mutator: (row: any) => row.product?.name || '—' },

    { ref: 'unit_id', name: 'Unit ID', mutator: (row: any) => row.unit?.name || '—' },
    { ref: 'created_by', name: 'Created By', mutator: (row: any) => this.getUserName(row.created_by) },
    { ref: 'qty', name: 'Quantity' },
    { ref: 'rem_qty', name: 'Remaining Quantity' },
    
    { ref: 'unit_price', name: 'Unit Price' },
    { ref: 'notes', name: 'Notes' },

    { ref: 'status', name: 'Status', mutator: (row: any) => (row.status === 1 ? 'Active' : 'Inactive') },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: InventoryService,
    private commonService: CommonService,
    private productService: ProductService,
    private unitService: UnitService,
    private userService: UsersService,
    private spinnerService: SpinnerService,
    private ar: ActivatedRoute
  ) {
    this.dataSource = new InventoryDatasource(this.service);
  }
  ngOnInit(): void {
    this.productId = this.form.value.productInfo.id || this.ar.snapshot.params['id'];
    console.log('inventory page ', this.form);
    if (this.productId) this.loadData();
    this.prefetchUserNames();
    this.subscriptionHandler.subscribe = this.sort.sortChange.subscribe();
    this.subscriptionHandler.subscribe = merge(this.sort.sortChange)
      .pipe(
        tap(() => {
          this.loadData();
        })
      )
      .subscribe();
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
    this.cdr.detectChanges();
  }

  loadData() {
    this.filter.orderField = this.sort.active;
    this.filter.orderBy = this.sort.direction;
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
      'unit_price',
      'notes',
      'created_at',
      'updated_at',
      'deleted_at',
      'status',
    ];
    this.dataSource.find(_.pickBy(this.filter)).subscribe({
      next: (response: any) => {
        this.form.value.inventoryInfo = response.data;
      },
      error: (err: any) => {
        console.error('Error while fetching inventory data:', err);
      },
    });
  }
  masterToggle() {
    if (this.selection.selected.length === this.dataSource.originalData.data.length) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: InventoryModel) => this.selection.select(row));
    }
  }

  isAllSelected(): boolean {
    return this.dataSource.originalData.data.length === this.selection.selected.length;
  }

  delete(item:InventoryModel) {
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
          model: new InventoryModel().clear(),
          isEdit: false,
          productId: this.productId,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        console.log('result of inventory page ', result);
        this.form.value.inventoryInfo = [...this.form.value.inventoryInfo, result];
        console.log('result is this ', result);
        this.loadData();
      });
  }

  edit(item: InventoryModel) {
    this.dialog
      .open(AddProductInventoryComponent, {
        data: {
          model: item,
          isEdit: true,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        console.log('result of inventory page ', result);
        this.form.value.inventoryInfo = [...this.form.value.inventoryInfo, result];
        console.log('result is this ', result);
        this.loadData();
      });
  }
}
