import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import _ from 'lodash';
import { debounceTime, distinctUntilChanged, fromEvent, merge, take, tap } from 'rxjs';
import { CommonService } from '../../core/common.service';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { SpinnerService } from 'src/app/services/spinner.service';
import { TaxRateDatasource } from './tax-rate.datasource';
import { TaxRateModel } from './tax-rate.model';
import { TaxRateService } from './tax-rate.service';
import { AddTaxRateComponent } from './add-tax-rate/add-tax-rate.component';

@Component({
    selector: 'app-tax-rate',
    templateUrl: './tax-rate.component.html',
    styleUrls: ['./tax-rate.component.scss'],
    standalone: false
})
export class TaxRateComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: TaxRateDatasource;
  selection = new SelectionModel<TaxRateModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  isLoading = false; 
  search: any = { all: '' };

  filter: any = {};
  displayableCol = ['select', 'rate', 'type', 'is_active', 'action'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  @ViewChild("searchElementRef", { static: true }) searchElementRef: ElementRef;

  taxtypeOptions = [
    { value: 1, label: 'GST' },
    { value: 2, label: 'IGST' },
    { value: 3, label: 'CGST' },
    { value: 4, label: 'SGST' },
    { value: 5, label: 'VAT' },
    { value: 6, label: 'Service Tax' },
    { value: 7, label: 'Other' }
  ]
  tableColumns: Array<any> = [
    { ref: 'select', name: 'select', style: { 'width': '70px' } },
    {
      ref: 'rate',
      name: 'Rate (%)',
      style: { 'max-width': '80px' },
    },
    { ref: 'type', name: 'Type', mutator: (item: any) => { 
      const type = this.taxtypeOptions.find(option => option.value == item.type);
      return type ? type.label : 'Unknown';
    }},
    { ref: 'is_active', name: 'Status', mutator: (item: any) => item.is_active ? 'Active' : 'In-Active' },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: TaxRateService,
    private commonService: CommonService,
    private spinnerService: SpinnerService
  ) {
    this.dataSource = new TaxRateDatasource(this.service);
  }

  ngOnInit(): void {
    this.loadData();
    this.subscriptionHandler.subscribe = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.subscriptionHandler.subscribe = merge(this.sort.sortChange, this.paginator.page).pipe(
      tap(() => {
        this.loadData();
      })
    ).subscribe();
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
    this.filter.with = [];
    this.dataSource.find(_.pickBy(this.filter));
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: TaxRateModel) =>
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

  delete(item: TaxRateModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Tax Rate',
          body: `Are you sure you want to delete this Tax Rate?`,
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
              this.commonService.toastr.success('Tax Rate has been deleted.');
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

  add() {
    this.dialog.open(AddTaxRateComponent, {
      data: {
        model: (new TaxRateModel()).clear(),
        isEdit: false,
      }
    }).afterClosed().pipe(take(1)).subscribe(flag => flag && this.loadData());
  }

  edit(item: TaxRateModel) {
    this.dialog.open(AddTaxRateComponent, {
      data: {
        model: item,
        isEdit: true
      }
    }).afterClosed().pipe(take(1)).subscribe(flag => flag && this.loadData());
  }
}
