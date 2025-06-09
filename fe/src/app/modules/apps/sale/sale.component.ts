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
import { AuthService } from '../../auth';
import { SaleDatasource } from './sale.datasource';
import { SaleModel } from './sale.model';
import { SaleService } from './sale.service';
import { AddSaleComponent } from './add-sale/add-sale.component';
import { AddressModel } from '../../settings/address/address.model';


@Component({
    selector: 'app-sale',
    templateUrl: './sale.component.html',
    styleUrl: './sale.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SaleComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: SaleDatasource;
  selection = new SelectionModel<SaleModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  cities: any = [];
  isLoading = false;
  search: any = { all: '' };
  filter: any = {};
  displayableCol = [
    'select',
    'id',
    'contact_id',
    'unit_id',
    'created_by',
    'amount',
    'discount_amount',
    'discount_type',
    'net_total',
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
    { ref: 'contact_id', name: 'Contact Person', mutator: (item: any) => item?.contact?.name || 'N/A' },
    { ref: 'unit_id', name: 'Unit', mutator: (item: any) => item?.unit?.name || 'N/A' }, 
    { ref: 'created_by', name: 'Created By',mutator: (item: AddressModel) => item.created_by?.name || 'N/A'  }, 
    { ref: 'amount', name: 'Amount' },
    { ref: 'discount_amount', name: 'Discount Amount' },
    { ref: 'discount_type', name: 'Discount Type', mutator: (item: any) => item.discount_type === 1 ? 'Flat' : 'Percentage' },
    { ref: 'net_total', name: 'Net Total' },
    { ref: 'notes', name: 'Notes' },
    { ref: 'status', name: 'Status', mutator: (item: any) => item.status === 1 ? 'Active' : 'Inactive' },
    { ref: 'created_at', name: 'Created At' },
    { ref: 'updated_at', name: 'Updated At' },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: SaleService,
    private commonService: CommonService,
    private cityService: CityService,
    private authService: AuthService,
  ) {
    this.dataSource = new SaleDatasource(this.service);
  }
  ngOnInit(): void {
    this.getAllCities()
    this.loadData();
    this.checkPermissions()
    this.commonService.page.updateTitle('Sale List');
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
  getAllCities() {
    this.cityService.find({}).subscribe((res:any) => {
      if(res.data.length){
        this.cities=res.data
      }
    }
    );
  }

  getCityName(id:any){
    const city = this.cities.find((city:any) => city.id === id);
    return city ? city.name : '';
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
      this.filter.with = ['contact','unit','createdBy','saleDetails']; // Removed 'address'
      this.filter.cols = [
        'id',
        'contact_id',
        'unit_id',
        'created_by',
        'amount',
        'discount_amount',
        'discount_type',
        'net_total',
        'notes',
        'status',
        'created_at',
        'updated_at',
      ]; 
      this.dataSource.find(_.pickBy(this.filter));
    }
  masterToggle() {
    if (
      this.selection.selected.length ===
      this.dataSource.originalData.data.length
    ) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: SaleModel) =>
        this.selection.select(row)
      );
    }
  }

  checkPermissions() {
    const userData = this.authService.getCurrentUser();    
  }
  isAllSelected(): boolean {
    return (
      this.dataSource.originalData.data.length ===
      this.selection.selected.length
    );
  }

  delete(item: SaleModel) {
   
    this.dialog
      .open(ConfirmationDialogComponent, {
        
        data: {
          title: 'Delete Sale Item',
          body: `Are you sure you want to delete this Sale Item?`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        this.isLoading = true; 
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('Sale has been deleted.');
              this.loadData();
              this.cdr.detectChanges(); 
              this.isLoading = false; 
            },
            error: (err) => {
              this.commonService.handleError(err);
              this.isLoading = false; 
            },
          });
        } else {
          this.isLoading = false; 
        }
      });
  }

  add() {
    this.dialog
      .open(AddSaleComponent, {
        height: 'auto',
        width: '100px !important',
        data: {
          model: new SaleModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => {
        if (flag) {
          this.loadData();
          this.cdr.detectChanges(); 
        }
      });
  }

  edit(item: SaleModel) {
    this.dialog
      .open(AddSaleComponent, {
        width:"90%",
        data: {
          model: item,
          isEdit: true,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => {
        if (flag) {
          this.loadData();
          this.cdr.detectChanges(); 
        }
      });
  }
}
