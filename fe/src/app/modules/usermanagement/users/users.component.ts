import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { SubscriptionHandler } from "../../core/subscription.handler";
import { SelectionModel } from "@angular/cdk/collections";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { CommonService } from "../../core/common.service";
import _, { merge } from "lodash";
import { take, tap } from "rxjs";
import { ConfirmationDialogComponent } from "../../core/confirmation-dialog/confirmation-dialog.component";
import {  UsersDatasource } from "./users.datasource";
import {  UsersModel } from "./users.model";
import { UsersService } from "./users.service";
import { AddUsersComponent } from "./add-users/add-users.component";



@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
   
    styleUrl: './users.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UsersComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: UsersDatasource;
  selection = new SelectionModel<UsersModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);

  filter: any = {};
  displayableCol = ['select', 'id', 'name',"email",'status','created_at','roles','action'];

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
    {
      ref: 'roles',
      name: 'Roles',
      mutator: (row: any) =>
        Array.isArray(row.roles)
          ? row.roles.map((r: any) => r.name).join(', ')
          : '—',
    },
   
    {
      ref: 'status',
      name: 'Status',
      doNotSort: false,
      mutator: (row: any) => (row.status === 1 ? 'Active' : 'Inactive'),
    },
    {
      ref:"email"   ,
      name:"Email",
    },
    {
      ref: 'created_at',
      name: 'Created At',
      mutator: (item: any) => item?.created_at,
    },
   
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: UsersService,
    private commonService: CommonService
  ) {
    this.dataSource = new UsersDatasource(this.service);
  }
  ngOnInit(): void {
    this.loadData();
    this.commonService.page.updateTitle('Users List');
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
    // throw new Error('Method not implemented.');
  }

  loadData() {
    this.filter.orderField = this.sort.active;
    this.filter.orderBy = this.sort.direction;
    this.filter.page = this.paginator.pageIndex + 1;
    this.filter.pageSize = this.paginator.pageSize;
    // this.filter.filter = JSON.stringify(this.search);
    this.filter.with = ['roles', 'status','created_at'];
    this.dataSource.find(this.filter);
  }

  masterToggle() {
    if (
      this.selection.selected.length ===
      this.dataSource.originalData.data.length
    ) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: UsersModel) =>
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

  delete(item: UsersModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Users',
          body: `Are you sure you want to delete this Users <span class="text-danger bold">${item.name}?</span>`,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.service.delete(item).subscribe({
            complete: () => {
              this.commonService.toastr.success('User has been deleted.');
              this.loadData();
            },
            error: (err) => this.commonService.handleError(err),
          });
        }
      });
  }

  add() {
    this.dialog
      .open(AddUsersComponent, {
        data: {
          model: new UsersModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => flag && this.loadData());
  }

  edit(item: UsersModel) {
    this.dialog
      .open(AddUsersComponent, {
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
