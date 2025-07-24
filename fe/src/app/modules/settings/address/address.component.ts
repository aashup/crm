import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AddressDatasource } from './address.datasource';
import { AddressModel } from './address.model';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import _, { multiply } from 'lodash';
import { merge, tap, take, debounceTime, distinctUntilChanged, fromEvent } from 'rxjs';
import { CommonService } from '../../core/common.service';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { AddressService } from './address.service';
import { AddAddressComponent } from './add-address/add-address.component';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
  standalone: false,
})
export class AddressComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: AddressDatasource;
  isLoading = false;
  selection = new SelectionModel<AddressModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  search: any = { all: '' };
  filter: any = {};
  displayableCol = [
    'select',
    'id',
    'address',
    'city_id',
    'mob1',
    'mob2',
    'type',
    'pin',
    'status',
    'created_by',
    'action',
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  @ViewChild('searchElementRef', { static: true }) searchElementRef: ElementRef;

  tableColumns: Array<any> = [
    { ref: 'select', name: 'select', style: { width: 'fit-content', paddingRight: '15px' } },
    {
      ref: 'id',
      name: 'ID',
      style: { 'max-width': 'fit-content', paddingRight: '15px' },
    },
    { ref: 'address', name: 'Address Name' , style: { 'max-width': 'fit-content', paddingRight: '15px' },},
    {
      ref: 'city_id',
      name: 'City',
      style: { 'max-width': 'fit-content', paddingRight: '15px' },
      mutator: (item: AddressModel) => (item.city ? item.city.name : 'N/A'),
    },
    { ref: 'pin', name: 'Pin Code', style: { 'max-width': 'fit-content', paddingRight: '15px' } },
    {
      ref: 'mob1',
      name: 'Mobile No 1',
      mutator: (item: any) => (item.mob1 ? item.mob1 : '--'),
      style: { 'max-width': 'fit-content', paddingRight: '15px' },
    },
    {
      ref: 'mob2',
      name: 'Mobile No 2',
      mutator: (item: any) => (item.mob2 ? item.mob2 : '--'),
      style: { 'max-width': 'fit-content', paddingRight: '15px' },
    },
    {
      ref: 'type',
      name: 'Address Type',
      mutator: (item: AddressModel) => (item.type == '1' ? 'Billing' : 'Shipping'),
      style: { 'max-width': 'fit-content', paddingRight: '15px' },
    },
    {
      ref: 'created_by',
      name: 'Created By',
      style: { 'max-width': 'fit-content', paddingRight: '15px' },
      mutator: (item: AddressModel) => item.created_by?.name || 'N/A',
    },
    {
      ref: 'status',
      name: 'Status',
      mutator: (item: AddressModel) => (item.status == 0 ? 'In-Active' : 'Active'),
      style: { 'max-width': 'fit-content', paddingRight: '15px' },
    },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: AddressService,
    private commonService: CommonService,
    private spinnerService: SpinnerService
  ) {
    this.dataSource = new AddressDatasource(this.service);
  }
  ngOnInit(): void {
    this.loadData();
    this.subscriptionHandler.subscribe = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.subscriptionHandler.subscribe = merge(this.sort.sortChange, this.paginator.page)
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
    this.filter.with = ['city', 'createdBy'];
    this.dataSource.find(_.pickBy(this.filter));
  }
  masterToggle() {
    if (this.selection.selected.length === this.dataSource.originalData.data.length) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: AddressModel) => this.selection.select(row));
    }
  }

  isAllSelected(): boolean {
    return this.dataSource.originalData.data.length === this.selection.selected.length;
  }

  delete(item: AddressModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Address',
          body: `Are you sure you want to delete this Address <span class="text-danger bold">${item.address}?</span>`,
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
              this.isLoading = false;
              this.spinnerService.hide();
              this.commonService.toastr.success('Address has been deleted.');
              this.loadData();
            },
            error: (err) => {
              this.isLoading = false;
              this.spinnerService.hide();
              this.commonService.handleError(err);
            },
          });
        }
      });
  }

  add() {
    this.dialog
      .open(AddAddressComponent, {
        data: {
          model: new AddressModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => flag && this.loadData());
  }

  edit(item: AddressModel) {
    this.dialog
      .open(AddAddressComponent, {
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
