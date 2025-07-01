import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import _ from 'lodash';
import { merge, tap, take, debounceTime, distinctUntilChanged, fromEvent } from 'rxjs';

import { SpinnerService } from 'src/app/services/spinner.service';
import { UnitConversionDatasource } from './unitconversion.datasource';
import { UnitConversionModel } from './unitconversion.model';
import { UnitConversionService } from './unitconversion.service';
import { AddUnitConversionComponent } from './add-unit-conversion/add-unit-conversion.component';
import { SubscriptionHandler } from 'src/app/modules/core/subscription.handler';
import { CommonService } from 'src/app/modules/core/common.service';
import { ConfirmationDialogComponent } from 'src/app/modules/core/confirmation-dialog/confirmation-dialog.component';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-unit-conversion',
    templateUrl:'./unitconversion.component.html',
    styleUrl: './unitconversion.component.scss',
    standalone: false
})
export class UnitConversionComponent implements OnInit, OnDestroy, AfterViewInit {
  _ = _;
  dataSource: UnitConversionDatasource;
  selection = new SelectionModel<UnitConversionModel>(true, []);
  subscriptionHandler = new SubscriptionHandler();
  productId:string

  readonly dialog = inject(MatDialog);
  @Input() form!: FormGroup; 
  @Input() next!: () => void; 
  @Input() prev!: () => void;
  isLoading = false;
  search: any = { all: '' };
  filter: any = {};
  displayableCol = ['select', 'id', 'product', 'from_unit', 'to_unit', 'conversion_factor', 'description', 'status', 'action'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('sort1', { static: true }) sort: MatSort;
  @ViewChild('searchElementRef', { static: true }) searchElementRef: ElementRef;

  tableColumns: Array<any> = [
    { ref: 'select', name: 'Select', style: { width: '70px' } },
    { ref: 'id', name: 'ID', style: { 'max-width': '30px' } },
    { ref: 'product', name: 'Product', mutator: (item: any) => item.product?.name || 'N/A' },
    { ref: 'from_unit', name: 'From Unit', mutator: (item: any) => item.from_unit?.name || 'N/A' },
    { ref: 'to_unit', name: 'To Unit', mutator: (item: any) => item.to_unit?.name || 'N/A' },
    { ref: 'conversion_factor', name: 'Conversion Factor',mutator: (item: any) => parseFloat(item.conversion_factor).toFixed(2) },
    { ref: 'description', name: 'Description' },
    { ref: 'status', name: 'Status', mutator: (item: any) => item.status === 1? 'Active' : 'Inactive' },
    { ref: 'action', name: 'Actions' },
  ];
  constructor(
    private cdr: ChangeDetectorRef,
    private service: UnitConversionService,
    private commonService: CommonService,
    private spinnerService:SpinnerService,
    
  ) {
    this.dataSource = new UnitConversionDatasource(this.service);
  }
  ngOnInit(): void {
    this.productId=this.form.value.productInfo.id
    console.log("product id",this.productId);
    
    this.loadData();
    console.log(this.form);
    this.cdr.detectChanges()
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
    this.isLoading = false; 
    this.spinnerService.hide();
  
    
    this.subscriptionHandler.subscribe = fromEvent(this.searchElementRef.nativeElement, 'keyup')
      .pipe(
        debounceTime(500), 
        distinctUntilChanged(), 
        tap(() => {
          this.paginator.pageIndex = 0; 
          this.search.all = this.searchElementRef.nativeElement.value.trim(); 
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
    this.filter.filter = JSON.stringify({
      ..._.pickBy(this.search),
      product_id: this.productId, 
    }); 
    this.filter.with = ['product', 'fromUnit', 'toUnit']; 
    console.log('Filter:', this.filter);
  
    this.dataSource.find(_.pickBy(this.filter)); 
  }

  masterToggle() {
    if (
      this.selection.selected.length ===
      this.dataSource.originalData.data.length
    ) {
      this.selection.clear();
    } else {
      this.dataSource.originalData.data.forEach((row: UnitConversionModel) =>
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

  delete(item: UnitConversionModel) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: {
          title: 'Delete Unit',
          body: `Are you sure you want to delete this Unit Conversion `,
          okBtnName: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((res) => {
        this.isLoading = true; 
        this.spinnerService.show()
        if (res) {
          
          this.service.delete(item).subscribe({
            complete: () => {
              this.isLoading = false; 
              this.spinnerService.hide()
              this.commonService.toastr.success('Unit has been deleted.');
              this.loadData();
            },
            error: (err) => {
              this.isLoading = false; 
              this.spinnerService.hide()
              this.commonService.handleError(err);
            },
          });
        }
      });
  }

  add() {
    this.dialog
      .open(AddUnitConversionComponent, {
        data: {
          model: new UnitConversionModel().clear(),
          productId:this.productId,
          isEdit: false,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        console.log("result is ",result);
         this.form.value.unitConversionInfo=[...this.form.value.unitConversionInfo,result];
        console.log("result is this ",result);
        this.loadData();
      });
  }

  edit(item: UnitConversionModel) {
    this.dialog
      .open(AddUnitConversionComponent, {
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
