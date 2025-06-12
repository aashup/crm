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
import { CountryDatasource } from './country.datasource';
import { SelectionModel } from '@angular/cdk/collections';
import { CountryModel } from './country.model';
import { CountryService } from './country.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import _ from 'lodash';
import { CommonService } from '../../core/common.service';
import { SubscriptionHandler } from '../../core/subscription.handler';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { AddCountryComponent } from './add-country/add-country.component';
import { debounceTime, distinctUntilChanged, fromEvent, merge, take, tap } from 'rxjs';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
    selector: 'app-country',
    templateUrl: './country.component.html',
    styleUrl: './country.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CountryComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: CountryDatasource;
  selection = new SelectionModel<CountryModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  search: any = { all: '' };
  filter: any = {};
  isLoading = false;
  displayableCol = ['select', 'id', 'name', 'action'];

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
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: CountryService,
    private commonService: CommonService,
    private spinnerService:SpinnerService
  ) {
    this.dataSource = new CountryDatasource(this.service);
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
      this.dataSource.originalData.data.forEach((row: CountryModel) =>
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

  delete(item: CountryModel) {
    
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Country',
          body: `Are you sure you want to delete this Country <span class="text-danger bold">${item.name}?</span>`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((res) => {
        this.isLoading = true; 
        this.spinnerService.show()
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('Country has been deleted.');
              this.loadData();
              this.cdr.detectChanges(); 
              this.isLoading = false; 
              this.spinnerService.hide()
            },
            error: (err) => {
              this.commonService.handleError(err);
              this.isLoading = false; 
              this.spinnerService.hide()
            },
          });
        } else {
          this.isLoading = false;
          this.spinnerService.hide()
        }
      });
  }

  add() {
    this.dialog.open(AddCountryComponent, {
      data: {
        model: (new CountryModel()).clear(),
        isEdit: false,
      }
    }).afterClosed().pipe(take(1)).subscribe(flag => flag && this.loadData())
  }

  edit(item: CountryModel) {
    this.dialog.open(AddCountryComponent, {
      data: {
        model: item,
        isEdit: true
      }
    }).afterClosed().pipe(take(1)).subscribe(flag => flag && this.loadData())
  }
}
