import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { StateDatasource } from './state.datasource';
import { StateModel } from './state.model';
import { SelectionModel } from '@angular/cdk/collections';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import _ from 'lodash';
import { debounceTime, distinctUntilChanged, fromEvent, merge, take, tap } from 'rxjs';
import { CommonService } from '../../core/common.service';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { StateService } from './state.service';
import { AddStateComponent } from './add-state/add-state.component';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';

@Component({
    selector: 'app-state',
    templateUrl: './state.component.html',
    styleUrl: './state.component.scss',
    standalone: false
})
export class StateComponent implements OnInit, OnDestroy, AfterViewInit {
 _ = _;
  dataSource: StateDatasource;
  selection = new SelectionModel<StateModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  isLoading = false; 
  search: any = { all: '' };

  filter: any = {};
  displayableCol = ['select', 'id', 'name', 'country','action'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  @ViewChild("searchElementRef", { static: true }) searchElementRef: ElementRef;

  tableColumns: Array<any> = [
    { ref: 'select', name: 'select', style: { 'width': '70px' } },
    {
      ref: 'id',
      name: 'ID',
      style: { 'max-width': '30px' },
    },
    { ref: 'name', name: 'Name' },
    { ref: 'country', name: 'Country', mutator: (item: any) => item?.country?.name },
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: StateService,
    private commonService: CommonService
  ) {
    this.dataSource = new StateDatasource(this.service);
  }
  ngOnInit(): void {
    this.loadData();
    this.commonService.page.updateTitle('Country List');
    this.subscriptionHandler.subscribe = this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.subscriptionHandler.subscribe = merge(this.sort.sortChange, this.paginator.page).pipe(
      tap(() => {
        this.loadData();
      })
    ).subscribe();
  }
  ngOnDestroy(): void {
    this.subscriptionHandler.unsubscribe();
  }
   ngAfterViewInit(): void {
    this.isLoading= false;
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
      this.filter.with = ['country'];
      this.dataSource.find(_.pickBy(this.filter));
    }
  masterToggle() {
    if (
      this.selection.selected.length ===
      this.dataSource.originalData.data.length
    ) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: StateModel) =>
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

  delete(item: StateModel) {
    
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete State',
          body: `Are you sure you want to delete this State <span class="text-danger bold">${item.name}?</span>`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        this.isLoading = true; 
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('State has been deleted.');
              this.loadData();
              this.cdr.detectChanges(); 
              this.isLoading = false; 
            },
            error: (err) => {
              this.commonService.handleError(err);
              this.isLoading = false;
            },
          });
        } else {
          this.isLoading = false; 
        }
      });
  }

  add() {
    this.dialog.open(AddStateComponent, {
      data: {
        model: (new StateModel()).clear(),
        isEdit: false,
      }
    }).afterClosed().pipe(take(1)).subscribe(flag => flag && this.loadData())
  }

  edit(item: StateModel) {
    this.dialog.open(AddStateComponent, {
      data: {
        model: item,
        isEdit: true
      }
    }).afterClosed().pipe(take(1)).subscribe(flag => flag && this.loadData())
  }
}

