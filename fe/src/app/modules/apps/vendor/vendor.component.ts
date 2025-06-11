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
import { AddressService } from '../../settings/address/address.service';

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
  address: any = [];
  shippingAddress:any;
  search: any = { all: '' };
  filter: any = {};
  isLoading = false;
  displayableCol = [
    'select',
    'id',
    'name',
    'shipping_address_id',
    'billing_address_id',
    'contact',
    'type',
    'level',
    'status',
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
    },
    { ref: 'name', name: 'Name' },
    {
      ref: 'shipping_address_id',
      name: 'Shipping Address',
      mutator: (item: any) => {
        const address = this.address.find((addr: any) => addr.id === item.shipping_address_id);
        console.log("type",address?.type);
        
        if(address?.type=='1')
        return address ? address .address: 'N/A';
        else
        return "N/A"

      },
     
    },
    {
      ref: 'billing_address_id',
      name: 'Billing Address',   
      mutator: (item: any) => {
        const address = this.address.find((addr: any) => addr.id === item.billing_address_id);
        
        if(address?.type=='1')
          return address ? address .address: 'N/A';
          else
          return "N/A"
      },
    },
    {
      ref: 'contact',
      name: 'Contact Person',
      mutator: (item: any) => item?.contact?.name || 'N/A',
    },
    {
      ref: 'type',
      name: 'Type',
     
      
    },
    {
      ref: 'level',
      name: 'Level',
   
    },
    {
      ref: 'status',
      name: 'Status',
      mutator: (item: any) => {
        return item.status == '1' ? 'Active' : 'Inactive';
      },
     
    },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: VendorService,
    private commonService: CommonService,
    private cityService: CityService,
    private addressService: AddressService,
  ) {
    this.dataSource = new VendorDatasource(this.service);
  }
  ngOnInit(): void {
    this.getAllAddresses()
    this.getAllCities()
    this.loadData();
    
    this.commonService.page.updateTitle('Suppliers List');
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

getAllAddresses() {
  this.addressService.find({}).subscribe((res:any) => {
    console.log(res.data);
    if(res.data.length){
      this.address=res.data
    }
  }
  );
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
      this.filter.with = ['contact', 'address']; 
      this.filter.cols = [
        'id', 
        'name', 
        'contact_id',
        'shipping_address_id', 
        'billing_address_id',
        'notes',
        'type',
        'level',
        'status',
        'created_at', 
        'updated_at'
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
          title: 'Delete Vendor',
          body: `Are you sure you want to delete this Vendor <span class="text-danger bold">${item.name}?</span>`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.isLoading = true; // Start the loader
          this.service.delete(item).subscribe({
            complete: () => {
              this.isLoading = false; // Stop the loader
              this.commonService.toastr.success('Vendor has been deleted.');
              this.loadData();
            },
            error: (err) => {
              this.isLoading = false; // Stop the loader on error
              this.commonService.handleError(err);
            },
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
