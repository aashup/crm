import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UnitDatasource } from './unit.datasource';
import { UnitModel } from './unit.model';
import { UnitService } from './unit.service';
import { AddUnitComponent } from './add-unit/add-unit.component';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import _ from 'lodash';
import { merge, tap, take, debounceTime, distinctUntilChanged, fromEvent } from 'rxjs';
import { CommonService } from '../../core/common.service';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionHandler } from '../../core/subscription.handler';

@Component({
    selector: 'app-unit',
    templateUrl: './unit.component.html',
    styleUrl: './unit.component.scss',
    standalone: false
})
export class UnitComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: UnitDatasource;
  selection = new SelectionModel<UnitModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  search: any = { all: '' };
  filter: any = {};
  displayableCol = ['select', 'id', 'name', 'status', 'action'];

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
    { ref: 'status', name: 'Status', mutator: (item: UnitModel) => item.status == 0 ? 'In-Active' : 'Active' },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: UnitService,
    private commonService: CommonService
  ) {
    this.dataSource = new UnitDatasource(this.service);
  }
  ngOnInit(): void {
    this.loadData();
    this.commonService.page.updateTitle('Unit List');
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
      this.dataSource.originalData.data.forEach((row: UnitModel) =>
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

  delete(item: UnitModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Unit',
          body: `Are you sure you want to delete this Unit <span class="text-danger bold">${item.name}?</span>`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('Unit has been deleted.');
              this.loadData();
            },
            error: (err) => this.commonService.handleError(err),
          });
        }
      });
  }

  add() {
    this.dialog
      .open(AddUnitComponent, {
        data: {
          model: new UnitModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => flag && this.loadData());
  }

  edit(item: UnitModel) {
    this.dialog
      .open(AddUnitComponent, {
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
