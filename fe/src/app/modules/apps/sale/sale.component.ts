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
import { SpinnerService } from 'src/app/services/spinner.service';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { Router } from '@angular/router';
import { TaxRateService } from '../tax-rate/tax-rate.service';

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
  tax_rates: any = [];
  displayableCol = [
    'select',
    'id',
    'party_id',
    'due_amount',
    'return_amount',
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
    { ref: 'party_id', name: 'Party', mutator: (item: any) => item?.party?.name || 'N/A' },
    { ref: 'due_amount', name: 'Due Amount' }, 
    { ref: 'return_amount', name: 'Return Amount'}, 
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
    private spinnerService: SpinnerService,
    private router:Router,
    private taxRateService:TaxRateService
  ) {
    this.dataSource = new SaleDatasource(this.service);
  }
  ngOnInit(): void {
    this.getAllTaxRates()
    this.getAllCities()
    this.loadData();
    this.checkPermissions()
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
  getAllTaxRates(): void {
    this.taxRateService
      .find({ pageSize: 1000 })
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          if (res?.data?.length) {
            this.tax_rates = res.data;
          } else {
            this.tax_rates = [];
          }
        },
        error: (error: any) => {
          this.tax_rates = [];
        },
      });
      this.cdr.detectChanges();
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
      this.filter.filter = JSON.stringify(_.pickBy(this.search));
      this.filter.with= ["saleDetails.product.units","party","saleDetails.unit"],
      this.filter.cols = [
        'id',
        'party_id',
        'due_amount',
        'return_amount',
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
        this.spinnerService.show();
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('Sale has been deleted.');
              this.loadData();
              this.cdr.detectChanges(); 
              this.isLoading = false; 
              this.spinnerService.hide();

            },
            error: (err) => {
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
  showContactTooltip(data:any){
    tippy(`#id${data.id}`, {
      content: `
      <strong>Contact Name :</strong> ${data.name}</br>
      <strong>Mobile 1 :</strong> ${data.mob1}</br>
      <strong>Mobile 2:</strong> ${data.mob2}</br>
      `,
      placement: 'top',
      animation: 'scale',
      allowHTML: true
    });
  }
  add() {
    this.router.navigate(["/app/direct-sale"])
    return
    // this.dialog
    //   .open(AddSaleComponent, {
    //     height: 'auto',
    //     width: '80%',
    //     maxWidth:"100%",
    //     data: {
    //       model: new SaleModel().clear(),
    //       isEdit: false,
    //     },
    //   })
    //   .afterClosed()
    //   .pipe(take(1))
    //   .subscribe((flag) => {
    //     if (flag) {
    //       this.loadData();
    //       this.cdr.detectChanges(); 
    //     }
    //   });
  }

  edit(item: SaleModel) {
    this.dialog
      .open(AddSaleComponent, {
        height: '80%',
        width: '80%',
        maxWidth:"100%",
        data: {
          model: item,
          isEdit: true,
          tax_rates:this.tax_rates
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
