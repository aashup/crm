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
import { VendorDatasource } from './vendor.datasource';
import { VendorModel } from './vendor.model';
import { VendorService } from './vendor.service';
import { AddVendorComponent } from './add-vendor/add-vendor.component';

@Component({
    selector: 'app-vendor',
    templateUrl: './vendor.component.html',
    styleUrl: './vendor.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class VendorComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: VendorDatasource;
  selection = new SelectionModel<VendorModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  cities: any = [];
  search: any = { all: '' };
  filter: any = {};
  displayableCol = ['select', 'id', 'name', 'contact', 'address', 'action'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  @ViewChild('searchElementRef', { static: true }) searchElementRef: ElementRef;

  tableColumns: Array<any> = [
    { ref: 'select', name: 'select', style: { width: '70px' } },
    {
      ref: 'id',
      name: 'ID',
      style: { 'max-width': '30px' },
    },
    { ref: 'name', name: 'Name' },
    { ref: 'address', name: 'Address Name', mutator: (item: any) => item?.address?.address },
    {
      ref: 'contact',
      name: 'Contact Person',
      mutator: (item: any) => item?.contact?.name,
    },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: VendorService,
    private commonService: CommonService,
    private cityService: CityService,
  ) {
    this.dataSource = new VendorDatasource(this.service);
  }
  ngOnInit(): void {
    this.getAllCities()
    this.loadData();
    this.commonService.page.updateTitle('Vendor List');
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
      console.log(res.data);
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
      this.filter.with = ['contact', 'address']; // Include contact and address
      this.filter.cols = ['id', 'name', 'contact_id', 'address_id', 'created_at', 'updated_at']; // Specify required columns
      this.dataSource.find(_.pickBy(this.filter));
    }
  masterToggle() {
    if (
      this.selection.selected.length ===
      this.dataSource.originalData.data.length
    ) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: VendorModel) =>
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

  delete(item: VendorModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Country',
          body: `Are you sure you want to delete this country <span class="text-danger bold">${item.name}?</span>`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('Country has been deleted.');
              this.loadData();
            },
            error: (err) => this.commonService.handleError(err),
          });
        }
      });
  }

  add() {
    this.dialog
      .open(AddVendorComponent, {
        data: {
          model: new VendorModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => flag && this.loadData());
  }

  edit(item: VendorModel) {
    this.dialog
      .open(AddVendorComponent, {
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
