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
import { InventoryDatasource } from './inventory.datasource';
import { InventoryModel } from './inventory.model';
import { AddInventoryComponent } from './add-inventory/add-inventory.component';
import { InventoryService } from './inventory.service';
import { UsersService } from '../../usermanagement/users/users.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { Router } from '@angular/router';


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
  isLoading = false;
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
    'unit_price',
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

    { ref: 'unit_id', name: 'Unit'
      ,mutator: (row: any) => row.unit?.name || '—' 
     },
    { ref: 'created_by', name: 'Created By',mutator: (row: any) => this.getUserName(row.created_by) },
    { ref: 'qty', name: 'Quantity' },
    { ref: 'rem_qty', name: 'Remaining Quantity' },
   
    { ref: 'unit_price', name: 'Unit Price' },
    { ref: 'notes', name: 'Notes' },
   
    { ref: 'status', name: 'Status', mutator: (row: any) => row.status === 1 ? 'Active' : 'Inactive'  },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: InventoryService,
    private commonService: CommonService,
    private userService: UsersService,
    private spinnerService: SpinnerService,
    private router:Router
  ) {
    this.dataSource = new InventoryDatasource(this.service);
  }
  ngOnInit(): void {
    this.loadData();
    this.prefetchUserNames();
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

 
  prefetchUserNames() {
    this.userService.find({}).subscribe((users: any) => {
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
      this.isLoading = false; 
      this.spinnerService.hide();
      this.subscriptionHandler.subscribe = fromEvent(this.searchElementRef.nativeElement, 'keyup')
        .pipe(
          debounceTime(300),
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
      this.filter.with = ['product', 'unit']; // Include related data if necessary
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
        next: () => {
        },
        error: (err) => {
          console.error('Error loading inventory:', err);
        }
      });
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
          this.isLoading = true;
          this.spinnerService.show();
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
        } else {
          this.isLoading = false;
          this.spinnerService.hide();
        }
      });
  }
  viewDetails(item:any){
    this.router.navigate([`/app/inventory/${item.id}`])
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
