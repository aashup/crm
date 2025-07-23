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
import { AuthService } from '../../auth';
import { SpinnerService } from 'src/app/services/spinner.service';
import { DatePipe } from '@angular/common';
import { ExpenseDatasource } from './expense.datasource';
import { ExpenseModel } from './expense.model';
import { ExpenseService } from './expense.service';
import { AddExpenseComponent } from './add-expense/add-expense.component';

@Component({
    selector: 'app-expense',
    templateUrl:'./expense.component.html',
    styleUrl: './expense.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ExpenseComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: ExpenseDatasource;
  selection = new SelectionModel<ExpenseModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  cities: any = [];
  isLoading = false;
  search: any = { all: '' };
  filter: any = {};
  displayableCol = [
    'select',
    'id',
    'expense_type',
    'amount',
    'notes',
    'action'
  ];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  @ViewChild('searchElementRef', { static: true }) searchElementRef: ElementRef;

  tableColumns: Array<any> = [
    { ref: 'select', name: 'Select', style: { width: '70px' } },
    { ref: 'id', name: 'ID', style: { 'max-width': '30px' } },
    {ref:'expense_type',name:'Expense Type'},
    { ref: 'amount', name: 'Amount' },
    { ref: 'notes', name: 'Notes' },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: ExpenseService,
    private commonService: CommonService,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private datePipe: DatePipe
  ) {
    this.dataSource = new ExpenseDatasource(this.service);
  }
  ngOnInit(): void {
    this.loadData();
    this.checkPermissions()
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
     
      this.filter.cols = [
        'id',
        'amount',
        'notes',
        'type'
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
      this.dataSource.originalData.data.forEach((row: ExpenseModel) =>
        this.selection.select(row)
      );
    }
  }

  checkPermissions() {
    const userData = this.authService.getCurrentUser(); 
  }
  isAllSelected(): boolean {
    return (
      this.dataSource.originalData.data.length ===
      this.selection.selected.length
    );
  }

  delete(item: ExpenseModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Expense Item',
          body: `Are you sure you want to delete this Expense`,
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
              this.commonService.toastr.success('Expense has been deleted.');
              this.loadData();
              this.isLoading = false; 
              this.spinnerService.hide();
              this.cdr.detectChanges(); 
            },
            error: (err) => {
              this.commonService.handleError(err);
              this.isLoading = false; 
              this.spinnerService.hide();
            },
          });
        }
      });
  }

  add() {
    this.dialog
      .open(AddExpenseComponent, {
        height: 'auto',
        width: '80%',
        maxWidth:"fit-content",
        data: {
          model: new ExpenseModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => {
        if (flag) {
          this.loadData();
          this.cdr.detectChanges(); 
        }
      });
  }

  edit(item: ExpenseModel) {
    this.dialog
      .open(AddExpenseComponent, {
        height: 'auto',
        width: 'fit-content',
        maxWidth:"100%",
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
          this.cdr.detectChanges(); 
        }
      });
  }
}
