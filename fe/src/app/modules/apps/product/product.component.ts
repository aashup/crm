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
import { ProductDatasource } from './product.datasource';
import { ProductModel } from './product.model';
import { ProductService } from './product.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import _ from 'lodash';
import { merge, tap, take, fromEvent, debounceTime, distinctUntilChanged } from 'rxjs';
import { CommonService } from '../../core/common.service';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ProductComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: ProductDatasource;
  selection = new SelectionModel<ProductModel>(true, []);
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
    { ref: 'status', name: 'Status', mutator: (item: ProductModel) => (item.status == 0 ? 'In-Active' : 'Active') },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: ProductService,
    private commonService: CommonService,
    private router: Router
  ) {
    this.dataSource = new ProductDatasource(this.service);
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
        debounceTime(300),
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
    this.filter.pageSize = this.paginator.pageSize;
     this.filter.filter = JSON.stringify(_.pickBy(this.search));
    this.filter.orderField = 'name';
    this.filter.orderBy = 'asc';
    this.filter.with = ['unit', 'productDetails'];
    this.dataSource.find(this.filter);
  }

  masterToggle() {
    if (this.selection.selected.length === this.dataSource.originalData.data.length) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: ProductModel) => this.selection.select(row));
    }
  }

  isAllSelected(): boolean {
    return this.dataSource.originalData.data.length === this.selection.selected.length;
  }

  delete(item: ProductModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Menu',
          body: `Are you sure you want to delete this Product <span class="text-danger bold">${item.name}?</span>`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('Product has been deleted.');
              this.loadData();
            },
            error: (err) => this.commonService.handleError(err),
          });
        }
      });
  }

  add() {
    this.router.navigate(['app/product/add']);
  }

  edit(item: ProductModel) {
    this.router.navigate(['app/product/add', item.id]);
  }
}
