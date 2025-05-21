import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
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
import { SubscriptionHandler } from '../../core/subscription.handler';
import { CommonService } from '../../core/common.service';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { CityService } from '../../settings/city/city.service';
import { InventoryDatasource } from './inventory.datasource';
import { InventoryModel } from './inventory.model';
import { AddInventoryComponent } from './add-inventory/add-inventory.component';
import { InventoryService } from './inventory.service';
import { ProductService } from '../product/product.service';
import { UnitService } from '../../settings/unit/unit.service';
import { UsersService } from '../../usermanagement/users/users.service';


@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrl: './inventory.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InventoryComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: InventoryDatasource;
  selection = new SelectionModel<InventoryModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  productCache: { [key: string]: string } = {};
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
    { ref: 'product_id', name: 'Product Name', mutator: (row: any) => this.getProductName(row.product_id) },

    { ref: 'unit_id', name: 'Unit ID'
      , mutator: (row: any) => this.getUnitName(row.unit_id)  
     },
    { ref: 'created_by', name: 'Created By',mutator: (row: any) => this.getUserName(row.created_by) },
    { ref: 'qty', name: 'Quantity' },
    { ref: 'rem_qty', name: 'Remaining Quantity' },
    { ref: 'purchase_price', name: 'Purchase Price' },
    { ref: 'sale_price', name: 'Sale Price' },
    { ref: 'notes', name: 'Notes' },
   
    { ref: 'status', name: 'Status', mutator: (row: any) => row.status === 1 ? 'Active' : 'Inactive'  },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: InventoryService,
    private commonService: CommonService,
    private productService: ProductService,
    private unitService: UnitService,
    private userService: UsersService,
  ) {
    this.dataSource = new InventoryDatasource(this.service);
  }
  ngOnInit(): void {
    this.loadData();
    this.prefetchProductNames()
    this.prefetchUnitNames()
    this.prefetchUserNames();
    this.commonService.page.updateTitle('Inventory List');
    this.subscriptionHandler.subscribe = this.sort.sortChange.subscribe(
      () => (this.paginator.pageIndex = 0)
    );
    this.subscriptionHandler.subscribe = merge(
      this.sort.sortChange,
      this.paginator.page
    )
      .pipe(
        tap(() => {
          this.loadData();
        })
      )
      .subscribe();
  }
  prefetchProductNames() {
    this.productService.find().subscribe((products: any) => {
      products.data.forEach((product:any) => {
        this.productCache[product.id] = product.name;
      });
    });
  }
  
  getProductName(id: any): string {
    return this.productCache[id] || 'Loading...';
  }

  prefetchUnitNames() {
    this.unitService.find().subscribe((units: any) => {
      units.data.forEach((unit:any) => {
        this.unitCache[unit.id] = unit.name;
      });
    });
  }
  
  getUnitName(id: any): string {
    return this.unitCache[id] || 'Loading...';
  }
  prefetchUserNames() {
    this.userService.find({}).subscribe((users: any) => {
      console.log("-----------");
      console.log(users);
      console.log("-----------");
      
      
      users.data.forEach((user:any) => {
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
      this.filter.filter = JSON.stringify(_.pickBy(this.search));
      this.filter.with = ['contact', 'address']; // Include related data if necessary
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
      ]; // Specify all required columns
      this.dataSource.find(_.pickBy(this.filter));
    }
  masterToggle() {
    if (
      this.selection.selected.length ===
      this.dataSource.originalData.data.length
    ) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: InventoryModel) =>
        this.selection.select(row)
      );
    }
  }

  isAllSelected(): boolean {
    return (
      this.dataSource.originalData.data.length ===
      this.selection.selected.length
    );
  }

  delete(item: InventoryModel) {
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
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('Inventory has been deleted.');
              this.loadData();
            },
            error: (err:any) => this.commonService.handleError(err),
          });
        }
      });
  }

  add() {
    this.dialog
      .open(AddInventoryComponent, {
        data: {
          model: new InventoryModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => flag && this.loadData());
  }

  edit(item: InventoryModel) {
    this.dialog
      .open(AddInventoryComponent, {
        data: {
          model: item,
          isEdit: true,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => flag && this.loadData());
  }
}
