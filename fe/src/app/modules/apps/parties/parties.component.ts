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
import { AddressService } from '../../settings/address/address.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { PartiesDatasource } from './parties.datasource';
import { PartiesModel } from './parties.model';
import { PartiesService } from './parties.service';
import { AddPartiesComponent } from './add-parties/add-parties.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-parties-details',
  templateUrl: './parties.component.html',
  styleUrl: './parties.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PartiesComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: PartiesDatasource;
  selection = new SelectionModel<PartiesModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  cities: any = [];
  address: any = [];
  shippingAddress: any;
  search: any = { all: '' };
  filter: any = {};
  isLoading = false;
  displayableCol = [
    'select',
    'id',
    'name',
    'gstin',
    'mobile',
    'opening_balance',
    'opening_balance_date',
    'credit_limit_amount',
    'state',
    'email',
    'action',
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  @ViewChild('searchElementRef', { static: true }) searchElementRef: ElementRef;

  tableColumns: Array<any> = [
    { ref: 'select', name: 'Select', style: { width: '70px' } },
    {
      ref: 'id',
      name: 'ID',
      style: { 'max-width': '30px' },
      mutator: (item: any) => item?.id || '--',
    },
    { ref: 'name', name: 'Name'  , mutator: (item: any) => item?.name || '--'}, 
    {
      ref: 'gstin',
      name: 'GST Number',
      mutator: (item: any) => item?.gstin || '--',
    },

    {
      ref: 'mobile',
      name: 'Mobile',
      mutator: (item: any) => item?.mobile || '--', 
    },
    {
      ref: 'opening_balance',
      name: 'Opening Balance',
      mutator: (item: any) => item?.opening_balance || '--', 
    },
    {
      ref: 'opening_balance_date',
      name: 'Opening Date',
      mutator: (item: any) =>
        this.datePipe.transform(item.opening_balance_date, 'mediumDate')||'--', 
    },
    {
      ref: 'credit_limit_amount',
      name: 'Limit Amount',
      mutator: (item: any) => item?.credit_limit_amount || '--', 
    },
   
    {
      ref: 'state',
      name: ' State',
      mutator: (item: any) => item?.state?.name || '--',
    },
    {
      ref: 'email',
      name: 'Email',
      mutator: (item: any) => item?.email || '--', 
    },
    { ref: 'action', name: 'Actions' },
  ];


  constructor(
    private cdr: ChangeDetectorRef,
    private service: PartiesService,
    private commonService: CommonService,
    private cityService: CityService,
    private addressService: AddressService,
    private spinnerService: SpinnerService,
    private datePipe: DatePipe,
    private router:Router
  ) {
    this.dataSource = new PartiesDatasource(this.service);
  }
  ngOnInit(): void {
    this.paginator.pageSize = 20;
    this.paginator.pageIndex = 0;
    this.getAllAddresses();
    this.getAllCities();
    this.loadData();
    this.subscriptionHandler.subscribe = this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
    });

    this.subscriptionHandler.subscribe = merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadData();
        })
      )
      .subscribe();
  }

  getAllAddresses() {
    this.addressService.find({}).subscribe((res: any) => {
      if (res.data.length) {
        this.address = res.data;
      }
    });
  }

  getAllCities() {
    this.cityService.find({}).subscribe((res: any) => {
      if (res.data.length) {
        this.cities = res.data;
      }
    });
  }

  getCityName(id: any) {
    const city = this.cities.find((city: any) => city.id === id);
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

  loadData(): void {
    this.filter.orderField = this.sort.active;
    this.filter.orderBy = this.sort.direction;
    this.filter.page = this.paginator.pageIndex + 1;
    this.filter.pageSize = this.paginator.pageSize || 20;
    this.filter.filter = JSON.stringify(_.pickBy(this.search));
    this.filter.with = ['state',"contact"];
    this.filter.cols = [
      'id',
      'name',
      'mobile',
      'gstin',
      'gst_type',
      'contact_id',
      'opening_balance',
      'opening_balance_date',
      'credit_limit',
      'credit_limit_amount',
      'billing_address_id',
      'shipping_address_id',
      'state_id',
      'email',
      'state',
    ];
    this.dataSource.find(_.pickBy(this.filter));
  }
  masterToggle() {
    if (this.selection.selected.length === this.dataSource.originalData.data.length) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: PartiesModel) => this.selection.select(row));
    }
  }

  isAllSelected(): boolean {
    return this.dataSource.originalData.data.length === this.selection.selected.length;
  }

  viewDetails(item:any){
    this.router.navigate([`/app/parties/${item.id}`])
  }

 


  delete(item: PartiesModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Party',
          body: `Are you sure you want to delete this Party <span class="text-danger bold">${item.name}?</span>`,
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
              this.isLoading = false;
              this.spinnerService.hide();
              this.commonService.toastr.success('Party has been deleted.');
              this.loadData();
            },
            error: (err) => {
              this.isLoading = false;
              this.spinnerService.hide();
              this.commonService.toastr.error(err.error.message || 'Some error occurred.');
            },
          });
        }
      });
  }

  add() {
    this.router.navigate(["/app/party"])
     return
    this.dialog
      .open(AddPartiesComponent, {
        maxWidth: '1200px',
        maxHeight: '650px',
        height: '100%',
        width: '100%',
        data: {
          model: new PartiesModel().clear(),
          isEdit: false,
        },
      })
      
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          this.loadData();
        })
      )
      .subscribe();
  }

  edit(item: PartiesModel) {
    this.dialog
      .open(AddPartiesComponent, {
        maxWidth: '1200px',
        maxHeight: '650px',
        height: '100%',
        width: '100%',
        data: {
          model: item,
          isEdit: true,
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          this.loadData();
        })
      )
      .subscribe();
  }
  showAddressTooltip(data: any) {
    tippy(`#id${data.id}`, {
      content: `
      <strong>Address Name :</strong> ${data.address}</br>
      <strong>City :</strong> ${this.getCityName(data.city_id)}</br>
      <strong>Mobile 1 :</strong> ${data.mob1}</br>
      <strong>Mobile 2:</strong> ${data.mob2}</br>
      <strong>Pin :</strong> ${data.pin}</br>
      `,
      placement: 'top',
      animation: 'scale',
      allowHTML: true,
    });
  }
  showContactTooltip(data: any) {
    tippy(`#id${data.id}`, {
      content: `
      <strong>Contact Name :</strong> ${data.name}</br>
      <strong>Mobile 1 :</strong> ${data.mob1}</br>
      <strong>Mobile 2:</strong> ${data.mob2}</br>
      `,
      placement: 'top',
      animation: 'scale',
      allowHTML: true,
    });
  }
}
