import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { SubscriptionHandler } from "../../core/subscription.handler";
import { SelectionModel } from "@angular/cdk/collections";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { CommonService } from "../../core/common.service";
import _, { merge } from "lodash";
import { debounceTime, distinctUntilChanged, fromEvent, take, tap } from "rxjs";
import { ConfirmationDialogComponent } from "../../core/confirmation-dialog/confirmation-dialog.component";
import { RolesDatasource } from "./roles.datasource";
import { RolesModel } from "./roles.model";
import { RolesService } from "./roles.service";
import { AddRolesComponent } from "./add-roles/add-roles.component";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { SpinnerService } from "src/app/services/spinner.service";


@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    styleUrl: './roles.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class RolesComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: RolesDatasource;
  selection = new SelectionModel<RolesModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  readonly dialog = inject(MatDialog);
  isLoading = false; 
  
  search: any = { all: '' };
  filter: any = {};
  displayableCol = ['select', 'id', 'name','status','guard_name','created_at', 'action'];

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
      ref: 'status',
      name: 'Status',
      doNotSort: false,
      mutator: (item: any) => item.status === "active" ? 'Active' : 'Inactive',
    },
    {
      ref: 'created_at',
      name: 'Created At',
           mutator: (row: RolesModel) => this.datePipe.transform(row.created_at, 'mediumDate'),
    
    },
    {
      ref: 'guard_name',
      name: 'Guard Name',
      mutator: (item: any) => item?.guard_name,
    },
   
    { ref: 'action', name: 'Actions' },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: RolesService,
    private router: Router,
    private commonService: CommonService,
    private datePipe: DatePipe,
    private spinnerService: SpinnerService
  ) {
    this.dataSource = new RolesDatasource(this.service);
  }
  ngOnInit(): void {
    this.loadData();
    this.commonService.page.updateTitle('Roles List');
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
      this.dataSource.originalData.data.forEach((row: RolesModel) =>
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
  navigateToEditPermission(id: number): void {
    this.router.navigate([`/app/usermanagement/roles/edit-permission/${id}`]);
  }
  delete(item: RolesModel) {
   
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Role',
          body: `Are you sure you want to delete this Role <span class="text-danger bold">${item.name}?</span>`,
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
              this.commonService.toastr.success('Role has been deleted.');
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
    this.dialog
      .open(AddRolesComponent, {
        data: {
          model: new RolesModel().clear(),
          isEdit: false,
        },
      })
      .afterClosed()
      .pipe(take(1))
      .subscribe((flag) => flag && this.loadData());
  }

  edit(item: RolesModel) {
    this.dialog
      .open(AddRolesComponent, {
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
