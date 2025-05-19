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
import { SubscriptionHandler } from '../../core/subscription.handler';

import _ from 'lodash';

import { CommonService } from '../../core/common.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../core/confirmation-dialog/confirmation-dialog.component';
import { debounceTime, distinctUntilChanged, fromEvent, merge, take, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ContactDatasource } from './contact.datasource';
import { ContactService } from './contact.service';
import { AddContactComponent } from './add-contact/add-contact.component';
import { ContactModel } from './contact.model';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ContactComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: ContactDatasource;
  selection = new SelectionModel<ContactModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  search: any = { all: '' };
  filter: any = {};
  displayableCol = ['select', 'id', 'name', 'mob1', 'mob2', 'status', 'action'];

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
    { ref: 'mob1', name: 'Mobile1' },
    {
      ref: 'mob2',
      name: 'Mobile2',
    },
    {
      ref: 'status',
      name: 'Status',
      doNotSort: false,
      mutator: (row: any) => (row.status === 1 ? 'Active' : 'Inactive'),
    },

    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: ContactService,
    private commonService: CommonService
  ) {
    this.dataSource = new ContactDatasource(this.service);
  }
  ngOnInit(): void {
    this.loadData();
    this.commonService.page.updateTitle('Contact List');
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
      this.dataSource.originalData.data.forEach((row: ContactModel) =>
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

  delete(item: ContactModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Contact',
          body: `Are you sure you want to delete this Contact <span class="text-danger bold">${item.name}?</span>`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('Contact has been deleted.');
              this.loadData();
            },
            error: (err) => this.commonService.handleError(err),
          });
        }
      });
  }

  add() {
    this.dialog
      .open(AddContactComponent, {
        data: {
          model: new ContactModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => flag && this.loadData());
  }

  edit(item: ContactModel) {
    this.dialog
      .open(AddContactComponent, {
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





