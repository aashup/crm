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
import { PurchaseDatasource } from './purchase.datasource';
import { PurchaseModel } from './purchase.model';
import { PurchaseService } from './purchase.service';
import { AddPurchaseComponent } from './add-purchase/add-purchase.component';
import { SpinnerService } from 'src/app/services/spinner.service';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-purchase',
    templateUrl: './purchase.component.html',
    styleUrl: './purchase.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PurchaseComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: PurchaseDatasource;
  selection = new SelectionModel<PurchaseModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  cities: any = [];
  isLoading = false;
  search: any = { all: '' };
  filter: any = {};
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
    { ref: 'notes', name: 'Notes', mutator: (item: any) => item.notes || '--' },
    { ref: 'created_at', name: 'Created At' },
    { ref: 'updated_at', name: 'Updated At' },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: PurchaseService,
    private commonService: CommonService,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private datePipe: DatePipe,
    private router: Router 
  ) {
    this.dataSource = new PurchaseDatasource(this.service);
  }
  ngOnInit(): void {
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
      this.filter.with= ["purchaseDetails","purchaseDetails.product","purchaseDetails.unit","party","unit","createdby"],
      this.filter.cols = [
        'id',
        'party_id',
        'due_amount',
        'unit_id',
        'return_amount',
        'amount',
        'discount_amount',
        'billinng_address_id',
        'discount_type',
        'net_total',
        'notes',
        'payment_method',
        'cash_amount',
        'online_amount',
        'transaction_id',
        'purchaseDetails',
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
      this.dataSource.originalData.data.forEach((row: PurchaseModel) =>
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

  delete(item: PurchaseModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Purchase Item',
          body: `Are you sure you want to delete this Purchase Item <span class="text-danger bold">${item.name}?</span>`,
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
              this.commonService.toastr.success('Purchase has been deleted.');
              this.loadData();
              this.isLoading = false; 
              this.spinnerService.hide();
              this.cdr.detectChanges(); 
            },
            error: (err) => {
              this.commonService.handleError(err);
              this.isLoading = false; 
              this.spinnerService.hide();
            },
          });
        }
      });
  }

  add() {

    this.router.navigate(['app/purchase/direct-purchase']);
    return
    this.dialog
      .open(AddPurchaseComponent, {
        height: 'auto',
        width: '80%',
        maxWidth:"100%",
        data: {
          model: new PurchaseModel().clear(),
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

  edit(item: PurchaseModel) {
    this.dialog
      .open(AddPurchaseComponent, {
        height: 'auto',
        width: '80%',
        maxWidth:"100%",
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
