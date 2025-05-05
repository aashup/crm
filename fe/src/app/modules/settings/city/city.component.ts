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
import { CityDatasource } from './city.datasource';
import { SelectionModel } from '@angular/cdk/collections';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { CityModel } from './city.model';
import _ from 'lodash';
import { CityService } from './city.service';
import { CommonService } from '../../core/common.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { AddCityComponent } from './add-city/add-city.component';
import { debounceTime, distinctUntilChanged, fromEvent, merge, take, tap } from 'rxjs';

@Component({
    selector: 'app-city',
    templateUrl: './city.component.html',
    styleUrl: './city.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CityComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: CityDatasource;
  selection = new SelectionModel<CityModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  search: any = { all: '' };
  filter: any = {};
  displayableCol = ['select', 'id', 'name', 'state', 'country', 'action'];

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
    { ref: 'state', name: 'State', mutator: (item: any) => item?.state?.name },
    {
      ref: 'country',
      name: 'Country',
      mutator: (item: any) => item?.country?.name,
    },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: CityService,
    private commonService: CommonService
  ) {
    this.dataSource = new CityDatasource(this.service);
  }
  ngOnInit(): void {
    this.loadData();
    this.commonService.page.updateTitle('City List');
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
    this.filter.with = ['roles'];
    this.dataSource.find(_.pickBy(this.filter));
  }

  masterToggle() {
    if (
      this.selection.selected.length ===
      this.dataSource.originalData.data.length
    ) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: CityModel) =>
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

  delete(item: CityModel) {
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
      .open(AddCityComponent, {
        data: {
          model: new CityModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => flag && this.loadData());
  }

  edit(item: CityModel) {
    this.dialog
      .open(AddCityComponent, {
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
