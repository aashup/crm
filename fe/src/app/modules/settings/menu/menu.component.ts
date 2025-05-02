import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MenuDatasource } from './menu.datasource';
import { MenuModel } from './menu.model';
import { MenuService } from './menu.service';
import { AddMenuComponent } from './add-menu/add-menu.component';
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
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MenuComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: MenuDatasource;
  selection = new SelectionModel<MenuModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  search: any = { all: '' };

  filter: any = {};
  displayableCol = ['select', 'id', 'name', 'root', 'icon', 'page', 'order_by', 'parent', 'status', 'action'];

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
    { ref: 'root', name: 'Root' },
    { ref: 'icon', name: 'Icon' },
    { ref: 'page', name: 'Page' },
    { ref: 'order_by', name: 'Order By' },
    { ref: 'parent', name: 'Parent', mutator: (item: any) => item?.parent?.name },
    { ref: 'status', name: 'Status' },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: MenuService,
    private commonService: CommonService
  ) {
    this.dataSource = new MenuDatasource(this.service);
  }
  ngOnInit(): void {
    this.loadData();
    this.commonService.page.updateTitle('Menu List');
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
      this.dataSource.originalData.data.forEach((row: MenuModel) =>
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

  delete(item: MenuModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Menu',
          body: `Are you sure you want to delete this Menu <span class="text-danger bold">${item.name}?</span>`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('Menu has been deleted.');
              this.loadData();
            },
            error: (err) => this.commonService.handleError(err),
          });
        }
      });
  }

  add() {
    this.dialog
      .open(AddMenuComponent, {
        data: {
          model: new MenuModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => flag && this.loadData());
  }

  edit(item: MenuModel) {
    this.dialog
      .open(AddMenuComponent, {
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
