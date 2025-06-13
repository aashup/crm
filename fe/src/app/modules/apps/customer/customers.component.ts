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
import {  CustomersDatasource } from './customers.datasource';
import { SelectionModel } from '@angular/cdk/collections';
import _ from 'lodash';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, fromEvent, merge, take, tap } from 'rxjs';
import { CustomersModel } from './customers.model';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { CustomersService } from './customers.service';
import { CommonService } from '../../core/common.service';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { AddCustomersComponent } from './add-customers/add-customers.component';
import { CityService } from '../../settings/city/city.service';
import { AuthService } from '../../auth';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
    selector: 'app-customers',
    templateUrl: './customers.component.html',
    styleUrl: './customers.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CustomersComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: CustomersDatasource;
  selection = new SelectionModel<CustomersModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  cities: any = [];
  search: any = { all: '' };
  filter: any = {};
  isLoading = false
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
    private service: CustomersService,
    private commonService: CommonService,
    private cityService: CityService,
    private authService: AuthService,
    private spinnerService: SpinnerService
  ) {
    this.dataSource = new CustomersDatasource(this.service);
  }
  ngOnInit(): void {
    this.getAllCities()
    this.loadData();
    this.checkPermissions()
    this.commonService.page.updateTitle('Customer List');
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
      this.isLoading = false; 
      this.spinnerService.hide()
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
      this.filter.cols = ['id', 'name', 'contact_id', 'address_id', 'created_at', 'updated_at']; 
      this.dataSource.find(_.pickBy(this.filter));
    }
  masterToggle() {
    if (
      this.selection.selected.length ===
      this.dataSource.originalData.data.length
    ) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: CustomersModel) =>
        this.selection.select(row)
      );
    }
  }

  checkPermissions() {
    const userData = this.authService.getCurrentUser(); 
   console.log(userData.permissions);
   
  }
  isAllSelected(): boolean {
    return (
      this.dataSource.originalData.data.length ===
      this.selection.selected.length
    );
  }

  delete(item: CustomersModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Customer',
          body: `Are you sure you want to delete this Customer <span class="text-danger bold">${item.name}?</span>`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        this.isLoading=true;
        this.spinnerService.show();
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('Customer has been deleted.');
              this.loadData();
              this.spinnerService.hide();
              this.isLoading = false;
            },
            error: (err) => {
              this.commonService.handleError(err);
            },
          });
        }
        this.spinnerService.hide();
        this.isLoading = false; 
      });
  }

  add() {
    this.dialog
      .open(AddCustomersComponent, {
        data: {
          model: new CustomersModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => {
        if (flag) {
          this.loadData();
        }
        this.loadData();
        this.isLoading = false; 
      });
  }
  edit(item: CustomersModel) {
    this.dialog
      .open(AddCustomersComponent, {
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
        }
        this.isLoading = false; 
        this.loadData();
      });
  }
}
