import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import _ from 'lodash';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { merge, take, tap } from 'rxjs';
import { SpinnerService } from 'src/app/services/spinner.service';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { CommonService } from 'src/app/modules/core/common.service';
import { CityService } from 'src/app/modules/settings/city/city.service';
import { AddressService } from 'src/app/modules/settings/address/address.service';
import { ConfirmationDialogComponent } from 'src/app/modules/core/confirmation-dialog/confirmation-dialog.component';
import { AddProductSellerComponent } from './add-product-seller/add-product-seller.component';
import { FormGroup } from '@angular/forms';
import { VendorDatasource } from '../../vendor/vendor.datasource';
import { VendorModel } from '../../vendor/vendor.model';
import { VendorService } from '../../vendor/vendor.service';
@Component({
  selector: 'app-product-seller',
  templateUrl: './product-seller.component.html',
  styleUrl: './product-seller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ProductSellerComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  @Input() form: FormGroup;
  @Input() next: () => void;
  @Input() prev: () => void;
  dataSource: VendorDatasource;
  selection = new SelectionModel<VendorModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  cities: any = [];
  address: any = [];
  shippingAddress: any;
  search: any = { all: '' };
  filter: any = {};
  isLoading = false;
  displayableCol = [
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
  
    {
      ref: 'id',
      name: 'ID',
      style: { 'max-width': '30px' },
    },
    { ref: 'name', name: 'Name' },
    {
      ref: 'shipping_address_id',
      name: 'Shipping Address',
      mutator: (item: any) => item?.shipping_address?.address || 'N/A',
    },
    {
      ref: 'billing_address_id',
      name: 'Billing Address',
      mutator: (item: any) => item?.billing_address?.address || 'N/A',
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
    private spinnerService: SpinnerService
  ) {
    this.dataSource = new VendorDatasource(this.service);
  }
  ngOnInit(): void {
    
    this.getAllAddresses();
    this.getAllCities();
    this.loadData();
    console.log('Product Seller Component Initialized ', this.form);
    this.subscriptionHandler.subscribe = this.sort.sortChange.subscribe();

    this.subscriptionHandler.subscribe = merge(this.sort.sortChange)
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
  }

  loadData(): void {
    this.filter.orderField = this.sort.active;
    this.filter.orderBy = this.sort.direction;
    this.filter.filter = JSON.stringify(_.pickBy(this.search));
    this.filter.with = ['contact', 'BillingAddress', 'ShippingAddress'];
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
      'updated_at',
    ];
    this.dataSource.find(_.pickBy(this.filter));
  }
  masterToggle() {
    if (this.selection.selected.length === this.dataSource.originalData.data.length) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: VendorModel) => this.selection.select(row));
    }
  }

  isAllSelected(): boolean {
    return this.dataSource.originalData.data.length === this.selection.selected.length;
  }

  delete(item: VendorModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Supplier',
          body: `Are you sure you want to delete this Supplier <span class="text-danger bold">${item.name}?</span>`,
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
              this.commonService.toastr.success('Supplier has been deleted.');
              this.loadData();
            },
            error: (err) => {
              this.isLoading = false;
              this.spinnerService.hide();
              console.log('err', err.error.message);
              this.commonService.toastr.error(err.error.message || 'Some error occurred.');
              // this.commonService.handleError(err.error.message);
            },
          });
        }
      });
  }

  add() {
    this.dialog
      .open(AddProductSellerComponent, {
        data: {
          model: new VendorModel().clear(),
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

  edit(item: VendorModel) {
    this.dialog
      .open(AddProductSellerComponent, {
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
